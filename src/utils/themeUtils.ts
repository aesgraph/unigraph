import type { ThemeId } from "@aesgraph/app-shell";

const THEME_STORAGE_KEY = "unigraph-app-shell-theme";

/**
 * Gets the persisted theme from localStorage or falls back to the provided default
 */
export const getPersistedTheme = (fallback: ThemeId = "light"): ThemeId => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && (stored === "light" || stored === "dark")) {
      return stored as ThemeId;
    }
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
  }
  return fallback;
};

/**
 * Persists the theme to localStorage
 */
export const persistTheme = (theme: ThemeId): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Failed to save theme to localStorage:", error);
  }
};

/**
 * Creates a WorkspaceConfig with the persisted theme, falling back to isDarkMode
 */
export const createThemeWorkspaceConfig = (isDarkMode: boolean) => {
  const fallbackTheme: ThemeId = isDarkMode ? "dark" : "light";
  const persistedTheme = getPersistedTheme(fallbackTheme);

  return {
    theme: persistedTheme,
  };
};
