import React, { useMemo, useState } from "react";
import { computePath } from "../../core/analysis/pathSearch";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import GraphSearch from "../common/GraphSearch";
import styles from "./PathAnalysisWizard.module.css";

export interface IPathArgs {
  startNode: NodeId | undefined;
  endNode: NodeId | undefined;
}

interface PathAnalysisWizardProps {
  sceneGraph: SceneGraph;
  isDarkMode: boolean;
  onClose: () => void;
  pathArgs?: IPathArgs; // Add this prop
}

const PathAnalysisWizard: React.FC<PathAnalysisWizardProps> = ({
  sceneGraph,
  isDarkMode,
  onClose,
  pathArgs,
}) => {
  const [startNode, setStartNode] = useState<NodeId | undefined>(
    pathArgs?.startNode
  );
  const [endNode, setEndNode] = useState<NodeId | undefined>(pathArgs?.endNode);
  const [pathResult, setPathResult] = useState<NodeId[] | null>(null);

  const handleAnalyze = () => {
    if (!startNode || !endNode) return;
    const path = computePath(
      startNode,
      endNode,
      sceneGraph.getGraph().getGraphMap()
    );
    setPathResult(path);
  };

  const renderStartNodeInput = useMemo(() => {
    return (
      <GraphSearch
        sceneGraph={sceneGraph}
        onSelectResult={(nodeId) => setStartNode(nodeId as NodeId)}
        isDarkMode={isDarkMode}
        searchTypes={["Node"]}
        placeholder="Select start node..."
        showSelection={true}
        value={startNode}
      />
    );
  }, [startNode, sceneGraph, isDarkMode]);

  const renderEndNodeInput = useMemo(() => {
    return (
      <GraphSearch
        sceneGraph={sceneGraph}
        onSelectResult={(nodeId) => setEndNode(nodeId as NodeId)}
        isDarkMode={isDarkMode}
        searchTypes={["Node"]}
        placeholder="Select end node..."
        showSelection={true}
        value={endNode}
      />
    );
  }, [endNode, sceneGraph, isDarkMode]);

  return (
    <>
      <div className={styles.wizardBackdrop} onClick={onClose} />
      <div
        className={`${styles.pathAnalysisWizard} ${isDarkMode ? styles.dark : ""}`}
      >
        <div className={styles.wizardHeader}>
          <h3>Path Analysis</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.wizardContent}>
          <div className={styles.searchSection}>
            <label>Start Node:</label>
            {renderStartNodeInput}
          </div>
          <div className={styles.searchSection}>
            <label>End Node:</label>
            {renderEndNodeInput}
          </div>
          <button
            className={styles.analyzeButton}
            disabled={!startNode || !endNode}
            onClick={handleAnalyze}
          >
            Analyze Path
          </button>

          {pathResult && (
            <div className={styles.pathResultSection}>
              <h4>Path Analysis Result</h4>
              {pathResult.length > 0 ? (
                <>
                  <div className={styles.pathStats}>
                    <span>Path Length: {pathResult.length - 1} steps</span>
                  </div>
                  <div className={styles.pathNodes}>
                    {pathResult.map((nodeId, index) => (
                      <React.Fragment key={nodeId}>
                        <span className={styles.pathNode}>{nodeId}</span>
                        {index < pathResult.length - 1 && (
                          <span className={styles.pathArrow}>→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.noPathFound}>
                  No path found between selected nodes
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PathAnalysisWizard;
