import React, { useEffect, useState } from "react";
import { getForceGraph3dInstance } from "../../../store/appConfigStore";
import { IForceGraphRenderConfig } from "../../../store/forceGraphConfigStore";
import { FormFieldProps, FormSchema } from "../../shared/FormSchemaTypes";
import "./ForceGraphRenderConfigEditor.css";

// Function to get current camera state from ForceGraph3D instance
const getCurrentCameraState = (): IForceGraphRenderConfig => {
  const forceGraphInstance = getForceGraph3dInstance();
  const config: IForceGraphRenderConfig = {
    nodeTextLabels: false,
    linkWidth: 2,
    nodeSize: 6,
    linkTextLabels: true,
    nodeOpacity: 1,
    linkOpacity: 1,
    chargeStrength: -30,
    backgroundColor: "#1a1a1a",
    fontSize: 12,
  };

  if (forceGraphInstance) {
    const camera = forceGraphInstance.camera();
    const controls = forceGraphInstance.controls() as any;

    // Get current camera position and target
    config.cameraPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    if (controls && controls.target) {
      config.cameraTarget = {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z,
      };
    } else {
      config.cameraTarget = { x: 0, y: 0, z: 0 };
    }

    // Get current zoom
    config.initialZoom = controls?.object?.zoom || 1;
  } else {
    // Fallback to defaults if no instance
    config.cameraPosition = { x: 0, y: 0, z: 500 };
    config.cameraTarget = { x: 0, y: 0, z: 0 };
    config.initialZoom = 1;
  }

  return config;
};

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

  // Camera controls
  cameraPositionX: {
    validate: (value) => {
      if (value === null || value === undefined) return "Camera X is required";
      if (isNaN(Number(value))) return "Camera X must be a number";
      return null;
    },
    label: "Pos X",
    type: "number",
  },
  cameraPositionY: {
    validate: (value) => {
      if (value === null || value === undefined) return "Camera Y is required";
      if (isNaN(Number(value))) return "Camera Y must be a number";
      return null;
    },
    label: "Pos Y",
    type: "number",
  },
  cameraPositionZ: {
    validate: (value) => {
      if (value === null || value === undefined) return "Camera Z is required";
      if (isNaN(Number(value))) return "Camera Z must be a number";
      return null;
    },
    label: "Pos Z",
    type: "number",
  },
  cameraTargetX: {
    validate: (value) => {
      if (value === null || value === undefined) return "Target X is required";
      if (isNaN(Number(value))) return "Target X must be a number";
      return null;
    },
    label: "Target X",
    type: "number",
  },
  cameraTargetY: {
    validate: (value) => {
      if (value === null || value === undefined) return "Target Y is required";
      if (isNaN(Number(value))) return "Target Y must be a number";
      return null;
    },
    label: "Target Y",
    type: "number",
  },
  cameraTargetZ: {
    validate: (value) => {
      if (value === null || value === undefined) return "Target Z is required";
      if (isNaN(Number(value))) return "Target Z must be a number";
      return null;
    },
    label: "Target Z",
    type: "number",
  },
  fontSize: {
    validate: (value) => {
      if (value === null || value === undefined) return "Font size is required";
      if (isNaN(Number(value)) || Number(value) <= 0)
        return "Font size must be a positive number";
      return null;
    },
    label: "Font Size",
    type: "number",
  },
  initialZoom: {
    validate: (value) => {
      if (value === null || value === undefined)
        return "Initial zoom is required";
      if (isNaN(Number(value)) || Number(value) <= 0)
        return "Initial zoom must be a positive number";
      return null;
    },
    label: "Initial Zoom",
    type: "number",
  },
  backgroundColor: {
    validate: (value) => {
      if (
        !value ||
        typeof value !== "string" ||
        !/^#[0-9A-Fa-f]{6}$/.test(value)
      ) {
        return "Background color must be a valid hex color (e.g. #1a1a1a)";
      }
      return null;
    },
    label: "Background Color",
    type: "color",
  },
};

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

  // Safety check - if field doesn't exist in schema, don't render
  if (!schema[name]) {
    console.warn(`Field "${name}" not found in schema`);
    return null;
  }

  return (
    <div className="form-field-compact">
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
      ) : schema[name].type === "color" ? (
        <input
          id={name}
          name={name}
          type="color"
          value={value as string}
          onChange={onChange}
          className={`form-input ${isDarkMode ? "dark-mode" : ""} ${
            error ? "form-input-error" : ""
          }`}
          style={{
            width: "100%",
            height: "2rem",
            padding: 0,
            border: "none",
            background: "none",
          }}
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
  // Get current camera state from ForceGraph3D instance
  const currentCameraState = getCurrentCameraState();

  const [formData, setFormData] = useState<IForceGraphRenderConfig>({
    ...initialConfig,
    // Use current camera state from ForceGraph3D instance
    cameraPosition: currentCameraState.cameraPosition,
    cameraTarget: currentCameraState.cameraTarget,
    initialZoom: currentCameraState.initialZoom,
    // Map camera object properties to individual form fields
    cameraPositionX: currentCameraState.cameraPosition?.x ?? 0,
    cameraPositionY: currentCameraState.cameraPosition?.y ?? 0,
    cameraPositionZ: currentCameraState.cameraPosition?.z ?? 500,
    cameraTargetX: currentCameraState.cameraTarget?.x ?? 0,
    cameraTargetY: currentCameraState.cameraTarget?.y ?? 0,
    cameraTargetZ: currentCameraState.cameraTarget?.z ?? 0,
  } as any);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Update form data when ForceGraph3D instance changes
  useEffect(() => {
    const currentCameraState = getCurrentCameraState();
    setFormData({
      ...initialConfig,
      // Use current camera state from ForceGraph3D instance
      cameraPosition: currentCameraState.cameraPosition,
      cameraTarget: currentCameraState.cameraTarget,
      initialZoom: currentCameraState.initialZoom,
      // Map camera object properties to individual form fields
      cameraPositionX: currentCameraState.cameraPosition?.x ?? 0,
      cameraPositionY: currentCameraState.cameraPosition?.y ?? 0,
      cameraPositionZ: currentCameraState.cameraPosition?.z ?? 500,
      cameraTargetX: currentCameraState.cameraTarget?.x ?? 0,
      cameraTargetY: currentCameraState.cameraTarget?.y ?? 0,
      cameraTargetZ: currentCameraState.cameraTarget?.z ?? 0,
    } as any);
  }, [initialConfig]); // Keep initialConfig dependency for non-camera settings

  const validateField = (
    name: string,
    value: number | boolean
  ): string | null => {
    const validator = formSchema[name].validate;
    return validator(value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: any;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "color") {
      newValue = value;
    } else {
      newValue = parseFloat(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // Handle camera position fields
      if (name.startsWith("cameraPosition")) {
        const currentPos = prev.cameraPosition ?? { x: 0, y: 0, z: 500 };
        updated.cameraPosition = {
          x: name === "cameraPositionX" ? (newValue as number) : currentPos.x,
          y: name === "cameraPositionY" ? (newValue as number) : currentPos.y,
          z: name === "cameraPositionZ" ? (newValue as number) : currentPos.z,
        };
      }

      // Handle camera target fields
      if (name.startsWith("cameraTarget")) {
        const currentTarget = prev.cameraTarget ?? { x: 0, y: 0, z: 0 };
        updated.cameraTarget = {
          x: name === "cameraTargetX" ? (newValue as number) : currentTarget.x,
          y: name === "cameraTargetY" ? (newValue as number) : currentTarget.y,
          z: name === "cameraTargetZ" ? (newValue as number) : currentTarget.z,
        };
      }

      return updated;
    });

    // Create the config to apply immediately, but clean it up to remove individual field properties
    const configToApply = { ...formData, [name]: newValue };

    // Handle camera position fields
    if (name.startsWith("cameraPosition")) {
      const currentPos = formData.cameraPosition ?? { x: 0, y: 0, z: 500 };
      configToApply.cameraPosition = {
        x: name === "cameraPositionX" ? (newValue as number) : currentPos.x,
        y: name === "cameraPositionY" ? (newValue as number) : currentPos.y,
        z: name === "cameraPositionZ" ? (newValue as number) : currentPos.z,
      };
    }

    // Handle camera target fields
    if (name.startsWith("cameraTarget")) {
      const currentTarget = formData.cameraTarget ?? { x: 0, y: 0, z: 0 };
      configToApply.cameraTarget = {
        x: name === "cameraTargetX" ? (newValue as number) : currentTarget.x,
        y: name === "cameraTargetY" ? (newValue as number) : currentTarget.y,
        z: name === "cameraTargetZ" ? (newValue as number) : currentTarget.z,
      };
    }

    // Clean up the config to remove individual field properties and only keep the object format
    const cleanConfig: IForceGraphRenderConfig = {
      nodeTextLabels: configToApply.nodeTextLabels as boolean,
      nodeSize: configToApply.nodeSize as number,
      nodeOpacity: configToApply.nodeOpacity as number,
      linkTextLabels: configToApply.linkTextLabels as boolean,
      linkWidth: configToApply.linkWidth as number,
      linkOpacity: configToApply.linkOpacity as number,
      chargeStrength: configToApply.chargeStrength as number,
      backgroundColor: configToApply.backgroundColor,
      fontSize: configToApply.fontSize,
      cameraPosition: configToApply.cameraPosition,
      cameraTarget: configToApply.cameraTarget,
      initialZoom: configToApply.initialZoom,
    };

    onApply(cleanConfig);

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
      // Clean up the config to remove individual field properties and only keep the object format
      const cleanConfig: IForceGraphRenderConfig = {
        nodeTextLabels: formData.nodeTextLabels as boolean,
        nodeSize: formData.nodeSize as number,
        nodeOpacity: formData.nodeOpacity as number,
        linkTextLabels: formData.linkTextLabels as boolean,
        linkWidth: formData.linkWidth as number,
        linkOpacity: formData.linkOpacity as number,
        chargeStrength: formData.chargeStrength as number,
        backgroundColor: formData.backgroundColor,
        fontSize: formData.fontSize,
        cameraPosition: formData.cameraPosition,
        cameraTarget: formData.cameraTarget,
        initialZoom: formData.initialZoom,
      };
      onApply(cleanConfig);
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
        {/* Custom Table Layout */}
        <div className="config-table">
          <div className="table-header">
            <div className="table-cell header-cell"></div>
            <div className="table-cell header-cell">Nodes</div>
            <div className="table-cell header-cell">Links</div>
          </div>

          {/* Size Row */}
          <div className="table-row">
            <div className="table-cell label-cell">Size</div>
            <div className="table-cell">
              <FormField
                name="nodeSize"
                value={(formData as any).nodeSize}
                error={errors.nodeSize}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <FormField
                name="linkWidth"
                value={(formData as any).linkWidth}
                error={errors.linkWidth}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Opacity Row */}
          <div className="table-row">
            <div className="table-cell label-cell">Opacity</div>
            <div className="table-cell">
              <FormField
                name="nodeOpacity"
                value={(formData as any).nodeOpacity}
                error={errors.nodeOpacity}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <FormField
                name="linkOpacity"
                value={(formData as any).linkOpacity}
                error={errors.linkOpacity}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Labels Row */}
          <div className="table-row">
            <div className="table-cell label-cell">Labels</div>
            <div className="table-cell">
              <FormField
                name="nodeTextLabels"
                value={(formData as any).nodeTextLabels}
                error={errors.nodeTextLabels}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <FormField
                name="linkTextLabels"
                value={(formData as any).linkTextLabels}
                error={errors.linkTextLabels}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Font Size Row */}
          <div className="table-row">
            <div className="table-cell label-cell">Font Size</div>
            <div className="table-cell">
              <FormField
                name="fontSize"
                value={(formData as any).fontSize}
                error={errors.fontSize}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <div className="empty-cell"></div>
            </div>
          </div>
        </div>

        {/* Background Color Row */}
        <div className="section-header">Display</div>
        <div className="form-field-group-2">
          <div className="form-label">Background Color</div>
          <FormField
            name="backgroundColor"
            value={(formData as any).backgroundColor}
            error={errors.backgroundColor}
            onChange={handleChange}
            schema={formSchema}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Camera Controls */}
        <div className="section-header">Camera</div>
        <div className="camera-table">
          <div className="table-row camera-header-row">
            <div className="table-cell header-cell"></div>
            <div className="table-cell header-cell">X</div>
            <div className="table-cell header-cell">Y</div>
            <div className="table-cell header-cell">Z</div>
          </div>
          {/* Camera Position Row */}
          <div className="table-row">
            <div className="table-cell label-cell">Camera Position</div>
            <div className="table-cell">
              <FormField
                name="cameraPositionX"
                value={(formData as any).cameraPositionX}
                error={errors.cameraPositionX}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <FormField
                name="cameraPositionY"
                value={(formData as any).cameraPositionY}
                error={errors.cameraPositionY}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <FormField
                name="cameraPositionZ"
                value={(formData as any).cameraPositionZ}
                error={errors.cameraPositionZ}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
          {/* Camera Target Row */}
          <div className="table-row">
            <div className="table-cell label-cell">Camera Target</div>
            <div className="table-cell">
              <FormField
                name="cameraTargetX"
                value={(formData as any).cameraTargetX}
                error={errors.cameraTargetX}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <FormField
                name="cameraTargetY"
                value={(formData as any).cameraTargetY}
                error={errors.cameraTargetY}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="table-cell">
              <FormField
                name="cameraTargetZ"
                value={(formData as any).cameraTargetZ}
                error={errors.cameraTargetZ}
                onChange={handleChange}
                schema={formSchema}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>

        {/* Initial Zoom */}
        <div className="zoom-group">
          <div className="zoom-label">Initial Zoom</div>
          <div className="zoom-input">
            <FormField
              name="initialZoom"
              value={(formData as any).initialZoom}
              error={errors.initialZoom}
              onChange={handleChange}
              schema={formSchema}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="apply-button">
            Apply Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForceGraphRenderConfigEditor;
