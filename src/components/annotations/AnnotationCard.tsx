import React, { useState } from "react";
import { Annotation } from "../../api/annotationsApi";

interface AnnotationCardProps {
  annotation: Annotation;
  onSave?: (updated: Annotation) => void;
  readOnly?: boolean;
}

export const AnnotationCard: React.FC<AnnotationCardProps> = ({
  annotation,
  onSave,
  readOnly = false,
}) => {
  // Extract fields from annotation.data
  const {
    comment = "",
    secondaryComment = "",
    tags = [],
    pageUrl = "",
    selectedText = "",
    imageUrl = "",
  } = annotation.data || {};

  const [title, setTitle] = useState(annotation.title);
  const [primaryComment, setPrimaryComment] = useState(comment);
  const [secondary, setSecondary] = useState(secondaryComment);
  const [tagList, setTagList] = useState<string[]>(tags);
  const [showSecondary, setShowSecondary] = useState(!!secondaryComment);

  // Tag input logic
  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    if (tagInput.trim() && !tagList.includes(tagInput.trim())) {
      setTagList([...tagList, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = (idx: number) => {
    setTagList(tagList.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...annotation,
        title,
        data: {
          ...annotation.data,
          comment: primaryComment,
          secondaryComment: secondary,
          tags: tagList,
        },
      });
    }
  };

  return (
    <div
      style={{
        background: "#fafbfc",
        borderRadius: 10,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        border: "1px solid #e0e0e0",
        maxWidth: 480,
        margin: "0 auto",
        padding: 0,
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div style={{ padding: "18px 18px 0 18px" }}>
        <h3 style={{ textAlign: "center", marginBottom: 8, color: "#222" }}>
          {readOnly ? "View Annotation" : "Edit Annotation"}
        </h3>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          {pageUrl && (
            <div>
              <b>Page:</b>{" "}
              <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                {pageUrl}
              </a>
            </div>
          )}
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Annotated"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: 180,
              marginBottom: 12,
              borderRadius: 6,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              border: "1px solid #e0e0e0",
              objectFit: "contain",
            }}
          />
        )}
        {selectedText && (
          <div
            style={{
              background: "#f5f5f5",
              padding: 7,
              borderRadius: 4,
              marginBottom: 8,
              fontSize: 13,
              border: "1px solid #e0e0e0",
            }}
          >
            {selectedText}
          </div>
        )}
        <label style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>
          Title
        </label>
        <input
          type="text"
          value={title}
          disabled={readOnly}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 8,
            fontSize: 14,
            padding: "5px 7px",
            borderRadius: 4,
            border: "1px solid #d0d0d0",
            background: readOnly ? "#f5f5f5" : "#fff",
          }}
        />
        <label style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>
          Annotation
        </label>
        <textarea
          value={primaryComment}
          disabled={readOnly}
          onChange={(e) => setPrimaryComment(e.target.value)}
          style={{
            width: "100%",
            minHeight: 80,
            maxHeight: 220,
            marginBottom: 8,
            fontSize: 13,
            padding: "5px 7px",
            borderRadius: 4,
            border: "1px solid #d0d0d0",
            background: readOnly ? "#f5f5f5" : "#fff",
            resize: "vertical",
          }}
        />
        <div style={{ marginBottom: 8 }}>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#1976d2",
              cursor: "pointer",
              fontSize: 12,
              padding: 0,
              marginBottom: 2,
              textAlign: "left",
              textDecoration: showSecondary ? "underline" : "none",
            }}
            onClick={() => setShowSecondary((v) => !v)}
            disabled={readOnly}
          >
            {showSecondary
              ? "- Hide secondary comment"
              : "+ Add secondary comment"}
          </button>
          {showSecondary && (
            <div>
              <label
                style={{
                  fontWeight: 500,
                  fontSize: 13,
                  marginBottom: 2,
                  display: "block",
                }}
              >
                Secondary Comment
              </label>
              <textarea
                value={secondary}
                disabled={readOnly}
                onChange={(e) => setSecondary(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 40,
                  maxHeight: 120,
                  marginBottom: 8,
                  fontSize: 13,
                  padding: "5px 7px",
                  borderRadius: 4,
                  border: "1px solid #d0d0d0",
                  background: readOnly ? "#f5f5f5" : "#fff",
                  resize: "vertical",
                }}
              />
            </div>
          )}
        </div>
        <label style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>
          Tags
          <span style={{ fontWeight: "normal", color: "#888", fontSize: 11 }}>
            {" "}
            (comma or Enter to separate)
          </span>
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            minHeight: 36,
            border: "1px solid #d0d0d0",
            borderRadius: 4,
            background: "#fff",
            padding: "3px 5px",
            marginBottom: 8,
            boxSizing: "border-box",
          }}
        >
          {tagList.map((tag, idx) => (
            <span
              key={tag}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#e3eafc",
                color: "#1976d2",
                borderRadius: 12,
                padding: "2px 8px 2px 8px",
                margin: "2px 4px 2px 0",
                fontSize: 12,
                fontWeight: 500,
                cursor: "default",
              }}
            >
              {tag}
              {!readOnly && (
                <span
                  style={{
                    marginLeft: 6,
                    color: "#888",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: "bold",
                    userSelect: "none",
                  }}
                  onClick={() => removeTag(idx)}
                >
                  ×
                </span>
              )}
            </span>
          ))}
          {!readOnly && (
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder="e.g. machine learning"
              style={{
                flex: "1 1 60px",
                minWidth: 60,
                margin: "2px 0",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
              }}
              autoComplete="off"
            />
          )}
        </div>
      </div>
      {!readOnly && (
        <div
          style={{
            flexShrink: 0,
            padding: "12px 18px 12px 18px",
            background: "#fafbfc",
            textAlign: "center",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <button
            onClick={handleSave}
            style={{
              padding: "6px 20px",
              fontSize: 14,
              borderRadius: 6,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
              margin: "0 auto",
              display: "block",
              marginTop: 8,
              marginBottom: 4,
              boxShadow: "0 1px 2px rgba(25,118,210,0.08)",
              transition: "background 0.15s",
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnotationCard;
