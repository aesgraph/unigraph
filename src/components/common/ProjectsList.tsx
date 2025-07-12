import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeBalham,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  confirmAction,
  copyProject,
  deleteProjectAction,
  editProject,
  exportProject,
  handleProjectActionResult,
} from "../../api/projectActions";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface ProjectRow {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  last_updated_at?: string;
}

interface ProjectsListProps {
  projects: ProjectRow[];
  loading?: boolean;
  error?: string | null;
  onProjectDoubleClick?: (projectId: string) => void;
  onRefresh?: () => void;
  style?: React.CSSProperties;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  loading,
  error,
  onProjectDoubleClick,
  onRefresh,
  style = {},
}) => {
  // Copy dialog state
  const [copyDialog, setCopyDialog] = useState<{
    projectId: string;
    projectName: string;
    newName: string;
  } | null>(null);

  // Spinner state for copy progress
  const [copying, setCopying] = useState(false);

  // Edit dialog state (was missing)
  const [editDialog, setEditDialog] = useState<{
    projectId: string;
    projectName: string;
    projectDescription: string;
    newName: string;
    newDescription: string;
  } | null>(null);

  // Handle copy with custom name
  const handleCopy = async (projectId: string) => {
    const project = projectsRef.current.find((p) => p.id === projectId);
    if (project) {
      setCopyDialog({
        projectId,
        projectName: project.name,
        newName: `${project.name} - copy`,
      });
    }
  };

  // Save copy to Supabase
  const handleSaveCopy = async () => {
    if (!copyDialog) return;
    setCopying(true);
    try {
      const result = await copyProject(
        copyDialog.projectId,
        copyDialog.newName
      );
      handleProjectActionResult(result, () => {
        setCopyDialog(null);
        setCopying(false);
        onRefresh?.(); // Refresh the project list
      });
    } finally {
      setCopying(false);
      setCopyDialog(null);
    }
  };

  // Cancel copy
  const handleCancelCopy = () => {
    setCopyDialog(null);
  };

  // Handle edit
  const handleEdit = async (projectId: string) => {
    const project = projectsRef.current.find((p) => p.id === projectId);
    if (project) {
      setEditDialog({
        projectId,
        projectName: project.name,
        projectDescription: project.description || "",
        newName: project.name,
        newDescription: project.description || "",
      });
    }
  };

  // Save edit changes
  const handleSaveEdit = async () => {
    if (!editDialog) return;

    const result = await editProject(editDialog.projectId, {
      name: editDialog.newName.trim(),
      description: editDialog.newDescription.trim(),
    });

    handleProjectActionResult(result, () => {
      setEditDialog(null);
      onRefresh?.(); // Refresh the project list
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditDialog(null);
  };

  // Add a ref to always have the latest projects array
  const projectsRef = useRef<ProjectRow[]>(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Handle export
  const handleExport = async (projectId: string) => {
    // Use the ref to get the latest projects array
    console.log(
      "handleExport called with projectId:",
      projectId,
      projectsRef.current
    );
    const project = projectsRef.current.find((p) => p.id === projectId);
    if (project) {
      console.log("Found project:", project);
      const result = await exportProject(projectId, project.name);
      handleProjectActionResult(result);
    } else {
      console.log("Project not found for ID:", projectId);
    }
  };

  // Handle delete
  const handleDelete = async (projectId: string) => {
    console.log("handleDelete called with projectId:", projectId);
    const project = projectsRef.current.find((p) => p.id === projectId);
    if (project) {
      const confirmed = await confirmAction(
        `Are you sure you want to delete "${project.name}"?`
      );

      if (confirmed) {
        const result = await deleteProjectAction(projectId, project.name);
        handleProjectActionResult(result, () => {
          onRefresh?.(); // Refresh the project list
        });
      }
    }
  };

  // Action column renderer
  const ActionCellRenderer = (props: any) => {
    const { data } = props;
    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: 36,
        }}
      >
        <button
          title="Export"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#1976d2",
            padding: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => {
            console.log("Export button clicked for project:", data?.id);
            e.stopPropagation();
            handleExport(data.id);
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4M12 16l-4-4m4 4l4-4M4 20h16"
              stroke="#1976d2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          title="Copy"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#1976d2",
            padding: 2,
          }}
          onClick={(e) => {
            console.log("Copy button clicked for project:", data?.id);
            e.stopPropagation();
            handleCopy(data.id);
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <rect
              x="9"
              y="9"
              width="13"
              height="13"
              rx="2"
              stroke="#1976d2"
              strokeWidth="2"
            />
            <rect
              x="2"
              y="2"
              width="13"
              height="13"
              rx="2"
              stroke="#1976d2"
              strokeWidth="2"
            />
          </svg>
        </button>
        <button
          title="Edit"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#1976d2",
            padding: 2,
          }}
          onClick={(e) => {
            console.log("Edit button clicked for project:", data?.id);
            e.stopPropagation();
            handleEdit(data.id);
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
              stroke="#1976d2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="#1976d2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          title="Delete"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#e11d48",
            padding: 2,
          }}
          onClick={(e) => {
            console.log("Delete button clicked for project:", data?.id);
            e.stopPropagation();
            handleDelete(data.id);
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <rect
              x="5"
              y="6"
              width="14"
              height="14"
              rx="2"
              stroke="#e11d48"
              strokeWidth="2"
            />
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
              stroke="#e11d48"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    );
  };

  const [colDefs] = useState<ColDef<ProjectRow>[]>([
    { headerName: "Name", field: "name", flex: 1, filter: false },
    { headerName: "Description", field: "description", flex: 2, filter: false },
    {
      headerName: "Last Updated",
      field: "last_updated_at",
      flex: 1,
      filter: false,
      valueFormatter: (params) =>
        params.value
          ? new Date(params.value as string).toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
      comparator: (valueA, valueB) => {
        const a = valueA ? new Date(valueA as string).getTime() : 0;
        const b = valueB ? new Date(valueB as string).getTime() : 0;
        return a - b;
      },
    },
    {
      headerName: "Created",
      field: "created_at",
      flex: 1,
      filter: false,
      valueFormatter: (params) =>
        params.value
          ? new Date(params.value as string).toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
      comparator: (valueA, valueB) => {
        const a = valueA ? new Date(valueA as string).getTime() : 0;
        const b = valueB ? new Date(valueB as string).getTime() : 0;
        return a - b;
      },
    },
    {
      headerName: "",
      flex: 1,
      minWidth: 120,
      maxWidth: 160,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
    },
  ]);

  // Debug the first project structure
  if (projects.length > 0) {
    console.log("First project structure:", projects[0]);
    console.log("First project keys:", Object.keys(projects[0]));
    console.log("First project id:", projects[0].id);
    console.log("First project name:", projects[0].name);
  }

  const defaultColDef = useMemo(
    () => ({
      filter: false, // Disable built-in filtering to prevent interference
      sortable: true,
      resizable: true,
      minWidth: 120,
    }),
    []
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        borderRadius: 10,
        ...style,
      }}
      // Add a class for custom scrollbar styling
      className="projects-list-scrollbar"
    >
      <style>
        {`
        .projects-list-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f5f6fa;
        }
        .projects-list-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: #f5f6fa;
        }
        .projects-list-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 6px;
        }
        .projects-list-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bfc7d1;
        }
        `}
      </style>
      <AgGridReact
        theme={themeBalham}
        rowData={projects}
        loadingOverlayComponentParams={{
          loadingMessage: "Loading projects...",
        }}
        loading={loading}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        domLayout="normal"
        rowSelection="single"
        animateRows={true}
        suppressCellFocus={true}
        enableRangeSelection={true}
        suppressContextMenu={false}
        allowContextMenuWithControlKey={false}
        suppressMenuHide={false}
        getRowStyle={() => ({
          display: "flex",
          alignItems: "center",
        })}
        onGridReady={(params) => {
          console.log("AG Grid ready with params:", params);
          console.log("Grid API:", params.api);
          console.log("Row data at grid ready:", projects);
          console.log("Column definitions at grid ready:", colDefs);
        }}
        onRowDataUpdated={(event) => {
          console.log("Row data updated event:", event);
          console.log("Current row data:", event.api.getRenderedNodes());
        }}
        onModelUpdated={(event) => {
          console.log("Model updated event:", event);
          console.log("Row count:", event.api.getDisplayedRowCount());
        }}
        onRowDoubleClicked={(event) => {
          console.log("Row double clicked:", event);
          if (event.data && event.data.id && onProjectDoubleClick) {
            onProjectDoubleClick(event.data.id);
          }
        }}
        overlayNoRowsTemplate={
          error
            ? `<span style="color:red;">${error}</span>`
            : `<span style="color:#888;">No projects found</span>`
        }
      />

      {/* Copy Dialog or Spinner */}
      {copyDialog &&
        (copying ? (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                minWidth: 120,
              }}
            >
              <svg
                style={{ margin: 8, animation: "spin 1s linear infinite" }}
                width={40}
                height={40}
                viewBox="0 0 50 50"
              >
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="#1976d2"
                  strokeWidth="5"
                  strokeDasharray="31.4 31.4"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ color: "#1976d2", fontWeight: 600, fontSize: 16 }}>
                Copying project...
              </div>
            </div>
            <style>
              {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        ) : (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
            }}
            onClick={handleCancelCopy}
          >
            <div
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "24px",
                width: "400px",
                maxWidth: "90vw",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "18px" }}>Copy Project</h3>
                <button
                  onClick={handleCancelCopy}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label style={{ fontWeight: 500, fontSize: "14px" }}>
                    Original Project:
                  </label>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {copyDialog.projectName}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    htmlFor="copy-name"
                    style={{ fontWeight: 500, fontSize: "14px" }}
                  >
                    New Project Name:
                  </label>
                  <input
                    id="copy-name"
                    type="text"
                    value={copyDialog.newName}
                    onChange={(e) =>
                      setCopyDialog((prev) =>
                        prev ? { ...prev, newName: e.target.value } : null
                      )
                    }
                    placeholder="Enter new project name"
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveCopy();
                      } else if (e.key === "Escape") {
                        handleCancelCopy();
                      }
                    }}
                    autoFocus
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
                <button
                  onClick={handleCancelCopy}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  disabled={copying}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCopy}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: copying ? "not-allowed" : "pointer",
                    opacity: copying ? 0.7 : 1,
                  }}
                  disabled={copying}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Edit Dialog */}
      {editDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={handleCancelEdit}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "24px",
              width: "400px",
              maxWidth: "90vw",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px" }}>Edit Project</h3>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label style={{ fontWeight: 500, fontSize: "14px" }}>
                  Current Name:
                </label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {editDialog.projectName}
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  htmlFor="edit-name"
                  style={{ fontWeight: 500, fontSize: "14px" }}
                >
                  New Name:
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editDialog.newName}
                  onChange={(e) =>
                    setEditDialog((prev) =>
                      prev ? { ...prev, newName: e.target.value } : null
                    )
                  }
                  placeholder="Enter new project name"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveEdit();
                    } else if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  htmlFor="edit-description"
                  style={{ fontWeight: 500, fontSize: "14px" }}
                >
                  Current Description:
                </label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {editDialog.projectDescription}
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  htmlFor="edit-description"
                  style={{ fontWeight: 500, fontSize: "14px" }}
                >
                  New Description:
                </label>
                <textarea
                  id="edit-description"
                  value={editDialog.newDescription}
                  onChange={(e) =>
                    setEditDialog((prev) =>
                      prev ? { ...prev, newDescription: e.target.value } : null
                    )
                  }
                  placeholder="Enter new project description"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveEdit();
                    } else if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
