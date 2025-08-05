import React, { useCallback, useMemo } from "react";
import { RenderingManager__DisplayMode } from "../../controllers/RenderingManager";
import { EdgeId } from "../../core/model/Edge";
import { getGraphStatistics } from "../../core/model/GraphBuilder";
import {
  GetCurrentDisplayConfigOf,
  SetCurrentDisplayConfigOf,
} from "../../core/model/utils";
import {
  getEdgeLegendConfig,
  setEdgeKeyColor,
  setEdgeKeyVisibility,
} from "../../store/activeLegendConfigStore";
import {
  getCurrentSceneGraph,
  getLegendMode,
  setLegendMode,
} from "../../store/appConfigStore";
import {
  selectEdgeIdsByTag,
  selectEdgeIdsByType,
} from "../../store/graphInteractionStore";
import Legend from "../common/Legend";
import LegendModeRadio from "../common/LegendModeRadio";

interface EdgeLegendViewProps {
  className?: string;
}

const EdgeLegendView: React.FC<EdgeLegendViewProps> = ({ className }) => {
  const currentSceneGraph = getCurrentSceneGraph();
  const legendMode = getLegendMode();
  const edgeLegendConfig = getEdgeLegendConfig();
  const graphStatistics = getGraphStatistics(currentSceneGraph.getGraph());

  const handleLegendModeChange = useCallback(
    (mode: RenderingManager__DisplayMode) => {
      currentSceneGraph.getDisplayConfig().mode = mode;
      setLegendMode(mode);
      const newConfig = GetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Edge"
      );
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Edge",
        newConfig
      );
    },
    [currentSceneGraph]
  );

  const handleEdgeCheckBulk = useCallback(
    (updates: { [key: string]: boolean }) => {
      const newConfig = { ...edgeLegendConfig };
      Object.keys(updates).forEach((key) => {
        newConfig[key].isVisible = updates[key];
      });
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Edge",
        newConfig
      );
    },
    [currentSceneGraph, edgeLegendConfig]
  );

  const renderEdgeLegend = useMemo(() => {
    const statistics =
      legendMode === "type"
        ? graphStatistics?.edgeTypeToCount
        : graphStatistics?.edgeTagsToCount;

    const onLegendLabelSelected =
      legendMode === "type" ? selectEdgeIdsByType : selectEdgeIdsByTag;

    return (
      <Legend
        title="Edge"
        displayConfig={edgeLegendConfig}
        onChange={(key: string, color: string) =>
          setEdgeKeyColor(key as EdgeId, color)
        }
        onCheck={(key: string, isVisiblity: boolean) =>
          setEdgeKeyVisibility(key as EdgeId, isVisiblity)
        }
        onCheckBulk={handleEdgeCheckBulk}
        isDarkMode={false} // Will be handled by app-shell theme
        totalCount={graphStatistics?.edgeCount}
        statistics={statistics}
        sceneGraph={currentSceneGraph}
        onLabelSelected={onLegendLabelSelected}
      />
    );
  }, [
    legendMode,
    graphStatistics?.edgeTypeToCount,
    graphStatistics?.edgeTagsToCount,
    graphStatistics?.edgeCount,
    edgeLegendConfig,
    handleEdgeCheckBulk,
    currentSceneGraph,
  ]);

  const renderLayoutModeRadio = useCallback(() => {
    return <LegendModeRadio onLegendModeChange={handleLegendModeChange} />;
  }, [handleLegendModeChange]);

  return (
    <div
      className={className}
      style={{ padding: "16px", height: "100%", overflow: "auto" }}
    >
      <div style={{ marginBottom: "16px" }}>
        <h3
          style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}
        >
          Edge Legend
        </h3>
        {renderLayoutModeRadio()}
      </div>
      {renderEdgeLegend}
    </div>
  );
};

export default EdgeLegendView;
