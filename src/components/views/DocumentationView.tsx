import { getColor, useTheme } from "@aesgraph/app-shell";
import { FolderOpen, Search } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import useAppConfigStore from "../../store/appConfigStore";
import { getContrastingTextColors } from "../../utils/colorUtils";
import DocumentationSearchV2 from "../common/DocumentationSearchV2";
import FileTreeView, { FileTreeInstance } from "../common/FileTreeView";
import MarkdownViewer from "../common/MarkdownViewer";
import ResizableSplitter from "../common/ResizableSplitter";
import "./DocumentationView.css";

const DocumentationView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(370);
  const [sidebarMode, setSidebarMode] = useState<"tree" | "search">("tree");
  const currentSceneGraph = useAppConfigStore(
    (state) => state.currentSceneGraph
  );

  const handleFileSelect = useCallback(
    (filePath: string, metadata?: Record<string, any>) => {
      console.log(
        "DocumentationView handleFileSelect called with:",
        filePath,
        metadata
      );
      setSelectedFile(filePath);
    },
    []
  );

  const handleWidthChange = useCallback((width: number) => {
    setSidebarWidth(width);
  }, []);

  // Get dynamic text colors based on background
  const backgroundColor = getColor(theme.colors, "background");
  const textColors = getContrastingTextColors(backgroundColor);

  // Create documentation file tree instance
  const documentationInstance: FileTreeInstance = useMemo(
    () => ({
      id: "documentation",
      name: "Documentation",
      dataSource: {
        id: "markdowns-json",
        name: "Markdowns JSON",
        type: "json",
        config: {
          url: "/markdowns-structure.json",
        },
      },
      rootPath: "/markdowns",
      hideEmptyFolders: true,
      onFileSelect: handleFileSelect,
    }),
    [handleFileSelect]
  );

  const leftPanel = useMemo(
    () => (
      <div
        className="documentation-sidebar"
        style={
          {
            backgroundColor: getColor(theme.colors, "backgroundSecondary"),
            borderRight: `1px solid ${getColor(theme.colors, "border")}`,
            height: "100%",
            "--border-color": getColor(theme.colors, "border"),
            "--background-secondary": getColor(
              theme.colors,
              "backgroundSecondary"
            ),
            "--surface-hover": getColor(theme.colors, "backgroundTertiary"),
            "--primary-color": getColor(theme.colors, "primary"),
          } as React.CSSProperties
        }
      >
        <div className="sidebar-header">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${sidebarMode === "tree" ? "active" : ""}`}
              onClick={() => setSidebarMode("tree")}
              style={{
                color:
                  sidebarMode === "tree"
                    ? getColor(theme.colors, "primary")
                    : getColor(theme.colors, "text"),
              }}
            >
              <FolderOpen size={16} />
              <span>Files</span>
            </button>
            <button
              className={`sidebar-tab ${sidebarMode === "search" ? "active" : ""}`}
              onClick={() => setSidebarMode("search")}
              style={{
                color:
                  sidebarMode === "search"
                    ? getColor(theme.colors, "primary")
                    : getColor(theme.colors, "text"),
              }}
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
        </div>
        <div className="sidebar-content">
          {sidebarMode === "tree" ? (
            <FileTreeView
              key="documentation-file-tree"
              instance={documentationInstance}
              onFileSelect={(
                filePath: string,
                metadata?: Record<string, any>
              ) => {
                console.log("FileTreeView onFileSelect called directly");
                handleFileSelect(filePath, metadata);
              }}
              selectedFile={selectedFile || undefined}
              showHeader={true}
              readOnly={true}
            />
          ) : (
            <DocumentationSearchV2
              onFileSelect={(
                filePath: string,
                metadata?: Record<string, any>
              ) => handleFileSelect(filePath, metadata)}
              selectedFile={selectedFile || undefined}
            />
          )}
        </div>
      </div>
    ),
    [
      theme.colors,
      handleFileSelect,
      selectedFile,
      sidebarMode,
      documentationInstance,
    ]
  );

  const rightPanel = useMemo(
    () => (
      <div
        className="documentation-content"
        style={{
          height: "100%",
          overflow: "auto",
        }}
      >
        {selectedFile ? (
          <div style={{ height: "100%" }}>
            <MarkdownViewer
              filename={selectedFile}
              sceneGraph={currentSceneGraph}
              showRawToggle={true}
              onAnnotate={(text) => {
                console.log("Annotation created:", text);
                // You can add additional annotation handling here
              }}
            />
          </div>
        ) : (
          <div
            className="documentation-welcome"
            style={{
              color: textColors.primary,
            }}
          >
            <h2
              style={{
                color: textColors.primary,
              }}
            >
              Documentation Browser
            </h2>
            <p
              style={{
                color: textColors.secondary,
              }}
            >
              Select a file from the sidebar to view its contents. The
              documentation includes guides, tutorials, and reference materials
              for Unigraph.
            </p>
            <div
              className="documentation-features"
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
            >
              <h3
                style={{
                  color: textColors.primary,
                }}
              >
                Available Documentation
              </h3>
              <ul>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
                    Overview
                  </strong>{" "}
                  - Introduction and motivation for Unigraph
                </li>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
                    User Guide
                  </strong>{" "}
                  - How to use Unigraph features
                </li>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
                    Quick Guides
                  </strong>{" "}
                  - Step-by-step tutorials
                </li>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
                    Markdowns
                  </strong>{" "}
                  - Additional documentation files
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    ),
    [
      selectedFile,
      currentSceneGraph,
      textColors.primary,
      textColors.secondary,
      theme.colors,
    ]
  );

  return (
    <div
      className="documentation-view"
      style={{
        backgroundColor: getColor(theme.colors, "background"),
        color: textColors.primary,
        height: "100%",
        width: "100%",
      }}
    >
      <ResizableSplitter
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        leftPanelWidth={sidebarWidth}
        onWidthChange={handleWidthChange}
        minLeftWidth={200}
        maxLeftWidth={600}
        splitterWidth={6}
      />
    </div>
  );
};

export default DocumentationView;
