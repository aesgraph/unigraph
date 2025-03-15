import { Handle, NodeResizer, Position } from "@xyflow/react";
import React, { memo } from "react";
import { NodeData } from "../core/model/Node";

function ResizerNode({ data }: { data: NodeData }) {
  return (
    <div>
      <NodeResizer minWidth={50} minHeight={50} />
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ResizerNode);
