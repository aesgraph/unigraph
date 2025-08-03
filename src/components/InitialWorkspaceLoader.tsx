import { useAppShell } from "@aesgraph/app-shell";
import React, { useEffect } from "react";
import initialWorkspaces from "../config/initialWorkspaces";

interface InitialWorkspaceLoaderProps {
  children: React.ReactNode;
}

const InitialWorkspaceLoader: React.FC<InitialWorkspaceLoaderProps> = ({
  children,
}) => {
  const { getAllWorkspaces, saveWorkspace, applyWorkspaceLayout } =
    useAppShell();

  useEffect(() => {
    // Check if any workspaces exist
    const existingWorkspaces = getAllWorkspaces();

    // Always ensure initial workspaces are available and up-to-date
    let addedOrUpdatedWorkspaces = false;
    initialWorkspaces.forEach((workspace) => {
      const existingIndex = existingWorkspaces.findIndex(
        (existing) => existing.id === workspace.id
      );

      if (existingIndex === -1) {
        // Add new workspace
        console.log(`Adding initial workspace: ${workspace.name}`);

        // Update timestamp to current time
        const workspaceWithTimestamp = {
          ...workspace,
          timestamp: Date.now(),
        };

        saveWorkspace(workspaceWithTimestamp);
        addedOrUpdatedWorkspaces = true;
      } else {
        // Check if existing workspace needs updating (wrong layout format)
        const existing = existingWorkspaces[existingIndex];
        const needsUpdate =
          existing.layout.horizontal.length !== 3 ||
          existing.layout.vertical.length !== 2;

        if (needsUpdate) {
          console.log(`Updating workspace layout format: ${workspace.name}`);

          // Update timestamp to current time
          const workspaceWithTimestamp = {
            ...workspace,
            timestamp: Date.now(),
          };

          saveWorkspace(workspaceWithTimestamp);
          addedOrUpdatedWorkspaces = true;
        }
      }
    });

    // Always load the documentation workspace on startup, regardless of saved layouts
    const documentationWorkspace = getAllWorkspaces().find(
      (ws) => ws.id === "documentation"
    );
    if (documentationWorkspace) {
      console.log("Loading default Documentation workspace on startup");
      // Clear any saved layout to ensure our default loads
      localStorage.removeItem("unigraph-last-workspace-layout");
      applyWorkspaceLayout("documentation");
    }
  }, [getAllWorkspaces, saveWorkspace, applyWorkspaceLayout]);

  return <>{children}</>;
};

export default InitialWorkspaceLoader;
