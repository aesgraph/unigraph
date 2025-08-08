import GravitySimulation3 from "@/_experimental/webgl/simulations/GravitySimulation3";
import {
  ExampleThemedComponent,
  LayoutManager,
  Theme,
  ThemeId,
  commonSizes,
  defaultViews,
  getColor,
  registerViews,
  themes,
  useTheme,
} from "@aesgraph/app-shell";
import "@aesgraph/app-shell/app-shell.css";
import React from "react";
import useAppConfigStore from "../../store/appConfigStore";
import AIChatPanel from "../ai/AIChatPanel";

import WikipediaArticleViewer_FactorGraph from "../applets/WikipediaViewer/WikipediaArticleViewer_FactorGraph";
import EntityTableV2 from "../common/EntityTableV2";
import HtmlPageViewer from "../common/HtmlPageViewer";
import LogViewer from "../common/LogViewer";
import MarkdownViewer from "../common/MarkdownViewer";
import UnigraphIframe from "../common/UnigraphIframe";
import SemanticWebQueryPanel from "../semantic/SemanticWebQueryPanel";
import DevToolsView from "./DevToolsView";
import DocumentationView from "./DocumentationView";
import DocumentEditorView from "./DocumentEditorView";
import EdgeLegendView from "./EdgeLegendView";
import ForceGraph3DViewV2 from "./ForceGraph3DViewV2";
import Map2DView from "./Map2DView";
import MonacoEditorView from "./MonacoEditorView";
import NodeLegendView from "./NodeLegendView";
import PdfJsViewer from "./PdfJsViewer";
import ReactFlowPanelV2 from "./ReactFlowPanelV2";
import ResourceManagerView from "./ResourceManagerView";
import SandpackEditorWithFileTree from "./SandpackEditorWithFileTree";
import SystemMonitorView from "./SystemMonitorView";
import { VIEW_DEFINITIONS } from "./viewDefinitions";

// Create custom views that include our AIChatPanel and SemanticWebQueryPanel
const aiChatView = {
  id: VIEW_DEFINITIONS["ai-chat"].id,
  title: VIEW_DEFINITIONS["ai-chat"].title,
  icon: VIEW_DEFINITIONS["ai-chat"].icon,
  component: (props: any) => (
    <AIChatPanel sessionId="appshell-chat" {...props} />
  ),
  category: VIEW_DEFINITIONS["ai-chat"].category,
};

const semanticWebQueryView = {
  id: VIEW_DEFINITIONS["semantic-web-query"].id,
  title: VIEW_DEFINITIONS["semantic-web-query"].title,
  icon: VIEW_DEFINITIONS["semantic-web-query"].icon,
  component: (props: any) => (
    <SemanticWebQueryPanel
      sessionId="appshell-chat"
      theme={props.theme}
      {...props}
    />
  ),
  category: VIEW_DEFINITIONS["semantic-web-query"].category,
};

const forceGraph3DView = {
  id: VIEW_DEFINITIONS["force-graph-3d"].id,
  title: VIEW_DEFINITIONS["force-graph-3d"].title,
  icon: VIEW_DEFINITIONS["force-graph-3d"].icon,
  component: (props: any) => <ForceGraph3DViewV2 {...props} />,
  category: VIEW_DEFINITIONS["force-graph-3d"].category,
};

const forceGraph3DViewV2 = {
  id: VIEW_DEFINITIONS["force-graph-3d-v2"].id,
  title: VIEW_DEFINITIONS["force-graph-3d-v2"].title,
  icon: VIEW_DEFINITIONS["force-graph-3d-v2"].icon,
  component: (props: any) => <ForceGraph3DViewV2 {...props} />,
  category: VIEW_DEFINITIONS["force-graph-3d-v2"].category,
};

const systemMonitorView = {
  id: VIEW_DEFINITIONS["system-monitor"].id,
  title: VIEW_DEFINITIONS["system-monitor"].title,
  icon: VIEW_DEFINITIONS["system-monitor"].icon,
  component: (props: any) => <SystemMonitorView {...props} />,
  category: VIEW_DEFINITIONS["system-monitor"].category,
};

// Create legend views
const nodeLegendView = {
  id: VIEW_DEFINITIONS["node-legend"].id,
  title: VIEW_DEFINITIONS["node-legend"].title,
  icon: VIEW_DEFINITIONS["node-legend"].icon,
  component: (props: any) => <NodeLegendView {...props} />,
  category: VIEW_DEFINITIONS["node-legend"].category,
};

const edgeLegendView = {
  id: VIEW_DEFINITIONS["edge-legend"].id,
  title: VIEW_DEFINITIONS["edge-legend"].title,
  icon: VIEW_DEFINITIONS["edge-legend"].icon,
  component: (props: any) => <EdgeLegendView {...props} />,
  category: VIEW_DEFINITIONS["edge-legend"].category,
};

// EntityTableV2 wrapper component
const EntityTableV2Wrapper: React.FC = () => {
  const { currentSceneGraph } = useAppConfigStore();

  if (!currentSceneGraph) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>No scene graph available. Please load a graph first.</p>
      </div>
    );
  }

  // Get all entities from the scene graph
  const allNodes = currentSceneGraph.getGraph().getNodes();

  return (
    <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <EntityTableV2
        container={allNodes}
        sceneGraph={currentSceneGraph}
        maxHeight="100%"
      />
    </div>
  );
};

const entityTableV2View = {
  id: VIEW_DEFINITIONS["entity-table-v2"].id,
  title: VIEW_DEFINITIONS["entity-table-v2"].title,
  icon: VIEW_DEFINITIONS["entity-table-v2"].icon,
  component: (props: any) => <EntityTableV2Wrapper {...props} />,
  category: VIEW_DEFINITIONS["entity-table-v2"].category,
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
  id: VIEW_DEFINITIONS["custom-themed-panel"].id,
  title: VIEW_DEFINITIONS["custom-themed-panel"].title,
  icon: VIEW_DEFINITIONS["custom-themed-panel"].icon,
  component: (props: any) => <CustomThemedPanel {...props} />,
  category: VIEW_DEFINITIONS["custom-themed-panel"].category,
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
  id: VIEW_DEFINITIONS["theme-inheritance-demo"].id,
  title: VIEW_DEFINITIONS["theme-inheritance-demo"].title,
  icon: VIEW_DEFINITIONS["theme-inheritance-demo"].icon,
  component: (props: any) => <ThemeInheritanceDemo {...props} />,
  category: VIEW_DEFINITIONS["theme-inheritance-demo"].category,
};

// Wikipedia Factor Graph viewer
const wikipediaFactorGraphView = {
  id: VIEW_DEFINITIONS["wikipedia-factor-graph"].id,
  title: VIEW_DEFINITIONS["wikipedia-factor-graph"].title,
  icon: VIEW_DEFINITIONS["wikipedia-factor-graph"].icon,
  component: (props: any) => (
    <WikipediaArticleViewer_FactorGraph
      initialArticle="Factor graph"
      highlightKeywords={[]}
      customTerms={{
        "sum-product": "A message-passing algorithm used in factor graphs",
        enabling: "Making something possible or easier",
      }}
      {...props}
    />
  ),
  category: VIEW_DEFINITIONS["wikipedia-factor-graph"].category,
};

const reactFlowPanelV2View = {
  id: VIEW_DEFINITIONS["react-flow-panel-v2"].id,
  title: VIEW_DEFINITIONS["react-flow-panel-v2"].title,
  icon: VIEW_DEFINITIONS["react-flow-panel-v2"].icon,
  component: (props: any) => <ReactFlowPanelV2 {...props} />,
  category: VIEW_DEFINITIONS["react-flow-panel-v2"].category,
};

const unigraphIframeView = {
  id: VIEW_DEFINITIONS["unigraph-iframe"].id,
  title: VIEW_DEFINITIONS["unigraph-iframe"].title,
  icon: VIEW_DEFINITIONS["unigraph-iframe"].icon,
  component: (_props: any) => (
    <UnigraphIframe
      src="http://localhost:3001"
      title="Live Unigraph Application"
      width="100%"
      height={700}
      showControls={true}
      resizable={true}
      allowFullscreen={true}
      loadingMessage="Loading Unigraph application..."
      style={{
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
      iframeProps={{
        sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
        referrerPolicy: "no-referrer",
      }}
    />
  ),
  category: VIEW_DEFINITIONS["unigraph-iframe"].category,
};

const htmlPageViewerView = {
  id: VIEW_DEFINITIONS["html-page-viewer"].id,
  title: VIEW_DEFINITIONS["html-page-viewer"].title,
  icon: VIEW_DEFINITIONS["html-page-viewer"].icon,
  component: (props: any) => {
    // Get parameters from sessionStorage, props, or URL parameters
    let resourceId = props.resourceId;
    let url = props.url;
    let title = props.title;

    // Try to get data from sessionStorage first
    try {
      const storedData = sessionStorage.getItem("htmlPageViewerData");
      if (storedData) {
        const data = JSON.parse(storedData);
        resourceId = resourceId || data.resourceId;
        url = url || data.url;
        title = title || data.title;
        // Clear the stored data after reading it
        sessionStorage.removeItem("htmlPageViewerData");
      }
    } catch (error) {
      console.warn(
        "Failed to parse htmlPageViewerData from sessionStorage:",
        error
      );
    }

    // Fallback to URL parameters
    resourceId =
      resourceId ||
      new URLSearchParams(window.location.search).get("resourceId");
    url =
      url ||
      new URLSearchParams(window.location.search).get("url") ||
      "https://example.com";
    title =
      title ||
      new URLSearchParams(window.location.search).get("title") ||
      "Example Page";

    return (
      <HtmlPageViewer
        resourceId={resourceId ? decodeURIComponent(resourceId) : undefined}
        url={decodeURIComponent(url)}
        title={decodeURIComponent(title)}
        {...props}
      />
    );
  },
  category: VIEW_DEFINITIONS["html-page-viewer"].category,
};

const devToolsView = {
  id: VIEW_DEFINITIONS["dev-tools"].id,
  title: VIEW_DEFINITIONS["dev-tools"].title,
  icon: VIEW_DEFINITIONS["dev-tools"].icon,
  component: (_props: any) => <DevToolsView {..._props} />,
  category: VIEW_DEFINITIONS["dev-tools"].category,
};

const gravitySimulationView = {
  id: VIEW_DEFINITIONS["gravity-simulation"].id,
  title: VIEW_DEFINITIONS["gravity-simulation"].title,
  icon: VIEW_DEFINITIONS["gravity-simulation"].icon,
  // eslint-disable-next-line unused-imports/no-unused-vars
  component: (props: any) => <GravitySimulation3 />,
  category: VIEW_DEFINITIONS["gravity-simulation"].category,
};

const monacoEditorView = {
  id: VIEW_DEFINITIONS["monaco-editor"].id,
  title: VIEW_DEFINITIONS["monaco-editor"].title,
  icon: VIEW_DEFINITIONS["monaco-editor"].icon,
  component: (props: any) => <MonacoEditorView {...props} />,
  category: VIEW_DEFINITIONS["monaco-editor"].category,
};

const sandpackEditorView = {
  id: VIEW_DEFINITIONS["sandpack-editor"].id,
  title: VIEW_DEFINITIONS["sandpack-editor"].title,
  icon: VIEW_DEFINITIONS["sandpack-editor"].icon,
  component: (props: any) => <SandpackEditorWithFileTree {...props} />,
  category: VIEW_DEFINITIONS["sandpack-editor"].category,
};

const ResourceManagerViewWrapper: React.FC = () => {
  return <ResourceManagerView />;
};

const resourceManagerView = {
  id: VIEW_DEFINITIONS["resource-manager"].id,
  title: VIEW_DEFINITIONS["resource-manager"].title,
  icon: VIEW_DEFINITIONS["resource-manager"].icon,
  component: ResourceManagerViewWrapper,
  category: VIEW_DEFINITIONS["resource-manager"].category,
};

const pdfViewerView = {
  id: VIEW_DEFINITIONS["pdf-viewer"].id,
  title: VIEW_DEFINITIONS["pdf-viewer"].title,
  icon: VIEW_DEFINITIONS["pdf-viewer"].icon,
  component: (props: any) => <PdfJsViewer {...props} />,
  category: VIEW_DEFINITIONS["pdf-viewer"].category,
};

const MarkdownViewerWrapper: React.FC<any> = (props) => {
  const currentSceneGraph = useAppConfigStore(
    (state) => state.currentSceneGraph
  );
  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        padding: "16px",
      }}
      className="documentation-content"
    >
      <MarkdownViewer
        filename="docs/overview/motivation.md"
        sceneGraph={currentSceneGraph}
        showRawToggle={true}
        onAnnotate={(text) => {
          console.log("Annotation created:", text);
        }}
        {...props}
      />
    </div>
  );
};

const markdownViewerView = {
  id: VIEW_DEFINITIONS["markdown-viewer"].id,
  title: VIEW_DEFINITIONS["markdown-viewer"].title,
  icon: VIEW_DEFINITIONS["markdown-viewer"].icon,
  component: MarkdownViewerWrapper,
  category: VIEW_DEFINITIONS["markdown-viewer"].category,
};

const documentationView = {
  id: VIEW_DEFINITIONS["documentation"].id,
  title: VIEW_DEFINITIONS["documentation"].title,
  icon: VIEW_DEFINITIONS["documentation"].icon,
  component: (props: any) => <DocumentationView {...props} />,
  category: VIEW_DEFINITIONS["documentation"].category,
};

const LogViewerWrapper: React.FC<any> = (props) => {
  return (
    <LogViewer
      isOpen={true}
      onClose={() => {
        // This will be handled by the app shell when the tab is closed
        console.log("LogViewer closed");
      }}
      maxHeight="100%"
      mode="panel"
      {...props}
    />
  );
};

const logViewerView = {
  id: VIEW_DEFINITIONS["log-viewer"].id,
  title: VIEW_DEFINITIONS["log-viewer"].title,
  icon: VIEW_DEFINITIONS["log-viewer"].icon,
  component: LogViewerWrapper,
  category: VIEW_DEFINITIONS["log-viewer"].category,
};

const documentEditorView = {
  id: VIEW_DEFINITIONS["document-editor"].id,
  title: "Document Editor", // Update title to reflect new name
  icon: VIEW_DEFINITIONS["document-editor"].icon,
  component: (props: any) => <DocumentEditorView {...props} />,
  category: VIEW_DEFINITIONS["document-editor"].category,
};

const map2DView = {
  id: VIEW_DEFINITIONS["map-2d"].id,
  title: VIEW_DEFINITIONS["map-2d"].title,
  icon: VIEW_DEFINITIONS["map-2d"].icon,
  component: (props: any) => <Map2DView {...props} />,
  category: VIEW_DEFINITIONS["map-2d"].category,
};

// Filter out unwanted default views
const viewsToExclude = [
  "terminal",
  "about",
  "properties",
  "file-explorer",
  "output",
];
const filteredDefaultViews = defaultViews.filter(
  (view) => !viewsToExclude.includes(view.id)
);

// Define all views
const allViews = [
  ...filteredDefaultViews,
  gravitySimulationView,
  aiChatView,
  semanticWebQueryView,
  forceGraph3DView,
  forceGraph3DViewV2,
  entityTableV2View,
  customThemedPanelView,
  themeInheritanceDemoView,
  systemMonitorView,
  nodeLegendView,
  edgeLegendView,
  wikipediaFactorGraphView,
  reactFlowPanelV2View,
  unigraphIframeView,
  htmlPageViewerView,
  devToolsView,
  monacoEditorView,
  sandpackEditorView,
  markdownViewerView,
  documentEditorView,
  documentationView,
  logViewerView,
  map2DView,
  resourceManagerView,
  pdfViewerView,
];

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

registerViews(allViews);

const AppShellView: React.FC = () => {
  return (
    // <div className={styles.appContainer}>
    <LayoutManager />
    // </div>
  );
};

export default AppShellView;
