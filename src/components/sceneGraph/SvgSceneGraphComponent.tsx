import React from "react";
import { useSvgSceneGraph } from "../../hooks/useSvgSceneGraph";

const SvgSceneGraphComponent: React.FC<{ svgUrl: string }> = ({ svgUrl }) => {
  const { sceneGraph, loading, error } = useSvgSceneGraph(svgUrl);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {/* Render your scene graph here */}
      <pre>{JSON.stringify(sceneGraph, null, 2)}</pre>
    </div>
  );
};

export default SvgSceneGraphComponent;
