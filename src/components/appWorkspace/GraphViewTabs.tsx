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

  // Track which views have been visited to avoid fitting to view on subsequent visits
  const [visitedViews, setVisitedViews] = useState<Set<string>>(new Set());

  // Update showEditorTab when activeView changes
  useEffect(() => {
    setShowEditorTab(activeView === "Editor" && getSelectedNodeIds().size > 0);
  }, [activeView]);

  // Check if current view is a simulation
  const isSimulation = simulationList.includes(activeView);

  // Helper function to handle view changes with smart fit-to-view logic
  const handleViewChange = (view: string) => {
    const isFirstVisit = !visitedViews.has(view);
    if (isFirstVisit) {
      setVisitedViews((prev) => new Set([...prev, view]));
    }
    onViewChange(view, isFirstVisit);
  };

  return (
    <div className="tab-container">
      {showEditorTab && (
        <button
          className={`tab ${activeView === "Editor" ? "active" : ""}`}
          style={{ maxWidth: "10px" }}
          onClick={() => handleViewChange("Editor")}
        >
          Editor
        </button>
      )}
      <button
        className={`tab ${activeView === "Gallery" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => handleViewChange("Gallery")}
      >
        Gallery
      </button>
      <button
        className={`tab ${activeView === "AppShell" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => handleViewChange("AppShell")}
      >
        Shell
      </button>
      <button
        className={`tab ${activeView === "Graphviz" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => handleViewChange("Graphviz")}
      >
        Graphviz
      </button>
      <button
        className={`tab ${activeView === "ForceGraph3d" ? "active" : ""}`}
        onClick={() => handleViewChange("ForceGraph3d")}
      >
        3D
      </button>
      <button
        className={`tab ${activeView === "ReactFlow" ? "active" : ""}`}
        onClick={() => handleViewChange("ReactFlow")}
      >
        Flow
      </button>
      <button
        className={`tab ${isSimulation ? "active" : ""}`}
        onClick={() => handleViewChange(selectedSimulation)}
      >
        Sim
      </button>
    </div>
  );
};

export default GraphViewTabs;
