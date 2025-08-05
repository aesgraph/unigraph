import {
  cancelLayoutJob,
  finishLayoutJob,
  selectIsLayoutJobRunning,
  selectLayoutJobStatus,
  startLayoutJob,
  updateLayoutJobProgress,
} from "../../store/activeLayoutStore";
import { EntityIds } from "../model/entity/entityIds";
import { Graph } from "../model/Graph";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { computeCustomLayout, CustomLayoutType } from "./CustomLayoutEngine";
import {
  GraphologyLayoutEngine,
  GraphologyLayoutType,
} from "./GraphologyLayoutEngine";
import { GraphvizLayoutEngine } from "./GraphvizLayoutEngine";
import { GraphvizLayoutType } from "./GraphvizLayoutType";
import { ILayoutEngineResult, LayoutEngineOption } from "./layoutEngineTypes";

// Map to store pending layout computations by ID
const pendingComputations = new Map<
  string,
  {
    resolve_layout: (result: ILayoutEngineResult) => void;
    reject: (error: Error) => void;
  }
>();

// Create a worker instance for layout computations
let layoutWorker: Worker | null = null;

// Initialize the layout worker
function getLayoutWorker(): Worker {
  if (!layoutWorker) {
    try {
      layoutWorker = new Worker(new URL("./LayoutWorker.ts", import.meta.url), {
        type: "module",
      });

      // Set up message handler
      layoutWorker!.onmessage = (e: MessageEvent) => {
        const response = e.data;
        const pendingComputation = pendingComputations.get(response.id);

        // Handle different message types
        if (response.type === "progress") {
          // Update progress in store
          updateLayoutJobProgress(response.progress);
          return;
        }

        if (response.type === "cancelled") {
          // Clean up this computation
          if (pendingComputation) {
            pendingComputations.delete(response.id);
            pendingComputation.reject(
              new Error("Layout computation cancelled")
            );
          }
          return;
        }

        if (pendingComputation) {
          if (response.error) {
            pendingComputation.reject(new Error(response.error));
          } else {
            pendingComputation.resolve_layout(response.result);
          }
          pendingComputations.delete(response.id);
        }
      };

      layoutWorker!.onerror = (error) => {
        console.error("Layout worker error:", error);
        layoutWorker = null;
      };
    } catch (error) {
      console.error("Failed to initialize layout worker:", error);
      throw new Error("Layout worker initialization failed");
    }
  }
  return layoutWorker;
}

export class LayoutEngine {
  private static isComputingSafeLayout: boolean = false;

  /**
   * Reset all computation state - useful when things get stuck
   */
  public static resetComputationState(): void {
    console.log("Resetting layout computation state");
    LayoutEngine.isComputingSafeLayout = false;
    finishLayoutJob();

    // Clean up any pending computations
    pendingComputations.forEach((computation, _id) => {
      try {
        computation.reject(new Error("Computation state reset"));
      } catch (e) {
        console.error("Error rejecting pending computation:", e);
      }
    });
    pendingComputations.clear();
  }

  public static async safeComputeLayout(
    sceneGraph: SceneGraph,
    layoutType: LayoutEngineOption,
    nodeIds?: EntityIds<NodeId>
  ): Promise<ILayoutEngineResult | null> {
    // Reset if there's a stale computation running for too long
    const jobStatus = selectLayoutJobStatus();
    if (jobStatus.isRunning && jobStatus.startTime) {
      const elapsedSeconds = Math.floor(
        (Date.now() - jobStatus.startTime) / 1000
      );
      if (elapsedSeconds > 120) {
        // 2 minutes timeout
        console.warn("Detected stale layout computation, resetting state");
        LayoutEngine.resetComputationState();
      }
    }

    if (LayoutEngine.isComputingSafeLayout) {
      console.log("Layout computation already in progress, skipping...");
      return null;
    }

    LayoutEngine.isComputingSafeLayout = true;
    console.log("Computing layout using worker...");
    const startTime = Date.now();
    let sceneGraphRef = sceneGraph;

    try {
      // Check if a specific nodeIds filter is provide
      if (nodeIds && nodeIds.size > 0) {
        const filteredNodes = sceneGraph
          .getGraph()
          .getNodes()
          .shallowCopy()
          .filter((node) => nodeIds.has(node.getId()));
        const filteredEdges = sceneGraph
          .getGraph()
          .getEdgesConnectedToNodes(filteredNodes.getIds());
        const filteredGraph = new Graph({
          nodes: filteredNodes,
          edges: filteredEdges,
        });
        console.log("filtered graph is ", filteredGraph);
        sceneGraphRef = new SceneGraph({
          graph: filteredGraph,
          displayConfig: sceneGraph.getDisplayConfig(),
        });
      }

      const result = await LayoutEngine.computeLayoutWithWorker(
        sceneGraphRef,
        layoutType
      );
      // Add a check for NaN
      if (result && result.positions) {
        for (const key in result.positions) {
          const pos = result.positions[key];
          if (
            typeof pos.x !== "number" ||
            isNaN(pos.x) ||
            typeof pos.y !== "number" ||
            isNaN(pos.y)
          ) {
            console.warn("NaN detected in result.positions:", key, pos);
          }
        }
      }
      return result;
    } catch (error) {
      console.error("Worker layout computation failed:", error);

      // Don't fall back to main thread computation if the error was a cancellation
      if (
        error instanceof Error &&
        (error.message.includes("cancelled") ||
          error.name === "CancellationError")
      ) {
        console.log(
          "Layout computation was cancelled by user, not falling back."
        );
        return null;
      }

      // Only fallback to main thread for non-cancellation errors
      return await LayoutEngine.computeLayout(sceneGraphRef, layoutType);
    } finally {
      const endTime = Date.now();
      console.log(
        `${layoutType} Layout computation took ${endTime - startTime} ms`
      );

      // Ensure job is marked as finished and flags are reset
      LayoutEngine.isComputingSafeLayout = false;
    }
  }

  /**
   * Cancel a running layout computation
   */
  public static cancelCurrentLayout(): void {
    const jobStatus = selectLayoutJobStatus();
    if (jobStatus.isRunning && jobStatus.workerId && layoutWorker) {
      console.log("Cancelling layout computation:", jobStatus.workerId);

      // Send cancellation message to worker
      layoutWorker.postMessage({
        id: jobStatus.workerId,
        action: "cancelComputation",
      });

      // Reject any pending promise
      const pendingComputation = pendingComputations.get(jobStatus.workerId);
      if (pendingComputation) {
        // Create a cancellation error that we can identify
        const cancellationError = new Error(
          "Layout computation cancelled by user"
        );
        cancellationError.name = "CancellationError";

        pendingComputation.reject(cancellationError);
        pendingComputations.delete(jobStatus.workerId);
      }

      // Mark job as cancelled in the store
      cancelLayoutJob();

      // Reset computation state
      LayoutEngine.isComputingSafeLayout = false;
    }
  }

  /**
   * Compute layout using a web worker
   */
  private static computeLayoutWithWorker(
    sceneGraph: SceneGraph,
    layoutType: LayoutEngineOption
  ): Promise<ILayoutEngineResult> {
    return new Promise((resolve, reject) => {
      try {
        // Check if another job is running
        if (selectIsLayoutJobRunning()) {
          // Cancel the current job before starting a new one
          LayoutEngine.cancelCurrentLayout();
        }

        // Generate a unique ID for this computation
        const workerId = `layout-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        console.log("Starting new layout job with ID:", workerId);

        // Register job in store
        startLayoutJob(layoutType, workerId);

        // Store the callbacks
        pendingComputations.set(workerId, {
          resolve_layout: (result) => {
            console.log("Layout computation resolved:", workerId);
            finishLayoutJob();
            resolve(result);
          },
          reject: (error) => {
            console.log(
              "Layout computation rejected:",
              workerId,
              error.message
            );
            finishLayoutJob();
            reject(error);
          },
        });

        // Serialize the scene graph for the worker
        const serializedGraph = sceneGraph.toSerialized();

        // Send the message to the worker
        getLayoutWorker().postMessage({
          id: workerId,
          action: "computeLayout",
          layoutType,
          serializedGraph,
        });
      } catch (error) {
        console.error("Error setting up layout worker:", error);
        finishLayoutJob();
        reject(error);
      }
    });
  }

  public static async computeLayout(
    sceneGraph: SceneGraph,
    layoutType: LayoutEngineOption
  ): Promise<ILayoutEngineResult> {
    if (
      Object.values(GraphologyLayoutType).includes(
        layoutType as GraphologyLayoutType
      )
    ) {
      const positions = await new GraphologyLayoutEngine().computeLayout(
        sceneGraph.getGraph(),
        layoutType as GraphologyLayoutType
      );
      return { positions, layoutType };
    } else if (
      Object.values(GraphvizLayoutType).includes(
        layoutType as GraphvizLayoutType
      )
    ) {
      const output = await GraphvizLayoutEngine.computeLayout(
        sceneGraph,
        layoutType as GraphvizLayoutType
      );
      return { ...output, layoutType };
    } else if (
      Object.values(CustomLayoutType).includes(layoutType as CustomLayoutType)
    ) {
      const positions = computeCustomLayout(
        sceneGraph,
        layoutType as CustomLayoutType
      );
      return { positions, layoutType };
    }
    throw new Error("Invalid layout type: " + layoutType);
  }
}

// Update exported function to fully handle errors and cancellation
export const Compute_Layout = async (
  sceneGraph: SceneGraph,
  layoutType: LayoutEngineOption,
  nodeSelection?: EntityIds<NodeId>
): Promise<ILayoutEngineResult | null> => {
  try {
    return await LayoutEngine.safeComputeLayout(
      sceneGraph,
      layoutType,
      nodeSelection
    );
  } catch (error) {
    console.error("Layout computation failed or was cancelled:", error);

    // Return null for cancellations instead of throwing
    if (
      error instanceof Error &&
      (error.message.includes("cancelled") ||
        error.name === "CancellationError")
    ) {
      return null;
    }

    // Rethrow unexpected errors
    throw error;
  } finally {
    // Ensure we always mark the job as finished, even on errors
    finishLayoutJob();
  }
};

/**
 * Terminate and recreate the layout worker - useful for recovery
 */
export const resetLayoutWorker = (): void => {
  if (layoutWorker) {
    layoutWorker.terminate();
    layoutWorker = null;
  }
  getLayoutWorker(); // This will recreate the worker
};
