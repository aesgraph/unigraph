import {
  Handle,
  NodeResizer,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import React, { useEffect, useState } from "react";
import { Webpage } from "../../../../api/webpagesApi";

interface ResizableWebpageNodeProps {
  webpage: Webpage;
  dimensions?: { width: number; height: number };
  onResizeEnd?: (x: number, y: number, width: number, height: number) => void;
  style?: React.CSSProperties;
}

const MIN_WIDTH = 160;
const MIN_HEIGHT = 80;

const ResizableWebpageNode: React.FC<
  ResizableWebpageNodeProps & { data?: any }
> = ({ webpage, dimensions, onResizeEnd, style = {}, data }) => {
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

  // Handler for resize end (call both local and data.onResizeEnd)
  const handleResizeEnd = (event: ResizeDragEvent, params: ResizeParams) => {
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
    // Call data.onResizeEnd if present (for ReactFlow integration)
    if (data && typeof data.onResizeEnd === "function") {
      data.onResizeEnd(
        params.x as number,
        params.y as number,
        newSize.width,
        newSize.height
      );
    }
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
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{ background: "#1976d2" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{ background: "#1976d2" }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 2,
            color: "#1976d2",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
          }}
        >
          {webpage.title || "Webpage"}
        </div>
        {/* Screenshot only (no iframe or page embed) */}
        {webpage.screenshot_url && (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "4px 0",
              width: "100%",
              minHeight: 40,
              maxHeight: "100%",
            }}
          >
            <img
              src={webpage.screenshot_url}
              alt="webpage screenshot"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 6,
                border: "1px solid #e0e0e0",
                objectFit: "cover",
                background: "#f5f6fa",
                display: "block",
              }}
            />
          </div>
        )}
        {/* URL */}
        {webpage.url && (
          <div style={{ marginTop: "auto" }}>
            <a
              href={webpage.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1976d2",
                fontSize: 12,
                textDecoration: "underline",
                marginTop: 2,
                marginBottom: 2,
                wordBreak: "break-all",
                display: "block",
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {webpage.url.replace(/^https?:\/\//, "").slice(0, 40)}
              {webpage.url.length > 40 ? "..." : ""}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// For React Flow nodeTypes compatibility
const WebpageNode = (props: any) => {
  const webpage: Webpage | undefined = props.data?.webpage;
  if (!webpage) return <div>Invalid webpage</div>;
  // Pass data prop for ReactFlow compatibility
  return (
    <ResizableWebpageNode
      webpage={webpage}
      dimensions={props.data?.dimensions}
      onResizeEnd={props.data?.onResizeEnd}
      style={props.style}
      data={props.data}
    />
  );
};

export default WebpageNode;
