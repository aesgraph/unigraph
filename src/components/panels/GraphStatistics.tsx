import React from "react";
import { GraphStastics } from "../../core/model/GraphBuilder";
import "./GraphStatistics.css";

interface GraphStatisticsProps {
  statistics: GraphStastics;
  isDarkMode?: boolean;
}

const GraphStatistics: React.FC<GraphStatisticsProps> = ({
  statistics,
  isDarkMode = false,
}) => {
  return (
    <div className={`graph-statistics ${isDarkMode ? "dark" : ""}`}>
      <div>
        <strong>Nodes:</strong> {statistics.nodeCount}
      </div>
      <div>
        <strong>Edges:</strong> {statistics.edgeCount}
      </div>
    </div>
  );
};

export default GraphStatistics;
