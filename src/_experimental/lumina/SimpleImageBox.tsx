import React, { useEffect, useRef, useState } from "react";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import { reconstructImageSource } from "../../core/utils/imageProcessing";
import "./SimpleImageBox.css"; // Import the CSS file

interface SimpleImageBoxProps {
  data: ImageBoxData;
  previewSize?: number;
  onClick?: () => void;
  onHover?: () => void;
  onUnhover?: () => void;
  onDelete?: () => void;
  isHovered?: boolean;
  onEdit?: () => void;
}

const SimpleImageBox: React.FC<SimpleImageBoxProps> = ({
  data,
  previewSize = 80,
  onClick,
  onHover,
  onUnhover,
  onDelete,
  isHovered = false,
  onEdit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSource, setImageSource] = useState<ImageData | null>(null);

  useEffect(() => {
    const loadImageSource = async () => {
      try {
        const source = await reconstructImageSource(data.imageUrl, data);
        setImageSource(source);
      } catch (error) {
        console.error(`Failed to load image source for box ${data.id}:`, error);
      }
    };

    loadImageSource();
  }, [data]);

  useEffect(() => {
    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas || !imageSource) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate scaling to fit preview size while maintaining aspect ratio
      const aspectRatio = imageSource.width / imageSource.height;
      let displayWidth = previewSize;
      let displayHeight = previewSize;

      if (aspectRatio > 1) {
        displayHeight = previewSize / aspectRatio;
      } else {
        displayWidth = previewSize * aspectRatio;
      }

      // Set canvas size
      canvas.width = imageSource.width;
      canvas.height = imageSource.height;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Draw the image data directly
      ctx.putImageData(imageSource, 0, 0);
    };

    drawCanvas();
  }, [imageSource, previewSize]);

  return (
    <div
      data-box-id={data.id}
      className={`simple-image-box ${isHovered ? "hovered" : ""}`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
      style={{
        transition: "all 0.3s ease-in-out",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        boxShadow: isHovered
          ? "0 8px 16px rgba(0, 0, 0, 0.2)"
          : "0 1px 3px rgba(0, 0, 0, 0.1)",
        backgroundColor: isHovered ? "#f0f0f0" : "white",
        border: isHovered ? "2px solid #007bff" : "2px solid transparent",
        borderRadius: "8px",
        overflow: "hidden",
        width: "300px", // Add fixed width to contain the horizontal layout
      }}
    >
      <div className="simple-image-box-actions">
        <button className="simple-image-box-edit-button" onClick={onEdit}>
          ✎
        </button>
        <button className="simple-image-box-delete-button" onClick={onDelete}>
          ✕
        </button>
      </div>
      <div className="simple-image-box-content">
        <canvas
          ref={canvasRef}
          className="simple-image-box-canvas"
          style={{
            maxWidth: `${previewSize}px`,
            maxHeight: `${previewSize}px`,
            objectFit: "contain",
            borderRadius: "4px",
            marginRight: "12px", // Add margin between image and text
          }}
        />
        <div className="simple-image-box-details">
          <h3 className="simple-image-box-title">{data.label}</h3>
          {data.description && (
            <p className="simple-image-box-description">{data.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleImageBox;
