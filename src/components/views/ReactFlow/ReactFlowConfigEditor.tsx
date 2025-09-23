import { BackgroundVariant } from "@xyflow/react";
import React, { useEffect, useState } from "react";
import { FormFieldProps, FormSchema } from "../../shared/FormSchemaTypes";
import styles from "./ReactFlowConfigEditor.module.css";

interface ReactFlowConfigEditorProps {
  isDarkMode?: boolean;
  onApply: (config: ReactFlowRenderConfig) => void;
  initialConfig?: ReactFlowRenderConfig;
}

export interface ReactFlowRenderConfig {
  nodeBorderRadius?: number;
  nodeStrokeWidth?: number;
  nodeFontSize?: number;
  edgeStrokeWidth?: number;
  edgeFontSize?: number;
  connectionLineStyle?:
    | "default"
    | "straight"
    | "step"
    | "smoothstep"
    | "bezier";
  minimap?: boolean;
  backgroundVariant?: BackgroundVariant;
  backgroundGap?: number;
  backgroundSize?: number;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
}

export const DEFAULT_REACTFLOW_CONFIG: ReactFlowRenderConfig = {
  nodeBorderRadius: 4,
  nodeStrokeWidth: 1,
  nodeFontSize: 12,
  edgeStrokeWidth: 1,
  edgeFontSize: 10,
  connectionLineStyle: "bezier",
  minimap: true,
  backgroundVariant: BackgroundVariant.Dots,
  backgroundGap: 12,
  backgroundSize: 1,
  snapToGrid: false,
  snapGrid: [15, 15],
};

const formSchema: FormSchema = {
  nodeBorderRadius: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Border radius is required";
      if (isNaN(Number(value)) || Number(value) < 0)
        return "Must be non-negative";
      return null;
    },
    label: "Border Radius",
    type: "number",
    min: 0,
    max: 20,
    step: 1,
  },
  nodeStrokeWidth: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Stroke width is required";
      if (isNaN(Number(value)) || Number(value) < 0)
        return "Must be non-negative";
      return null;
    },
    label: "Stroke Width",
    type: "number",
    min: 0,
    step: 0.5,
  },
  nodeFontSize: {
    validate: (value) => {
      if (value === null || value === undefined) return "Font size is required";
      if (isNaN(Number(value)) || Number(value) < 8)
        return "Must be at least 8px";
      return null;
    },
    label: "Font Size",
    type: "number",
    min: 8,
    step: 1,
  },
  edgeStrokeWidth: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Edge width is required";
      if (isNaN(Number(value)) || Number(value) < 0.5)
        return "Must be at least 0.5";
      return null;
    },
    label: "Edge Width",
    type: "number",
    min: 0.5,
    step: 0.5,
  },
  connectionLineStyle: {
    validate: () => null,
    label: "Connection Style",
    type: "select",
    options: [
      { value: "default", label: "Default" },
      { value: "straight", label: "Straight" },
      { value: "step", label: "Step" },
      { value: "smoothstep", label: "Smooth Step" },
      { value: "bezier", label: "Bezier" },
    ],
  },
  backgroundVariant: {
    validate: () => null,
    label: "Background Style",
    type: "select",
    options: [
      { value: BackgroundVariant.Dots, label: "Dots" },
      { value: BackgroundVariant.Lines, label: "Lines" },
      { value: BackgroundVariant.Cross, label: "Cross" },
    ],
  },
  backgroundGap: {
    validate: (value) => {
      if (value === null || value === undefined) return "Gap is required";
      if (isNaN(Number(value)) || Number(value) < 5)
        return "Must be at least 5px";
      return null;
    },
    label: "Background Gap",
    type: "number",
    min: 5,
    step: 1,
  },
  minimap: {
    validate: () => null,
    label: "Show Minimap",
    type: "checkbox",
  },
  snapToGrid: {
    validate: () => null,
    label: "Snap to Grid",
    type: "checkbox",
  },
};

const FormField: React.FC<FormFieldProps> = ({
  name,
  value,
  error,
  onChange,
  schema,
}) => {
  const field = schema[name];

  const handleIncrement = () => {
    if (field.type !== "number") return;
    const step = field.step || 1;
    const newValue = Number(value) + step;
    if (field.max !== undefined && newValue > field.max) return;

    onChange({
      target: { name, value: String(newValue), type: "number" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleDecrement = () => {
    if (field.type !== "number") return;
    const step = field.step || 1;
    const newValue = Number(value) - step;
    if (field.min !== undefined && newValue < field.min) return;

    onChange({
      target: { name, value: String(newValue), type: "number" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  if (field.type === "checkbox") {
    return (
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={Boolean(value)}
          onChange={onChange}
          className={styles.checkbox}
        />
        <label className={styles.checkboxLabel} htmlFor={name}>
          {field.label}
        </label>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={styles.controlGroup}>
        <label className={styles.label} htmlFor={name}>
          {field.label}
        </label>
        <select
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          className={styles.select}
        >
          {field.options?.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  return (
    <div className={styles.controlGroup}>
      <div className={styles.row}>
        <label className={styles.label} htmlFor={name}>
          {field.label}
        </label>
        <div className={styles.numberInputContainer}>
          <input
            type="number"
            id={name}
            name={name}
            value={value as number}
            onChange={onChange}
            min={field.min}
            max={field.max}
            step={field.step}
            className={styles.numberInput}
          />
          <div className={styles.spinnerButtons}>
            <button
              type="button"
              onClick={handleIncrement}
              className={styles.spinUp}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className={styles.spinDown}
            >
              ▼
            </button>
          </div>
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

const ReactFlowConfigEditor: React.FC<ReactFlowConfigEditorProps> = ({
  onApply,
  initialConfig = DEFAULT_REACTFLOW_CONFIG,
}) => {
  const [formData, setFormData] =
    useState<ReactFlowRenderConfig>(initialConfig);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    setFormData(initialConfig);
  }, [initialConfig]);

  const _validateField = (
    name: string,
    value: number | boolean | string
  ): string | null => {
    return formSchema[name].validate(value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    const updatedFormData = { ...formData, [name]: newValue };
    setFormData(updatedFormData);

    onApply(updatedFormData);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className={styles.editorContainer}>
      <form>
        {Object.keys(formSchema).map((fieldName) => (
          <FormField
            key={fieldName}
            name={fieldName}
            value={(formData as any)[fieldName]}
            error={errors[fieldName]}
            onChange={handleChange}
            schema={formSchema}
          />
        ))}
      </form>
    </div>
  );
};

export default ReactFlowConfigEditor;
