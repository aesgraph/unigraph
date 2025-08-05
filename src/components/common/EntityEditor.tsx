import { Plus, Save, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Entity } from "../../core/model/entity/abstractEntity";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import styles from "./EntityEditor.module.css";

export interface EntityEditorProps {
  entity: Entity;
  sceneGraph: SceneGraph;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entityId: NodeId, updatedData: any) => void;
  isDarkMode?: boolean;
}

interface FieldData {
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "object";
}

const EntityEditor: React.FC<EntityEditorProps> = ({
  entity,
  // eslint-disable-next-line unused-imports/no-unused-vars
  sceneGraph,
  isOpen,
  onClose,
  onSave,
  isDarkMode = false,
}) => {
  const [formData, setFormData] = useState({
    label: "",
    type: "",
    description: "",
    tags: [] as string[],
    customFields: [] as FieldData[],
  });

  const [newTag, setNewTag] = useState("");
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [newFieldType, setNewFieldType] = useState<
    "string" | "number" | "boolean" | "object"
  >("string");

  // Initialize form data when entity changes
  useEffect(() => {
    if (entity) {
      const data = entity.getData();
      const customFields: FieldData[] = [];

      // Extract custom fields (not label, type, description, tags)
      Object.entries(data).forEach(([key, value]) => {
        if (!["label", "type", "description", "tags"].includes(key)) {
          let type: "string" | "number" | "boolean" | "object" = "string";
          if (typeof value === "number") type = "number";
          else if (typeof value === "boolean") type = "boolean";
          else if (typeof value === "object") type = "object";

          customFields.push({
            key,
            value:
              typeof value === "object" ? JSON.stringify(value) : String(value),
            type,
          });
        }
      });

      setFormData({
        label: data.label || "",
        type: data.type || "",
        description: data.description || "",
        tags: data.tags ? Array.from(data.tags) : [],
        customFields,
      });
    }
  }, [entity]);

  const handleSave = () => {
    const updatedData: any = {
      label: formData.label,
      type: formData.type,
      description: formData.description,
      tags: new Set(formData.tags),
    };

    // Add custom fields
    formData.customFields.forEach((field) => {
      let value: any = field.value;

      switch (field.type) {
        case "number":
          value = parseFloat(field.value) || 0;
          break;
        case "boolean":
          value = field.value.toLowerCase() === "true";
          break;
        case "object":
          try {
            value = JSON.parse(field.value);
          } catch {
            value = field.value; // Keep as string if invalid JSON
          }
          break;
        default:
          value = field.value;
      }

      updatedData[field.key] = value;
    });

    onSave(entity.getId() as NodeId, updatedData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addCustomField = () => {
    if (
      newFieldKey.trim() &&
      !formData.customFields.some((f) => f.key === newFieldKey.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        customFields: [
          ...prev.customFields,
          {
            key: newFieldKey.trim(),
            value: newFieldValue,
            type: newFieldType,
          },
        ],
      }));
      setNewFieldKey("");
      setNewFieldValue("");
      setNewFieldType("string");
    }
  };

  const removeCustomField = (keyToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter(
        (field) => field.key !== keyToRemove
      ),
    }));
  };

  const updateCustomField = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((field) =>
        field.key === key ? { ...field, value } : field
      ),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${isDarkMode ? styles.dark : ""}`}
      onClick={onClose}
    >
      <div className={styles.editor} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Entity</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>

            <div className={styles.field}>
              <label className={styles.label}>Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
                className={styles.input}
                placeholder="Enter entity label"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className={styles.input}
                placeholder="Enter entity type"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={styles.textarea}
                placeholder="Enter entity description"
                rows={3}
              />
            </div>
          </div>

          {/* Tags */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tags</h3>

            <div className={styles.tagInput}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                className={styles.input}
                placeholder="Add a tag"
              />
              <button className={styles.addButton} onClick={addTag}>
                <Plus size={16} />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className={styles.tags}>
                {formData.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button
                      className={styles.removeTagButton}
                      onClick={() => removeTag(tag)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Custom Fields</h3>

            <div className={styles.customFieldInput}>
              <input
                type="text"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                className={styles.input}
                placeholder="Field name"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as any)}
                className={styles.select}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object (JSON)</option>
              </select>
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addCustomField)}
                className={styles.input}
                placeholder="Field value"
              />
              <button className={styles.addButton} onClick={addCustomField}>
                <Plus size={16} />
              </button>
            </div>

            {formData.customFields.length > 0 && (
              <div className={styles.customFields}>
                {formData.customFields.map((field, index) => (
                  <div key={index} className={styles.customField}>
                    <span className={styles.fieldKey}>{field.key}</span>
                    <span className={styles.fieldType}>({field.type})</span>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        updateCustomField(field.key, e.target.value)
                      }
                      className={styles.fieldValue}
                    />
                    <button
                      className={styles.removeFieldButton}
                      onClick={() => removeCustomField(field.key)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntityEditor;
