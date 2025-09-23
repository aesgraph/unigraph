import React, { useCallback, useMemo } from "react";
import { RenderingManager__DisplayMode } from "../../controllers/RenderingManager";
import { getGraphStatistics } from "../../core/model/GraphBuilder";
import { NodeId } from "../../core/model/Node";
import {
  GetCurrentDisplayConfigOf,
  SetCurrentDisplayConfigOf,
} from "../../core/model/utils";
import {
  getNodeLegendConfig,
  setNodeKeyColor,
  setNodeKeyVisibility,
} from "../../store/activeLegendConfigStore";
import {
  getCurrentSceneGraph,
  getLegendMode,
  setLegendMode,
} from "../../store/appConfigStore";
import {
  selectNodeIdsByType,
  selectNodesIdsByTag,
  setHoveredNodeIds,
} from "../../store/graphInteractionStore";
import Legend from "../common/Legend";
import LegendModeRadio from "../common/LegendModeRadio";

interface NodeLegendViewProps {
  className?: string;
}

const NodeLegendView: React.FC<NodeLegendViewProps> = ({ className }) => {
  const currentSceneGraph = getCurrentSceneGraph();
  const legendMode = getLegendMode();
  const nodeLegendConfig = getNodeLegendConfig();
  const graphStatistics = getGraphStatistics(currentSceneGraph.getGraph());

  const handleLegendModeChange = useCallback(
    (mode: RenderingManager__DisplayMode) => {
      currentSceneGraph.getDisplayConfig().mode = mode;
      setLegendMode(mode);
      const newConfig = GetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Node"
      );
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Node",
        newConfig
      );
    },
    [currentSceneGraph]
  );

  const handleNodeCheckBulk = useCallback(
    (updates: { [key: string]: boolean }) => {
      const newConfig = { ...nodeLegendConfig };
      Object.keys(updates).forEach((key) => {
        newConfig[key].isVisible = updates[key];
      });
      SetCurrentDisplayConfigOf(
        currentSceneGraph.getDisplayConfig(),
        "Node",
        newConfig
      );
    },
    [currentSceneGraph, nodeLegendConfig]
  );

  const handleMouseHoverLegendItem = useCallback(
    (key: string): void => {
      const allNodesOfType =
        legendMode === "type"
          ? currentSceneGraph
              .getGraph()
              .getNodesByType(key)
              .map((n) => n.getId())
          : currentSceneGraph
              .getGraph()
              .getNodesByTag(key)
              .map((node) => node.getId());
      setHoveredNodeIds(allNodesOfType);
    },
    [currentSceneGraph, legendMode]
  );

  const handleMouseUnhoverLegendItem = useCallback((_key: string): void => {
    setHoveredNodeIds([]);
  }, []);

  const renderNodeLegend = useMemo(() => {
    const statistics =
      legendMode === "type"
        ? graphStatistics?.nodeTypeToCount
        : graphStatistics?.nodeTagsToCount;

    const onLegendLabelSelected =
      legendMode === "type" ? selectNodeIdsByType : selectNodesIdsByTag;

    return (
      <Legend
        title="Node"
        displayConfig={{ ...nodeLegendConfig }}
        onChange={(key: string, color: string) =>
          setNodeKeyColor(key as NodeId, color)
        }
        onCheck={(key: string, isVisiblity: boolean) =>
          setNodeKeyVisibility(key as NodeId, isVisiblity)
        }
        onCheckBulk={handleNodeCheckBulk}
        isDarkMode={false} // Will be handled by app-shell theme
        totalCount={graphStatistics?.nodeCount}
        statistics={statistics}
        sceneGraph={currentSceneGraph}
        onMouseHoverItem={handleMouseHoverLegendItem}
        onMouseUnhoverItem={handleMouseUnhoverLegendItem}
        onLabelSelected={onLegendLabelSelected}
      />
    );
  }, [
    legendMode,
    graphStatistics?.nodeTypeToCount,
    graphStatistics?.nodeTagsToCount,
    graphStatistics?.nodeCount,
    nodeLegendConfig,
    handleNodeCheckBulk,
    currentSceneGraph,
    handleMouseHoverLegendItem,
    handleMouseUnhoverLegendItem,
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
          Node Legend
        </h3>
        {renderLayoutModeRadio()}
      </div>
      {renderNodeLegend}
    </div>
  );
};

export default NodeLegendView;
