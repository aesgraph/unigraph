import React from "react";
import {
  getCurrentSceneGraph,
  getForceGraphInstance,
} from "../../store/appConfigStore";
import { getForceGraphInitializationStatus } from "../../utils/forceGraphInitializer";

/**
 * Debug component to show the current state of ForceGraph3D initialization
 */
export const ForceGraphDebugInfo: React.FC = () => {
  const sceneGraph = getCurrentSceneGraph();
  const mainInstance = getForceGraphInstance();
  const status = getForceGraphInitializationStatus();

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f5f5f5",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
      }}
    >
      <h4>ForceGraph3D Debug Info</h4>
      <div>
        <strong>Scene Graph:</strong>{" "}
        {sceneGraph ? sceneGraph.getMetadata().name : "None"}
      </div>
      <div>
        <strong>Main Instance:</strong>{" "}
        {mainInstance ? "Available" : "Not available"}
      </div>
      <div>
        <strong>Can Create Tab:</strong>{" "}
        {status.canCreateTabInstance ? "Yes" : "No"}
      </div>
      <div>
        <strong>Can Use Main:</strong>{" "}
        {status.canUseMainInstance ? "Yes" : "No"}
      </div>

      <h5>Detailed Status:</h5>
      <pre>{JSON.stringify(status, null, 2)}</pre>

      {sceneGraph && (
        <>
          <h5>Scene Graph Info:</h5>
          <div>
            <strong>Nodes:</strong> {sceneGraph.getGraph().getNodes().size()}
          </div>
          <div>
            <strong>Edges:</strong> {sceneGraph.getGraph().getEdges().size()}
          </div>
          <div>
            <strong>Has Positions:</strong>{" "}
            {sceneGraph.getDisplayConfig().nodePositions ? "Yes" : "No"}
          </div>
        </>
      )}

      {mainInstance && (
        <>
          <h5>Main Instance Info:</h5>
          <div>
            <strong>Has Canvas:</strong>{" "}
            {mainInstance.renderer()?.domElement ? "Yes" : "No"}
          </div>
          <div>
            <strong>Graph Data Nodes:</strong>{" "}
            {mainInstance.graphData().nodes?.length || 0}
          </div>
          <div>
            <strong>Graph Data Edges:</strong>{" "}
            {mainInstance.graphData().links?.length || 0}
          </div>
        </>
      )}
    </div>
  );
};

export default ForceGraphDebugInfo;
