import {
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  FilePlus,
  Folder,
  FolderOpen,
  MinusSquare,
  Plus,
  PlusSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { loadSceneGraphFromFile } from "../../core/serializers/sceneGraphLoader";
import { StoredSceneGraphInfo } from "../../core/storage/IPersistentStore";
import { persistentStore } from "../../core/storage/PersistentStoreManager";
import { DEMO_SCENE_GRAPHS } from "../../data/DemoSceneGraphs";
import useAppConfigStore, {
  setActiveProjectId,
} from "../../store/appConfigStore";
import LoadSceneGraphDialog from "../common/LoadSceneGraphDialog";
import "./ProjectManager.css";
import SaveProjectDialog from "./SaveProjectDialog"; // Import the new component

interface ProjectManagerProps {
  onProjectSelected: (sceneGraph: SceneGraph) => void;
  isDarkMode: boolean;
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isGraph: boolean;
  isOpen?: boolean;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  onProjectSelected,
  isDarkMode,
}) => {
  const [projects, setProjects] = useState<StoredSceneGraphInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"myProjects" | "demoGraphs">(
    "myProjects"
  );
  const { currentSceneGraph, activeProjectId } = useAppConfigStore();

  useEffect(() => {
    setSelectedProjectId(activeProjectId);
  }, [activeProjectId]);

  // Demo Graphs tree state
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  // Add search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Add state for showing the load dialog
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Add state for the save dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Initialize tree data for demo graphs
  useEffect(() => {
    const initialTreeData: TreeNode[] = Object.entries(DEMO_SCENE_GRAPHS).map(
      ([category, { graphs }]) => ({
        id: category,
        label: category,
        isGraph: false,
        isOpen: false,
        children: Object.keys(graphs).map((graphId) => ({
          id: graphId,
          label: graphId,
          isGraph: true,
        })),
      })
    );

    setTreeData(initialTreeData);
  }, []);

  // Load the list of projects
  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const projectList = await persistentStore.listSceneGraphs();
      setProjects(projectList);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Save current scene graph - updated to show dialog for new projects
  const handleSaveCurrent = async () => {
    try {
      if (selectedProjectId) {
        // If we have a selected project, update it directly
        await persistentStore.updateSceneGraph(
          selectedProjectId,
          currentSceneGraph
        );
        console.log(`Updated existing project: ${selectedProjectId}`);
        await loadProjects(); // Refresh the list
      } else {
        // If no project is selected, show the save dialog
        setShowSaveDialog(true);
      }
    } catch (err) {
      console.error("Error saving project:", err);
      setError("Failed to save project");
    }
  };

  // Add handler for save dialog submit
  const handleSaveDialogSubmit = async (name: string, description: string) => {
    try {
      // Update the metadata in the scene graph
      const metadata = currentSceneGraph.getMetadata() || {};
      currentSceneGraph.setMetadata({
        ...metadata,
        name,
        description,
      });

      // Save the scene graph
      const id = await persistentStore.saveSceneGraph(currentSceneGraph, {
        createThumbnail: true,
      });

      setSelectedProjectId(id);
      await loadProjects(); // Refresh the list
      setActiveTab("myProjects"); // Switch to My Projects tab
      setShowSaveDialog(false); // Close the dialog
    } catch (err) {
      console.error("Error saving project:", err);
      setError("Failed to save project");
    }
  };

  // Load a project from persistent storage
  const handleLoadProject = async (projectId: string) => {
    try {
      const sceneGraph = await persistentStore.loadSceneGraph(projectId);

      if (sceneGraph) {
        setSelectedProjectId(projectId);
        setActiveProjectId(projectId);
        setSelectedDemoId(null);
        onProjectSelected(sceneGraph);
      } else {
        setError("Project not found");
      }
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Failed to load project");
    }
  };

  // Load a demo graph
  const handleLoadDemoGraph = async (graphId: string) => {
    try {
      // Find the category that contains this graph
      const category = Object.entries(DEMO_SCENE_GRAPHS).find(
        ([_, { graphs }]) => Object.keys(graphs).includes(graphId)
      )?.[0];

      if (!category) {
        throw new Error(`Graph ${graphId} not found in any category`);
      }

      const graph = DEMO_SCENE_GRAPHS[category].graphs[graphId];
      let sceneGraph: SceneGraph;

      if (typeof graph === "function") {
        sceneGraph = await graph();
      } else {
        sceneGraph = graph;
      }

      setSelectedDemoId(graphId);
      setSelectedProjectId(null);
      setActiveProjectId(null);
      onProjectSelected(sceneGraph);
    } catch (err) {
      console.error("Error loading demo graph:", err);
      setError("Failed to load demo graph");
    }
  };

  // Delete a project
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await persistentStore.deleteSceneGraph(projectId);

        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }

        await loadProjects(); // Refresh the list
      } catch (err) {
        console.error("Error deleting project:", err);
        setError("Failed to delete project");
      }
    }
  };

  // Import a scene graph from a file
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.graphml,.svg,.dot";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // First, load the scene graph using our unified loader
        const sceneGraph = await loadSceneGraphFromFile(file);
        // Then, save it to persistent storage
        await persistentStore.saveSceneGraph(sceneGraph, {
          createThumbnail: true,
        });
        await loadProjects(); // Refresh the list
        setActiveTab("myProjects"); // Switch to My Projects tab
      } catch (err) {
        console.error("Error importing project:", err);
        setError("Failed to import project");
      }
    };

    input.click();
  };

  // Export a scene graph to a file
  const handleExport = async (projectId: string) => {
    try {
      const blob = await persistentStore.exportSceneGraph(projectId);
      const project = projects.find((p) => p.id === projectId);
      const fileName = `${project?.name || "scene-graph"}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting project:", err);
      setError("Failed to export project");
    }
  };

  // Toggle tree node expansion
  const toggleNode = (nodeId: string) => {
    setTreeData((prevTree) =>
      prevTree.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isOpen: !node.isOpen };
        }
        return node;
      })
    );
  };

  // Toggle all tree nodes expansion
  const expandAll = () => {
    setTreeData((prevTree) =>
      prevTree.map((node) => ({
        ...node,
        isOpen: true,
      }))
    );
  };

  const collapseAll = () => {
    setTreeData((prevTree) =>
      prevTree.map((node) => ({
        ...node,
        isOpen: false,
      }))
    );
  };

  // Handler for search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Auto-expand categories containing matching items
    if (term) {
      setTreeData((prevTree) =>
        prevTree.map((node) => {
          const matchesCategory = node.label.toLowerCase().includes(term);
          const matchesChild = node.children?.some((child) =>
            child.label.toLowerCase().includes(term)
          );
          return {
            ...node,
            isOpen: matchesCategory || matchesChild || node.isOpen,
          };
        })
      );
    }
  };

  // Highlight text matching the search term
  const highlightText = (text: string, term: string) => {
    if (!term) return text;

    const parts = text.split(new RegExp(`(${term})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <span key={i} className="highlight">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Filter tree data based on search term
  const filteredTreeData = searchTerm
    ? treeData
        .filter(
          (node) =>
            node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.children?.some((child) =>
              child.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .map((node) => ({
          ...node,
          children: node.children?.filter((child) =>
            child.label.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
    : treeData;

  // Updated render tree node function to include highlighting
  const renderTreeNode = (node: TreeNode, level: number) => {
    const paddingLeft = level * 16 + "px";

    // Filter children if there's a search term
    const filteredChildren =
      searchTerm && node.children
        ? node.children.filter((child) =>
            child.label.toLowerCase().includes(searchTerm)
          )
        : node.children;

    return (
      <React.Fragment key={node.id}>
        <div
          className={`tree-node ${node.isGraph && selectedDemoId === node.id ? "selected" : ""}`}
          style={{ paddingLeft }}
          onClick={() => {
            if (node.isGraph) {
              handleLoadDemoGraph(node.id);
            } else if (node.children) {
              toggleNode(node.id);
            }
          }}
        >
          {node.children ? (
            <span className="tree-icon">
              {node.isOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          ) : (
            <span className="tree-icon">
              <Database size={14} />
            </span>
          )}
          <span className="tree-label">
            {highlightText(node.label, searchTerm)}
          </span>
        </div>

        {node.isOpen &&
          filteredChildren &&
          filteredChildren.map((child) => renderTreeNode(child, level + 1))}
      </React.Fragment>
    );
  };

  // Add function to handle opening the new graph dialog
  const handleNew = () => {
    setShowLoadDialog(true);
  };

  return (
    <div className={`project-manager ${isDarkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className="project-manager-header">
        <h3>Projects</h3>
        <div className="project-manager-actions">
          <button title="New" onClick={handleNew} className="action-button">
            <Plus size={16} />
          </button>
          <button
            title="Save Current"
            onClick={handleSaveCurrent}
            className="action-button"
          >
            <FilePlus size={16} />
          </button>
          <button
            title="Import"
            onClick={handleImport}
            className="action-button"
          >
            <FolderOpen size={16} />
          </button>
          <button
            title="Refresh"
            onClick={loadProjects}
            className="action-button"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="project-tabs">
        <button
          className={`tab-button ${activeTab === "myProjects" ? "active" : ""}`}
          onClick={() => setActiveTab("myProjects")}
        >
          My Projects
        </button>
        <button
          className={`tab-button ${activeTab === "demoGraphs" ? "active" : ""}`}
          onClick={() => setActiveTab("demoGraphs")}
        >
          Demo Graphs
        </button>
      </div>

      {/* Error message */}
      {error && <div className="project-error">{error}</div>}

      {/* Tab Content */}
      <div className="tab-content">
        {/* My Projects Tab */}
        {activeTab === "myProjects" && (
          <div className="projects-list">
            {loading ? (
              <div className="projects-loading">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="projects-empty">
                <p>No saved projects</p>
                <button
                  className="new-project-button"
                  onClick={handleSaveCurrent}
                >
                  <Plus size={16} /> Save Current Project
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`project-item ${selectedProjectId === project.id ? "selected" : ""}`}
                  onClick={() => handleLoadProject(project.id)}
                >
                  <div className="project-icon">
                    <Folder size={18} />
                  </div>
                  <div className="project-details">
                    <div className="project-name">{project.name}</div>
                    <div className="project-dates">
                      <span className="project-date-label">Modified:</span>
                      <span className="project-date">
                        {new Date(project.lastModified).toLocaleString()}
                      </span>
                      {project.createdAt && (
                        <>
                          <span className="project-date-label">Created:</span>
                          <span className="project-date">
                            {new Date(project.createdAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="project-actions">
                    <button
                      title="Export"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(project.id);
                      }}
                      className="project-action-button"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="project-action-button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Demo Graphs Tab with search */}
        {activeTab === "demoGraphs" && (
          <div className="demo-graphs-list">
            <div className="demo-search-container">
              <input
                type="text"
                placeholder="Search graphs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="demo-search-input"
              />
              <div className="tree-controls">
                <button
                  title="Expand All"
                  onClick={expandAll}
                  className="tree-control-button"
                >
                  <PlusSquare size={16} />
                </button>
                <button
                  title="Collapse All"
                  onClick={collapseAll}
                  className="tree-control-button"
                >
                  <MinusSquare size={16} />
                </button>
              </div>
            </div>
            {filteredTreeData.map((node) => renderTreeNode(node, 0))}
            {filteredTreeData.length === 0 && (
              <div className="no-results">No matching graphs found</div>
            )}
          </div>
        )}
      </div>

      {/* Add LoadSceneGraphDialog */}
      {showLoadDialog && (
        <LoadSceneGraphDialog
          onClose={() => setShowLoadDialog(false)}
          onSelect={(key) => {
            handleLoadDemoGraph(key);
            setShowLoadDialog(false);
          }}
          isDarkMode={isDarkMode}
          handleLoadSceneGraph={(sceneGraph) => {
            onProjectSelected(sceneGraph);
            setShowLoadDialog(false);
          }}
        />
      )}

      {/* Add Save Dialog */}
      {showSaveDialog && (
        <SaveProjectDialog
          onSave={handleSaveDialogSubmit}
          onCancel={() => setShowSaveDialog(false)}
          isDarkMode={isDarkMode}
          initialName={currentSceneGraph.getMetadata()?.name || ""}
          initialDescription={
            currentSceneGraph.getMetadata()?.description || ""
          }
        />
      )}
    </div>
  );
};

export default ProjectManager;
