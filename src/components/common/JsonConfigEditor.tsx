import React, { useState } from "react";

type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

interface JsonEditorProps {
  initialConfig?: JsonObject;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  initialConfig = {
    server: {
      port: 3000,
      host: "localhost",
      cors: {
        enabled: true,
        origins: ["http://localhost:3000"],
      },
    },
    database: {
      type: "postgresql",
      credentials: {
        user: "admin",
        password: "********",
      },
    },
  },
}) => {
  const [config, setConfig] = useState<JsonObject>(initialConfig);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["server", "database"])
  );

  const togglePath = (path: string): void => {
    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  const updateValue = (path: string, value: JsonValue): void => {
    const pathArray = path.split(".");
    const newConfig = { ...config };
    let current: JsonObject = newConfig;

    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]] as JsonObject;
    }

    current[pathArray[pathArray.length - 1]] = value;
    setConfig(newConfig);
  };

  const renderValue = (value: JsonValue, path: string): React.ReactNode => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "Array";
    if (typeof value === "object") return "Object";
    if (typeof value === "boolean") {
      return (
        <select
          value={value.toString()}
          onChange={(e) => updateValue(path, e.target.value === "true")}
          className="bg-gray-100 rounded px-2 py-1 text-sm"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    return (
      <input
        type="text"
        value={value.toString()}
        onChange={(e) => updateValue(path, e.target.value)}
        className="bg-gray-100 rounded px-2 py-1 text-sm w-48"
      />
    );
  };

  const renderObject = (
    obj: JsonObject,
    path: string = ""
  ): React.ReactNode => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const isObject = value !== null && typeof value === "object";
      const isExpanded = expandedPaths.has(currentPath);

      return (
        <div key={currentPath} className="ml-4">
          <div className="flex items-center gap-2">
            {isObject && (
              <button
                onClick={() => togglePath(currentPath)}
                className="w-4 h-4 flex items-center justify-center text-gray-500"
              >
                {isExpanded ? "−" : "+"}
              </button>
            )}
            {!isObject && <div className="w-4" />}
            <span className="font-medium text-gray-700">{key}:</span>
            {!isObject && (
              <div className="ml-2">{renderValue(value, currentPath)}</div>
            )}
          </div>
          {isObject && isExpanded && (
            <div className="mt-1">
              {renderObject(value as JsonObject, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Configuration Editor</h2>
      <div className="font-mono text-sm">{renderObject(config)}</div>
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="text-sm font-medium mb-2">Current Configuration:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonEditor;
