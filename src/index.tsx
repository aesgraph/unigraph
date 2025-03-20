import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";

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

  let showToolbar = getToggleOptionValue(urlParams, "showToolbar");
  let showLeftSidebar = getToggleOptionValue(urlParams, "showLeftSidebar");
  let showRightSidebar = getToggleOptionValue(urlParams, "showRightSidebar");
  const hideWorkspace = getToggleOptionValue(urlParams, "hideWorkspace", false);
  if (hideWorkspace) {
    showToolbar = false;
    showLeftSidebar = false;
    showRightSidebar = false;
  }

  root.render(
    <App
      defaultGraph={graphName}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
      showToolbar={showToolbar}
      showLeftSidebar={showLeftSidebar}
      showRightSidebar={showRightSidebar}
    />
  );
}
