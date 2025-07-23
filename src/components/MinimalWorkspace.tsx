import { getCurrentSceneGraph } from "@/store/appConfigStore";
import {} from "@aesgraph/app-shell";
import "@aesgraph/app-shell/app-shell.css";
import React from "react";
import Workspace from "./appWorkspace/Workspace";
import styles from "./MinimalWorkspace.module.css";
import AppShellView from "./views/AppShellView";

const MinimalWorkspace: React.FC = () => {
  return (
    <div className={styles.appContainer}>
      {/* Main Content Area with Workspace */}
      <div className={styles.mainContent}>
        <Workspace
          menuConfig={{}}
          currentSceneGraph={getCurrentSceneGraph()}
          isDarkMode={false}
          selectedSimulation={""}
          simulations={[]}
          onViewChange={() => {}}
          onSelectResult={() => {}}
          onSearchResult={() => {}}
          onHighlight={() => {}}
          onApplyForceGraphConfig={() => {}}
          renderLayoutModeRadio={() => <div>Layout Mode Radio</div>}
          showFilterWindow={() => {}}
          showFilterManager={() => {}}
          renderNodeLegend={<div>Node Legend</div>}
          renderEdgeLegend={<div>Edge Legend</div>}
          showPathAnalysis={() => {}}
          showLoadSceneGraphWindow={() => {}}
          showSaveSceneGraphDialog={() => {}}
          showLayoutManager={() => {}}
          handleFitToView={() => {}}
          handleShowEntityTables={() => {}}
          handleLoadSceneGraph={() => {}}
        >
          {/* <AppShellWorkspace fullViewport={false} /> */}
          <AppShellView />
        </Workspace>
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        Ready • Unigraph • Scene Graph Loaded •{" "}
        {getCurrentSceneGraph() ? "Graph Active" : "No Graph"}
      </div>
    </div>
  );
};

export default MinimalWorkspace;
