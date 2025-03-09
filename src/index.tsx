import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  const urlParams = new URLSearchParams(window.location.search);
  const graphName = urlParams.get("graph") ?? undefined;
  root.render(<App defaultGraph={graphName} />);
}
