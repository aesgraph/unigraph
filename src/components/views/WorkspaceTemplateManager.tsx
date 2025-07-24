import React, { useState } from "react";
import { useTheme, getColor, useWorkspace } from "@aesgraph/app-shell";
import {
  workspaceTemplates,
  templateToWorkspaceState,
  getTemplateCategories,
} from "../../config/workspaceTemplates";

const WorkspaceTemplateManager: React.FC = () => {
  const { theme } = useTheme();
  const {
    getAllWorkspaces,
    saveWorkspace,
    applyWorkspaceLayout,
    deleteWorkspace,
  } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories = getTemplateCategories();
  const savedWorkspaces = getAllWorkspaces();

  // Filter templates based on category and search
  const filteredTemplates = workspaceTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const loadTemplate = (template: (typeof workspaceTemplates)[0]) => {
    try {
      const workspaceState = templateToWorkspaceState(template);
      saveWorkspace(workspaceState);
      applyWorkspaceLayout(workspaceState.id);
      console.log(`Loaded template: ${template.name}`);
    } catch (error) {
      console.error(`Failed to load template ${template.name}:`, error);
    }
  };

  const reloadTemplate = (template: (typeof workspaceTemplates)[0]) => {
    try {
      // Find existing workspace with this template name
      const existingWorkspace = savedWorkspaces.find(
        (ws) => ws.name === template.name
      );

      if (existingWorkspace) {
        // Delete existing workspace
        deleteWorkspace(existingWorkspace.id);
      }

      // Create new workspace from template
      const workspaceState = templateToWorkspaceState(template);
      saveWorkspace(workspaceState);
      applyWorkspaceLayout(workspaceState.id);
      console.log(`Reloaded template: ${template.name}`);
    } catch (error) {
      console.error(`Failed to reload template ${template.name}:`, error);
    }
  };

  const reloadAllTemplates = () => {
    try {
      // Delete all existing workspaces
      savedWorkspaces.forEach((workspace) => {
        deleteWorkspace(workspace.id);
      });

      // Create new workspaces from all templates
      workspaceTemplates.forEach((template) => {
        const workspaceState = templateToWorkspaceState(template);
        saveWorkspace(workspaceState);
      });

      // Load the first template as default
      if (workspaceTemplates.length > 0) {
        const firstTemplate = templateToWorkspaceState(workspaceTemplates[0]);
        applyWorkspaceLayout(firstTemplate.id);
      }

      console.log("Reloaded all templates");
    } catch (error) {
      console.error("Failed to reload all templates:", error);
    }
  };

  const getWorkspaceStatus = (template: (typeof workspaceTemplates)[0]) => {
    const existingWorkspace = savedWorkspaces.find(
      (ws) => ws.name === template.name
    );
    return existingWorkspace ? "saved" : "not-saved";
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1000px",
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
          Workspace Template Manager
        </h1>
        <p
          style={{
            color: getColor(theme.colors, "textSecondary"),
            fontSize: "16px",
            margin: 0,
          }}
        >
          Load, reload, and manage workspace templates
        </p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Category Filter */}
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: getColor(theme.colors, "text"),
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: `1px solid ${getColor(theme.colors, "border")}`,
                backgroundColor: getColor(theme.colors, "surface"),
                color: getColor(theme.colors, "text"),
                fontSize: "14px",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: getColor(theme.colors, "text"),
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Search:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: `1px solid ${getColor(theme.colors, "border")}`,
                backgroundColor: getColor(theme.colors, "surface"),
                color: getColor(theme.colors, "text"),
                fontSize: "14px",
              }}
            />
          </div>

          {/* Reload All Button */}
          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              onClick={reloadAllTemplates}
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
              Reload All Templates
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {filteredTemplates.map((template) => {
          const status = getWorkspaceStatus(template);
          const isSaved = status === "saved";

          return (
            <div
              key={template.id}
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
                borderRadius: "8px",
                padding: "16px",
                position: "relative",
              }}
            >
              {/* Status Badge */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  backgroundColor: isSaved
                    ? getColor(theme.colors, "success")
                    : getColor(theme.colors, "info"),
                  color: getColor(theme.colors, "textInverse"),
                }}
              >
                {isSaved ? "Saved" : "Template"}
              </div>

              {/* Template Header */}
              <div style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{template.icon}</span>
                  <h3
                    style={{
                      color: getColor(theme.colors, "text"),
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    {template.name}
                  </h3>
                </div>
                <div
                  style={{
                    color: getColor(theme.colors, "textSecondary"),
                    fontSize: "12px",
                    textTransform: "capitalize",
                  }}
                >
                  {template.category}
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  color: getColor(theme.colors, "textSecondary"),
                  fontSize: "14px",
                  marginBottom: "16px",
                  lineHeight: "1.4",
                }}
              >
                {template.description}
              </p>

              {/* Layout Info */}
              <div
                style={{
                  backgroundColor: getColor(
                    theme.colors,
                    "backgroundSecondary"
                  ),
                  padding: "8px 12px",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    color: getColor(theme.colors, "textMuted"),
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  Layout: {template.layout.horizontal.join(":")} |{" "}
                  {template.layout.vertical.join(":")}
                </div>
                <div
                  style={{
                    color: getColor(theme.colors, "textMuted"),
                    fontSize: "12px",
                  }}
                >
                  Views:{" "}
                  {template.tabContainers.reduce(
                    (acc, container) => acc + container.tabs.length,
                    0
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => loadTemplate(template)}
                  style={{
                    flex: "1",
                    backgroundColor: getColor(theme.colors, "primary"),
                    color: getColor(theme.colors, "textInverse"),
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {isSaved ? "Switch To" : "Load"}
                </button>
                <button
                  onClick={() => reloadTemplate(template)}
                  style={{
                    flex: "1",
                    backgroundColor: getColor(theme.colors, "secondary"),
                    color: getColor(theme.colors, "textInverse"),
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Reload
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div
        style={{
          backgroundColor: getColor(theme.colors, "surface"),
          border: `1px solid ${getColor(theme.colors, "border")}`,
          borderRadius: "8px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {workspaceTemplates.length}
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "14px",
              }}
            >
              Available Templates
            </div>
          </div>
          <div>
            <div
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {savedWorkspaces.length}
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "14px",
              }}
            >
              Saved Workspaces
            </div>
          </div>
          <div>
            <div
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {categories.length}
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textSecondary"),
                fontSize: "14px",
              }}
            >
              Categories
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceTemplateManager;
