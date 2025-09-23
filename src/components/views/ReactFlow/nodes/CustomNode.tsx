import { Handle, NodeProps, Position } from "@xyflow/react";
import React, { useCallback, useState } from "react";
import { NodeData } from "../../../../core/model/Node";

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as NodeData;
  const [dimensions, setDimensions] = useState({ width: 200, height: 100 });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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
    },
    [isResizing]
  );

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
  }, [handleMouseMove, isResizing]);

  console.log("RENDERING CUSTOM NODE");

  // Helper function to safely render userData values
  const renderUserDataValue = (value: any): string => {
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

  // Get the main label from userData or fallback to node id
  const getMainLabel = (): string => {
    if (nodeData.userData?.name) {
      return renderUserDataValue(nodeData.userData.name);
    }
    // Try to find the first property that might be a label
    for (const [key, value] of Object.entries(nodeData.userData || {})) {
      if (
        key.toLowerCase().includes("name") ||
        key.toLowerCase().includes("label")
      ) {
        return renderUserDataValue(value);
      }
    }
    return nodeData.id;
  };

  // Get description from userData
  const getDescription = (): string => {
    if (nodeData.userData?.description) {
      return renderUserDataValue(nodeData.userData.description);
    }
    return "";
  };

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
      <div style={{ fontWeight: "bold" }}>{getMainLabel()}</div>
      <div style={{ fontSize: "0.9em", color: "#555" }}>{getDescription()}</div>
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
