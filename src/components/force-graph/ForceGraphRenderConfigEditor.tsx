import React, { useEffect, useState } from "react";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import "./ForceGraphRenderConfigEditor.css";

interface FormSchemaField {
  validate: (value: number | boolean) => string | null;
  label: string;
  type: "number" | "checkbox";
}

interface FormSchema {
  [key: string]: FormSchemaField;
}

const formSchema: FormSchema = {
  nodeTextLabels: {
    validate: () => null,
    label: "Node Labels",
    type: "checkbox",
  },
  nodeSize: {
    validate: (value) => {
      if (value === null || value === undefined) return "Node Size is required";
      if (isNaN(Number(value)) || Number(value) < 0)
        return "Node Size must be a non-negative number";
      return null;
    },
    label: "Node Size",
    type: "number",
  },
  nodeOpacity: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Node Opacity is required";
      if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 1)
        return "Node Opacity must be between 0 and 1";
      return null;
    },
    label: "Node Opacity",
    type: "number",
  },
  linkTextLabels: {
    validate: () => null,
    label: "Link Labels",
    type: "checkbox",
  },
  linkWidth: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Link Width is required";
      if (isNaN(Number(value)) || Number(value) < 0)
        return "Link Width must be a non-negative number";
      return null;
    },
    label: "Link Width",
    type: "number",
  },
  linkOpacity: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Link Opacity is required";
      if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 1)
        return "Link Opacity must be between 0 and 1";
      return null;
    },
    label: "Link Opacity",
    type: "number",
  },
  chargeStrength: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Charge strength is required";
      if (isNaN(Number(value))) return "Charge strength must be a number";
      return null;
    },
    label: "Charge Strength",
    type: "number",
  },
};

interface FormFieldProps {
  name: string;
  value: number | boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  schema: FormSchema;
  isDarkMode: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  value,
  error,
  onChange,
  schema,
  isDarkMode,
}) => {
  const handleIncrement = () => {
    const input = document.getElementById(name) as HTMLInputElement;
    const step = name.includes("Opacity") ? 0.1 : 1;
    const max = name.includes("Opacity") ? 1 : undefined;
    let newValue = Number((Number(input.value) + step).toFixed(2));

    // Handle the case where we're close to max value
    if (max !== undefined && newValue > max) {
      newValue = max;
    }

    const event = {
      target: {
        name,
        value: String(newValue),
        type: "number",
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  const handleDecrement = () => {
    const input = document.getElementById(name) as HTMLInputElement;
    const step = name.includes("Opacity") ? 0.1 : 1;
    const min = name.includes("Charge") ? -300 : 0;
    let newValue = Number((Number(input.value) - step).toFixed(2));

    // Handle the case where we're close to min value
    if (newValue < min) {
      newValue = min;
    }

    const event = {
      target: {
        name,
        value: String(newValue),
        type: "number",
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className="form-field">
      <div className="form-field-row">
        <label className="form-label" htmlFor={name}>
          {schema[name].label}
        </label>
        {schema[name].type === "checkbox" ? (
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={onChange}
            className={`form-input ${isDarkMode ? "dark-mode" : ""} ${
              error ? "form-input-error" : ""
            }`}
          />
        ) : (
          <div className="number-input-container">
            <input
              id={name}
              name={name}
              type="number"
              value={value as number}
              onChange={onChange}
              min={0}
              max={name.includes("Opacity") ? 1 : undefined}
              step={name.includes("Opacity") ? "0.1" : "1"}
              className={`form-input ${isDarkMode ? "dark-mode" : ""} ${
                error ? "form-input-error" : ""
              }`}
              onInvalid={(e) => e.preventDefault()} // Prevent native validation popup
              // noValidate // Disable HTML5 validation
            />
            <div className="number-input-buttons">
              <button
                type="button"
                onClick={handleIncrement}
                className="spinner-button up"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                className="spinner-button down"
              >
                ▼
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

interface ForceGraphRenderConfigEditorProps {
  onApply: (config: IForceGraphRenderConfig) => void;
  isDarkMode: boolean;
  initialConfig: IForceGraphRenderConfig;
}

const ForceGraphRenderConfigEditor: React.FC<
  ForceGraphRenderConfigEditorProps
> = ({ onApply, isDarkMode, initialConfig }) => {
  const [formData, setFormData] = useState<IForceGraphRenderConfig>({
    ...initialConfig,
  });
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Update initialConfig when it changes from parent
  useEffect(() => {
    setFormData(initialConfig);
  }, [initialConfig]);

  const validateField = (
    name: string,
    value: number | boolean
  ): string | null => {
    const validator = formSchema[name].validate;
    return validator(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    onApply({ ...formData, [name]: newValue });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { [key: string]: string | null } = {};
    Object.keys(formSchema).forEach((field) => {
      const error = validateField(field, (formData as any)[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      const config: IForceGraphRenderConfig = {
        nodeTextLabels: formData.nodeTextLabels as boolean,
        nodeSize: formData.nodeSize as number,
        nodeOpacity: formData.nodeOpacity as number,
        linkTextLabels: formData.linkTextLabels as boolean,
        linkWidth: formData.linkWidth as number,
        linkOpacity: formData.linkOpacity as number,
        chargeStrength: formData.chargeStrength as number,
      };
      onApply(config);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div
      className={`force-graph-render-config-editor ${
        isDarkMode ? "dark-mode" : ""
      }`}
    >
      <form onSubmit={handleSubmit}>
        {Object.keys(formSchema).map((fieldName) => (
          <FormField
            key={fieldName}
            name={fieldName}
            value={(formData as any)[fieldName]}
            error={errors[fieldName]}
            onChange={handleChange}
            schema={formSchema}
            isDarkMode={isDarkMode}
          />
        ))}
      </form>
    </div>
  );
};

export default ForceGraphRenderConfigEditor;
