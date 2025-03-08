import React from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { JsonSchema } from "@jsonforms/core";
import {
  IForceGraphRenderConfig,
  DEFAULT_FORCE_GRAPH_RENDER_CONFIG,
} from "../../core/force-graph/createForceGraph";

const schema: JsonSchema = {
  type: "object",
  properties: {
    nodeTextLabels: {
      type: "boolean",
    },
    linkWidth: {
      type: "number",
      minimum: 0,
    },
    layout: {
      type: "string",
      enum: ["Physics", "Circular", "Box"],
    },
  },
};

// Important: The scope in uiSchema must match exactly with the schema structure
const uiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/nodeTextLabels",
      options: {
        label: "Show Node Text Labels",
        style: {
          margin: "10px 0",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        },
      },
    },
    {
      type: "Control",
      scope: "#/properties/linkWidth",
      options: {
        label: "Link Width",
        style: {
          margin: "10px 0",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        },
      },
    },
    {
      type: "Control",
      scope: "#/properties/layout",
      options: {
        label: "Layout",
        style: {
          margin: "10px 0",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        },
      },
    },
  ],
};

const ConfigPanel: React.FC = () => {
  const [data, setData] = React.useState<IForceGraphRenderConfig>(
    DEFAULT_FORCE_GRAPH_RENDER_CONFIG
  );

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <JsonForms
        schema={schema}
        uischema={uiSchema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ data }) => setData(data)}
      />
    </div>
  );
};

export default ConfigPanel;
