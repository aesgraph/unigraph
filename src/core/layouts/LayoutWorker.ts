import { SceneGraph } from "../model/SceneGraph";
import { SerializedSceneGraph } from "../model/SerializedSceneGraph";
import { computeCustomLayout, CustomLayoutType } from "./CustomLayoutEngine";
import {
  GraphologyLayoutEngine,
  GraphologyLayoutType,
} from "./GraphologyLayoutEngine";
import {
  GraphvizLayoutEngine,
  GraphvizLayoutType,
} from "./GraphvizLayoutEngine";
import { ILayoutEngineResult, LayoutEngineOption } from "./LayoutEngine";

// Define message format for the worker
interface LayoutWorkerMessage {
  id: string;
  action: "computeLayout" | "cancelComputation";
  layoutType?: LayoutEngineOption;
  serializedGraph?: SerializedSceneGraph;
}

interface _LayoutWorkerResponse {
  id: string;
  result?: ILayoutEngineResult;
  error?: string;
  type?: "progress" | "complete" | "cancelled" | "error";
  progress?: number;
}

// Create a SceneGraph instance from serialized data
function deserializeSceneGraph(
  serializedGraph: SerializedSceneGraph
): SceneGraph {
  const sceneGraph = new SceneGraph();
  sceneGraph.fromSerialized(serializedGraph);
  return sceneGraph;
}

// Track active computations and their cancellation status
const activeComputations = new Map<string, { cancelled: boolean }>();

// Handle the layout computation in the worker context
async function handleComputeLayout(
  message: LayoutWorkerMessage
): Promise<ILayoutEngineResult> {
  const { id, layoutType, serializedGraph } = message;

  // Register this computation as active
  activeComputations.set(id, { cancelled: false });

  const sceneGraph = deserializeSceneGraph(serializedGraph!);
  let progressReportCount = 0;

  // Setup progress reporting
  const progressInterval = setInterval(() => {
    if (activeComputations.has(id)) {
      // Check if computation was cancelled
      if (activeComputations.get(id)?.cancelled) {
        clearInterval(progressInterval);
        return;
      }

      // Simulate progress (0-100%)
      progressReportCount++;
      const progress = Math.min(95, progressReportCount * 5); // Cap at 95% until complete

      // Report progress back to main thread
      self.postMessage({
        id,
        type: "progress",
        progress,
      });
    } else {
      clearInterval(progressInterval);
    }
  }, 250);

  try {
    // Check for cancellation before starting heavy computation
    if (activeComputations.get(id)?.cancelled) {
      clearInterval(progressInterval);
      throw new Error("Computation cancelled");
    }

    // Handle different layout types
    let result: ILayoutEngineResult;

    // Check for cancellation frequently during computation
    const checkCancellation = () => {
      if (activeComputations.get(id)?.cancelled) {
        throw new Error("Computation cancelled");
      }
    };

    // Periodically check for cancellation
    const cancellationCheckInterval = setInterval(() => {
      try {
        checkCancellation();
      } catch (e) {
        clearInterval(cancellationCheckInterval);
        throw e;
      }
    }, 100);

    try {
      if (
        Object.values(GraphologyLayoutType).includes(
          layoutType as GraphologyLayoutType
        )
      ) {
        const positions = await new GraphologyLayoutEngine().computeLayout(
          sceneGraph.getGraph(),
          layoutType as GraphologyLayoutType
        );
        checkCancellation();
        result = { positions, layoutType: layoutType as GraphologyLayoutType };
      } else if (
        Object.values(GraphvizLayoutType).includes(
          layoutType as GraphvizLayoutType
        )
      ) {
        const output = await GraphvizLayoutEngine.computeLayout(
          sceneGraph,
          layoutType as GraphvizLayoutType
        );
        checkCancellation();
        result = { ...output, layoutType: layoutType as GraphvizLayoutType };
      } else if (
        Object.values(CustomLayoutType).includes(layoutType as CustomLayoutType)
      ) {
        const positions = computeCustomLayout(
          sceneGraph,
          layoutType as CustomLayoutType
        );
        checkCancellation();
        result = { positions, layoutType: layoutType as CustomLayoutType };
      } else {
        throw new Error("Invalid layout type: " + layoutType);
      }
    } finally {
      clearInterval(cancellationCheckInterval);
    }

    // Check for cancellation again before returning result
    if (activeComputations.get(id)?.cancelled) {
      clearInterval(progressInterval);
      throw new Error("Computation cancelled");
    }

    clearInterval(progressInterval);
    activeComputations.delete(id);
    return result!;
  } catch (error) {
    clearInterval(progressInterval);
    activeComputations.delete(id);

    // Format cancellation errors consistently
    if (error instanceof Error && error.message === "Computation cancelled") {
      error.name = "CancellationError";
    }

    throw error;
  }
}

// Worker message handler
self.onmessage = async (e: MessageEvent<LayoutWorkerMessage>) => {
  const message = e.data;

  try {
    // Handle different message types
    if (message.action === "computeLayout") {
      // Start the computation
      try {
        const result = await handleComputeLayout(message);

        // Send complete result back
        self.postMessage({
          id: message.id,
          result,
          type: "complete",
        });
      } catch (error) {
        // Check if this was a cancellation
        if (
          error instanceof Error &&
          (error.name === "CancellationError" ||
            error.message.includes("cancelled"))
        ) {
          console.log(`Worker: Layout computation ${message.id} was cancelled`);
          self.postMessage({
            id: message.id,
            type: "cancelled",
          });
        } else {
          // Real error
          console.error(`Worker: Error in layout computation:`, error);
          self.postMessage({
            id: message.id,
            error: error instanceof Error ? error.message : String(error),
            type: "error",
          });
        }
      }
    } else if (message.action === "cancelComputation") {
      // Mark computation as cancelled immediately
      if (activeComputations.has(message.id)) {
        console.log(`Worker: Marking computation ${message.id} as cancelled`);
        activeComputations.get(message.id)!.cancelled = true;

        // Respond immediately to confirm cancellation
        self.postMessage({
          id: message.id,
          type: "cancelled",
        });
      }
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error("Worker: Unexpected error:", error);
    self.postMessage({
      id: message.id,
      error: error instanceof Error ? error.message : String(error),
      type: "error",
    });
  }
};

export {}; // Ensure this is treated as a module
