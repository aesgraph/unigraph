# AG Grid Theme Utilities

This module provides utilities to convert app-shell themes to AG Grid CSS custom properties, allowing AG Grid tables to inherit the app-shell theme colors and styling.

## Usage

### Basic Usage

```tsx
import { useTheme } from "@aesgraph/app-shell";
import { createThemedAgGridContainer } from "./aggridThemeUtils";

function MyComponent() {
  const { theme } = useTheme();

  return (
    <div className="ag-theme-alpine" style={createThemedAgGridContainer(theme)}>
      <AgGridReact
      // ... your grid props
      />
    </div>
  );
}
```

### Manual Theme Application

```tsx
import { applyAgGridTheme } from "./aggridThemeUtils";

// Apply theme to a DOM element
const container = document.getElementById("my-grid");
applyAgGridTheme(container, theme);
```

## Functions

### `convertThemeToAgGrid(theme: Theme)`

Converts an app-shell theme to AG Grid CSS custom properties.

**Parameters:**

- `theme`: App-shell theme object

**Returns:**

- Object with AG Grid CSS custom properties

### `createThemedAgGridContainer(theme: Theme)`

Creates a React CSS properties object for an AG Grid container with theme applied.

**Parameters:**

- `theme`: App-shell theme object

**Returns:**

- React.CSSProperties object

### `applyAgGridTheme(container: HTMLElement, theme: Theme)`

Applies theme CSS custom properties to a DOM element.

**Parameters:**

- `container`: HTML element to apply theme to
- `theme`: App-shell theme object

## Supported AG Grid Properties

The utility maps app-shell theme properties to the following AG Grid CSS custom properties:

- `--ag-foreground-color`: Text color
- `--ag-background-color`: Background color
- `--ag-border-color`: Border color
- `--ag-header-background-color`: Header background
- `--ag-header-foreground-color`: Header text color
- `--ag-row-hover-color`: Row hover color
- `--ag-active-color`: Active/primary color
- `--ag-font-family`: Font family
- `--ag-font-size`: Font size
- `--ag-border-radius`: Border radius
- And many more...

## Integration with EntityTableV2

The EntityTableV2 component has been updated to use these utilities:

1. Imports the `useTheme` hook from app-shell
2. Uses `createThemedAgGridContainer` to apply theme to the grid container
3. Updates all hardcoded colors in cell renderers to use theme colors
4. Applies theme colors to context menus and overlays

## Theme Inheritance

The theming system automatically inherits from the app-shell theme context, so when users switch themes in the app-shell, the AG Grid tables will automatically update to match the new theme.
