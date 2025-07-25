import React from "react";
import { useMouseControlsStore } from "../../store/mouseControlsStore";

const SelectionBox: React.FC = () => {
  const selectionBox = useMouseControlsStore((state) => state.selectionBox);

  if (!selectionBox.isActive) return null;

  // Calculate position and dimensions (now local to parent container)
  const left = Math.min(selectionBox.startX, selectionBox.endX);
  const top = Math.min(selectionBox.startY, selectionBox.endY);
  const width = Math.abs(selectionBox.endX - selectionBox.startX);
  const height = Math.abs(selectionBox.endY - selectionBox.startY);

  // Only show if the selection has some size
  if (width < 2 && height < 2) return null;

  // Determine color based on whether it's additive selection
  const borderColor = selectionBox.isAdditive
    ? "rgba(0, 255, 0, 0.8)" // Green for additive selection
    : "rgba(255, 255, 255, 0.8)"; // White for normal selection

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        border: `2px dashed ${borderColor}`,
        backgroundColor: "rgba(173, 216, 230, 0.15)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  );
};

export default SelectionBox;
