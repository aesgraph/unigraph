import { LayoutManager, WorkspaceConfig } from "@aesgraph/app-shell";
import React from "react";

const WorkspaceTest: React.FC = () => {
  const PANE_COLLAPSE_THRESHOLD = 80;
  const PANE_MIN_SIZE = PANE_COLLAPSE_THRESHOLD - 10;
  const PANE_MAX_SIZE = 700;

  const workspaceConfig: Partial<WorkspaceConfig> = {
    theme: "dark",
    leftPane: {
      defaultSize: 250,
      maxSize: PANE_MAX_SIZE,
      minSize: PANE_MIN_SIZE,
      collapseThreshold: PANE_COLLAPSE_THRESHOLD,
      collapsedSize: 8,
    },
    rightPane: {
      defaultSize: 300,
      maxSize: PANE_MAX_SIZE,
      minSize: PANE_MIN_SIZE,
      collapseThreshold: PANE_COLLAPSE_THRESHOLD,
      collapsedSize: 8,
    },
    bottomPane: {
      defaultSize: 200,
      maxSize: PANE_MAX_SIZE,
      minSize: PANE_MIN_SIZE,
      collapseThreshold: PANE_COLLAPSE_THRESHOLD,
      collapsedSize: 8,
    },
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <h2>Unigraph App with App-Shell Workspace</h2>
      <LayoutManager />
    </div>
  );
};

export default WorkspaceTest;
