import React, { useMemo, useState } from "react";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import SimpleImageBox from "./SimpleImageBox";

interface ImageBoxListProps {
  imageBoxes: ImageBoxData[];
  hoveredBoxId: string | null;
  selectedBoxId?: string | null;
  onBoxHover?: (boxId: string) => void;
  onBoxUnhover?: () => void;
  onBoxClick?: (boxId: string) => void;
  onEditImageBox?: (imageBox: ImageBoxData) => void;
  onDeleteImageBox?: (imageBox: ImageBoxData) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

const ImageBoxList: React.FC<ImageBoxListProps> = ({
  imageBoxes,
  hoveredBoxId,
  selectedBoxId,
  onBoxHover,
  onBoxUnhover,
  onBoxClick,
  onEditImageBox,
  onDeleteImageBox,
  onSearchFocus,
  onSearchBlur,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredImageBoxes = useMemo(() => {
    if (selectedBoxId) {
      console.log("selectedBoxId!!!", selectedBoxId);
      return imageBoxes.filter((box) => box.id === selectedBoxId);
    }
    return imageBoxes.filter((box) =>
      box.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [imageBoxes, searchTerm, selectedBoxId]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: "20px",
        zIndex: 1000,
        backgroundColor: "white",
        padding: "12px",
        height: "70vh",
        width: "22rem",
        overflow: "hidden",
        overflowY: "auto",
        scrollbarColor: "#ccc #f9f9f9",
        scrollbarWidth: "thin",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        pointerEvents: "auto",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()} // Add this line
      onMouseMove={(e) => e.stopPropagation()} // Add this line for older browsers
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "12px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      {filteredImageBoxes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            fontStyle: "italic",
            marginTop: "20px",
          }}
        >
          No matching image boxes
        </div>
      ) : null}
      {filteredImageBoxes.map((box) => (
        <SimpleImageBox
          key={box.id}
          data={box}
          isHovered={hoveredBoxId === box.id}
          onHover={() => onBoxHover?.(box.id)}
          onUnhover={onBoxUnhover}
          onClick={() => onBoxClick?.(box.id)}
          onEdit={() => onEditImageBox?.(box)}
          onDelete={() => onDeleteImageBox?.(box)}
        />
      ))}
    </div>
  );
};

export default ImageBoxList;
