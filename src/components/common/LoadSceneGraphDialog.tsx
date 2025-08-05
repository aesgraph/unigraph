import { getColor, useTheme } from "@aesgraph/app-shell";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { RefreshCw } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  getProject,
  listProjects,
  toSceneGraph,
} from "../../api/supabaseProjects";

import { SceneGraph } from "../../core/model/SceneGraph";
import { deserializeDotToSceneGraph } from "../../core/serializers/fromDot";
import { loadSceneGraphFromFile } from "../../core/serializers/sceneGraphLoader";
import { fetchSvgSceneGraph } from "../../hooks/useSvgSceneGraph";
import { addNotification } from "../../store/notificationStore";
import { useUserStore } from "../../store/userStore"; // <-- new import for user state
import styles from "./LoadSceneGraphDialog.module.css";
import ProjectsList from "./ProjectsList";
import SceneGraphTreeView from "./SceneGraphTreeView";

// Register AG Grid community modules (fixes AG Grid error #272)
ModuleRegistry.registerModules([AllCommunityModule]);

interface LoadSceneGraphDialogProps {
  onClose: () => void;
  onSelect: (graphKey: string) => void;
  handleLoadSceneGraph: (sceneGraph: SceneGraph) => void;
}

const LoadSceneGraphDialog: React.FC<LoadSceneGraphDialogProps> = ({
  onClose,
  onSelect,
  handleLoadSceneGraph,
}) => {
  const { theme } = useTheme();
  // Get user state from store
  const { isSignedIn } = useUserStore();

  console.log("LoadSceneGraphDialog - isSignedIn:", isSignedIn);

  // Set default tab based on user sign-in state
  const [activeTab, setActiveTab] = useState<
    "Server" | "File" | "Text" | "Svg Url" | "Demos"
  >(isSignedIn ? "Server" : "Demos");

  // Track if user manually selected a tab
  const [userSelectedTab, setUserSelectedTab] = useState(false);

  // Update active tab when authentication state changes (only if user hasn't manually selected)
  useEffect(() => {
    console.log("Auth state changed - isSignedIn:", isSignedIn);
    if (!userSelectedTab) {
      if (isSignedIn && activeTab !== "Server") {
        console.log("Switching to Server tab due to authentication");
        setActiveTab("Server");
      } else if (!isSignedIn && activeTab === "Server") {
        console.log("Switching to Demos tab due to no authentication");
        setActiveTab("Demos");
      }
    }
  }, [activeTab, isSignedIn, userSelectedTab]);
  const [textInput, setTextInput] = useState("");
  const [svgUrl, setSvgUrl] = useState("");

  // Server projects state
  const [serverProjects, setServerProjects] = useState<any[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSearchTerm, setServerSearchTerm] = useState("");

  console.log("LoadSceneGraphDialog - activeTab:", activeTab);
  console.log("LoadSceneGraphDialog - serverProjects:", serverProjects);

  const loadServerProjects = useCallback(async () => {
    setServerLoading(true);
    setServerError(null);

    try {
      const projects = await listProjects();
      setServerProjects(projects);
      // Add this log to verify the loaded projects
      console.log("loadServerProjects: loaded projects", projects);
    } catch (error) {
      console.error("Error loading server projects:", error);
      setServerError("Failed to load projects from server");
      addNotification({
        message: "Failed to load projects from server",
        type: "error",
        duration: 5000,
      });
    } finally {
      setServerLoading(false);
    }
  }, []);

  // Load server projects when Server tab is selected
  useEffect(() => {
    console.log(
      "useEffect triggered - activeTab:",
      activeTab,
      "serverProjects.length:",
      serverProjects.length,
      "isSignedIn:",
      isSignedIn
    );
    if (activeTab === "Server" && serverProjects.length === 0 && isSignedIn) {
      console.log("Loading server projects...");
      loadServerProjects();
    } else {
      console.log("Not loading server projects - conditions not met");
    }
  }, [activeTab, serverProjects.length, isSignedIn, loadServerProjects]);

  // Refresh server projects when authentication state changes
  useEffect(() => {
    if (activeTab === "Server" && isSignedIn) {
      console.log("Auth state changed, refreshing server projects...");
      loadServerProjects();
    }
  }, [isSignedIn, activeTab, loadServerProjects]);

  const handleServerProjectSelect = async (projectId: string) => {
    try {
      const project = await getProject({ id: projectId });
      if (!project) {
        throw new Error("Project not found");
      }

      const sceneGraph = toSceneGraph(project);
      handleLoadSceneGraph(sceneGraph);
      onClose();

      addNotification({
        message: `Loaded project: ${project.name}`,
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error loading server project:", error);
      addNotification({
        message: "Failed to load project from server",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleImportFileToSceneGraph = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const sceneGraph = await loadSceneGraphFromFile(file);
        if (sceneGraph) {
          handleLoadSceneGraph(sceneGraph);
          onClose();
        } else {
          throw new Error("Failed to load scene graph from file");
        }
      } catch (error) {
        console.error(`Error importing file: ${error}`);
      }
    },
    [handleLoadSceneGraph, onClose]
  );

  const handleTextSubmit = () => {
    try {
      const sceneGraph = deserializeDotToSceneGraph(textInput);
      handleLoadSceneGraph(sceneGraph);
      onClose();
    } catch (error) {
      console.error("Failed to parse text input as SceneGraph:", error);
    }
  };

  const handleSvgUrlSubmit = async () => {
    try {
      const { sceneGraph, error } = await fetchSvgSceneGraph(svgUrl);
      if (error) {
        console.error("Failed to load SVG from URL:", error);
        return;
      }
      handleLoadSceneGraph(sceneGraph);
      onClose();
    } catch (error) {
      console.error("Failed to load Svg Url:", error);
    }
  };

  const handleSelect = (key: string) => {
    onSelect(key);
    onClose();
  };

  const handleCreateNewProject = () => {
    const newSceneGraph = new SceneGraph({
      metadata: {
        name: "New Project",
        description: "A new empty project",
      },
    });
    handleLoadSceneGraph(newSceneGraph);
    onClose();
  };

  // Close dialog on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Filtering function for server projects
  const filterServerProjects = (projects: any[], searchTerm: string): any[] => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return projects;

    return projects.filter((project) => {
      if (!project || !project.name) return false;

      // Search in name
      if (project.name.toLowerCase().includes(term)) return true;

      // Search in description
      if (
        project.description &&
        project.description.toLowerCase().includes(term)
      )
        return true;

      // Search in last updated date - multiple string representations
      if (project.last_updated_at) {
        try {
          const date = new Date(project.last_updated_at);
          const searchableStrings = [
            date.toString(),
            date.toLocaleString(),
            date.toLocaleDateString(),
            date.toISOString(),
            date.toUTCString(),
            date.getFullYear().toString(),
            (date.getMonth() + 1).toString().padStart(2, "0"),
            date.getDate().toString().padStart(2, "0"),
            date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          ];

          if (
            searchableStrings.some((str) => str.toLowerCase().includes(term))
          ) {
            return true;
          }
        } catch {
          if (project.last_updated_at.toLowerCase().includes(term)) {
            return true;
          }
        }
      }

      // Search in created date - multiple string representations
      if (project.created_at) {
        try {
          const date = new Date(project.created_at);
          const searchableStrings = [
            date.toString(),
            date.toLocaleString(),
            date.toLocaleDateString(),
            date.toISOString(),
            date.toUTCString(),
            date.getFullYear().toString(),
            (date.getMonth() + 1).toString().padStart(2, "0"),
            date.getDate().toString().padStart(2, "0"),
            date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          ];

          if (
            searchableStrings.some((str) => str.toLowerCase().includes(term))
          ) {
            return true;
          }
        } catch {
          if (project.created_at.toLowerCase().includes(term)) {
            return true;
          }
        }
      }

      return false;
    });
  };

  // Memoize filtered projects to avoid unnecessary recalculation
  const filteredServerProjects = React.useMemo(
    () => filterServerProjects(serverProjects, serverSearchTerm),
    [serverProjects, serverSearchTerm]
  );

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      style={{
        backgroundColor: `rgba(0, 0, 0, 0.5)`,
      }}
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: getColor(theme.colors, "background"),
          color: getColor(theme.colors, "text"),
          border: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        <div className={styles.header}>
          <h2 style={{ color: getColor(theme.colors, "text") }}>
            Load Scene Graph
          </h2>
          <div className={styles.headerButtons}>
            <button
              onClick={handleCreateNewProject}
              className={styles.newProjectButton}
              title="Create a new empty project"
              style={{
                backgroundColor: getColor(theme.colors, "primary"),
                color: getColor(theme.colors, "background"),
              }}
            >
              New Project
            </button>
            <button
              onClick={onClose}
              className={styles.closeButton}
              style={{
                color: getColor(theme.colors, "textSecondary"),
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Server" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("Server");
              setUserSelectedTab(true);
            }}
            style={{
              color:
                activeTab === "Server"
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "textSecondary"),
              backgroundColor:
                activeTab === "Server"
                  ? getColor(theme.colors, "backgroundTertiary")
                  : "transparent",
            }}
          >
            Server
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Demos" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("Demos");
              setUserSelectedTab(true);
            }}
            style={{
              color:
                activeTab === "Demos"
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "textSecondary"),
              backgroundColor:
                activeTab === "Demos"
                  ? getColor(theme.colors, "backgroundTertiary")
                  : "transparent",
            }}
          >
            Demos
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "File" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("File");
              setUserSelectedTab(true);
            }}
            style={{
              color:
                activeTab === "File"
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "textSecondary"),
              backgroundColor:
                activeTab === "File"
                  ? getColor(theme.colors, "backgroundTertiary")
                  : "transparent",
            }}
          >
            File
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Svg Url" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("Svg Url");
              setUserSelectedTab(true);
            }}
            style={{
              color:
                activeTab === "Svg Url"
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "textSecondary"),
              backgroundColor:
                activeTab === "Svg Url"
                  ? getColor(theme.colors, "backgroundTertiary")
                  : "transparent",
            }}
          >
            Svg Url
          </button>
        </div>
        {activeTab === "File" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                maxWidth: "400px",
                width: "100%",
              }}
            >
              <div
                style={{
                  color: getColor(theme.colors, "textSecondary"),
                  fontSize: "14px",
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                Select a file to import (.json, .graphml, .svg, .dot)
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  type="file"
                  accept=".json,.graphml,.svg,.dot"
                  onChange={handleImportFileToSceneGraph}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: getColor(
                      theme.colors,
                      "backgroundSecondary"
                    ),
                    color: getColor(theme.colors, "text"),
                    border: `1px solid ${getColor(theme.colors, "border")}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "center",
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Choose File
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Demos" && (
          <div className={styles.demosTab}>
            <SceneGraphTreeView
              onSceneGraphSelect={handleSelect}
              selectedSceneGraph={undefined}
            />
          </div>
        )}
        {activeTab === "Text" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                maxWidth: "500px",
                width: "100%",
              }}
            >
              <div
                style={{
                  color: getColor(theme.colors, "textSecondary"),
                  fontSize: "14px",
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                Paste SceneGraph JSON here
              </div>
              <textarea
                placeholder="Paste SceneGraph JSON here..."
                style={{
                  width: "100%",
                  height: "200px",
                  padding: "12px",
                  backgroundColor: getColor(
                    theme.colors,
                    "backgroundSecondary"
                  ),
                  color: getColor(theme.colors, "text"),
                  border: `1px solid ${getColor(theme.colors, "border")}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "monospace",
                }}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
              <button
                style={{
                  padding: "12px 24px",
                  backgroundColor: getColor(theme.colors, "primary"),
                  color: getColor(theme.colors, "background"),
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
                onClick={handleTextSubmit}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Load
              </button>
            </div>
          </div>
        )}
        {activeTab === "Svg Url" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                maxWidth: "400px",
                width: "100%",
              }}
            >
              <div
                style={{
                  color: getColor(theme.colors, "textSecondary"),
                  fontSize: "14px",
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                Enter an SVG URL to import
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Enter Svg Url..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: getColor(
                      theme.colors,
                      "backgroundSecondary"
                    ),
                    color: getColor(theme.colors, "text"),
                    border: `1px solid ${getColor(theme.colors, "border")}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  value={svgUrl}
                  onChange={(e) => setSvgUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSvgUrlSubmit();
                    }
                  }}
                />
                <button
                  style={{
                    padding: "12px 24px",
                    backgroundColor: getColor(theme.colors, "primary"),
                    color: getColor(theme.colors, "background"),
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                  }}
                  onClick={handleSvgUrlSubmit}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Server" && (
          <div className={styles.serverTab}>
            {!isSignedIn ? (
              <div
                className={styles.loginPrompt}
                style={{
                  backgroundColor: getColor(
                    theme.colors,
                    "backgroundSecondary"
                  ),
                  border: `1px solid ${getColor(theme.colors, "border")}`,
                }}
              >
                <div
                  className={styles.loginContent}
                  style={{
                    color: getColor(theme.colors, "text"),
                  }}
                >
                  <h3 style={{ color: getColor(theme.colors, "text") }}>
                    Sign in to access your projects
                  </h3>
                  <p style={{ color: getColor(theme.colors, "textSecondary") }}>
                    You need to be signed in to view and load projects from the
                    server.
                  </p>
                  <button
                    className={styles.loginButton}
                    style={{
                      backgroundColor: getColor(theme.colors, "primary"),
                      color: getColor(theme.colors, "background"),
                    }}
                    onClick={() => {
                      // Open signin page as popup with better dimensions and centering
                      const width = 800;
                      const height = 600;
                      const left = (window.screen.width - width) / 2;
                      const top = (window.screen.height - height) / 2;

                      const popup = window.open(
                        "/signin",
                        "signin",
                        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
                      );

                      if (popup) {
                        // Listen for messages from popup
                        const handleMessage = (event: MessageEvent) => {
                          if (event.origin !== window.location.origin) return;

                          if (event.data.type === "SIGNED_IN") {
                            console.log(
                              "User signed in via popup:",
                              event.data.user
                            );
                            window.removeEventListener(
                              "message",
                              handleMessage
                            );
                          } else if (event.data.type === "SIGNIN_CANCELLED") {
                            console.log("Sign-in was cancelled");
                            window.removeEventListener(
                              "message",
                              handleMessage
                            );
                          }
                        };

                        window.addEventListener("message", handleMessage);
                      } else {
                        // Popup was blocked, fallback to redirect
                        window.location.href = "/signin";
                      }
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.toolbar}>
                  <input
                    type="text"
                    placeholder="Search for projects..."
                    className={styles.searchBar}
                    value={serverSearchTerm}
                    onChange={(e) => setServerSearchTerm(e.target.value)}
                    style={{
                      backgroundColor: getColor(
                        theme.colors,
                        "backgroundSecondary"
                      ),
                      color: getColor(theme.colors, "text"),
                      border: `1px solid ${getColor(theme.colors, "border")}`,
                    }}
                  />
                  <button
                    className={styles.toolbarIconButton}
                    onClick={loadServerProjects}
                    disabled={serverLoading}
                    title="Refresh projects"
                    style={{
                      color: getColor(theme.colors, "primary"),
                    }}
                  >
                    <RefreshCw
                      size={20}
                      className={serverLoading ? styles.spinning : ""}
                    />
                  </button>
                </div>
                {serverLoading ? (
                  // Don't render anything during loading - just show empty space
                  <div
                    style={{
                      height: "200px",
                      backgroundColor: getColor(theme.colors, "background"),
                    }}
                  />
                ) : (
                  <ProjectsList
                    projects={filteredServerProjects}
                    loading={false}
                    error={serverError}
                    onProjectDoubleClick={handleServerProjectSelect}
                    onRefresh={loadServerProjects}
                    style={{ marginTop: 0 }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadSceneGraphDialog;
