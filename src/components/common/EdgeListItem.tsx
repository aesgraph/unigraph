import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";
import styles from "./EdgeListItem.module.css";
import SelectDropdown from "./SelectDropdown";

export interface EdgeInfo {
  id: string;
  nodeId: string;
  type: string;
  direction: "in" | "out";
  color?: string;
}

interface EdgeListItemProps {
  edge: EdgeInfo;
  onSelect?: (edge: EdgeInfo) => void;
  availableNodes?: { value: string; label: string; color?: string }[];
  availableTypes?: { value: string; label: string; color?: string }[];
  onNodeChange?: (newNodeId: string) => void;
  onTypeChange?: (newType: string) => void;
  isDarkMode?: boolean;
}

const EdgeListItem: React.FC<EdgeListItemProps> = ({
  edge,
  onSelect,
  availableNodes = [],
  availableTypes = [],
  onNodeChange,
  onTypeChange,
  isDarkMode = false,
}) => {
  return (
    <div
      className={`${styles.edgeItem} ${isDarkMode ? styles.dark : ""}`}
      onClick={() => onSelect?.(edge)}
    >
      <span className={styles.edgeItemDirection}>
        {edge.direction === "in" ? (
          <ArrowLeft size={16} />
        ) : (
          <ArrowRight size={16} />
        )}
      </span>
      <div className={styles.edgeItemContent}>
        {/* <div className={styles.edgeItemNode}> */}
        <SelectDropdown
          options={availableNodes}
          value={{ value: edge.nodeId, label: edge.nodeId }}
          onChange={(option) => onNodeChange?.(option?.value || "")}
          placeholder="Select node..."
          isDarkMode={isDarkMode}
          showClearButton={false}
        />
        {/* </div> */}
        {/* <div className={styles.edgeItemType}> */}
        <SelectDropdown
          options={availableTypes}
          value={{ value: edge.type, label: edge.type, color: edge.color }}
          onChange={(option) => onTypeChange?.(option?.value || "")}
          placeholder="Select type..."
          isDarkMode={isDarkMode}
          showClearButton={false}
        />
        {/* </div> */}
      </div>
    </div>
  );
};

export default EdgeListItem;
