import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  const urlParams = new URLSearchParams(window.location.search);
  const graphName = urlParams.get('graph') ?? undefined;
  const svgUrl = urlParams.get('svgUrl') ?? undefined;
  const activeView = urlParams.get('view') ?? undefined;
  const activeLayout = urlParams.get('layout') ?? undefined;
  const showOptionsPanel = urlParams.get('showOptionsPanel') ?? undefined;
  const showLegendBars = urlParams.get('showLegendBars') ?? undefined;
  const showGraphLayoutToolbar =
    urlParams.get('showGraphLayoutToolbar') ?? undefined;
  const showRenderConfigOptions =
    urlParams.get('showRenderConfig') ?? undefined;
  root.render(
    <App
      defaultGraph={graphName}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
      showOptionsPanel={showOptionsPanel}
      showLegendBars={showLegendBars}
      showGraphLayoutToolbar={showGraphLayoutToolbar}
      showRenderConfigOptions={showRenderConfigOptions}
    />
  );
}
