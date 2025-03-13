import React from "react";
import { useMousePosition } from "../../context/MousePositionContext";
import "./EntityDataDisplayCard.css";

interface EntityDataDisplayCardProps {
  entityData: any;
}

const EntityDataDisplayCard: React.FC<EntityDataDisplayCardProps> = ({
  entityData,
}) => {
  const { mousePosition } = useMousePosition();

  return (
    <div
      className="entity-data-display-card"
      style={{
        left: mousePosition.x + 10,
        top: mousePosition.y + 10,
      }}
    >
      <pre>{JSON.stringify(entityData, null, 2)}</pre>
    </div>
  );
};

export default EntityDataDisplayCard;
