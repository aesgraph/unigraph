import React from "react";
import "./SceneGraphTitle.css";

interface SceneGraphTitleProps {
  title: string;
  description: string;
}

const SceneGraphTitle: React.FC<SceneGraphTitleProps> = ({
  title,
  description,
}) => {
  if (!title) return null;
  return (
    <div className="scenegraph-title">
      {`Graph: ${title}`}
      {description && <p>{description}</p>}
    </div>
  );
};

export default SceneGraphTitle;
