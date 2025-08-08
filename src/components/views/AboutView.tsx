import React from "react";
import { useTheme, getColor } from "@aesgraph/app-shell";

const AboutView: React.FC = () => {
  const { theme } = useTheme();

  const shortcuts = [
    { key: "Cmd+Shift+P", description: "Open command palette" },
    { key: "Cmd+K", description: "Quick search" },
    { key: "Cmd+Shift+F", description: "Open filter panel" },
    { key: "Cmd+Shift+L", description: "Open layout manager" },
    { key: "Cmd+Shift+S", description: "Save current workspace" },
    { key: "Cmd+Shift+W", description: "Switch workspace" },
    { key: "Cmd+Shift+T", description: "Toggle theme" },
    { key: "Cmd+Shift+H", description: "Show help" },
  ];

  const features = [
    "Interactive 3D Force Graph Visualization",
    "ReactFlow 2D Graph Editor",
    "Scene Graph Management",
    "Workspace Configuration",
    "Theme System with Dark/Light Modes",
    "Command Palette for Quick Actions",
    "Filter and Search Capabilities",
    "Layout Management Tools",
    "Wikipedia Article Integration",
    "AI Chat Integration",
    "Semantic Web Query Support",
    "Entity Table Views",
    "Node Legend and Edge Legend",
    "System Monitoring",
    "Gravity Simulation",
  ];

  const sections = [
    {
      title: "Keyboard Shortcuts",
      items: shortcuts.map(({ key, description }) => (
        <div
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <kbd
            style={{
              backgroundColor: getColor(theme.colors, "surface"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "12px",
              fontFamily: "monospace",
              color: getColor(theme.colors, "text"),
            }}
          >
            {key}
          </kbd>
          <span
            style={{
              color: getColor(theme.colors, "textSecondary"),
              marginLeft: "12px",
            }}
          >
            {description}
          </span>
        </div>
      )),
    },
    {
      title: "Features",
      items: features.map((feature, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "6px",
            color: getColor(theme.colors, "textSecondary"),
          }}
        >
          <span
            style={{
              color: getColor(theme.colors, "primary"),
              marginRight: "8px",
              fontSize: "14px",
            }}
          >
            •
          </span>
          {feature}
        </div>
      )),
    },
    {
      title: "Getting Started",
      items: [
        "Load a scene graph or create a new one",
        "Use the command palette (Cmd+Shift+P) to access all features",
        "Switch between different views using the tab system",
        "Customize your workspace layout and save it",
        "Explore the various visualization options available",
        "Use filters and search to find specific nodes or edges",
      ].map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "8px",
            color: getColor(theme.colors, "textSecondary"),
            lineHeight: "1.4",
          }}
        >
          <span
            style={{
              color: getColor(theme.colors, "primary"),
              marginRight: "8px",
              marginTop: "2px",
              fontSize: "12px",
            }}
          >
            {index + 1}.
          </span>
          {item}
        </div>
      )),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
        color: getColor(theme.colors, "text"),
        backgroundColor: getColor(theme.colors, "background"),
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1
          style={{
            color: getColor(theme.colors, "text"),
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "600",
          }}
        >
          About Unigraph
        </h1>
        <p
          style={{
            color: getColor(theme.colors, "textSecondary"),
            fontSize: "16px",
            margin: 0,
          }}
        >
          A powerful graph visualization and analysis platform
        </p>
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: getColor(theme.colors, "text"),
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              paddingBottom: "8px",
              borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
            }}
          >
            {section.title}
          </h2>
          <div style={{ paddingLeft: "8px" }}>{section.items}</div>
        </div>
      ))}

      <div
        style={{
          marginTop: "40px",
          padding: "16px",
          backgroundColor: getColor(theme.colors, "surface"),
          border: `1px solid ${getColor(theme.colors, "border")}`,
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: getColor(theme.colors, "textSecondary"),
            margin: 0,
            fontSize: "14px",
          }}
        >
          For more information and updates, check the documentation or use the
          command palette.
        </p>
      </div>
    </div>
  );
};

export default AboutView;
