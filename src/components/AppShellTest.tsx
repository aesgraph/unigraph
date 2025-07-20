import React from "react";
import { WorkspaceConfig, ThemeId } from "app-shell";

const AppShellTest: React.FC = () => {
  // Example configuration using app-shell types
  const sampleWorkspaceConfig: Partial<WorkspaceConfig> = {
    theme: "dark" as ThemeId,
    leftPane: {
      defaultSize: 300,
      maxSize: 500,
      minSize: 100,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
    rightPane: {
      defaultSize: 250,
      maxSize: 400,
      minSize: 150,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>App Shell Integration Test</h2>
      <p>✅ Successfully imported app-shell types!</p>
      <h3>Sample Configuration:</h3>
      <pre
        style={{
          background: "#f5f5f5",
          padding: "10px",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        {JSON.stringify(sampleWorkspaceConfig, null, 2)}
      </pre>
      <p>
        The app-shell workspace components are now available as a local
        dependency!
      </p>
    </div>
  );
};

export default AppShellTest;
