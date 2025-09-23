import React, { useState } from "react";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import ImageBoxInspector from "./ImageBoxInspector";

const ImageBoxInspectorDemo: React.FC = () => {
  const [selectedImageBox, setSelectedImageBox] = useState<ImageBoxData | null>(
    null
  );
  const [imageBoxes, setImageBoxes] = useState<ImageBoxData[]>([
    {
      id: "particulation-main",
      label: "Particulation Experiment",
      type: "ImageBox",
      description: "Main particulation visualization showing particle dynamics",
      imageUrl: "/images/demo/experiment/particulation.png",
      topLeft: { x: 100, y: 100 },
      bottomRight: { x: 700, y: 500 },
    },
    {
      id: "particle-cluster-1",
      label: "Primary Particle Cluster",
      type: "ImageBox",
      description:
        "Dense cluster of particles showing gravitational attraction",
      imageUrl: "/images/demo/experiment/particulation.png",
      topLeft: { x: 250, y: 200 },
      bottomRight: { x: 400, y: 350 },
    },
    {
      id: "particle-cluster-2",
      label: "Secondary Particle Cluster",
      type: "ImageBox",
      description: "Secondary cluster with different particle density",
      imageUrl: "/images/demo/experiment/particulation.png",
      topLeft: { x: 450, y: 250 },
      bottomRight: { x: 600, y: 400 },
    },
  ]);

  const handleEditImageBox = (updatedImageBox: ImageBoxData) => {
    setImageBoxes((prev) =>
      prev.map((box) => (box.id === updatedImageBox.id ? updatedImageBox : box))
    );
    setSelectedImageBox(updatedImageBox);
  };

  const handleDeleteImageBox = (imageBoxId: string) => {
    setImageBoxes((prev) => prev.filter((box) => box.id !== imageBoxId));
    setSelectedImageBox(null);
  };

  const handleCloseInspector = () => {
    setSelectedImageBox(null);
  };

  return (
    <div
      style={{ padding: "20px", display: "flex", gap: "20px", height: "100vh" }}
    >
      {/* Image Box List */}
      <div style={{ flex: "1", maxWidth: "300px" }}>
        <h2>Image Boxes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {imageBoxes.map((imageBox) => (
            <div
              key={imageBox.id}
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor:
                  selectedImageBox?.id === imageBox.id ? "#f0f8ff" : "white",
              }}
              onClick={() => setSelectedImageBox(imageBox)}
            >
              <h4 style={{ margin: "0 0 8px 0" }}>{imageBox.label}</h4>
              <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                {imageBox.description}
              </p>
              <div
                style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}
              >
                {imageBox.bottomRight.x - imageBox.topLeft.x} ×{" "}
                {imageBox.bottomRight.y - imageBox.topLeft.y} pixels
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspector Panel */}
      <div style={{ flex: "1" }}>
        {selectedImageBox ? (
          <ImageBoxInspector
            imageBox={selectedImageBox}
            onClose={handleCloseInspector}
            onEdit={handleEditImageBox}
            onDelete={handleDeleteImageBox}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#666",
              fontSize: "16px",
            }}
          >
            Select an image box to inspect
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBoxInspectorDemo;
