import { useAppShell } from "@aesgraph/app-shell";
import React, { useEffect } from "react";
import initialWorkspaces from "../config/initialWorkspaces";
import useAppConfigStore from "../store/appConfigStore";
import { workspaceStateManager } from "../utils/workspaceStateManager";

interface InitialWorkspaceLoaderProps {
  children: React.ReactNode;
}

const InitialWorkspaceLoader: React.FC<InitialWorkspaceLoaderProps> = ({
  children,
}) => {
  const { getAllWorkspaces, saveWorkspace, applyWorkspaceLayout } =
    useAppShell();
  const { currentSceneGraph } = useAppConfigStore();

  useEffect(() => {
    // Add a small delay to ensure app shell is fully initialized
    const timer = setTimeout(() => {
      // Check if any workspaces exist
      const existingWorkspaces = getAllWorkspaces();

      // Always ensure initial workspaces are available and up-to-date
      let _addedOrUpdatedWorkspaces = false;
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
          _addedOrUpdatedWorkspaces = true;
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
            _addedOrUpdatedWorkspaces = true;
          }
        }
      });

      // Only apply the default documentation workspace on initial load
      // Scenegraph-specific layouts are handled in handleLoadSceneGraph
      const scenegraphName = currentSceneGraph.getMetadata().name;
      const isDefaultEmptyGraph =
        scenegraphName === "Empty Graph" || scenegraphName === "Unnamed";

      console.log("InitialWorkspaceLoader - Current scenegraph:", {
        name: scenegraphName,
        isDefaultEmptyGraph,
        hasAppConfig: !!currentSceneGraph.getData()?.defaultAppConfig,
        appShellLayout:
          currentSceneGraph.getData()?.defaultAppConfig?.appShellLayout,
      });

      if (isDefaultEmptyGraph) {
        console.log("Initial load - applying default documentation workspace");
        const documentationWorkspace = getAllWorkspaces().find(
          (ws) => ws.id === "documentation"
        );
        if (documentationWorkspace) {
          console.log("Found documentation workspace, applying it");
          // Clear any saved layout to ensure our default loads
          workspaceStateManager.clearWorkspaceState();
          applyWorkspaceLayout("documentation")
            .then(() => {
              console.log("Successfully applied documentation workspace");
            })
            .catch((error) => {
              console.error("Failed to apply documentation workspace:", error);
            });
        } else {
          console.error("Documentation workspace not found!");
          console.log(
            "Available workspaces:",
            getAllWorkspaces().map((ws) => ws.id)
          );
        }
      } else {
        console.log(
          "Skipping default workspace - scenegraph has specific configuration"
        );
      }
    }, 100); // Small delay to ensure app shell is ready

    return () => clearTimeout(timer);
  }, [
    getAllWorkspaces,
    saveWorkspace,
    applyWorkspaceLayout,
    currentSceneGraph,
  ]);

  return <>{children}</>;
};

export default InitialWorkspaceLoader;
