import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LayoutEngineOption } from "./core/layouts/layoutEngineTypes";
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

  const urlParams = new URLSearchParams(window.location.search);

  // Get graph from URL only - don't auto-load most recent project
  const graphFromUrl = urlParams.get("graph") ?? undefined;
  const graphId = graphFromUrl; // Remove auto-loading of most recent project

  const svgUrl = urlParams.get("svgUrl") ?? undefined;
  const activeView = urlParams.get("view") ?? undefined;
  const activeLayout = urlParams.get("layout") ?? undefined;

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

  root.render(
    <App
      defaultGraph={graphId}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
      shouldShowLoadDialog={!graphId && !svgUrl} // Show dialog when no graph or SVG URL is provided
    />
  );
};

// Initialize the app
initializeApp();
