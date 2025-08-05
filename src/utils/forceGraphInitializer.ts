import { ForceGraph3DInstance } from "3d-force-graph";
import { SceneGraph } from "../core/model/SceneGraph";
import {
  createForceGraph,
  bindEventsToGraphInstance,
} from "../core/force-graph/createForceGraph";
import {
  getCurrentSceneGraph,
  setForceGraphInstance,
  getForceGraphInstance,
} from "../store/appConfigStore";
import { applyMouseClickModeFromInteractivityFlags } from "../store/mouseControlsStore";
import { NodeId } from "../core/model/Node";
import { EntityIds } from "../core/model/entity/entityIds";

export interface ForceGraphInitializerOptions {
  container: HTMLDivElement;
  sceneGraph?: SceneGraph;
  layout?: "Physics" | "Layout";
  onNodesRightClick?: (
    event: MouseEvent | React.MouseEvent,
    nodeIds: EntityIds<NodeId>
  ) => void;
  onBackgroundRightClick?: (event: MouseEvent | React.MouseEvent) => void;
  setAsMainInstance?: boolean;
  instanceId?: string; // For persistent instances (future use)
}

/**
 * Initializes a ForceGraph3D instance with the provided configuration.
 * This utility function can be used by both the main App and ForceGraph3DView tabs.
 *
 * @param options Configuration options for initializing the ForceGraph3D instance
 * @returns The initialized ForceGraph3DInstance
 */
export const initializeForceGraphInstance = (
  options: ForceGraphInitializerOptions
): ForceGraph3DInstance => {
  const {
    container,
    sceneGraph,
    layout = "Layout",
    onNodesRightClick,
    onBackgroundRightClick,
    setAsMainInstance = false,
  } = options;

  if (!container) {
    throw new Error(
      "Container element is required for ForceGraph3D initialization"
    );
  }

  // Use provided scene graph or fall back to current scene graph from store
  const targetSceneGraph: SceneGraph = sceneGraph || getCurrentSceneGraph();

  if (!targetSceneGraph) {
    throw new Error("No scene graph available for ForceGraph3D initialization");
  }

  console.log("Creating new force graph instance...", {
    sceneGraphName: targetSceneGraph.getMetadata().name,
    layout,
    setAsMainInstance,
    hasEventHandlers: !!(onNodesRightClick && onBackgroundRightClick),
    containerReady: !!container,
  });

  try {
    const newInstance = createForceGraph(
      targetSceneGraph,
      container,
      targetSceneGraph.getDisplayConfig().nodePositions,
      targetSceneGraph.getForceGraphRenderConfig(),
      layout
    );

    if (!newInstance) {
      throw new Error("createForceGraph returned null/undefined");
    }

    // Set as main instance in the store if requested
    if (setAsMainInstance) {
      setForceGraphInstance(newInstance);
    }

    // Bind events if handlers are provided
    if (onNodesRightClick && onBackgroundRightClick) {
      bindEventsToGraphInstance(
        newInstance,
        targetSceneGraph,
        onNodesRightClick,
        onBackgroundRightClick
      );
    }

    // Apply mouse click mode from interactivityFlags if specified
    const interactivityFlags =
      targetSceneGraph.getData().defaultAppConfig?.interactivityFlags;
    if (interactivityFlags?.mouseClickMode) {
      console.log(
        "Applying mouse click mode to new ForceGraph3D instance:",
        interactivityFlags.mouseClickMode
      );
      applyMouseClickModeFromInteractivityFlags(
        interactivityFlags.mouseClickMode
      );
    }

    // Initialize the force graph engine
    setTimeout(() => {
      try {
        newInstance?.onEngineTick(() => {});
      } catch (err) {
        console.warn("Error setting up engine tick:", err);
      }
    }, 800);

    // Ensure proper sizing - this is critical for visibility
    setTimeout(() => {
      try {
        if (container && newInstance) {
          const rect = container.getBoundingClientRect();
          console.log(`Container dimensions: ${rect.width}x${rect.height}`);

          // Set explicit dimensions if the methods exist
          if (typeof (newInstance as any).width === "function") {
            (newInstance as any).width(rect.width || 800);
          }
          if (typeof (newInstance as any).height === "function") {
            (newInstance as any).height(rect.height || 600);
          }

          console.log("Applied explicit dimensions to ForceGraph3D instance");
        }
      } catch (err) {
        console.warn("Error setting up dimensions:", err);
      }
    }, 100);

    console.log("ForceGraph3D instance successfully initialized");
    return newInstance;
  } catch (error) {
    console.error("Error in initializeForceGraphInstance:", error);
    throw error;
  }
};

/**
 * Convenience function for initializing the main ForceGraph3D instance in the App
 */
export const initializeMainForceGraph = (
  container: HTMLDivElement,
  onNodesRightClick: (
    event: MouseEvent | React.MouseEvent,
    nodeIds: EntityIds<NodeId>
  ) => void,
  onBackgroundRightClick: (event: MouseEvent | React.MouseEvent) => void,
  layout?: "Physics" | "Layout"
): ForceGraph3DInstance => {
  return initializeForceGraphInstance({
    container,
    layout,
    onNodesRightClick,
    onBackgroundRightClick,
    setAsMainInstance: true,
  });
};

/**
 * Convenience function for initializing a ForceGraph3D instance for tabs
 * (without setting as main instance)
 */
export const initializeTabForceGraph = (
  container: HTMLDivElement,
  sceneGraph?: SceneGraph,
  layout?: "Physics" | "Layout"
): ForceGraph3DInstance => {
  console.log("=== initializeTabForceGraph START ===");
  console.log("initializeTabForceGraph called with:", {
    container: container ? "HTMLDivElement" : "null",
    containerDimensions: container
      ? `${container.offsetWidth}x${container.offsetHeight}`
      : "N/A",
    sceneGraph: sceneGraph
      ? sceneGraph.getMetadata().name
      : "using store default",
    layout,
  });

  try {
    console.log("Calling initializeForceGraphInstance...");
    const result = initializeForceGraphInstance({
      container,
      sceneGraph,
      layout,
      setAsMainInstance: false,
    });

    console.log("initializeForceGraphInstance returned:", !!result);
    console.log("Tab ForceGraph3D instance created successfully");
    console.log("=== initializeTabForceGraph END (SUCCESS) ===");
    return result;
  } catch (error) {
    console.error("=== initializeTabForceGraph END (ERROR) ===");
    console.error("Error in initializeTabForceGraph:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    throw error;
  }
};

/**
 * Checks if the main ForceGraph3D instance is available and initialized
 */
export const isMainForceGraphInstanceAvailable = (): boolean => {
  const instance = getCurrentSceneGraph();
  const forceGraphInstance = getForceGraphInstance();

  console.log("Checking main instance availability:", {
    hasSceneGraph: !!instance,
    hasForceGraphInstance: !!forceGraphInstance,
    sceneGraphName: instance?.getMetadata().name,
  });

  return !!instance && !!forceGraphInstance;
};

/**
 * Gets the current status of ForceGraph3D initialization
 */
export const getForceGraphInitializationStatus = () => {
  const sceneGraph = getCurrentSceneGraph();
  const forceGraphInstance = getForceGraphInstance();

  return {
    hasSceneGraph: !!sceneGraph,
    hasMainInstance: !!forceGraphInstance,
    sceneGraphName: sceneGraph?.getMetadata().name || "No scene graph",
    canCreateTabInstance: !!sceneGraph,
    canUseMainInstance: !!sceneGraph && !!forceGraphInstance,
  };
};
