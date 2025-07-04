import React from "react";
import { StoryNode } from "../types/StoryTypes";
import StoryCardPreviewContent from "./StoryCardPreviewContent";

interface StoryCardPreviewProps {
  node: StoryNode;
  onClick: () => void;
  markdownContent?: string;
}

const StoryCardPreview: React.FC<StoryCardPreviewProps> = ({
  node,
  onClick,
  markdownContent,
}) => {
  return (
    <div key={node.id} className="child-card" onClick={onClick}>
      <h3 className="child-card-title">{node.title}</h3>

      <div
        style={{
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          position: "relative",
        }}
      >
        {/* Content container with no fading */}
        <div
          style={{
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <StoryCardPreviewContent
            node={node}
            markdownContent={markdownContent}
          />

          {/* Gradient overlay that sits on top of the content */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40px",
              pointerEvents: "none",
              background:
                "linear-gradient(to top, #e4ecf7 50%, rgba(228, 236, 247, 0) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StoryCardPreview;
