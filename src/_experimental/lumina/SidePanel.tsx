import React from "react";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import ImageBoxList from "./ImageBoxList";

interface SidePanelProps {
  imageBoxes: ImageBoxData[];
  hoveredBoxId: string | null;
  onBoxHover: (boxId: string) => void;
  onBoxUnhover: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  imageBoxes,
  hoveredBoxId,
  onBoxHover,
  onBoxUnhover,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "300px",
        height: "100vh",
        backgroundColor: "white",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        zIndex: 1001, // Ensure side panel is above the WebGL scene
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <h2
        style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Image Boxes ({imageBoxes.length})
      </h2>
      <ImageBoxList
        imageBoxes={imageBoxes}
        hoveredBoxId={hoveredBoxId}
        onBoxHover={onBoxHover}
        onBoxUnhover={onBoxUnhover}
      />
    </div>
  );
};

export default SidePanel;
