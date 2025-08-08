import React from "react";

export interface Annotation {
  id: string;
  label: string;
  description: string;
  imageBoxId: string;
  references: string[];
  date?: string;
}

interface AnnotationsListProps {
  annotations: Annotation[];
  onAnnotationClick?: (annotationId: string) => void;
}

const AnnotationsList: React.FC<AnnotationsListProps> = ({
  annotations,
  onAnnotationClick,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        right: "20px",
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
      onPointerMove={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <h3>Annotations</h3>
      {annotations.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            fontStyle: "italic",
            marginTop: "20px",
          }}
        >
          No annotations available
        </div>
      ) : (
        annotations.map((annotation) => (
          <div
            key={annotation.id}
            data-annotation-id={annotation.id}
            onClick={() => onAnnotationClick?.(annotation.id)}
            style={{
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h4>{annotation.label}</h4>
            <p>{annotation.description}</p>
            <div>ID: {annotation.id.slice(0, 8)}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnnotationsList;
