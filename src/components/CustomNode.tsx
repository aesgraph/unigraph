import { Handle, NodeProps, Position } from "@xyflow/react";
import React from "react";
import { NodeData } from "../core/model/Node";

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as NodeData;
  console.log("RENDERING CUSTOM NODE");
  return (
    <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 5 }}>
      <Handle type="target" position={Position.Left} />
      <div>{nodeData.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomNode;
