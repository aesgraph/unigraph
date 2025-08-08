import { Edit2, Plus, Save, Tag, X } from "lucide-react";
import React, { useState } from "react";
import { Annotation, saveAnnotation } from "../../api/annotationsApi";
import { addNotification } from "../../store/notificationStore";

interface EditableAnnotationCardProps {
  annotation: Annotation;
  style?: React.CSSProperties;
  compact?: boolean;
  onUpdate?: (updatedAnnotation: Annotation) => void;
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

const EditableAnnotationCard: React.FC<EditableAnnotationCardProps> = ({
  annotation,
  style = {},
  compact = false,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    title: annotation.title,
    comment: annotation.data.comment || "",
    secondaryComment: annotation.data.secondary_comment || "",
    tags: Array.isArray(annotation.data.tags) ? [...annotation.data.tags] : [],
    type: annotation.data.type || "text_selection",
  });
  const [newTag, setNewTag] = useState("");

  const handleSave = async () => {
    try {
      const updatedAnnotation: Annotation = {
        ...annotation,
        title: editedData.title,
        data: {
          ...annotation.data,
          comment: editedData.comment,
          secondary_comment: editedData.secondaryComment || undefined,
          tags: editedData.tags.length > 0 ? editedData.tags : undefined,
          type: editedData.type,
        },
        last_updated_at: new Date().toISOString(),
      };

      await saveAnnotation(updatedAnnotation);

      addNotification({
        message: "Annotation updated successfully",
        type: "success",
        duration: 3000,
      });

      onUpdate?.(updatedAnnotation);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update annotation:", error);
      addNotification({
        message: `Failed to update annotation: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleCancel = () => {
    setEditedData({
      title: annotation.title,
      comment: annotation.data.comment || "",
      secondaryComment: annotation.data.secondary_comment || "",
      tags: Array.isArray(annotation.data.tags)
        ? [...annotation.data.tags]
        : [],
      type: annotation.data.type || "text_selection",
    });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedData.tags.includes(newTag.trim())) {
      setEditedData({
        ...editedData,
        tags: [...editedData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedData({
      ...editedData,
      tags: editedData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (isEditing) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: compact ? "8px 10px" : "14px 18px",
          minWidth: 0,
          maxWidth: "100%",
          width: "100%",
          fontFamily: "inherit",
          fontSize: 13,
          color: "#222",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxSizing: "border-box",
          ...style,
        }}
      >
        {/* Title */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 4,
            }}
          >
            Title
          </label>
          <input
            type="text"
            value={editedData.title}
            onChange={(e) =>
              setEditedData({ ...editedData, title: e.target.value })
            }
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Primary Comment */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 4,
            }}
          >
            Primary Comment
          </label>
          <textarea
            value={editedData.comment}
            onChange={(e) =>
              setEditedData({ ...editedData, comment: e.target.value })
            }
            rows={2}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              fontSize: 13,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Secondary Comment */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 4,
            }}
          >
            Secondary Comment
          </label>
          <textarea
            value={editedData.secondaryComment}
            onChange={(e) =>
              setEditedData({ ...editedData, secondaryComment: e.target.value })
            }
            rows={2}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              fontSize: 13,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tags */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 4,
            }}
          >
            Tags
          </label>

          {/* Existing Tags */}
          {editedData.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 8,
              }}
            >
              {editedData.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 6px",
                    backgroundColor: "#e0e7ff",
                    color: "#3730a3",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: "500",
                  }}
                >
                  <Tag size={10} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      marginLeft: 2,
                      color: "#3730a3",
                      fontSize: 10,
                    }}
                  >
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add New Tag */}
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: "4px 6px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 12,
              }}
              placeholder="Add tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              style={{
                padding: "4px 6px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: "4px 8px",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <X size={12} />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "4px 8px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Save size={12} />
            Save
          </button>
        </div>
      </div>
    );
  }

  // Display mode (non-editing)
  const { data, title, created_at } = annotation;
  const tags = Array.isArray(data?.tags) ? data.tags : [];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        padding: compact ? "8px 10px" : "14px 18px",
        minWidth: 0,
        maxWidth: "100%",
        width: "100%",
        fontFamily: "inherit",
        fontSize: 13,
        color: "#222",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxSizing: "border-box",
        position: "relative",
        ...style,
      }}
    >
      {/* Edit Button */}
      <button
        onClick={() => setIsEditing(true)}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          borderRadius: "4px",
          color: "#6b7280",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
        title="Edit annotation"
      >
        <Edit2 size={14} />
      </button>

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
            paddingRight: 30, // Make room for edit button
          }}
        >
          {title}
        </div>
      )}

      {/* Image annotation */}
      {data.type === "image" && "image_url" in data && (
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
          {data.secondary_comment &&
            data.secondary_comment.trim() &&
            data.secondary_comment !== "null" && (
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
      {data.type === "text_selection" && "selected_text" in data && (
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
          {data.secondary_comment &&
            data.secondary_comment.trim() &&
            data.secondary_comment !== "null" && (
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
      {"page_url" in data && data.page_url && data.page_url !== "null" && (
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
          {data.type === "image"
            ? "Image"
            : data.type === "text_selection"
              ? "Text"
              : data.type === "note"
                ? "Note"
                : data.type === "highlight"
                  ? "Highlight"
                  : data.type || "Annotation"}
        </span>
      </div>
    </div>
  );
};

export default EditableAnnotationCard;
