import {
  ChevronDown,
  ChevronRight,
  MinusSquare,
  PlusSquare,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { deserializeDotToSceneGraph } from "../../core/serializers/fromDot";
import { deserializeGraphmlToSceneGraph } from "../../core/serializers/fromGraphml";
import { deserializeSvgToSceneGraph } from "../../core/serializers/fromSvg";
import { deserializeSceneGraphFromJson } from "../../core/serializers/toFromJson";
import { sceneGraphs } from "../../data/graphs/sceneGraphLib";
import styles from "./LoadSceneGraphDialog.module.css";

interface TreeNodeProps {
  category: string;
  graphs: { [key: string]: SceneGraph | (() => SceneGraph) };
  onSelect: (key: string) => void;
  isExpanded: boolean;
  toggleExpand: (category: string) => void;
  isDarkMode?: boolean;
  searchTerm: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  graphs,
  onSelect,
  isExpanded,
  toggleExpand,
  isDarkMode,
  searchTerm,
}) => {
  const filteredGraphs = Object.entries(graphs).filter(([key]) =>
    key.toLowerCase().includes(searchTerm)
  );

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className={styles.highlight}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.treeNodeHeader} ${
          isDarkMode ? styles.dark : styles.light
        }`}
        onClick={() => toggleExpand(category)} // Make the entire header clickable
      >
        <button className={styles.expandButton}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className={styles.categoryName}>
          {highlightText(category, searchTerm)}
        </span>
      </div>
      {isExpanded && (
        <div className={styles.treeNodeChildren}>
          {filteredGraphs.map(([key]) => (
            <button
              key={key}
              className={styles.graphButton}
              onClick={() => onSelect(key)}
            >
              {highlightText(key, searchTerm)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface LoadSceneGraphDialogProps {
  onClose: () => void;
  onSelect: (graphKey: string) => void;
  isDarkMode?: boolean;
  handleLoadSceneGraph: (sceneGraph: SceneGraph) => void;
}

const LoadSceneGraphDialog: React.FC<LoadSceneGraphDialogProps> = ({
  onClose,
  onSelect,
  isDarkMode,
  handleLoadSceneGraph,
}) => {
  const [activeTab, setActiveTab] = useState<"File" | "Demos">("Demos");
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpand = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const expandAll = () => {
    const allCategories = Object.keys(sceneGraphs);
    const expandedState = allCategories.reduce(
      (acc, category) => ({ ...acc, [category]: true }),
      {}
    );
    setExpandedCategories(expandedState);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Auto-expand sections containing the search term
    const expandedState = Object.entries(sceneGraphs).reduce(
      (acc, [category, { graphs }]) => {
        const matchesCategory = category.toLowerCase().includes(term);
        const matchesGraphs = Object.keys(graphs).some((key) =>
          key.toLowerCase().includes(term)
        );
        return { ...acc, [category]: matchesCategory || matchesGraphs };
      },
      {}
    );
    setExpandedCategories(expandedState);
  };

  const filteredSceneGraphs = Object.entries(sceneGraphs).filter(
    ([category, { graphs }]) =>
      category.toLowerCase().includes(searchTerm) ||
      Object.keys(graphs).some((key) => key.toLowerCase().includes(searchTerm))
  );

  const handleImportFileToSceneGraph = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target?.result as string;
        let sceneGraph: SceneGraph | undefined;

        try {
          switch (fileExtension) {
            case "json":
              sceneGraph = deserializeSceneGraphFromJson(content);
              break;
            case "graphml":
              sceneGraph = await deserializeGraphmlToSceneGraph(content);
              break;
            case "svg":
              sceneGraph = deserializeSvgToSceneGraph(content);
              break;
            case "dot":
              sceneGraph = deserializeDotToSceneGraph(content);
              break;
            default:
              console.error(
                `Unsupported file type: ${fileExtension || file.type}`
              );
              return; //@todo: add banner error message
          }

          if (sceneGraph) {
            handleLoadSceneGraph(sceneGraph);
          } else {
            throw new Error("Unable to load file to SceneGraph");
          }
        } catch (error) {
          console.error(`Error importing file: ${error}`);
        } finally {
          onClose();
        }
      };

      reader.readAsText(file);
    },
    [handleLoadSceneGraph, onClose]
  );

  const handleSelect = (key: string) => {
    onSelect(key);
    onClose();
  };

  return (
    <div className={`${styles.overlay} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Load Scene Graph</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "File" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("File")}
          >
            File
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Demos" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("Demos")}
          >
            Demos
          </button>
        </div>
        {activeTab === "File" ? (
          <div className={styles.fileTab}>
            <input
              type="file"
              accept=".json,.graphml,.svg,.dot"
              onChange={handleImportFileToSceneGraph}
              className={styles.fileInput}
            />
          </div>
        ) : (
          <div className={styles.demosTab}>
            <div className={styles.toolbar}>
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchBar}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className={styles.toolbarIconButton} onClick={expandAll}>
                <PlusSquare size={20} />
              </button>
              <button
                className={styles.toolbarIconButton}
                onClick={collapseAll}
              >
                <MinusSquare size={20} />
              </button>
            </div>
            <div className={styles.content}>
              {filteredSceneGraphs.map(([category, { graphs }]) => (
                <TreeNode
                  key={category}
                  category={category}
                  graphs={graphs}
                  onSelect={handleSelect}
                  isExpanded={!!expandedCategories[category]}
                  toggleExpand={toggleExpand}
                  isDarkMode={isDarkMode}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadSceneGraphDialog;
