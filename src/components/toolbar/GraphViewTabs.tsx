import React, { useEffect, useState } from "react";
import { getSelectedNodeIds } from "../../store/graphInteractionStore";
import SignInButton from "../common/SignInButton";

interface GraphViewTabsProps {
  activeView: string;
  onViewChange: (view: string) => void;
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
          onClick={() => onViewChange("Editor")}
        >
          Editor
        </button>
      )}
      <button
        className={`tab ${activeView === "Yasgui" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Yasgui")}
      >
        Yasgui
      </button>
      <button
        className={`tab ${activeView === "Gallery" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Gallery")}
      >
        Gallery
      </button>
      <button
        className={`tab ${activeView === "Graphviz" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Graphviz")}
      >
        Graphviz
      </button>
      <button
        className={`tab ${activeView === "ForceGraph3d" ? "active" : ""}`}
        onClick={() => onViewChange("ForceGraph3d")}
      >
        3D
      </button>
      <button
        className={`tab ${activeView === "ReactFlow" ? "active" : ""}`}
        onClick={() => onViewChange("ReactFlow")}
      >
        Flow
      </button>
      <button
        className={`tab ${isSimulation ? "active" : ""}`}
        onClick={() => onViewChange(selectedSimulation)}
      >
        Sim
      </button>

      {/* Use the new SignInButton component */}
      <SignInButton
        style={{
          marginLeft: 12,
          marginRight: 16,
        }}
        onSignOut={() => window.location.reload()}
      />
    </div>
  );
};

export default GraphViewTabs;
