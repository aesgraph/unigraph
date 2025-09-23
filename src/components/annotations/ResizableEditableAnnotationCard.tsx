import {
  Handle,
  NodeResizer,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import React, { useEffect, useState } from "react";
import { Annotation } from "../../api/annotationsApi";
import EditableAnnotationCard from "./EditableAnnotationCard";

interface ResizableEditableAnnotationCardProps {
  annotation: Annotation;
  dimensions?: { width: number; height: number };
  onResizeEnd?: (x: number, y: number, width: number, height: number) => void;
  style?: React.CSSProperties;
  compact?: boolean;
  onUpdate?: (updatedAnnotation: Annotation) => void;
}

const MIN_WIDTH = 160;
const MIN_HEIGHT = 80;

const ResizableEditableAnnotationCard: React.FC<
  ResizableEditableAnnotationCardProps
> = ({
  annotation,
  dimensions,
  onResizeEnd,
  style = {},
  compact = false,
  onUpdate,
}) => {
  const [size, setSize] = useState({
    width: dimensions?.width || 220,
    height: dimensions?.height || 140,
  });

  useEffect(() => {
    if (dimensions) {
      setSize({
        width: dimensions.width || 220,
        height: dimensions.height || 140,
      });
    }
  }, [dimensions?.width, dimensions?.height, dimensions]);

  // Handler for resizing (live update)
  const handleResize = (_event: ResizeDragEvent, params: ResizeParams) => {
    setSize({
      width: params.width as number,
      height: params.height as number,
    });
  };

  // Handler for resize end
  const handleResizeEnd = (_event: ResizeDragEvent, params: ResizeParams) => {
    const newSize = {
      width: params.width as number,
      height: params.height as number,
    };
    setSize(newSize);
    onResizeEnd?.(
      params.x as number,
      params.y as number,
      newSize.width,
      newSize.height
    );
  };

  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        background: "transparent",
        ...style,
      }}
    >
      <NodeResizer
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        isVisible
        color="#1976d2"
        lineStyle={{ borderStyle: "dashed" }}
      />
      <Handle type="target" position={Position.Left} />
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <EditableAnnotationCard
          annotation={annotation}
          compact={compact}
          onUpdate={onUpdate}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        />
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default ResizableEditableAnnotationCard;
