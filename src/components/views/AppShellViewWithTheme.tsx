import {
  LayoutManager as AppShellWorkspace,
  useTheme,
} from "@aesgraph/app-shell";
import "@aesgraph/app-shell/dist/app-shell.css";
import React, { useEffect } from "react";
import {
  createThemeWorkspaceConfig,
  persistTheme,
} from "../../utils/themeUtils";
import { ThemeWorkspaceProvider } from "../providers/ThemeWorkspaceProvider";

interface AppShellViewWithThemeProps {
  isDarkMode: boolean;
  style?: React.CSSProperties;
}

/**
 * Internal component that handles theme persistence
 * This component runs inside the ThemeWorkspaceProvider context
 */
const ThemePersistenceHandler: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Persist theme changes to localStorage
    if (theme) {
      persistTheme(theme.id);
    }
  }, [theme]);

  return null;
};

/**
 * AppShellView wrapper that properly handles theme persistence
 * This ensures that theme selections are saved and restored across view switches
 */
const AppShellViewWithTheme: React.FC<AppShellViewWithThemeProps> = ({
  isDarkMode,
  style,
}) => {
  const workspaceConfig = createThemeWorkspaceConfig(isDarkMode);

  return (
    <ThemeWorkspaceProvider initialConfig={workspaceConfig}>
      <ThemePersistenceHandler />
      <div style={style}>
        <AppShellWorkspace />
      </div>
    </ThemeWorkspaceProvider>
  );
};

export default AppShellViewWithTheme;
