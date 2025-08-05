import {
  Handle,
  NodeResizer,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import React, { useEffect, useState } from "react";

interface ClassField {
  name: string;
  type: string;
}

interface ClassMethod {
  name: string;
  arguments: { name: string; type: string }[];
  returnType: string;
}

interface ResizableClassCardProps {
  name: string;
  description?: string;
  fields: ClassField[];
  methods: ClassMethod[];
  dimensions?: { width: number; height: number };
  onResizeEnd?: (x: number, y: number, width: number, height: number) => void;
  style?: React.CSSProperties;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 110;

const ResizableClassCard: React.FC<ResizableClassCardProps> = ({
  name,
  description,
  fields,
  methods,
  dimensions,
  onResizeEnd,
  style = {},
}) => {
  const [size, setSize] = useState({
    width: dimensions?.width || 280,
    height: dimensions?.height || 180,
  });

  useEffect(() => {
    if (dimensions) {
      setSize({
        width: dimensions.width || 280,
        height: dimensions.height || 180,
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
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid #e0e0e0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: 12,
          boxSizing: "border-box",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
          {name}{" "}
          <span style={{ fontWeight: 400, fontSize: 13, color: "#1976d2" }}>
            (class)
          </span>
        </div>
        {description && (
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
            {description}
          </div>
        )}
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
          Data Members:
        </div>
        <table
          style={{
            width: "100%",
            maxWidth: "100%",
            fontSize: 13,
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <tbody>
            {fields.map((field) => (
              <tr key={field.name}>
                <td
                  style={{
                    fontWeight: 500,
                    padding: "2px 6px 2px 0",
                    color: "#333",
                  }}
                >
                  {field.name}
                </td>
                <td style={{ color: "#1976d2", padding: "2px 0" }}>
                  {field.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontWeight: 600, fontSize: 13, margin: "8px 0 2px 0" }}>
          Methods:
        </div>
        <table
          style={{
            width: "100%",
            maxWidth: "100%",
            fontSize: 13,
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <tbody>
            {methods.map((method) => (
              <tr key={method.name}>
                <td
                  style={{
                    fontWeight: 500,
                    padding: "2px 6px 2px 0",
                    color: "#333",
                    verticalAlign: "top",
                  }}
                >
                  {method.name}(
                  {method.arguments
                    .map((arg) => `${arg.name}: ${arg.type}`)
                    .join(", ")}
                  )
                </td>
                <td
                  style={{
                    color: "#1976d2",
                    padding: "2px 0",
                    verticalAlign: "top",
                  }}
                >
                  {method.returnType}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default ResizableClassCard;
