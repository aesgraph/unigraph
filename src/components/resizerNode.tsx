import {
  Handle,
  NodeResizer,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import React, { memo, useState } from "react";
import { NodeData } from "../core/model/Node";

export type ResizerNodeDataArgs = NodeData & {
  onResizeEnd?: (x: number, y: number, width: number, height: number) => void;
};

function ResizerNode({ data }: { data: ResizerNodeDataArgs }) {
  const [dimensions, setDimensions] = useState({
    width: data.dimensions?.width || 100,
    height: data.dimensions?.height || 50,
  });

  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      <NodeResizer
        minWidth={50}
        minHeight={50}
        onResizeEnd={(event: ResizeDragEvent, params: ResizeParams) => {
          const newDimensions = {
            width: params.width as number,
            height: params.height as number,
          };
          setDimensions(newDimensions);
          data.onResizeEnd?.(
            params.x as number,
            params.y as number,
            newDimensions.width,
            newDimensions.height
          );
        }}
      />
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ResizerNode);
