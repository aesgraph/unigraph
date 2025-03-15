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
  onResizeEnd?: (x: number, y: number, width: number, height: number) => void;
};

function ResizerNode({ data }: { data: ResizerNodeDataArgs }) {
  const { width = 200, height = 100 } = data.dimensions || {};

  return (
    <div style={{ width, height, position: "relative" }}>
      <NodeResizer
        minWidth={50}
        minHeight={50}
        onResizeEnd={(event: ResizeDragEvent, params: ResizeParams) =>
          data.onResizeEnd?.(
            params.x as number,
            params.y as number,
            params.width as number,
            params.height as number
          )
        }
      />
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ResizerNode);
