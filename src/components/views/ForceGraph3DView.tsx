import { ForceGraph3DInstance } from "3d-force-graph";
import { Settings2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ForceGraphManager } from "../../core/force-graph/ForceGraphManager";
import {
  getCurrentSceneGraph,
  getForceGraphInstance,
} from "../../store/appConfigStore";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import {
  getForceGraphInitializationStatus,
  initializeTabForceGraph,
  isMainForceGraphInstanceAvailable,
} from "../../utils/forceGraphInitializer";
import ForceGraphRenderConfigEditor from "./ForceGraph3d/ForceGraphRenderConfigEditor";

interface ForceGraph3DViewProps {
  width?: number;
  height?: number;
  useMainInstance?: boolean; // If true, uses the main instance; if false, creates its own
}

/**
 * ForceGraph3D view component that can display either the main ForceGraph3D instance
 * or create its own dedicated instance for use in app-shell tabs.
 */
const ForceGraph3DView: React.FC<ForceGraph3DViewProps> = ({
  width = 800,
  height = 600,
  useMainInstance = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ownInstance, setOwnInstance] = useState<ForceGraph3DInstance | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationAttemptedRef = useRef<boolean>(false);

  // Add state for display config editor
  const [showDisplayConfig, setShowDisplayConfig] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.body.classList.contains("dark-mode");
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Watch for changes to dark mode
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Handle display config changes
  const handleApplyForceGraphConfig = (config: IForceGraphRenderConfig) => {
    const sceneGraph = getCurrentSceneGraph();
    if (sceneGraph) {
      sceneGraph.setForceGraphRenderConfig(config);

      // Apply to main instance if available
      const mainInstance = getForceGraphInstance();
      if (mainInstance) {
        ForceGraphManager.applyForceGraphRenderConfig(
          mainInstance,
          config,
          sceneGraph
        );
      }

      // Apply to own instance if we have one
      if (ownInstance) {
        ForceGraphManager.applyForceGraphRenderConfig(
          ownInstance,
          config,
          sceneGraph
        );
      }
    }
  };

  // Handle click outside to close editor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDisplayConfig &&
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(
          'button[title="Display Configuration"]'
        )
      ) {
        setShowDisplayConfig(false);
      }
    };

    if (showDisplayConfig) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDisplayConfig]);

  useEffect(() => {
    console.log("ForceGraph3DView useEffect triggered", {
      hasContainer: !!containerRef.current,
      isInitialized,
      useMainInstance,
      width,
      height,
    });

    // Don't re-initialize if already attempted
    if (initializationAttemptedRef.current) {
      console.log("Initialization already attempted, skipping");
      return;
    }

    if (!containerRef.current) {
      console.log("No container ref, skipping initialization");
      return;
    }

    const initializeInstance = async () => {
      console.log("initializeInstance called");
      if (initializationAttemptedRef.current) {
        console.log("Already attempted initialization, returning");
        return;
      }

      initializationAttemptedRef.current = true;
      console.log("Starting ForceGraph3D initialization...");

      try {
        // Log current status for debugging
        const status = getForceGraphInitializationStatus();
        console.log("ForceGraph3DView initialization status:", status);

        if (useMainInstance) {
          console.log("Attempting to use main instance...");

          // Try to use the main ForceGraph3D instance
          if (isMainForceGraphInstanceAvailable()) {
            console.log("Main instance is available");
            const forceGraphInstance = getForceGraphInstance();
            console.log(
              "Got main ForceGraph3D instance:",
              !!forceGraphInstance
            );

            if (forceGraphInstance) {
              // Get the canvas element from the main force graph instance
              const canvas = forceGraphInstance.renderer().domElement;
              console.log("Got canvas from main instance:", !!canvas);

              if (canvas && containerRef.current) {
                console.log("Setting up canvas clone...");

                // Clear any existing content
                containerRef.current.innerHTML = "";

                // Clone the canvas to show in this view
                const canvasClone = canvas.cloneNode(true) as HTMLCanvasElement;
                canvasClone.style.width = `${width}px`;
                canvasClone.style.height = `${height}px`;

                containerRef.current.appendChild(canvasClone);

                // Set up a sync mechanism to keep the clone updated
                const syncCanvas = () => {
                  if (
                    canvas &&
                    canvasClone &&
                    containerRef.current?.contains(canvasClone)
                  ) {
                    const context = canvasClone.getContext("2d");
                    if (context) {
                      context.clearRect(
                        0,
                        0,
                        canvasClone.width,
                        canvasClone.height
                      );
                      context.drawImage(
                        canvas,
                        0,
                        0,
                        canvasClone.width,
                        canvasClone.height
                      );
                    }
                  }
                };

                // Start sync loop
                const syncInterval = setInterval(syncCanvas, 16); // ~60fps
                syncIntervalRef.current = syncInterval;

                console.log(
                  "Main instance setup complete, marking as initialized"
                );
                setIsInitialized(true);
                return;
              } else {
                console.warn("No canvas available from main instance");
                throw new Error("Main instance has no canvas");
              }
            } else {
              console.warn("Main instance is null despite availability check");
              throw new Error("Main instance is null");
            }
          } else {
            console.warn(
              "Main ForceGraph3D instance not available, falling back to creating own instance"
            );
            // Fallback: create our own instance
            const sceneGraph = getCurrentSceneGraph();

            if (!sceneGraph) {
              throw new Error("No scene graph available and no main instance");
            }

            console.log(
              "Creating fallback instance with scene graph:",
              sceneGraph.getMetadata().name
            );
            const newInstance = initializeTabForceGraph(
              containerRef.current!,
              sceneGraph,
              "Layout"
            );

            setOwnInstance(newInstance);
            console.log("Fallback instance created, marking as initialized");
            setIsInitialized(true);
            return;
          }
        } else {
          // Create our own ForceGraph3D instance
          console.log(
            "Creating new ForceGraph3D instance for tab (useMainInstance=false)"
          );
          const sceneGraph = getCurrentSceneGraph();

          if (!sceneGraph) {
            console.error("No scene graph available for tab instance");
            throw new Error("No scene graph available");
          }

          console.log(
            "Creating tab instance with scene graph:",
            sceneGraph.getMetadata().name
          );
          const newInstance = initializeTabForceGraph(
            containerRef.current!,
            sceneGraph,
            "Layout"
          );

          console.log("Tab instance created:", !!newInstance);
          setOwnInstance(newInstance);
          console.log("Tab instance set, marking as initialized");
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize ForceGraph3D instance:", error);
        console.error("Error details:", error);
        setInitializationError(
          error instanceof Error ? error.message : "Unknown error"
        );
        setIsInitialized(true); // Mark as initialized to stop trying
      }
    };

    // Small delay to ensure container is ready
    console.log("Setting up initialization timeout...");
    const timeoutId = setTimeout(() => {
      console.log("Timeout fired, calling initializeInstance");
      initializeInstance();
    }, 100);

    return () => {
      console.log("Cleaning up initialization timeout");
      clearTimeout(timeoutId);
    };
  }); // Remove dependency array to avoid infinite loops - component handles re-initialization internally

  // Cleanup effect for own instance and sync intervals
  useEffect(() => {
    return () => {
      // Clean up sync interval if it exists
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }

      // Clean up own instance if it exists
      if (!useMainInstance && ownInstance) {
        try {
          console.log("Cleaning up tab ForceGraph3D instance");
          ownInstance.pauseAnimation();
        } catch (error) {
          console.warn("Error cleaning up ForceGraph3D instance:", error);
        }
      }
    };
  }, [ownInstance, useMainInstance]);

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff6b6b",
          fontSize: "14px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Failed to initialize ForceGraph3D
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            {initializationError}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "16px",
        }}
      >
        <div>
          <div>Initializing ForceGraph3D...</div>
          <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
            {useMainInstance ? "Using main instance" : "Creating new instance"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height, overflow: "hidden", position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />

      {/* Display Config Button */}
      <button
        onClick={() => setShowDisplayConfig(!showDisplayConfig)}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 999999999,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          color: isDarkMode ? "#e2e8f0" : "#1f2937",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          backdropFilter: "blur(10px)",
        }}
        title="Display Configuration"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)";
        }}
      >
        <Settings2 size={20} />
      </button>

      {/* Display Config Editor Overlay */}
      {showDisplayConfig && (
        <div
          ref={editorRef}
          style={{
            position: "absolute",
            top: "70px",
            right: "20px",
            zIndex: 1001,
            width: "320px",
            maxWidth: "calc(100vw - 40px)",
            maxHeight: "calc(100vh - 90px)",
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
              backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#1f2937",
              }}
            >
              Display Configuration
            </h3>
            <button
              onClick={() => setShowDisplayConfig(false)}
              style={{
                background: "none",
                border: "none",
                color: isDarkMode ? "#9ca3af" : "#6b7280",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                fontSize: "16px",
                lineHeight: "1",
              }}
              title="Close"
            >
              ×
            </button>
          </div>
          <div
            style={{
              maxHeight: "calc(100vh - 150px)",
              overflowY: "auto",
              padding: "16px",
            }}
          >
            <ForceGraphRenderConfigEditor
              onApply={handleApplyForceGraphConfig}
              isDarkMode={isDarkMode}
              initialConfig={
                getCurrentSceneGraph()?.getForceGraphRenderConfig() || {
                  nodeTextLabels: false,
                  linkWidth: 2,
                  nodeSize: 6,
                  linkTextLabels: true,
                  nodeOpacity: 1,
                  linkOpacity: 1,
                  chargeStrength: -30,
                  backgroundColor: "#1a1a1a",
                  fontSize: 12,
                }
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceGraph3DView;
