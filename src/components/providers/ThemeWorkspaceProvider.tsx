import type { WorkspaceConfig } from "@aesgraph/app-shell";
import { ThemeVariables } from "@aesgraph/app-shell";
import React from "react";

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
  return <ThemeVariables>{children}</ThemeVariables>;
};

/**
 * Combined provider that ensures ThemeProvider and WorkspaceProvider stay in sync.
 * The WorkspaceProvider is the source of truth for the current theme.
 */
export const ThemeWorkspaceProvider: React.FC<ThemeWorkspaceProviderProps> = ({
  children,
  // eslint-disable-next-line unused-imports/no-unused-vars
  initialConfig,
}) => {
  return <ThemedWorkspaceContent>{children}</ThemedWorkspaceContent>;
};
