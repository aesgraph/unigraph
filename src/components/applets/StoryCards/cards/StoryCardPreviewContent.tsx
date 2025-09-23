import React from "react";
import MarkdownViewer from "../../../common/MarkdownViewer";
import { StoryNode } from "../../../types/StoryTypes";

interface StoryCardPreviewContentProps {
  node: StoryNode;
  markdownContent?: string;
}

const StoryCardPreviewContent: React.FC<StoryCardPreviewContentProps> = ({
  node,
  markdownContent,
}) => {
  return (
    <>
      {node.markdownFile ? (
        <div
          style={{
            overflow: "hidden",
            width: "100%",
          }}
        >
          <MarkdownViewer
            filename={node.markdownFile}
            excerpt={true}
            excerptLength={1000}
            overrideMarkdown={markdownContent}
            imageStyle={{
              maxWidth: "180px",
              maxHeight: "140px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto 12px auto",
            }}
          />
        </div>
      ) : (
        <p className="child-card-description">{node.description}</p>
      )}
    </>
  );
};

export default StoryCardPreviewContent;
