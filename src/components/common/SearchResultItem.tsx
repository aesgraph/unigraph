import React from "react";
import { RenderingManager } from "../../controllers/RenderingManager";
import { getTextColorBasedOnBackground } from "../../utils/colorUtils";
import "./SearchResultItem.css";

interface SearchResultItemProps {
  id: string;
  label: string;
  type: string;
  tags: string[];
  onClick: () => void;
  renderingManager: RenderingManager;
  isDarkMode?: boolean;
  entityType: "Node" | "Edge";
  searchTerm: string;
}

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

const highlightText = (text: string, highlight: string, isDarkMode = false) => {
  const escapedSearchTerm = escapeRegExp(highlight);
  const parts = text.split(new RegExp(`(${escapedSearchTerm})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={index}
            className="highlight"
            style={{
              backgroundColor: "rgba(246, 255, 0, 0.32)", // Darker yellow with transparency
              color: isDarkMode ? "white" : "black",
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  // eslint-disable-next-line unused-imports/no-unused-vars
  id,
  label,
  type,
  tags,
  onClick,
  isDarkMode = false,
  renderingManager,
  entityType,
  searchTerm,
}) => {
  const typeColor =
    renderingManager.getDisplayConfig(entityType, "type")[type]?.color ??
    "#999";
  const textColor = getTextColorBasedOnBackground(typeColor);

  const isVisible = true; //todo: need to pass graph context to this component for entity-level greyying out of hidden entities

  return (
    <div
      className={`search-result-item ${isDarkMode ? "dark-mode" : ""} ${
        isVisible ? "" : "greyed-out"
      }`}
      onClick={onClick}
    >
      <div className="result-main">
        {entityType === "Edge" ? (
          <>
            <div className="result-label">
              {highlightText(label.split(" → ")[0], searchTerm, isDarkMode)}
            </div>
            <div className="result-type-container">
              <div
                className="result-type"
                style={{ backgroundColor: typeColor, color: textColor }}
              >
                {highlightText(type, searchTerm, isDarkMode)}
              </div>
            </div>
            <div className="result-label">
              {highlightText(label.split(" → ")[1], searchTerm, isDarkMode)}
            </div>
          </>
        ) : (
          <>
            <div className="result-label">
              {highlightText(label, searchTerm, isDarkMode)}
            </div>
            <div
              className="result-type"
              style={{ backgroundColor: typeColor, color: textColor }}
            >
              {highlightText(type, searchTerm, isDarkMode)}
            </div>
          </>
        )}
      </div>
      {tags.length > 0 && (
        <div className="result-tags">
          {tags.map((tag) => {
            const tagColor =
              renderingManager.getDisplayConfig("Node", "tag")[tag]?.color ??
              "#999";
            const tagTextColor = getTextColorBasedOnBackground(tagColor);
            return (
              <span
                key={tag}
                className="result-tag"
                style={{
                  backgroundColor: tagColor,
                  color: tagTextColor,
                }}
              >
                {highlightText(tag, searchTerm, isDarkMode)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResultItem;
