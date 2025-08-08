import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import { Annotation } from "./AnnotationsList";
import ImageBoxInspector from "./ImageBoxInspector";
import "./ImageBoxWizard.css";

interface ImageBoxWizardProps {
  imageBoxData: ImageBoxData | null;
  existingAnnotations?: Annotation[];
  onSubmit: (data: ImageBoxData, annotations: Annotation[]) => void;
  onCancel: () => void;
}

const ImageBoxWizard: React.FC<ImageBoxWizardProps> = ({
  imageBoxData,
  existingAnnotations = [],
  onSubmit,
  onCancel,
}) => {
  // Image box state
  const [id] = useState(imageBoxData?.id ?? uuidv4());
  const [label, setLabel] = useState(imageBoxData?.label ?? "");
  const [type, setType] = useState(imageBoxData?.type ?? "imageBox");
  const [description, setDescription] = useState(
    imageBoxData?.description ?? ""
  );
  const [imageUrl] = useState(imageBoxData?.imageUrl ?? "");
  const [topLeft] = useState(imageBoxData?.topLeft ?? { x: 0, y: 0 });
  const [bottomRight] = useState(
    imageBoxData?.bottomRight ?? { x: 100, y: 100 }
  );

  // Annotations state
  const [annotations, setAnnotations] =
    useState<Annotation[]>(existingAnnotations);
  const [newAnnotationText, setNewAnnotationText] = useState("");

  const handleAddAnnotation = () => {
    if (!newAnnotationText.trim()) return;

    const newAnnotation: Annotation = {
      id: uuidv4(),
      label: "",
      description: newAnnotationText,
      imageBoxId: id,
      references: [],
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    setNewAnnotationText("");
  };

  const handleRemoveAnnotation = (annotationId: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const updatedImageBox: ImageBoxData = {
      id,
      label,
      type,
      description,
      imageUrl,
      topLeft,
      bottomRight,
    };

    onSubmit(updatedImageBox, annotations);
  };

  return (
    <div className="wizard-overlay">
      <div className="image-box-wizard">
        <h2 className="image-box-wizard-title">
          {imageBoxData ? "Edit ImageBox" : "Create ImageBox"}
        </h2>
        {imageBoxData && (
          <ImageBoxInspector imageBox={imageBoxData} onClose={onCancel} />
        )}
        {imageUrl && (
          <div className="image-preview">
            <img
              src={imageUrl}
              alt={label || "Image preview"}
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
            <div
              className="selection-overlay"
              style={{
                position: "absolute",
                left: `${topLeft.x}px`,
                top: `${topLeft.y}px`,
                width: `${bottomRight.x - topLeft.x}px`,
                height: `${bottomRight.y - topLeft.y}px`,
                border: "2px solid red",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="image-box-wizard-form">
          <label>
            Label:
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </label>

          <label>
            Type:
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </label>

          <label className="description-field">
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          {/* Annotations Section */}
          <div className="annotations-section">
            <h3>Annotations</h3>

            {annotations.length === 0 ? (
              <p className="no-annotations">No annotations yet</p>
            ) : (
              <ul className="annotation-list">
                {annotations.map((annotation) => (
                  <li key={annotation.id} className="annotation-item">
                    <span>{annotation.description}</span>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemoveAnnotation(annotation.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="add-annotation">
              <input
                type="text"
                value={newAnnotationText}
                onChange={(e) => setNewAnnotationText(e.target.value)}
                placeholder="Add a new annotation..."
              />
              <button
                type="button"
                onClick={handleAddAnnotation}
                disabled={!newAnnotationText.trim()}
              >
                Add
              </button>
            </div>
          </div>

          <div className="button-group">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageBoxWizard;
