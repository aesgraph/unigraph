import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LayoutEngineOption } from "./core/layouts/layoutEngineTypes";
import { decompressSceneGraphJsonFromUrl } from "./core/serializers/toFromJson";
import "./index.css";
import SignIn from "./pages/SignIn";
import {
  setActiveLayout,
  setActiveSceneGraph,
  setActiveView,
} from "./store/appConfigStore";
import {
  setLeftSidebarConfig,
  setRightSidebarConfig,
  setShowToolbar,
} from "./store/workspaceConfigStore";

const getToggleOptionValue = (
  params: URLSearchParams,
  key: string,
  defaultValue = true
): boolean => {
  if (params.get(key) != null) {
    return params.get(key) === "true";
  }
  return defaultValue; //default to true
};

const initializeApp = async () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  const root = ReactDOM.createRoot(rootElement);

  // --- Add this block for /signin route ---
  if (window.location.pathname === "/signin") {
    root.render(<SignIn />);
    return;
  }
  // --- End block ---

  // --- Add this block for minimal workspace test ---
  if (window.location.pathname === "/minimal-workspace") {
    const MinimalWorkspace = (await import("./components/MinimalWorkspace"))
      .default;
    root.render(<MinimalWorkspace />);
    return;
  }
  // --- End block ---

  const urlParams = new URLSearchParams(window.location.search);

  // Get graph from URL only - don't auto-load most recent project
  const graphFromUrl = urlParams.get("graph") ?? undefined;
  const graphId = graphFromUrl; // Remove auto-loading of most recent project

  const svgUrl = urlParams.get("svgUrl") ?? undefined;
  const activeView = urlParams.get("view") ?? undefined;
  const activeLayout = urlParams.get("layout") ?? undefined;

  // Check for minimal workspace test
  const testMinimalWorkspace = urlParams.get("test") === "minimal-workspace";

  // Support loading a scenegraph from the #scenegraph= hash fragment
  const sceneGraphParam = urlParams.get("scenegraph");
  let defaultSerializedSceneGraph = undefined;

  // Check for scenegraph in hash fragment first (preferred method)
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const sceneGraphHash = hashParams.get("scenegraph");
    if (sceneGraphHash) {
      try {
        // First try to parse as JSON (uncompressed)
        defaultSerializedSceneGraph = JSON.parse(
          decodeURIComponent(sceneGraphHash)
        );
      } catch (e) {
        try {
          // If JSON parsing fails, try to decompress
          const decompressed = decompressSceneGraphJsonFromUrl(sceneGraphHash);
          defaultSerializedSceneGraph = JSON.parse(
            JSON.stringify(decompressed)
          );
        } catch (decompressError) {
          console.error(
            "Failed to parse or decompress scenegraph hash",
            e,
            decompressError
          );
        }
      }
    }
  }

  // Fall back to query parameter if no hash fragment
  if (!defaultSerializedSceneGraph && sceneGraphParam) {
    try {
      // First try to parse as JSON (uncompressed)
      defaultSerializedSceneGraph = JSON.parse(
        decodeURIComponent(sceneGraphParam)
      );
    } catch (e) {
      try {
        // If JSON parsing fails, try to decompress
        const decompressed = decompressSceneGraphJsonFromUrl(sceneGraphParam);
        defaultSerializedSceneGraph = JSON.parse(JSON.stringify(decompressed));
      } catch (decompressError) {
        console.error(
          "Failed to parse or decompress scenegraph param",
          e,
          decompressError
        );
      }
    }
  }

  const showToolbar = getToggleOptionValue(urlParams, "showToolbar");
  setShowToolbar(showToolbar);

  const showLeftSidebar = getToggleOptionValue(urlParams, "showLeftSidebar");
  setLeftSidebarConfig({
    isVisible: showLeftSidebar,
    mode: "collapsed",
    minimal: false,
  });

  const showRightSidebar = getToggleOptionValue(urlParams, "showRightSidebar");
  setRightSidebarConfig({
    isVisible: showRightSidebar,
    mode: "collapsed",
    minimal: false,
  });

  const hideWorkspace = getToggleOptionValue(urlParams, "hideWorkspace", false);
  if (hideWorkspace) {
    setShowToolbar(false);
    setLeftSidebarConfig({
      isVisible: false,
      mode: "collapsed",
      minimal: false,
    });
    setRightSidebarConfig({
      isVisible: false,
      mode: "collapsed",
      minimal: false,
    });
  }

  if (graphId) {
    setActiveSceneGraph(graphId);
  }
  if (activeView) {
    setActiveView(activeView);
  }
  if (activeLayout) {
    setActiveLayout(activeLayout as LayoutEngineOption);
  }

  // Render minimal workspace test if requested
  if (testMinimalWorkspace) {
    const MinimalWorkspace = (await import("./components/MinimalWorkspace"))
      .default;
    root.render(<MinimalWorkspace />);
    return;
  }

  root.render(
    <App
      defaultGraph={graphId}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
      shouldShowLoadDialog={!graphId && !svgUrl && !defaultSerializedSceneGraph}
      defaultSerializedSceneGraph={defaultSerializedSceneGraph}
    />
  );
};

// Initialize the app
initializeApp();
