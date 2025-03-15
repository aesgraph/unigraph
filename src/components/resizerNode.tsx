import {
  Handle,
  NodeResizer,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import React, { memo } from "react";
import { NodeData } from "../core/model/Node";

export type ResizerNodeDataArgs = NodeData & {
  onResizeEnd?: (width: number, height: number) => void;
};

function ResizerNode({ data }: { data: ResizerNodeDataArgs }) {
  return (
    <div>
      <NodeResizer
        minWidth={50}
        minHeight={50}
        onResizeEnd={(event: ResizeDragEvent, params: ResizeParams) =>
          data.onResizeEnd?.(params.width as number, params.height as number)
        }
      />
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ResizerNode);
