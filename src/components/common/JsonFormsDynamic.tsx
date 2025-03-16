import { JsonSchema } from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React from "react";
import { DEFAULT_FORCE_GRAPH_RENDER_CONFIG } from "../../core/force-graph/createForceGraph";

// Helper function to determine JSON schema type from TypeScript type
function getJsonSchemaType(value: any): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  if (typeof value === "object") return "object";
  return "string"; // default fallback
}

function generateJsonFormsSchema(defaultConfig: any): JsonSchema {
  const properties: Record<string, any> = {};

  Object.entries(defaultConfig).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively handle nested objects
      properties[key] = {
        type: "object",
        properties: generateJsonFormsSchema(value).properties,
      };
    } else {
      properties[key] = {
        type: getJsonSchemaType(value),
      };

      // Add additional schema properties based on type
      if (typeof value === "number") {
        // You can add validation constraints based on your needs
        properties[key].minimum = Number.MIN_SAFE_INTEGER;
        properties[key].maximum = Number.MAX_SAFE_INTEGER;
      }

      if (Array.isArray(value)) {
        properties[key].items = {
          type: getJsonSchemaType(value[0]),
        };
      }
    }
  });

  return {
    type: "object",
    properties,
  };
}

// Example usage:
interface _ServerConfig {
  port: number;
  host: string;
  debug: boolean;
  tags: string[];
  database: {
    url: string;
    maxConnections: number;
  };
}

// const defaultConfig: ServerConfig = {
//   port: 3000,
//   host: "localhost",
//   debug: false,
//   tags: ["production"],
//   database: {
//     url: "mongodb://localhost:27017",
//     maxConnections: 10,
//   },
// };

const defaultConfig = DEFAULT_FORCE_GRAPH_RENDER_CONFIG;

// Generate schema and UI schema
const generatedSchema = generateJsonFormsSchema(defaultConfig);

// Generate a basic UI schema
function generateUiSchema(
  config: any,
  parentPath: string = ""
): { type: string; elements: any[] } {
  const elements = Object.keys(config).map((key) => {
    const currentPath = parentPath
      ? `${parentPath}/properties/${key}`
      : `#/properties/${key}`;
    if (
      typeof config[key] === "object" &&
      config[key] !== null &&
      !Array.isArray(config[key])
    ) {
      return {
        type: "Control",
        label: key,
        scope: currentPath,
        options: {
          detail: generateUiSchema(config[key], currentPath),
        },
      };
    }
    return {
      type: "Control",
      label: key,
      scope: currentPath,
    };
  });

  return {
    type: "VerticalLayout",
    elements,
  };
}

// Use in component
const ConfigPanel: React.FC = () => {
  const [data, setData] = React.useState(defaultConfig);
  const generatedUiSchema = generateUiSchema(defaultConfig);

  return (
    <JsonForms
      schema={generatedSchema}
      uischema={generatedUiSchema}
      data={data}
      renderers={materialRenderers}
      cells={materialCells}
      onChange={({ data }) => setData(data)}
    />
  );
};

export default ConfigPanel;
