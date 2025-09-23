import React from "react";
import { useTheme, getColor, useWorkspace } from "@aesgraph/app-shell";

const DevToolsView: React.FC = () => {
  const { theme } = useTheme();
  const { savedWorkspaces, deleteWorkspace } = useWorkspace();

  // Debug logging
  React.useEffect(() => {
    console.log("DevToolsView: Component mounted");
  }, []);

  const clearWorkspaceCache = () => {
    try {
      // Clear localStorage
      localStorage.removeItem("layout-workspaces");

      // Clear all saved workspaces from state
      savedWorkspaces.forEach((workspace) => {
        deleteWorkspace(workspace.id);
      });

      // Force reload to trigger initial workspace creation
      window.location.reload();

      console.log("Workspace cache cleared successfully");
    } catch (error) {
      console.error("Failed to clear workspace cache:", error);
    }
  };

  const clearAllLocalStorage = () => {
    try {
      localStorage.clear();
      console.log("All localStorage cleared");
      alert("All localStorage cleared. Page will reload.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  };

  const exportWorkspaces = () => {
    try {
      const data = {
        workspaces: savedWorkspaces,
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workspaces-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log("Workspaces exported successfully");
    } catch (error) {
      console.error("Failed to export workspaces:", error);
    }
  };

  const importWorkspaces = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.workspaces) {
              localStorage.setItem(
                "layout-workspaces",
                JSON.stringify(data.workspaces)
              );
              alert("Workspaces imported successfully. Page will reload.");
              window.location.reload();
            }
          } catch (error) {
            console.error("Failed to import workspaces:", error);
            alert("Failed to import workspaces. Check console for details.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
        color: getColor(theme.colors, "text"),
        backgroundColor: getColor(theme.colors, "background"),
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1
          style={{
            color: getColor(theme.colors, "text"),
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "600",
          }}
        >
          Development Tools
        </h1>
        <p
          style={{
            color: getColor(theme.colors, "textSecondary"),
            fontSize: "16px",
            margin: 0,
          }}
        >
          Utilities for development and debugging
        </p>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            color: getColor(theme.colors, "text"),
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "16px",
            paddingBottom: "8px",
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          Workspace Management
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              padding: "16px",
              backgroundColor: getColor(theme.colors, "surface"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Clear Workspace Cache
            </h3>
            <p
              style={{
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              Clears all saved workspace layouts and reloads with initial
              configurations.
            </p>
            <button
              onClick={clearWorkspaceCache}
              style={{
                backgroundColor: getColor(theme.colors, "error"),
                color: getColor(theme.colors, "textInverse"),
                border: "none",
                borderRadius: "4px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Clear Workspace Cache
            </button>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: getColor(theme.colors, "surface"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Export/Import Workspaces
            </h3>
            <p
              style={{
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              Export current workspaces to JSON or import from a file.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={exportWorkspaces}
                style={{
                  backgroundColor: getColor(theme.colors, "primary"),
                  color: getColor(theme.colors, "textInverse"),
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Export Workspaces
              </button>
              <button
                onClick={importWorkspaces}
                style={{
                  backgroundColor: getColor(theme.colors, "secondary"),
                  color: getColor(theme.colors, "textInverse"),
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Import Workspaces
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: getColor(theme.colors, "surface"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Clear All Local Storage
            </h3>
            <p
              style={{
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              ⚠️ Warning: This will clear ALL localStorage data, not just
              workspaces.
            </p>
            <button
              onClick={clearAllLocalStorage}
              style={{
                backgroundColor: getColor(theme.colors, "warning"),
                color: getColor(theme.colors, "textInverse"),
                border: "none",
                borderRadius: "4px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Clear All Local Storage
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            color: getColor(theme.colors, "text"),
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "16px",
            paddingBottom: "8px",
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          Current Workspaces
        </h2>

        <div
          style={{
            padding: "16px",
            backgroundColor: getColor(theme.colors, "surface"),
            border: `1px solid ${getColor(theme.colors, "border")}`,
            borderRadius: "8px",
          }}
        >
          <p
            style={{
              color: getColor(theme.colors, "textSecondary"),
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Total saved workspaces: <strong>{savedWorkspaces.length}</strong>
          </p>
          {savedWorkspaces.length > 0 && (
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {savedWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  style={{
                    padding: "8px",
                    border: `1px solid ${getColor(theme.colors, "border")}`,
                    borderRadius: "4px",
                    marginBottom: "4px",
                    fontSize: "12px",
                    color: getColor(theme.colors, "textSecondary"),
                  }}
                >
                  <strong>{workspace.name}</strong> (ID: {workspace.id})
                  <br />
                  Created: {new Date(workspace.timestamp).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "40px",
          padding: "16px",
          backgroundColor: getColor(theme.colors, "surface"),
          border: `1px solid ${getColor(theme.colors, "border")}`,
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: getColor(theme.colors, "textSecondary"),
            margin: 0,
            fontSize: "14px",
          }}
        >
          Use these tools carefully. Some actions will reload the page.
        </p>
      </div>
    </div>
  );
};

export default DevToolsView;
