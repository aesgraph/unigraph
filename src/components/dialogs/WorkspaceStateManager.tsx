import type { WorkspaceState } from "@aesgraph/app-shell";
import { useAppShell } from "@aesgraph/app-shell";
import { Check, Copy, Edit, Play, Trash2, X } from "lucide-react";
import React, { useState } from "react";

interface WorkspaceStateManagerProps {
  onClose?: () => void;
}

const WorkspaceStateManager: React.FC<WorkspaceStateManagerProps> = ({
  onClose,
}) => {
  const {
    savedWorkspaces,
    currentWorkspace,
    saveWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
    saveCurrentLayout,
    applyWorkspaceLayout,
  } = useAppShell();

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [editingWorkspace, setEditingWorkspace] =
    useState<WorkspaceState | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleSaveCurrentWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      alert("Please enter a workspace name");
      return;
    }

    const saved = await saveCurrentLayout(newWorkspaceName.trim());
    if (saved) {
      setNewWorkspaceName("");
    } else {
      alert("Failed to save workspace");
    }
  };

  const handleLoadWorkspace = async (workspace: WorkspaceState) => {
    const success = await applyWorkspaceLayout(workspace.id);
    if (success) {
      onClose?.();
    } else {
      alert("Failed to load workspace");
    }
  };

  const handleDeleteWorkspace = (workspace: WorkspaceState) => {
    if (confirm(`Are you sure you want to delete "${workspace.name}"?`)) {
      deleteWorkspace(workspace.id);
    }
  };

  const handleDuplicateWorkspace = (workspace: WorkspaceState) => {
    duplicateWorkspace(workspace.id);
  };

  const handleStartEdit = (workspace: WorkspaceState) => {
    setEditingWorkspace(workspace);
    setEditingName(workspace.name);
  };

  const handleSaveEdit = () => {
    if (editingWorkspace && editingName.trim()) {
      // Update the workspace name
      const updatedWorkspace = {
        ...editingWorkspace,
        name: editingName.trim(),
      };
      saveWorkspace(updatedWorkspace);
      setEditingWorkspace(null);
      setEditingName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkspace(null);
    setEditingName("");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Filter out autosave workspaces
  const visibleWorkspaces = savedWorkspaces.filter(
    (w) => w.name !== "Autosaved"
  );

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        minHeight: "400px",
        maxHeight: "600px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          Workspace Manager
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "4px 8px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: "#333",
              color: "#fff",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Save Current Workspace */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#2a2a2a",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
          Save Current Workspace
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Enter workspace name..."
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #444",
              borderRadius: "4px",
              backgroundColor: "#1a1a1a",
              color: "#fff",
            }}
            onKeyPress={(e) =>
              e.key === "Enter" && handleSaveCurrentWorkspace()
            }
          />
          <button
            onClick={handleSaveCurrentWorkspace}
            disabled={!newWorkspaceName.trim()}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: newWorkspaceName.trim() ? "pointer" : "not-allowed",
              backgroundColor: newWorkspaceName.trim() ? "#007acc" : "#333",
              color: "#fff",
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Saved Workspaces */}
      <div>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "14px" }}>
          Saved Workspaces ({visibleWorkspaces.length})
        </h3>
        {visibleWorkspaces.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#888",
            }}
          >
            No saved workspaces yet. Save your first workspace above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {visibleWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                style={{
                  padding: "8px",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "6px",
                  border:
                    currentWorkspace?.id === workspace.id
                      ? "2px solid #007acc"
                      : "1px solid #444",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  {editingWorkspace?.id === workspace.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        backgroundColor: "#1a1a1a",
                        color: "#fff",
                        marginRight: "8px",
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        fontWeight:
                          currentWorkspace?.id === workspace.id ? "600" : "400",
                        color:
                          currentWorkspace?.id === workspace.id
                            ? "#007acc"
                            : "#fff",
                      }}
                    >
                      {workspace.name}
                      {currentWorkspace?.id === workspace.id && " (Current)"}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "6px" }}>
                    {editingWorkspace?.id === workspace.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          style={{
                            padding: "4px 6px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#007acc",
                            color: "#fff",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: "4px 6px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#333",
                            color: "#fff",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleLoadWorkspace(workspace)}
                          style={{
                            padding: "4px 6px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#007acc",
                            color: "#fff",
                            fontSize: "12px",
                            minWidth: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Load workspace"
                        >
                          <Play size={14} />
                        </button>
                        <button
                          onClick={() => handleStartEdit(workspace)}
                          style={{
                            padding: "4px 6px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#333",
                            color: "#fff",
                            fontSize: "12px",
                            minWidth: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Rename workspace"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicateWorkspace(workspace)}
                          style={{
                            padding: "4px 6px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#333",
                            color: "#fff",
                            fontSize: "12px",
                            minWidth: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Duplicate workspace"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkspace(workspace)}
                          style={{
                            padding: "4px 6px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            fontSize: "12px",
                            minWidth: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Delete workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                  }}
                >
                  Created: {formatDate(workspace.timestamp)}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    marginTop: "2px",
                  }}
                >
                  Theme: {workspace.theme} | Tabs:{" "}
                  {workspace.tabContainers.length}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceStateManager;
