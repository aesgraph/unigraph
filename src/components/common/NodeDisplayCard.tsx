import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; // Add this import
import { Rnd } from "react-rnd";
import { RenderingManager } from "../../controllers/RenderingManager";
import { Edge } from "../../core/model/Edge";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { getTextColorBasedOnBackground } from "../../utils/colorUtils";
import "./NodeDisplayCard.css";

interface NodeDisplayCardProps {
  nodeId: NodeId;
  sceneGraph: SceneGraph;
  position?: { x: number; y: number };
  onNodeSelect?: (nodeId: NodeId) => void;
  onClose?: () => void; // Add this prop
}

interface EdgeCardProps {
  edge: Edge;
  sceneGraph: SceneGraph;
  isInput?: boolean;
  onNodeSelect?: (nodeId: NodeId) => void;
}

const EdgeCard: React.FC<
  EdgeCardProps & { renderingManager: RenderingManager }
> = ({ edge, sceneGraph, isInput = false, renderingManager, onNodeSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = renderingManager.getEdgeColor(edge);
  const node = isInput
    ? sceneGraph.getGraph().getNode(edge.getSource())
    : sceneGraph.getGraph().getNode(edge.getTarget());
  const nodeType = node?.getType();
  const nodeTypeColor = RenderingManager.getColorByKeySimple(
    nodeType,
    sceneGraph.getDisplayConfig().nodeConfig.types
  );

  const handleClick = () => {
    if (onNodeSelect && node) {
      onNodeSelect(node.getId());
    }
  };

  return (
    <div
      className="edge-card"
      style={{
        borderLeft: `4px solid ${color}`,
        background: isHovered ? `${color}22` : `${color}11`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick} // Add onClick handler
    >
      {!isInput ? (
        <div className="edge-direction" style={{ color: "white" }}>
          →
        </div>
      ) : undefined}
      <div className="edge-info">
        <div className="edge-main-content">
          <div className="edge-node">
            {isInput ? edge.getSource() : edge.getTarget()}
            {nodeType && (
              <div
                className="edge-node-type"
                style={{
                  background: nodeTypeColor,
                  color: getTextColorBasedOnBackground(nodeTypeColor),
                }}
                data-text={nodeType}
              >
                {nodeType}
              </div>
            )}
          </div>
        </div>
        <div
          className="edge-type"
          style={{ background: color }}
          data-text={edge.getType()}
        >
          {edge.getType()}
        </div>
      </div>
      {isInput ? (
        <div className="edge-direction" style={{ color: "white" }}>
          →
        </div>
      ) : undefined}
    </div>
  );
};

const NodeDisplayCard: React.FC<NodeDisplayCardProps> = ({
  nodeId,
  sceneGraph,
  position,
  onNodeSelect,
  onClose, // Add this prop
}) => {
  const renderingManager = sceneGraph.getRenderingManager();
  const node = sceneGraph.getGraph().getNode(nodeId);
  const edgesTo = sceneGraph.getGraph().getEdgesTo(nodeId);
  const edgesFrom = sceneGraph.getGraph().getEdgesFrom(nodeId);

  if (!node) return null;

  const nodeColor = renderingManager.getNodeColor(node);
  const typeColor = renderingManager.getNodeColor(node); // Using same color for type

  const content = (
    <div
      className="node-display-card"
      style={{
        position: "static", // Changed from fixed/relative
        borderTop: `4px solid ${nodeColor}`,
      }}
    >
      <div className="node-header">
        <h3 style={{ color: nodeColor }}>{node.getId()}</h3>
        <div
          className="node-type"
          style={{ background: typeColor }}
          data-text={node.getType()}
        >
          {node.getType()}
        </div>
        <div className="close-button" onClick={onClose}>
          <FaTimes />
        </div>
      </div>

      <div className="node-body">
        {node.getLabel() && <div className="node-label">{node.getLabel()}</div>}
        {node.getLabel() && (
          <div className="node-description">{node.getDescription()}</div>
        )}
      </div>

      <div className="edge-panels">
        <div className="edge-panel">
          <div
            className="panel-header"
            title="Click to expand/collapse"
            onClick={() => console.log("Clicked Inputs")}
          >
            From ({edgesTo.length})
          </div>
          <div className="edge-list">
            {edgesTo.map((edge) => (
              <EdgeCard
                key={edge.getId()}
                edge={edge}
                isInput={true}
                renderingManager={renderingManager}
                sceneGraph={sceneGraph}
                onNodeSelect={onNodeSelect} // Add this prop
              />
            ))}
          </div>
        </div>

        <div className="edge-panel">
          <div
            className="panel-header"
            title="Click to expand/collapse"
            onClick={() => console.log("Clicked Outputs")}
          >
            To ({edgesFrom.length})
          </div>
          <div className="edge-list">
            {edgesFrom.map((edge) => (
              <EdgeCard
                key={edge.getId()}
                edge={edge}
                renderingManager={renderingManager}
                sceneGraph={sceneGraph}
                onNodeSelect={onNodeSelect} // Add this prop
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Rnd
      default={{
        x: position?.x || 0,
        y: position?.y || 0,
        width: "auto",
        height: "auto",
      }}
      style={{ zIndex: 1000 }}
      bounds="window"
      minWidth={"40rem"}
      maxWidth={"40rem"}
      enableResizing={{
        bottom: true,
        right: true,
        bottomRight: true,
      }}
      resizeHandleStyles={{
        bottom: { cursor: "row-resize" },
        right: { cursor: "col-resize" },
        bottomRight: { cursor: "se-resize" },
      }}
    >
      {content}
    </Rnd>
  );
};

export default NodeDisplayCard;
