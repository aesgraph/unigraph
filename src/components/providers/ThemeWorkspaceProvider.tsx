import React from "react";
import {
  ThemeProvider,
  ThemeVariables,
  WorkspaceProvider,
  useWorkspace,
} from "@aesgraph/app-shell";
import type { WorkspaceConfig } from "@aesgraph/app-shell";

interface ThemeWorkspaceProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<WorkspaceConfig>;
}

/**
 * Internal component that syncs ThemeProvider with workspace theme changes
 */
const ThemedWorkspaceContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentTheme } = useWorkspace();

  return (
    <ThemeProvider themeId={currentTheme}>
      <ThemeVariables>{children}</ThemeVariables>
    </ThemeProvider>
  );
};

/**
 * Combined provider that ensures ThemeProvider and WorkspaceProvider stay in sync.
 * The WorkspaceProvider is the source of truth for the current theme.
 */
export const ThemeWorkspaceProvider: React.FC<ThemeWorkspaceProviderProps> = ({
  children,
  initialConfig,
}) => {
  return (
    <WorkspaceProvider initialConfig={initialConfig}>
      <ThemedWorkspaceContent>{children}</ThemedWorkspaceContent>
    </WorkspaceProvider>
  );
};
