import {
  Handle,
  NodeResizer,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import React, { memo, useEffect, useState } from "react";
import { NodeData } from "../../../../core/model/Node";

// Helper function to safely render values that might be objects
const renderValue = (value: any): string => {
  if (typeof value === "string") {
    return value;
  } else if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  } else if (value && typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return String(value || "");
  }
};

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
        onResizeEnd={(_event: ResizeDragEvent, params: ResizeParams) => {
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
      <div style={{ fontWeight: "bold" }}>{renderValue(data.label)}</div>
      <div style={{ fontSize: "0.9em", color: "#555" }}>
        {renderValue(data?.description)}
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
