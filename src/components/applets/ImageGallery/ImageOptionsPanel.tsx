import React from "react";

interface ImageOptionsPanelProps {
  outlineColor: string;
  outlineOpacity: number;
  onOutlineColorChange: (color: string) => void;
  onOutlineOpacityChange: (opacity: number) => void;
}

const ImageOptionsPanel: React.FC<ImageOptionsPanelProps> = ({
  outlineColor,
  outlineOpacity,
  onOutlineColorChange,
  onOutlineOpacityChange,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "80px", // Changed from bottom to top
        right: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.95)", // Made slightly transparent
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        zIndex: 2000, // Increased z-index
        minWidth: "200px", // Added minimum width
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Image Box Options</h3>
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Outline Color:
        </label>
        <input
          type="color"
          value={outlineColor}
          onChange={(e) => onOutlineColorChange(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Outline Opacity:
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={outlineOpacity}
          onChange={(e) => onOutlineOpacityChange(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default ImageOptionsPanel;
