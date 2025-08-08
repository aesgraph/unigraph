import { Save, Tag, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TextSelectionAnnotationData } from "../../api/annotationsApi";

interface AnnotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (annotationData: TextSelectionAnnotationData) => void;
  selectedText: string;
  pageUrl: string;
  pageTitle: string;
}

const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedText,
  pageUrl,
  pageTitle,
}) => {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [secondaryComment, setSecondaryComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Initialize with default values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(`Annotation from ${pageTitle}`);
      setComment(`Selected text: "${selectedText}"`);
      setSecondaryComment("");
      setTags(["webpage", "text-selection"]);
      setNewTag("");
    }
  }, [isOpen, selectedText, pageTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const annotationData: TextSelectionAnnotationData = {
      selected_text: selectedText,
      comment: comment.trim() || title,
      secondary_comment: secondaryComment.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      page_url: pageUrl,
      type: "text_selection",
    };

    onSubmit(annotationData);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "500px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            Create Annotation
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              color: "#6b7280",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Selected Text Preview */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Selected Text
            </label>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                maxHeight: "100px",
                overflow: "auto",
              }}
            >
              {selectedText.length > 200
                ? `${selectedText.substring(0, 200)}...`
                : selectedText}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter annotation title"
            />
          </div>

          {/* Primary Comment */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Primary Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
              placeholder="Enter your primary comment about this selection"
            />
          </div>

          {/* Secondary Comment */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Secondary Comment (Optional)
            </label>
            <textarea
              value={secondaryComment}
              onChange={(e) => setSecondaryComment(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
              placeholder="Enter additional notes or context"
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Tags
            </label>

            {/* Existing Tags */}
            {tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      backgroundColor: "#e0e7ff",
                      color: "#3730a3",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    <Tag size={12} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        marginLeft: "4px",
                        color: "#3730a3",
                        fontSize: "12px",
                      }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="Add a new tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                backgroundColor: "transparent",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Save size={16} />
              Create Annotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnotationDialog;
