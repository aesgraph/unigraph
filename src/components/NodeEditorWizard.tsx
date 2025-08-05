import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { RenderingManager } from "../controllers/RenderingManager";
import { Edge } from "../core/model/Edge";
import { NodeDataArgs, NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";
import EdgeListItem, { EdgeInfo } from "./common/EdgeListItem";
import EntityTagsSelectorDropdown from "./common/EntityTagsSelectorDropdown";
import EntityTypeSelectDropdown from "./common/EntityTypeSelectDropdown";
import "./NodeEditorWizard.css";

interface NodeEditorWizardProps {
  sceneGraph: SceneGraph;
  nodeId: NodeId | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSubmit: (nodeId: NodeId | null, data: NodeDataArgs) => void;
}

export interface INodeInfo {
  id: string;
  label: string;
  type: string;
  tags: string[];
  description: string;
  userData: any;
  edgesToThisNode: Edge[];
  edgesFromThisNode: Edge[];
}

const NodeEditorWizard: React.FC<NodeEditorWizardProps> = ({
  sceneGraph,
  nodeId,
  isDarkMode,
  onClose,
  onSubmit,
}) => {
  const [nodeConfig, setNodeConfig] = useState<INodeInfo | undefined>(
    undefined
  );
  const [label, setLabel] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [tags, setTags] = useState<
    { value: string; label: string; color: string }[]
  >([]);
  const [description, setDescription] = useState<string | undefined>(undefined);

  const isEditing = useMemo(() => {
    return nodeId != null;
  }, [nodeId]);

  useEffect(() => {
    if (nodeId) {
      const node = sceneGraph.getGraph().getNode(nodeId);
      const nodeData: INodeInfo = {
        id: node.getId(),
        label: node.getLabel(),
        type: node.getType(),
        tags: Array.from(node.getTags()),
        description: node.getDescription(),
        userData: node.getAllUserData(),
        edgesToThisNode: sceneGraph.getGraph().getEdgesTo(nodeId),
        edgesFromThisNode: sceneGraph.getGraph().getEdgesFrom(nodeId),
      };
      setNodeConfig(nodeData);
      setLabel(node.getLabel());
      setType(node.getType());
      setDescription(node.getDescription());
      setTags(
        Array.from(node.getTags()).map((tag) => ({
          value: tag,
          label: tag,
          color: RenderingManager.getColorByKeySimple(
            tag,
            sceneGraph.getDisplayConfig().nodeConfig.tags
          ),
        }))
      );
    } else {
      setNodeConfig({
        id: uuidv4(),
        label: "",
        type: "",
        tags: [],
        description: "",
        userData: {},
        edgesToThisNode: [],
        edgesFromThisNode: [],
      });
      setLabel("");
      setType("");
      setDescription("");
      setTags([]);
    }
  }, [nodeId, sceneGraph]);

  const availableNodes = useMemo(
    () =>
      sceneGraph
        .getGraph()
        .getNodes()
        .map((node) => ({
          value: node.getId(),
          label: node.getId(),
        })),
    [sceneGraph]
  );

  const availableEdgeTypes = useMemo(
    () =>
      Array.from(
        new Set(
          sceneGraph
            .getGraph()
            .getEdges()
            .map((e) => e.getType())
        )
      ).map((type) => ({
        value: type,
        label: type,
        color: RenderingManager.getColorByKeySimple(
          type,
          sceneGraph.getDisplayConfig().edgeConfig.types
        ),
      })),
    [sceneGraph]
  );

  const handleEdgeNodeChange = (edgeId: string, newNodeId: string) => {
    // Implement edge node change logic
    console.log("Change edge node:", edgeId, "to:", newNodeId);
    // setNodeConfig((prev) => {
    //   if (!prev) return prev;
    //   const newEdges = prev.edgesToThisNode.map((edge) => {
    //     if (edge.getId() === edgeId) {
    //       const updatedEdge = sceneGraph.getGraph().getEdge(edgeId);
    //       updatedEdge.setTarget(newNodeId);
    //       return updatedEdge;
    //     }
    //     return edge;
    //   });
    //   return {
    //     ...prev,
    //     edgesToThisNode: newEdges as Edge[],
    //   };
    // });
  };

  const handleEdgeTypeChange = (edgeId: string, newType: string) => {
    // Implement edge type change logic
    console.log("Change edge type:", edgeId, "to:", newType);
  };

  const handleSave = () => {
    if (!nodeConfig) return;
    onSubmit(nodeId, {
      ...nodeConfig,
      label,
      type,
      tags: tags?.map((tag) => tag.value),
      description,
    });
  };

  // Get all edges connected to this node
  const connectedEdges = useMemo(() => {
    const edges = sceneGraph.getGraph().getEdges();
    return edges.toArray().reduce<EdgeInfo[]>((acc, edge) => {
      if (edge.getSource() === nodeId) {
        acc.push({
          id: edge.getId(),
          nodeId: edge.getTarget(),
          type: edge.getType(),
          direction: "out",
        });
      }
      if (edge.getTarget() === nodeId) {
        acc.push({
          id: edge.getId(),
          nodeId: edge.getSource(),
          type: edge.getType(),
          direction: "in",
        });
      }
      return acc;
    }, []);
  }, [nodeId, sceneGraph]);

  const incomingEdges = useMemo(
    () => connectedEdges.filter((edge) => edge.direction === "in"),
    [connectedEdges]
  );

  const outgoingEdges = useMemo(
    () => connectedEdges.filter((edge) => edge.direction === "out"),
    [connectedEdges]
  );

  const renderEdgeList = (edges: EdgeInfo[], title: string) => (
    <div className="edge-section">
      <h3 className="edge-section-title">{title}</h3>
      <div className="edge-list">
        {edges.map((edge) => (
          <EdgeListItem
            key={edge.id}
            edge={{
              ...edge,
              color: RenderingManager.getColorByKeySimple(
                edge.type,
                sceneGraph.getDisplayConfig().edgeConfig.types
              ),
            }}
            isDarkMode={isDarkMode}
            availableNodes={availableNodes}
            availableTypes={availableEdgeTypes}
            onNodeChange={(newNodeId) =>
              handleEdgeNodeChange(edge.id, newNodeId)
            }
            onTypeChange={(newType) => handleEdgeTypeChange(edge.id, newType)}
            onSelect={(edge) => {
              console.log("Selected edge:", edge);
              // Handle edge selection
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="wizard-backdrop" onClick={onClose} />
      <div className={`node-editor-wizard ${isDarkMode ? "dark" : ""}`}>
        <div className="wizard-header">
          <h3>{isEditing ? "Edit Node" : "Create Node"}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="wizard-content">
          {renderEdgeList(incomingEdges, "Incoming Edges")}

          <div className="main-section">
            <div className="form-group">
              <label>Label:</label>
              <input
                type="text"
                value={label || ""}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <EntityTypeSelectDropdown
                sceneGraph={sceneGraph}
                nodeId={nodeId}
                value={type}
                setValue={setType}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="form-group">
              <label>Tags:</label>
              <EntityTagsSelectorDropdown
                sceneGraph={sceneGraph}
                nodeId={nodeId}
                values={tags}
                setValues={setTags}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button className="save-button" onClick={handleSave}>
              {isEditing ? "Save" : "Create"}
            </button>
          </div>

          {renderEdgeList(outgoingEdges, "Outgoing Edges")}
        </div>
      </div>
    </>
  );
};

export default NodeEditorWizard;
