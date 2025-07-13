import React from "react";
import MarkdownViewer from "../../../common/MarkdownViewer";
import { StoryNode } from "../../../types/StoryTypes";
import StoryCardPreview from "./StoryCardPreview";

interface StoryCardProps {
  node: StoryNode;
  onBack?: () => void;
  onRestart?: () => void;
  onSelectChild?: (child: StoryNode) => void;
  showBackButton?: boolean;
  showRestartButton?: boolean;
  markdownContents: Record<string, string>;
}

const StoryCard: React.FC<StoryCardProps> = ({
  node,
  onBack,
  onRestart,
  onSelectChild,
  showBackButton = false,
  showRestartButton = false,
  markdownContents,
}) => {
  return (
    <div className="parent-card">
      <div className="parent-card-header">
        {showBackButton && (
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
        )}
        <h2 className="parent-card-title">{node.title}</h2>
        {showRestartButton && (
          <button className="restart-button" onClick={onRestart}>
            Start Over
          </button>
        )}
      </div>

      <div className="parent-card-content">
        {/* Current node content */}
        {node.markdownFile ? (
          <MarkdownViewer filename={node.markdownFile} />
        ) : (
          <p className="parent-card-description">{node.description}</p>
        )}

        {/* Child cards */}
        {node.children && node.children.length > 0 ? (
          <div className="child-cards-container">
            {node.children.map((child) => (
              <StoryCardPreview
                key={child.id}
                node={child}
                onClick={() => onSelectChild && onSelectChild(child)}
                markdownContent={
                  child.markdownFile
                    ? markdownContents[child.markdownFile]
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          /* End of branch message */
          <div className="story-ending">
            <p>{"You've reached the end of this branch."}</p>
            <button className="restart-button" onClick={onRestart}>
              Return to Start
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard;
