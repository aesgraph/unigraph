import React from "react";
import {
  Annotation,
  ImageAnnotationData,
  TextSelectionAnnotationData,
} from "../../api/annotationsApi";

interface AnnotationCardProps {
  annotation: Annotation;
  style?: React.CSSProperties;
  compact?: boolean;
}

const tagStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#e3e8f0",
  color: "#1976d2",
  borderRadius: 6,
  fontSize: 11,
  padding: "2px 8px",
  marginRight: 4,
  marginBottom: 2,
  fontWeight: 500,
  letterSpacing: 0.2,
};

function isImageAnnotationData(data: any): data is ImageAnnotationData {
  return (
    !!data && typeof data.image_url === "string" && data.image_url.length > 0
  );
}

function isTextSelectionAnnotationData(
  data: any
): data is TextSelectionAnnotationData {
  return (
    !!data && typeof data.comment === "string" && !isImageAnnotationData(data)
  );
}

const AnnotationCard: React.FC<AnnotationCardProps> = ({
  annotation,
  style = {},
  compact = false,
}) => {
  // console.log("Rendering AnnotationCard for:", annotation);
  const { data, title, created_at } = annotation;
  const tags = Array.isArray(data?.tags) ? data.tags : [];

  // Defensive: fallback for missing/empty data
  if (!data) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1.5px solid #d1d5db",
          borderRadius: 10,
          boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.07)",
          padding: "14px 18px",
          minWidth: 160,
          maxWidth: 260,
          width: "fit-content",
          fontFamily: "inherit",
          fontSize: 13,
          color: "#222",
          ...style,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#1976d2",
          }}
        >
          {title || "Annotation"}
        </div>
        <div
          style={{
            color: "#888",
            fontSize: 13,
            marginTop: 6,
          }}
        >
          No annotation data.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #d1d5db",
        borderRadius: 10,
        boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.07)",
        padding: compact ? "8px 10px" : "14px 18px",
        minWidth: 0, // allow shrinking
        maxWidth: "100%", // allow to fit parent
        width: "100%", // fill parent container
        fontFamily: "inherit",
        fontSize: 13,
        color: "#222",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 2,
            color: "#1976d2",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>
      )}

      {/* Image annotation */}
      {isImageAnnotationData(data) && (
        <>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "4px 0",
              width: "100%",
              minHeight: 40,
              maxHeight: "100%",
            }}
          >
            <img
              src={data.image_url}
              alt="annotation"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 6,
                border: "1px solid #e0e0e0",
                objectFit: "contain",
                background: "#f5f6fa",
                display: "block",
              }}
            />
          </div>
          {data.comment && (
            <div
              style={{
                color: "#333",
                fontSize: 13,
                margin: "2px 0",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
              }}
            >
              {data.comment}
            </div>
          )}
          {data.secondary_comment && data.secondary_comment.trim() && (
            <div
              style={{
                color: "#888",
                fontSize: 12,
                fontStyle: "italic",
                marginTop: 2,
                whiteSpace: "pre-line",
                wordBreak: "break-word",
              }}
            >
              {data.secondary_comment}
            </div>
          )}
        </>
      )}

      {/* Text annotation */}
      {isTextSelectionAnnotationData(data) && (
        <>
          {data.selected_text && (
            <div
              style={{
                background: "#f5f6fa",
                borderLeft: "3px solid #1976d2",
                borderRadius: 5,
                padding: "6px 10px",
                fontStyle: "italic",
                color: "#444",
                fontSize: 13,
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
              }}
            >
              {data.selected_text}
            </div>
          )}
          {data.comment && (
            <div
              style={{
                color: "#333",
                fontSize: 13,
                margin: "2px 0",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
              }}
            >
              {data.comment}
            </div>
          )}
          {data.secondary_comment && data.secondary_comment.trim() && (
            <div
              style={{
                color: "#888",
                fontSize: 12,
                fontStyle: "italic",
                marginTop: 2,
                whiteSpace: "pre-line",
                wordBreak: "break-word",
              }}
            >
              {data.secondary_comment}
            </div>
          )}
        </>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ marginTop: 2, marginBottom: 2 }}>
          {tags.map((tag, i) => (
            <span key={i} style={tagStyle}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Page URL */}
      {data.page_url && (
        <a
          href={data.page_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#1976d2",
            fontSize: 12,
            textDecoration: "underline",
            marginTop: 2,
            marginBottom: 2,
            wordBreak: "break-all",
            display: "block",
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.page_url.replace(/^https?:\/\//, "").slice(0, 40)}
          {data.page_url.length > 40 ? "..." : ""}
        </a>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        {created_at && (
          <span style={{ color: "#aaa", fontSize: 11 }}>
            {new Date(created_at).toLocaleDateString()}
          </span>
        )}
        <span
          style={{
            background: "#f5f6fa",
            color: "#1976d2",
            fontSize: 10,
            borderRadius: 4,
            padding: "1px 6px",
            marginLeft: "auto",
            fontWeight: 500,
            letterSpacing: 0.3,
          }}
        >
          {isImageAnnotationData(data)
            ? "Image"
            : isTextSelectionAnnotationData(data)
              ? "Text"
              : ""}
        </span>
      </div>
    </div>
  );
};

export default AnnotationCard;
