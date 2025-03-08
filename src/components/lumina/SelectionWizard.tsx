import React, { useState, useEffect } from "react";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import "./ImageBoxWizard.css";

interface SelectionWizardProps {
  selectionImage: ImageData;
  defaultData?: ImageBoxData; // Add defaultData prop
  onSubmit: (data: {
    name: string;
    description: string;
    imageData: ImageData;
  }) => void;
  onCancel: () => void;
}

const SelectionWizard: React.FC<SelectionWizardProps> = ({
  selectionImage,
  defaultData,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(defaultData?.label || "");
  const [description, setDescription] = useState(
    defaultData?.description || ""
  );

  // Update form when defaultData changes
  useEffect(() => {
    if (defaultData) {
      setName(defaultData.label);
      setDescription(defaultData.description);
    }
  }, [defaultData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, imageData: selectionImage });
  };

  return (
    <div className="wizard-overlay">
      <div className="image-box-wizard">
        <div className="image-box-wizard-title">
          {defaultData ? "Edit Segment" : "Create Segment"}
        </div>
        <div className="preview-container">
          <canvas
            width={selectionImage.width}
            height={selectionImage.height}
            className="preview-canvas"
            ref={(canvas) => {
              if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) ctx.putImageData(selectionImage, 0, 0);
              }
            }}
          />
        </div>
        <form onSubmit={handleSubmit} className="image-box-wizard-form">
          <label>
            Label:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <div className="button-group">
            <button type="submit" className="submit-button">
              {defaultData ? "Update" : "Create"}
            </button>
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectionWizard;
