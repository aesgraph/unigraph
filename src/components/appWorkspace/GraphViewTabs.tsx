import React, { useEffect, useState } from "react";
import { getSelectedNodeIds } from "../../store/graphInteractionStore";

interface GraphViewTabsProps {
  activeView: string;
  onViewChange: (view: string, fitToView: boolean) => void;
  simulationList: string[];
  selectedSimulation: string;
}

const GraphViewTabs: React.FC<GraphViewTabsProps> = ({
  activeView,
  onViewChange,
  simulationList,
  selectedSimulation,
}) => {
  // Track whether to show the editor tab
  const [showEditorTab, setShowEditorTab] = useState(false);

  // Update showEditorTab when activeView changes
  useEffect(() => {
    setShowEditorTab(activeView === "Editor" && getSelectedNodeIds().size > 0);
  }, [activeView]);

  // Check if current view is a simulation
  const isSimulation = simulationList.includes(activeView);

  return (
    <div className="tab-container">
      {showEditorTab && (
        <button
          className={`tab ${activeView === "Editor" ? "active" : ""}`}
          style={{ maxWidth: "10px" }}
          onClick={() => onViewChange("Editor", true)}
        >
          Editor
        </button>
      )}
      <button
        className={`tab ${activeView === "Gallery" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Gallery", true)}
      >
        Gallery
      </button>
      <button
        className={`tab ${activeView === "AppShell" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("AppShell", true)}
      >
        Shell
      </button>
      <button
        className={`tab ${activeView === "Graphviz" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Graphviz", true)}
      >
        Graphviz
      </button>
      <button
        className={`tab ${activeView === "ForceGraph3d" ? "active" : ""}`}
        onClick={() => onViewChange("ForceGraph3d", true)}
      >
        3D
      </button>
      <button
        className={`tab ${activeView === "ReactFlow" ? "active" : ""}`}
        onClick={() => onViewChange("ReactFlow", true)}
      >
        Flow
      </button>
      <button
        className={`tab ${isSimulation ? "active" : ""}`}
        onClick={() => onViewChange(selectedSimulation, true)}
      >
        Sim
      </button>
    </div>
  );
};

export default GraphViewTabs;
