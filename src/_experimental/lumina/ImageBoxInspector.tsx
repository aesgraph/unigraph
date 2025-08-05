import { Edit, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Annotation, ImageBoxData } from "../../core/types/ImageBoxData";
import "./ImageBoxInspector.css";
import { images } from "./images";

interface ImageBoxInspectorProps {
  imageBox: ImageBoxData;
  onClose?: () => void;
  onEdit?: (imageBox: ImageBoxData) => void;
  onDelete?: (imageBoxId: string) => void;
}

const ImageBoxInspector: React.FC<ImageBoxInspectorProps> = ({
  imageBox,
  onClose,
  onEdit,
  onDelete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ImageBoxData>(imageBox);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showAddAnnotation, setShowAddAnnotation] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    label: "",
    description: "",
    tags: [] as string[],
    urls: [] as { url: string; label?: string }[],
  });
  const [newTag, setNewTag] = useState("");
  const [newUrl, setNewUrl] = useState({ url: "", label: "" });

  // Canvas size for the preview
  const canvasSize = 300;

  useEffect(() => {
    const drawImageBox = (image: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      console.log("Drawing image box:", imageBox.id);
      console.log("Image dimensions:", image.width, image.height);
      console.log(
        "ImageBox coordinates:",
        imageBox.topLeft,
        imageBox.bottomRight
      );

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get image dimensions
      const imgWidth = image.width;
      const imgHeight = image.height;

      // Ensure image is actually loaded and has dimensions
      if (imgWidth === 0 || imgHeight === 0) {
        console.log("Image not fully loaded yet, retrying...");
        setTimeout(() => drawImageBox(image), 100);
        return;
      }

      // The coordinates are in pixel space, but we need to ensure they're within bounds
      // Let's also add some debugging to see what's happening
      console.log(
        "Original coordinates:",
        imageBox.topLeft,
        imageBox.bottomRight
      );
      console.log("Image dimensions:", imgWidth, imgHeight);

      // The coordinates might be in a different coordinate system
      // Let's try scaling them to the actual image dimensions
      // Assuming the coordinates are for an 800x600 image but the actual image might be different
      const expectedWidth = 800;
      const expectedHeight = 600;

      const coordScaleX = imgWidth / expectedWidth;
      const coordScaleY = imgHeight / expectedHeight;

      console.log("Coordinate scale factors:", coordScaleX, coordScaleY);

      const scaledTopLeft = {
        x: imageBox.topLeft.x * coordScaleX,
        y: imageBox.topLeft.y * coordScaleY,
      };

      const scaledBottomRight = {
        x: imageBox.bottomRight.x * coordScaleX,
        y: imageBox.bottomRight.y * coordScaleY,
      };

      console.log("Scaled coordinates:", scaledTopLeft, scaledBottomRight);

      const extractX = Math.max(0, Math.min(scaledTopLeft.x, imgWidth));
      const extractY = Math.max(0, Math.min(scaledTopLeft.y, imgHeight));
      const extractWidth = Math.min(
        scaledBottomRight.x - scaledTopLeft.x,
        imgWidth - extractX
      );
      const extractHeight = Math.min(
        scaledBottomRight.y - scaledTopLeft.y,
        imgHeight - extractY
      );

      console.log(
        "Extract area:",
        extractX,
        extractY,
        extractWidth,
        extractHeight
      );

      // Calculate scaling to fit in canvas while maintaining aspect ratio
      const canvasScaleX = canvasSize / extractWidth;
      const canvasScaleY = canvasSize / extractHeight;
      const scale = Math.min(canvasScaleX, canvasScaleY);

      const drawWidth = extractWidth * scale;
      const drawHeight = extractHeight * scale;

      // Center the drawing
      const offsetX = (canvasSize - drawWidth) / 2;
      const offsetY = (canvasSize - drawHeight) / 2;

      console.log("Draw dimensions:", drawWidth, drawHeight);
      console.log("Offset:", offsetX, offsetY);

      console.log("Drawing extracted area:");
      console.log("Source:", extractX, extractY, extractWidth, extractHeight);
      console.log("Destination:", offsetX, offsetY, drawWidth, drawHeight);

      // Draw the extracted area
      ctx.drawImage(
        image,
        extractX,
        extractY,
        extractWidth,
        extractHeight,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
    };

    const loadImage = () => {
      const image = new Image();
      const imageSrc = images[imageBox.imageUrl];

      console.log("Loading image for ImageBox:", imageBox.id);
      console.log("Image URL:", imageBox.imageUrl);
      console.log("Resolved image src:", imageSrc);

      if (!imageSrc) {
        console.error("Image not found in images object:", imageBox.imageUrl);
        setImageError(`Image not found: ${imageBox.imageUrl}`);
        return;
      }

      image.onload = () => {
        console.log("Image loaded successfully for:", imageBox.id);
        console.log("Image dimensions:", image.width, image.height);

        // Double-check that the image has valid dimensions
        if (image.width > 0 && image.height > 0) {
          setImageLoaded(true);
          setImageError(null);
          // Add a small delay to ensure canvas is ready
          setTimeout(() => drawImageBox(image), 50);
        } else {
          console.log("Image loaded but has zero dimensions, retrying...");
          setTimeout(() => {
            if (image.width > 0 && image.height > 0) {
              setImageLoaded(true);
              setImageError(null);
              drawImageBox(image);
            } else {
              setImageError("Image loaded but has invalid dimensions");
            }
          }, 100);
        }
      };

      image.onerror = () => {
        console.error("Failed to load image:", imageSrc);
        // Try loading the image directly as a fallback
        console.log("Trying direct image load as fallback...");
        const fallbackImage = new Image();
        fallbackImage.onload = () => {
          console.log("Fallback image loaded successfully");
          setImageLoaded(true);
          setImageError(null);
          drawImageBox(fallbackImage);
        };
        fallbackImage.onerror = () => {
          console.error("Fallback image also failed to load");
          setImageError(`Failed to load image: ${imageSrc}`);
        };
        fallbackImage.src = imageBox.imageUrl;
      };

      image.src = imageSrc;
    };

    loadImage();
  }, [imageBox]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit?.(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(imageBox);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(`Are you sure you want to delete "${imageBox.label}"?`)
    ) {
      onDelete?.(imageBox.id);
    }
  };

  const handleAddAnnotation = () => {
    if (newAnnotation.label.trim() && newAnnotation.description.trim()) {
      const annotation: Annotation = {
        id: `annotation-${Date.now()}`,
        label: newAnnotation.label.trim(),
        description: newAnnotation.description.trim(),
        date: new Date().toISOString(),
        tags: newAnnotation.tags,
        urls: newAnnotation.urls.map((url) => ({
          id: `url-${Date.now()}-${Math.random()}`,
          type: "web-url",
          url: url.url,
          label: url.label || url.url,
        })),
      };

      const updatedData = {
        ...editedData,
        annotations: [...(editedData.annotations || []), annotation],
      };
      setEditedData(updatedData);

      // Save immediately whether in edit mode or view mode
      onEdit?.(updatedData);

      setNewAnnotation({ label: "", description: "", tags: [], urls: [] });
      setShowAddAnnotation(false);
    }
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    const updatedData = {
      ...editedData,
      annotations: (editedData.annotations || []).filter(
        (a) => a.id !== annotationId
      ),
    };
    setEditedData(updatedData);

    // Save immediately whether in edit mode or view mode
    onEdit?.(updatedData);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setNewAnnotation({
        ...newAnnotation,
        tags: [...newAnnotation.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewAnnotation({
      ...newAnnotation,
      tags: newAnnotation.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddUrl = () => {
    if (newUrl.url.trim()) {
      setNewAnnotation({
        ...newAnnotation,
        urls: [...newAnnotation.urls, { ...newUrl }],
      });
      setNewUrl({ url: "", label: "" });
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setNewAnnotation({
      ...newAnnotation,
      urls: newAnnotation.urls.filter((url) => url.url !== urlToRemove),
    });
  };

  const renderAnnotationForm = () => (
    <div className="add-annotation-form">
      <input
        type="text"
        placeholder="Annotation label"
        value={newAnnotation.label}
        onChange={(e) =>
          setNewAnnotation({ ...newAnnotation, label: e.target.value })
        }
        style={{
          border: "1px solid #ddd",
          background: "#f8f9fa",
          fontSize: "13px",
          padding: "6px 8px",
          borderRadius: "4px",
          width: "100%",
          marginBottom: "8px",
        }}
      />
      <textarea
        placeholder="Annotation description"
        value={newAnnotation.description}
        onChange={(e) =>
          setNewAnnotation({
            ...newAnnotation,
            description: e.target.value,
          })
        }
        style={{
          border: "1px solid #ddd",
          background: "#f8f9fa",
          fontSize: "13px",
          padding: "6px 8px",
          borderRadius: "4px",
          width: "100%",
          resize: "vertical",
          minHeight: "60px",
          marginBottom: "8px",
        }}
      />

      {/* Tags Section */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#555",
            marginBottom: "6px",
            display: "block",
          }}
        >
          Tags (optional):
        </label>
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
          <input
            type="text"
            placeholder="Enter tag and press Enter"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
            style={{
              border: "1px solid #ddd",
              background: "#f8f9fa",
              fontSize: "12px",
              padding: "6px 8px",
              borderRadius: "4px",
              flex: 1,
            }}
          />
          <button
            onClick={handleAddTag}
            style={{
              background: "none",
              color: "#28a745",
              border: "1px solid #28a745",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#28a745";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#28a745";
            }}
          >
            Add
          </button>
        </div>
        {newAnnotation.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {newAnnotation.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  background: "#f8f9fa",
                  color: "#495057",
                  padding: "4px 8px",
                  borderRadius: "16px",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "1px solid #e9ecef",
                }}
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6c757d",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: 0,
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dc3545";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "#6c757d";
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* URLs Section */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#555",
            marginBottom: "6px",
            display: "block",
          }}
        >
          URLs (optional):
        </label>
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
          <input
            type="url"
            placeholder="https://example.com"
            value={newUrl.url}
            onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
            style={{
              border: "1px solid #ddd",
              background: "#f8f9fa",
              fontSize: "12px",
              padding: "6px 8px",
              borderRadius: "4px",
              flex: 1,
            }}
          />
          <input
            type="text"
            placeholder="Label (optional)"
            value={newUrl.label}
            onChange={(e) => setNewUrl({ ...newUrl, label: e.target.value })}
            style={{
              border: "1px solid #ddd",
              background: "#f8f9fa",
              fontSize: "12px",
              padding: "6px 8px",
              borderRadius: "4px",
              flex: 1,
            }}
          />
          <button
            onClick={handleAddUrl}
            style={{
              background: "none",
              color: "#007bff",
              border: "1px solid #007bff",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#007bff";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#007bff";
            }}
          >
            Add
          </button>
        </div>
        {newAnnotation.urls.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {newAnnotation.urls.map((url, index) => (
              <div
                key={index}
                style={{
                  background: "#f8f9fa",
                  color: "#495057",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #e9ecef",
                }}
              >
                <span>{url.label || url.url}</span>
                <button
                  onClick={() => handleRemoveUrl(url.url)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6c757d",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: 0,
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dc3545";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "#6c757d";
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleAddAnnotation}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
        <button
          onClick={() => {
            setShowAddAnnotation(false);
            setNewAnnotation({
              label: "",
              description: "",
              tags: [],
              urls: [],
            });
          }}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderEditForm = () => (
    <div className="image-box-inspector-view">
      <div className="inspector-header">
        <h3>
          <input
            type="text"
            value={editedData.label}
            onChange={(e) =>
              setEditedData({ ...editedData, label: e.target.value })
            }
            style={{
              border: "1px solid #ddd",
              background: "#f8f9fa",
              fontSize: "18px",
              fontWeight: "600",
              color: "#333",
              width: "100%",
              outline: "none",
              borderRadius: "4px",
              padding: "4px 8px",
            }}
          />
        </h3>
        <div className="header-actions">
          <button onClick={handleSave} className="edit-button">
            <Edit size={16} />
          </button>
          <button onClick={handleDelete} className="delete-button">
            <Trash2 size={16} />
          </button>
          <button onClick={handleCancel} className="delete-button">
            <X size={16} />
          </button>
          {onClose && (
            <button onClick={onClose} className="close-button">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="image-preview">
        {imageError ? (
          <div className="error-message">{imageError}</div>
        ) : !imageLoaded ? (
          <div className="loading-message">Loading image...</div>
        ) : (
          <div>
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="image-box-canvas"
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              Canvas size: {canvasSize}×{canvasSize}px
            </div>
          </div>
        )}
      </div>

      <div className="image-box-details">
        <div className="detail-group">
          <label>Type:</label>
          <span>{imageBox.type}</span>
        </div>
        <div className="detail-group">
          <label>Description:</label>
          <textarea
            value={editedData.description}
            onChange={(e) =>
              setEditedData({ ...editedData, description: e.target.value })
            }
            style={{
              border: "1px solid #ddd",
              background: "#f8f9fa",
              fontSize: "13px",
              color: "#333",
              width: "100%",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              minHeight: "60px",
              padding: "6px 8px",
              margin: 0,
              borderRadius: "4px",
            }}
          />
        </div>
        <div className="detail-group">
          <label>Image:</label>
          <span>{imageBox.imageUrl}</span>
        </div>
        <div className="detail-group">
          <label>Coordinates:</label>
          <div className="coordinates">
            <div>
              Top Left: ({imageBox.topLeft.x}, {imageBox.topLeft.y})
            </div>
            <div>
              Bottom Right: ({imageBox.bottomRight.x}, {imageBox.bottomRight.y})
            </div>
          </div>
        </div>
        <div className="detail-group">
          <label>Dimensions:</label>
          <span>
            {imageBox.bottomRight.x - imageBox.topLeft.x} ×{" "}
            {imageBox.bottomRight.y - imageBox.topLeft.y} pixels
          </span>
        </div>

        {/* Annotations Section */}
        <div className="annotations-section">
          <div className="annotations-header">
            <label>Annotations:</label>
            <button
              onClick={() => setShowAddAnnotation(true)}
              className="add-annotation-button"
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {showAddAnnotation && renderAnnotationForm()}

          <div className="annotations-list">
            {(editedData.annotations || []).length === 0 ? (
              <div
                style={{ color: "#888", fontStyle: "italic", fontSize: "13px" }}
              >
                No annotations yet
              </div>
            ) : (
              (editedData.annotations || []).map((annotation) => (
                <div key={annotation.id} className="annotation-item">
                  <div className="annotation-header">
                    <strong>{annotation.label}</strong>
                    <button
                      onClick={() => handleDeleteAnnotation(annotation.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc3545",
                        cursor: "pointer",
                        padding: "2px",
                        fontSize: "12px",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p
                    style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}
                  >
                    {annotation.description}
                  </p>

                  {/* Display Tags */}
                  {annotation.tags && annotation.tags.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        {annotation.tags.map((tag, index) => (
                          <span
                            key={index}
                            style={{
                              background: "#e9ecef",
                              color: "#495057",
                              padding: "2px 6px",
                              borderRadius: "12px",
                              fontSize: "10px",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display URLs */}
                  {annotation.urls && annotation.urls.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {annotation.urls.map((url, index) => (
                          <a
                            key={index}
                            href={url.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#007bff",
                              fontSize: "11px",
                              textDecoration: "none",
                              display: "block",
                              padding: "2px 4px",
                              borderRadius: "3px",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f0f8ff";
                              e.currentTarget.style.textDecoration =
                                "underline";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.textDecoration = "none";
                            }}
                          >
                            {url.label || url.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {annotation.date && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        marginTop: "4px",
                      }}
                    >
                      {new Date(annotation.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderViewMode = () => (
    <div className="image-box-inspector-view">
      <div className="inspector-header">
        <h3>{imageBox.label}</h3>
        <div className="header-actions">
          <button onClick={handleEdit} className="edit-button">
            <Edit size={16} />
          </button>
          {onClose && (
            <button onClick={onClose} className="close-button">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="image-preview">
        {imageError ? (
          <div className="error-message">{imageError}</div>
        ) : !imageLoaded ? (
          <div className="loading-message">Loading image...</div>
        ) : (
          <div>
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="image-box-canvas"
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              Canvas size: {canvasSize}×{canvasSize}px
            </div>
          </div>
        )}
      </div>

      <div className="image-box-details">
        <div className="detail-group">
          <label>Type:</label>
          <span>{imageBox.type}</span>
        </div>
        <div className="detail-group">
          <label>Description:</label>
          <span>{imageBox.description || "No description"}</span>
        </div>
        <div className="detail-group">
          <label>Image:</label>
          <span>{imageBox.imageUrl}</span>
        </div>
        <div className="detail-group">
          <label>Coordinates:</label>
          <div className="coordinates">
            <div>
              Top Left: ({imageBox.topLeft.x}, {imageBox.topLeft.y})
            </div>
            <div>
              Bottom Right: ({imageBox.bottomRight.x}, {imageBox.bottomRight.y})
            </div>
          </div>
        </div>
        <div className="detail-group">
          <label>Dimensions:</label>
          <span>
            {imageBox.bottomRight.x - imageBox.topLeft.x} ×{" "}
            {imageBox.bottomRight.y - imageBox.topLeft.y} pixels
          </span>
        </div>

        {/* Annotations Section */}
        <div className="annotations-section">
          <div className="annotations-header">
            <label>Annotations:</label>
            <button
              onClick={() => setShowAddAnnotation(true)}
              className="add-annotation-button"
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {showAddAnnotation && renderAnnotationForm()}

          <div className="annotations-list">
            {(editedData.annotations || []).length === 0 ? (
              <div
                style={{ color: "#888", fontStyle: "italic", fontSize: "13px" }}
              >
                No annotations yet
              </div>
            ) : (
              (editedData.annotations || []).map((annotation) => (
                <div key={annotation.id} className="annotation-item">
                  <div className="annotation-header">
                    <strong>{annotation.label}</strong>
                  </div>
                  <p
                    style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}
                  >
                    {annotation.description}
                  </p>

                  {/* Display Tags */}
                  {annotation.tags && annotation.tags.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        {annotation.tags.map((tag, index) => (
                          <span
                            key={index}
                            style={{
                              background: "#f8f9fa",
                              color: "#495057",
                              padding: "2px 6px",
                              borderRadius: "12px",
                              fontSize: "10px",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display URLs */}
                  {annotation.urls && annotation.urls.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {annotation.urls.map((url, index) => (
                          <a
                            key={index}
                            href={url.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#007bff",
                              fontSize: "11px",
                              textDecoration: "none",
                              display: "block",
                              padding: "2px 4px",
                              borderRadius: "3px",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f0f8ff";
                              e.currentTarget.style.textDecoration =
                                "underline";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.textDecoration = "none";
                            }}
                          >
                            {url.label || url.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {annotation.date && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        marginTop: "4px",
                      }}
                    >
                      {new Date(annotation.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="image-box-inspector">
      {isEditing ? renderEditForm() : renderViewMode()}
    </div>
  );
};

export default ImageBoxInspector;
