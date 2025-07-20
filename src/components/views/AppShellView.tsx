import {
  Workspace as AppShellWorkspace,
  ExampleThemedComponent,
  Theme,
  ThemeId,
  WorkspaceConfig,
  commonSizes,
  defaultViews,
  getColor,
  registerViews,
  themes,
  useTheme,
} from "app-shell";
import "app-shell/dist/app-shell.css";
import React from "react";
import EntityTableV2 from "../common/EntityTableV2";
import AIChatPanel from "../ai/AIChatPanel";
import { ThemeWorkspaceProvider } from "../providers/ThemeWorkspaceProvider";
import SemanticWebQueryPanel from "../semantic/SemanticWebQueryPanel";
import ForceGraph3DViewV2 from "./ForceGraph3DViewV2";
import { getCurrentSceneGraph } from "../../store/appConfigStore";

// Create custom views that include our AIChatPanel and SemanticWebQueryPanel
const aiChatView = {
  id: "ai-chat",
  title: "AI Chat",
  icon: "💬",
  component: (props: any) => <AIChatPanel {...props} />,
};

const semanticWebQueryView = {
  id: "semantic-web-query",
  title: "SPARQL Query",
  icon: "🔍",
  component: (props: any) => (
    <SemanticWebQueryPanel theme={props.theme} {...props} />
  ),
};

const forceGraph3DView = {
  id: "force-graph-3d",
  title: "ForceGraph 3D",
  icon: "🌐",
  component: (props: any) => <ForceGraph3DViewV2 {...props} />,
};

const forceGraph3DViewV2 = {
  id: "force-graph-3d-v2",
  title: "ForceGraph 3D V2",
  icon: "🚀",
  component: (props: any) => <ForceGraph3DViewV2 {...props} />,
  category: "visualization",
};

// EntityTableV2 wrapper component
const EntityTableV2Wrapper: React.FC = () => {
  const sceneGraph = getCurrentSceneGraph();
  
  if (!sceneGraph) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No scene graph available. Please load a graph first.</p>
      </div>
    );
  }

  // Get all entities from the scene graph
  const allNodes = sceneGraph.getGraph().getNodes();
  
  return (
    <div style={{ height: '100%', width: '100%', padding: '10px' }}>
      <EntityTableV2 
        container={allNodes} 
        sceneGraph={sceneGraph}
        maxHeight="100%"
      />
    </div>
  );
};

const entityTableV2View = {
  id: "entity-table-v2",
  title: "Entity Table V2",
  icon: "📋",
  component: (props: any) => <EntityTableV2Wrapper {...props} />,
  category: "data",
};

// Create a themed component using the useTheme hook
const CustomThemedPanel: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        padding: theme.sizes.spacing.lg,
        backgroundColor: getColor(theme.colors, "surface"),
        borderRadius: theme.sizes.borderRadius.md,
        border: `1px solid ${getColor(theme.colors, "border")}`,
        color: getColor(theme.colors, "text"),
        margin: theme.sizes.spacing.md,
      }}
    >
      <h3
        style={{
          color: getColor(theme.colors, "primary"),
          fontSize: theme.sizes.fontSize.lg,
          marginBottom: theme.sizes.spacing.sm,
        }}
      >
        Custom Themed Component
      </h3>
      <p
        style={{
          color: getColor(theme.colors, "textSecondary"),
          fontSize: theme.sizes.fontSize.sm,
        }}
      >
        This component demonstrates how external projects can create custom
        themes and use all the theming utilities from app-shell.
      </p>
      <ExampleThemedComponent
        title="Demo Component"
        content="This shows theme inheritance working!"
      />
    </div>
  );
};

const customThemedPanelView = {
  id: "custom-themed-panel",
  title: "Theme Demo",
  icon: "🎨",
  component: (props: any) => <CustomThemedPanel {...props} />,
};

// Create a component that inherits app-shell's current theme styles
const ThemeInheritanceDemo: React.FC = () => {
  const { theme, themeId, themes: availableThemes } = useTheme();

  return (
    <div
      style={{
        padding: theme.sizes.spacing.lg,
        height: "100%",
        overflow: "auto",
      }}
    >
      <h2
        style={{
          color: getColor(theme.colors, "primary"),
          fontSize: theme.sizes.fontSize.xl,
          marginBottom: theme.sizes.spacing.lg,
          borderBottom: `2px solid ${getColor(theme.colors, "border")}`,
          paddingBottom: theme.sizes.spacing.sm,
        }}
      >
        Theme Inheritance Demo
      </h2>

      <div
        style={{
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
          padding: theme.sizes.spacing.md,
          borderRadius: theme.sizes.borderRadius.lg,
          marginBottom: theme.sizes.spacing.lg,
          border: `1px solid ${getColor(theme.colors, "borderFocus")}`,
        }}
      >
        <h3
          style={{
            color: getColor(theme.colors, "accent"),
            fontSize: theme.sizes.fontSize.lg,
            marginBottom: theme.sizes.spacing.sm,
          }}
        >
          Current Theme: {theme.name} ({themeId})
        </h3>
        <p
          style={{
            color: getColor(theme.colors, "text"),
            fontSize: theme.sizes.fontSize.md,
            lineHeight: "1.5",
          }}
        >
          This component automatically inherits all theme styles from the
          app-shell workspace. It demonstrates how external components can
          seamlessly integrate with any theme that&apos;s currently active.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: theme.sizes.spacing.md,
          marginBottom: theme.sizes.spacing.lg,
        }}
      >
        {/* Color Palette Demo */}
        <div
          style={{
            backgroundColor: getColor(theme.colors, "surface"),
            padding: theme.sizes.spacing.md,
            borderRadius: theme.sizes.borderRadius.md,
            border: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          <h4
            style={{
              color: getColor(theme.colors, "primary"),
              fontSize: theme.sizes.fontSize.md,
              marginBottom: theme.sizes.spacing.sm,
            }}
          >
            Color Palette
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.sizes.spacing.xs,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.sizes.spacing.xs,
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: getColor(theme.colors, "primary"),
                  borderRadius: theme.sizes.borderRadius.sm,
                }}
              />
              <span
                style={{
                  color: getColor(theme.colors, "text"),
                  fontSize: theme.sizes.fontSize.sm,
                }}
              >
                Primary
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.sizes.spacing.xs,
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: getColor(theme.colors, "secondary"),
                  borderRadius: theme.sizes.borderRadius.sm,
                }}
              />
              <span
                style={{
                  color: getColor(theme.colors, "text"),
                  fontSize: theme.sizes.fontSize.sm,
                }}
              >
                Secondary
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.sizes.spacing.xs,
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: getColor(theme.colors, "accent"),
                  borderRadius: theme.sizes.borderRadius.sm,
                }}
              />
              <span
                style={{
                  color: getColor(theme.colors, "text"),
                  fontSize: theme.sizes.fontSize.sm,
                }}
              >
                Accent
              </span>
            </div>
          </div>
        </div>

        {/* Status Colors Demo */}
        <div
          style={{
            backgroundColor: getColor(theme.colors, "surface"),
            padding: theme.sizes.spacing.md,
            borderRadius: theme.sizes.borderRadius.md,
            border: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          <h4
            style={{
              color: getColor(theme.colors, "primary"),
              fontSize: theme.sizes.fontSize.md,
              marginBottom: theme.sizes.spacing.sm,
            }}
          >
            Status Indicators
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.sizes.spacing.xs,
            }}
          >
            <div
              style={{
                padding: theme.sizes.spacing.xs,
                backgroundColor: getColor(theme.colors, "success"),
                color: getColor(theme.colors, "textInverse"),
                borderRadius: theme.sizes.borderRadius.sm,
                fontSize: theme.sizes.fontSize.sm,
                textAlign: "center",
              }}
            >
              Success
            </div>
            <div
              style={{
                padding: theme.sizes.spacing.xs,
                backgroundColor: getColor(theme.colors, "warning"),
                color: getColor(theme.colors, "textInverse"),
                borderRadius: theme.sizes.borderRadius.sm,
                fontSize: theme.sizes.fontSize.sm,
                textAlign: "center",
              }}
            >
              Warning
            </div>
            <div
              style={{
                padding: theme.sizes.spacing.xs,
                backgroundColor: getColor(theme.colors, "error"),
                color: getColor(theme.colors, "textInverse"),
                borderRadius: theme.sizes.borderRadius.sm,
                fontSize: theme.sizes.fontSize.sm,
                textAlign: "center",
              }}
            >
              Error
            </div>
            <div
              style={{
                padding: theme.sizes.spacing.xs,
                backgroundColor: getColor(theme.colors, "info"),
                color: getColor(theme.colors, "textInverse"),
                borderRadius: theme.sizes.borderRadius.sm,
                fontSize: theme.sizes.fontSize.sm,
                textAlign: "center",
              }}
            >
              Info
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Elements Demo */}
      <div
        style={{
          backgroundColor: getColor(theme.colors, "surface"),
          padding: theme.sizes.spacing.md,
          borderRadius: theme.sizes.borderRadius.md,
          border: `1px solid ${getColor(theme.colors, "border")}`,
          marginBottom: theme.sizes.spacing.lg,
        }}
      >
        <h4
          style={{
            color: getColor(theme.colors, "primary"),
            fontSize: theme.sizes.fontSize.md,
            marginBottom: theme.sizes.spacing.sm,
          }}
        >
          Interactive Elements
        </h4>
        <div
          style={{
            display: "flex",
            gap: theme.sizes.spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              backgroundColor: getColor(theme.colors, "primary"),
              color: getColor(theme.colors, "textInverse"),
              border: "none",
              padding: `${theme.sizes.spacing.xs} ${theme.sizes.spacing.sm}`,
              borderRadius: theme.sizes.borderRadius.sm,
              fontSize: theme.sizes.fontSize.sm,
              cursor: "pointer",
            }}
          >
            Primary Button
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              color: getColor(theme.colors, "primary"),
              border: `1px solid ${getColor(theme.colors, "primary")}`,
              padding: `${theme.sizes.spacing.xs} ${theme.sizes.spacing.sm}`,
              borderRadius: theme.sizes.borderRadius.sm,
              fontSize: theme.sizes.fontSize.sm,
              cursor: "pointer",
            }}
          >
            Outline Button
          </button>
          <a
            href="#"
            style={{
              color: getColor(theme.colors, "link"),
              textDecoration: "none",
              fontSize: theme.sizes.fontSize.sm,
              padding: `${theme.sizes.spacing.xs} ${theme.sizes.spacing.sm}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = getColor(theme.colors, "linkHover");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = getColor(theme.colors, "link");
            }}
          >
            Link Example
          </a>
        </div>
      </div>

      {/* Workspace Colors Demo */}
      <div
        style={{
          backgroundColor: getColor(theme.colors, "surface"),
          padding: theme.sizes.spacing.md,
          borderRadius: theme.sizes.borderRadius.md,
          border: `1px solid ${getColor(theme.colors, "border")}`,
          marginBottom: theme.sizes.spacing.lg,
        }}
      >
        <h4
          style={{
            color: getColor(theme.colors, "primary"),
            fontSize: theme.sizes.fontSize.md,
            marginBottom: theme.sizes.spacing.sm,
          }}
        >
          Workspace-Specific Colors (Migrated from CSS)
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: theme.sizes.spacing.sm,
          }}
        >
          {/* Workspace Background */}
          <div
            style={{
              padding: theme.sizes.spacing.sm,
              backgroundColor: getColor(theme.colors, "workspaceBackground"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: theme.sizes.borderRadius.sm,
            }}
          >
            <div
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: theme.sizes.fontSize.xs,
                marginBottom: theme.sizes.spacing.xs,
              }}
            >
              Workspace Background
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textMuted"),
                fontSize: theme.sizes.fontSize.xs,
              }}
            >
              {getColor(theme.colors, "workspaceBackground")}
            </div>
          </div>

          {/* Workspace Panel */}
          <div
            style={{
              padding: theme.sizes.spacing.sm,
              backgroundColor: getColor(theme.colors, "workspacePanel"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: theme.sizes.borderRadius.sm,
            }}
          >
            <div
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: theme.sizes.fontSize.xs,
                marginBottom: theme.sizes.spacing.xs,
              }}
            >
              Workspace Panel
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textMuted"),
                fontSize: theme.sizes.fontSize.xs,
              }}
            >
              {getColor(theme.colors, "workspacePanel")}
            </div>
          </div>

          {/* Title Bar */}
          <div
            style={{
              padding: theme.sizes.spacing.sm,
              backgroundColor: getColor(
                theme.colors,
                "workspaceTitleBackground"
              ),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: theme.sizes.borderRadius.sm,
            }}
          >
            <div
              style={{
                color: getColor(theme.colors, "workspaceTitleText"),
                fontSize: theme.sizes.fontSize.xs,
                marginBottom: theme.sizes.spacing.xs,
              }}
            >
              Title Bar
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textMuted"),
                fontSize: theme.sizes.fontSize.xs,
              }}
            >
              BG: {getColor(theme.colors, "workspaceTitleBackground")}
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textMuted"),
                fontSize: theme.sizes.fontSize.xs,
              }}
            >
              Text: {getColor(theme.colors, "workspaceTitleText")}
            </div>
          </div>

          {/* Resizer */}
          <div
            style={{
              padding: theme.sizes.spacing.sm,
              backgroundColor: getColor(theme.colors, "workspaceResizer"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: theme.sizes.borderRadius.sm,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = getColor(
                theme.colors,
                "workspaceResizerHover"
              );
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = getColor(
                theme.colors,
                "workspaceResizer"
              );
            }}
          >
            <div
              style={{
                color: getColor(theme.colors, "text"),
                fontSize: theme.sizes.fontSize.xs,
                marginBottom: theme.sizes.spacing.xs,
              }}
            >
              Resizer (hover me)
            </div>
            <div
              style={{
                color: getColor(theme.colors, "textMuted"),
                fontSize: theme.sizes.fontSize.xs,
              }}
            >
              {getColor(theme.colors, "workspaceResizer")}
            </div>
          </div>
        </div>
      </div>

      {/* Available Themes List */}
      <div
        style={{
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
          padding: theme.sizes.spacing.md,
          borderRadius: theme.sizes.borderRadius.md,
          border: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        <h4
          style={{
            color: getColor(theme.colors, "primary"),
            fontSize: theme.sizes.fontSize.md,
            marginBottom: theme.sizes.spacing.sm,
          }}
        >
          Available Themes ({Object.keys(availableThemes).length})
        </h4>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: theme.sizes.spacing.xs,
          }}
        >
          {Object.entries(availableThemes).map(([id, themeData]) => (
            <span
              key={id}
              style={{
                backgroundColor:
                  id === themeId
                    ? getColor(theme.colors, "primary")
                    : getColor(theme.colors, "surface"),
                color:
                  id === themeId
                    ? getColor(theme.colors, "textInverse")
                    : getColor(theme.colors, "text"),
                padding: `${theme.sizes.spacing.xs} ${theme.sizes.spacing.sm}`,
                borderRadius: theme.sizes.borderRadius.sm,
                fontSize: theme.sizes.fontSize.sm,
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
            >
              {themeData.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const themeInheritanceDemoView = {
  id: "theme-inheritance-demo",
  title: "Theme Inheritance",
  icon: "🎭",
  component: (props: any) => <ThemeInheritanceDemo {...props} />,
};

// Register all views as a single array
registerViews([
  ...defaultViews,
  aiChatView,
  semanticWebQueryView,
  forceGraph3DView,
  forceGraph3DViewV2,
  entityTableV2View,
  customThemedPanelView,
  themeInheritanceDemoView,
]);

// Example: Create a custom theme for demonstration
const customUnigraphTheme: Theme = {
  id: "unigraph-custom" as ThemeId,
  name: "Unigraph Custom",
  colors: {
    primary: "#4f46e5",
    secondary: "#06b6d4",
    accent: "#f59e0b",
    background: "#0f172a",
    backgroundSecondary: "#1e293b",
    backgroundTertiary: "#334155",
    surface: "#475569",
    surfaceHover: "#64748b",
    surfaceActive: "#94a3b8",
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    textInverse: "#0f172a",
    border: "#475569",
    borderFocus: "#4f46e5",
    borderHover: "#64748b",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
    link: "#06b6d4",
    linkHover: "#0891b2",

    // Workspace-specific colors for custom theme
    workspaceBackground: "#0f172a", // --color-bg
    workspacePanel: "#1e293b", // --color-panel
    workspaceTitleBackground: "#334155", // --color-title-bg
    workspaceTitleText: "#4f46e5", // --color-title-text
    workspaceResizer: "#475569", // --color-resizer
    workspaceResizerHover: "#4f46e5", // --color-resizer-hover
    workspaceScrollbar: "#64748b", // --color-scrollbar
    workspaceScrollbarHover: "#06b6d4", // --color-scrollbar-hover
  },
  sizes: commonSizes, // Use the shared size definitions
};

// Register our custom theme (this demonstrates how external projects can add themes)
// Note: In a real implementation, this could be done via a theme registration API
Object.assign(themes, { "unigraph-custom": customUnigraphTheme });

const AppShellView: React.FC = () => {
  // Create a sample workspace configuration

  const workspaceConfig: Partial<WorkspaceConfig> = {
    theme: "dark" as ThemeId,
    leftPane: {
      defaultSize: 250,
      maxSize: 500,
      minSize: 100,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
    rightPane: {
      defaultSize: 300,
      maxSize: 400,
      minSize: 150,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
    bottomPane: {
      defaultSize: 200,
      maxSize: 300,
      minSize: 100,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {/* Use combined provider that syncs ThemeProvider with workspace theme */}
      <ThemeWorkspaceProvider initialConfig={workspaceConfig}>
        <AppShellWorkspace />
      </ThemeWorkspaceProvider>
    </div>
  );
};

export default AppShellView;
