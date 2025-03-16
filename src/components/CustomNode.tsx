import { Handle, NodeProps, Position } from "@xyflow/react";
import React, { useState } from "react";
import { NodeData } from "../core/model/Node";

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as NodeData;
  const [dimensions, setDimensions] = useState({ width: 200, height: 100 });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      setDimensions({
        width:
          e.clientX -
          (e.currentTarget as HTMLElement)?.getBoundingClientRect().left,
        height:
          e.clientY -
          (e.currentTarget as HTMLElement)?.getBoundingClientRect().top,
      });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  console.log("RENDERING CUSTOM NODE");
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #ddd",
        borderRadius: 5,
        position: "relative",
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div>{nodeData.label}</div>
      <Handle type="source" position={Position.Right} />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 10,
          height: 10,
          backgroundColor: "#ddd",
          cursor: "se-resize",
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default CustomNode;
