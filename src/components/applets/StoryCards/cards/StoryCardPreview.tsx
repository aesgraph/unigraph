import React from "react";
import { StoryNode } from "../../../types/StoryTypes";
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
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [titleFontSize, setTitleFontSize] = React.useState(1); // Default size in rem

  // Adjust font size based on container size after the component mounts
  React.useEffect(() => {
    const resizeTitle = () => {
      if (!titleRef.current) return;

      // Get the container width and height
      const container = titleRef.current.parentElement;
      if (!container) return;

      const maxHeight = 24 * 2; // Approx 3 lines (assuming line-height of ~1.5 with 1rem font)

      // Start with initial font size
      let fontSize = 1.2;
      titleRef.current.style.fontSize = `${fontSize}rem`;
      titleRef.current.style.whiteSpace = "normal"; // Allow wrapping for measurement

      // Decrease font size until title fits in 3 lines or less
      while (titleRef.current.scrollHeight > maxHeight && fontSize > 0.6) {
        fontSize -= 0.05;
        titleRef.current.style.fontSize = `${fontSize}rem`;
      }

      setTitleFontSize(fontSize);
    };

    // Initial sizing
    resizeTitle();

    // Handle window resize
    window.addEventListener("resize", resizeTitle);
    return () => {
      window.removeEventListener("resize", resizeTitle);
    };
  }, [node.title]);

  return (
    <div key={node.id} className="child-card" onClick={onClick}>
      <h3
        ref={titleRef}
        className="child-card-title"
        style={{
          fontSize: `${titleFontSize}rem`,
          lineHeight: 1.2,
          maxHeight: `${1.2 * 3}em`, // 3 lines max
          overflow: "hidden",
        }}
      >
        {node.title}
      </h3>

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
