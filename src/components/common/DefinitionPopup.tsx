import React from "react";

export type DefinitionPopupData = {
  term: string;
  definition: string;
  position: { x: number; y: number };
  isDragging?: boolean;
};

export interface DefinitionPopupProps {
  popup: DefinitionPopupData;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  popupRef?: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
}

export const DefinitionPopup: React.FC<DefinitionPopupProps> = ({
  popup,
  onClose,
  onMouseDown,
  popupRef,
  children,
}) => {
  return (
    <div
      ref={popupRef}
      className={`definition-popup${popup.isDragging ? " dragging" : ""}`}
      style={{
        position: "absolute",
        top: `${popup.position.y}px`,
        left: `${popup.position.x}px`,
        zIndex: 1000,
        cursor: popup.isDragging ? "grabbing" : "grab",
        transform: "translate(-50%, -100%)",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        padding: "16px 20px 12px 20px",
        minWidth: 220,
        maxWidth: 340,
        maxHeight: 300,
        overflow: "auto",
      }}
    >
      <h4
        onMouseDown={onMouseDown}
        style={{
          margin: 0,
          fontWeight: 600,
          cursor: "grab",
          fontSize: "1.1em",
          userSelect: "none",
        }}
      >
        {popup.term}
      </h4>
      <p style={{ margin: "12px 0 0 0", fontSize: "1em" }}>
        {popup.definition}
      </p>
      <button
        style={{
          position: "absolute",
          top: 6,
          right: 10,
          border: "none",
          background: "transparent",
          fontSize: "1.2em",
          cursor: "pointer",
          color: "#888",
        }}
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      {children}
    </div>
  );
};
