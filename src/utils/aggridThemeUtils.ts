import { Theme } from "@aesgraph/app-shell";

/**
 * Convert app-shell theme to AG Grid CSS custom properties
 * This allows AG Grid to inherit the app-shell theme colors and styling
 */
export const convertThemeToAgGrid = (theme: Theme): Record<string, string> => {
  return {
    // Core colors
    "--ag-foreground-color": theme.colors.text,
    "--ag-background-color": theme.colors.background,
    "--ag-border-color": theme.colors.border,
    "--ag-secondary-border-color": theme.colors.border,

    // Header styling
    "--ag-header-foreground-color": theme.colors.text,
    "--ag-header-background-color": theme.colors.surface,
    "--ag-header-cell-hover-background-color": theme.colors.surfaceHover,
    "--ag-header-cell-moving-background-color": theme.colors.surfaceActive,
    "--ag-header-column-separator-color": theme.colors.border,

    // Row styling
    "--ag-row-hover-color": theme.colors.surfaceHover,
    "--ag-selected-row-background-color": `${theme.colors.primary}20`, // 20% opacity
    "--ag-odd-row-background-color": theme.colors.backgroundSecondary,
    "--ag-row-border-color": theme.colors.border,
    "--ag-cell-horizontal-border": `solid ${theme.colors.border}`,

    // Cell styling
    "--ag-cell-horizontal-padding": theme.sizes.spacing.sm,
    "--ag-cell-widget-spacing": theme.sizes.spacing.xs,
    "--ag-widget-container-vertical-padding": theme.sizes.spacing.xs,
    "--ag-widget-container-horizontal-padding": theme.sizes.spacing.sm,
    "--ag-widget-vertical-spacing": theme.sizes.spacing.xs,
    "--ag-widget-horizontal-spacing": theme.sizes.spacing.xs,

    // Typography
    "--ag-font-family":
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "--ag-font-size": theme.sizes.fontSize.sm,
    "--ag-font-weight": "400",
    "--ag-font-weight-bold": "600",

    // Spacing and sizing
    "--ag-grid-size": "6px",
    "--ag-list-item-height": "40px",
    "--ag-header-height": "50px",
    "--ag-row-height": "48px",
    "--ag-border-radius": theme.sizes.borderRadius.sm,
    "--ag-grid-border-radius": theme.sizes.borderRadius.sm,

    // Interactive elements
    "--ag-active-color": theme.colors.primary,
    "--ag-input-border-color": theme.colors.border,
    "--ag-input-focus-border-color": theme.colors.borderFocus,
    "--ag-input-disabled-background-color": theme.colors.backgroundTertiary,
    "--ag-input-disabled-border-color": theme.colors.border,

    // Range selection
    "--ag-range-selection-border-color": theme.colors.primary,
    "--ag-range-selection-border-style": "solid",
    "--ag-range-selection-border-width": "2px",
    "--ag-range-selection-highlight-color": `${theme.colors.primary}10`, // 10% opacity
    "--ag-range-selection-chart-category-background-color": `${theme.colors.primary}10`,
    "--ag-range-selection-chart-background-color": `${theme.colors.primary}10`,

    // Charts and panels
    "--ag-chart-background-color": theme.colors.background,
    "--ag-chart-panel-background-color": theme.colors.surface,
    "--ag-panel-background-color": theme.colors.surface,
    "--ag-tool-panel-background-color": theme.colors.surface,

    // Data and content
    "--ag-data-color": theme.colors.text,
    "--ag-disabled-foreground-color": theme.colors.textMuted,

    // Chips and other UI elements
    "--ag-chip-background-color": theme.colors.surfaceHover,

    // Borders
    "--ag-borders": `solid 1px`,

    // Icons
    "--ag-icon-font-family": "agGridAlpine",
    "--ag-icon-size": "16px",
    "--ag-icon-weight": "normal",
    "--ag-icon-font-family-inherit": "false",
  };
};

/**
 * Apply AG Grid theme to a container element
 */
export const applyAgGridTheme = (container: HTMLElement, theme: Theme) => {
  const agGridVars = convertThemeToAgGrid(theme);

  // Apply CSS custom properties to the container
  Object.entries(agGridVars).forEach(([property, value]) => {
    container.style.setProperty(property, value);
  });
};

/**
 * Get AG Grid theme class based on app-shell theme
 * Returns appropriate theme class for AG Grid
 */
export const getAgGridThemeClass = (_theme: Theme): string => {
  // Use alpine theme as base, then override with custom properties
  return "ag-theme-alpine";
};

/**
 * Create a styled AG Grid container with app-shell theme
 */
export const createThemedAgGridContainer = (
  theme: Theme
): React.CSSProperties => {
  const agGridVars = convertThemeToAgGrid(theme);

  return {
    ...agGridVars,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties;
};
