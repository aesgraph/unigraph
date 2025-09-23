import React, { useMemo } from "react";
import { SongAnnotationData } from "./SongAnnotation";

interface TimelineChartProps {
  annotations: SongAnnotationData[];
  duration: number;
  width?: number;
  height?: number;
  onClickAnnotation?: (time: number) => void;
  tagColors: { [key: string]: string };
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  annotations,
  duration,
  // eslint-disable-next-line unused-imports/no-unused-vars
  width = 800,
  height = 100,
  onClickAnnotation,
  tagColors,
}) => {
  // Get unique tags and assign them vertical positions
  const tagPositions = useMemo(() => {
    const uniqueTags = new Set<string>();
    annotations.forEach((anno) => {
      anno.tags.forEach((tag) => uniqueTags.add(tag));
    });
    const positions: { [key: string]: number } = {};
    Array.from(uniqueTags).forEach((tag, index) => {
      positions[tag] = (index + 1) / (uniqueTags.size + 1);
    });
    return positions;
  }, [annotations]);

  return (
    <div
      style={{
        width: "100%",
        height: height,
        position: "relative",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      {/* Time markers */}
      {Array.from({ length: Math.ceil(duration) }).map((_, index) => (
        <div
          key={`marker-${index}`}
          style={{
            position: "absolute",
            left: `${(index / duration) * 100}%`,
            top: 0,
            bottom: 0,
            borderLeft: "1px solid #ddd",
            width: 1,
          }}
        />
      ))}

      {/* Annotations as dots */}
      {annotations.map((anno) => {
        const left = (anno.time / duration) * 100;
        const firstTag = Array.from(anno.tags)[0] || "default";
        const top = tagPositions[firstTag] * 100 || 50;
        const color = tagColors[firstTag] || "#4a90e2";

        return (
          <div
            key={anno.id}
            onClick={() => onClickAnnotation?.(anno.time)}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%, -50%)",
              width: "8px",
              height: "8px",
              backgroundColor: color,
              borderRadius: "50%",
              cursor: "pointer",
              zIndex: 1,
            }}
            title={`${anno.text || Array.from(anno.tags).join(", ")} (${anno.time.toFixed(2)}s)`}
          />
        );
      })}

      {/* Tag labels on the right */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "20px",
          borderLeft: "1px solid #ddd",
          backgroundColor: "rgba(255,255,255,0.5)",
        }}
      >
        {Object.entries(tagPositions).map(([tag, position]) => (
          <div
            key={tag}
            style={{
              position: "absolute",
              right: "6px",
              top: `${position * 100}%`,
              transform: "translateY(-50%)",
              width: "8px",
              height: "8px",
              backgroundColor: tagColors[tag] || "#4a90e2",
              borderRadius: "50%",
            }}
            title={tag}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineChart;
