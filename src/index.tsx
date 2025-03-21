import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { LayoutEngineOption } from "./core/layouts/LayoutEngine";
import "./index.css";
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

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  const urlParams = new URLSearchParams(window.location.search);
  const graphName = urlParams.get("graph") ?? undefined;
  const svgUrl = urlParams.get("svgUrl") ?? undefined;
  const activeView = urlParams.get("view") ?? undefined;
  const activeLayout = urlParams.get("layout") ?? undefined;

  const showToolbar = getToggleOptionValue(urlParams, "showToolbar");
  setShowToolbar(showToolbar);

  const showLeftSidebar = getToggleOptionValue(urlParams, "showLeftSidebar");
  setLeftSidebarConfig({
    isVisible: showLeftSidebar,
    mode: "full",
    minimal: false,
  });

  const showRightSidebar = getToggleOptionValue(urlParams, "showRightSidebar");
  setRightSidebarConfig({
    isVisible: showRightSidebar,
    mode: "full",
    minimal: false,
  });

  const hideWorkspace = getToggleOptionValue(urlParams, "hideWorkspace", false);
  if (hideWorkspace) {
    setShowToolbar(false);
    setLeftSidebarConfig({ isVisible: false, mode: "full", minimal: false });
    setRightSidebarConfig({ isVisible: false, mode: "full", minimal: true });
  }

  if (graphName) {
    setActiveSceneGraph(graphName);
  }
  if (activeView) {
    setActiveView(activeView);
  }
  if (activeLayout) {
    setActiveLayout(activeLayout as LayoutEngineOption);
  }

  root.render(
    <App
      defaultGraph={graphName}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
    />
  );
}
