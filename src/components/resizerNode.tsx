import {
  Handle,
  NodeResizer,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import React, { memo, useEffect, useState } from "react";
import { NodeData } from "../core/model/Node";

export type ResizerNodeDataArgs = NodeData & {
  onResizeEnd?: (x: number, y: number, width: number, height: number) => void;
};

function ResizerNode({ data }: { data: ResizerNodeDataArgs }) {
  const [dimensions, setDimensions] = useState({
    width: data.dimensions?.width || 100,
    height: data.dimensions?.height || 50,
  });

  // console.log("RENDERING RESIZER NODE", data.label);

  // Add effect to update dimensions when props change
  useEffect(() => {
    if (data.dimensions) {
      setDimensions({
        width: data.dimensions.width || 100,
        height: data.dimensions.height || 50,
      });
    }
  }, [data.dimensions]);

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
      <div style={{ fontWeight: "bold" }}>{data.label}</div>
      <div style={{ fontSize: "0.9em", color: "#555" }}>
        {data?.description}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// Use React.memo with a custom comparison function to prevent unnecessary rerenders
export default memo(ResizerNode, (prevProps, nextProps) => {
  // Only rerender if label or dimensions have changed
  return (
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.dimensions?.width === nextProps.data.dimensions?.width &&
    prevProps.data.dimensions?.height === nextProps.data.dimensions?.height
  );
});
