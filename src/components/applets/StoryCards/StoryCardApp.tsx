import React, { useEffect, useMemo, useState } from "react";
import { NodeId } from "../../../core/model/Node";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { loadMarkdownFile } from "../../../utils/markdownLoader";
import StoryCard from "../../cards/StoryCard";
import { StoryNode } from "../../types/StoryTypes";
import "./StoryCardApp.css";

interface StoryCardAppProps {
  sceneGraph: SceneGraph;
  initialNodeId?: string;
}

const StoryCardApp: React.FC<StoryCardAppProps> = ({
  sceneGraph,
  initialNodeId,
}) => {
  const [rootNode, setRootNode] = useState<StoryNode | null>(null);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [path, setPath] = useState<StoryNode[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [markdownContents, setMarkdownContents] = useState<
    Record<string, string>
  >({});

  // Convert SceneGraph to a hierarchical structure that can be navigated
  const buildStoryTree = useMemo(() => {
    // Track processed nodes to avoid cycles
    const processedNodes = new Set<string>();

    // Function to build a tree from the graph
    const buildNodeTree = (nodeId: NodeId, depth = 0): StoryNode | null => {
      // Prevent infinite recursion due to cycles
      if (depth > 10 || processedNodes.has(nodeId)) {
        return null;
      }

      const node = sceneGraph.getGraph().getNode(nodeId);
      if (!node) return null;

      processedNodes.add(nodeId);

      // Get data from node
      const title = node.getLabel();
      const description = node.getDescription();
      const userData = node.getAllUserData();

      // Create story node
      const storyNode: StoryNode = {
        id: nodeId,
        title: userData?.title || title,
        description: userData?.description || description,
        markdownFile: userData?.markdownFile,
      };

      // Get child nodes through "StoryChoice" edges
      const outgoingEdges = sceneGraph.getGraph().getEdgesFrom(nodeId);
      const childEdges = outgoingEdges.filter(
        (edge) =>
          edge.getTags().has("EntryPoint") ||
          edge.getTags().has("storyNode") ||
          edge.getType() === "StoryChoice" ||
          edge.getType() === "related" ||
          edge.getType() === "explores" ||
          edge.getType() === "includes"
      );

      // Build child nodes
      const children: StoryNode[] = [];
      childEdges.forEach((edge) => {
        const childNode = buildNodeTree(edge.getTarget(), depth + 1);
        if (childNode) {
          children.push(childNode);
        }
      });

      if (children.length > 0) {
        storyNode.children = children;
      }

      processedNodes.delete(nodeId); // Allow node to appear in multiple branches
      return storyNode;
    };

    // Find the root node of the story
    const findRootNode = (): NodeId | null => {
      // Try to use initialNodeId if provided
      if (initialNodeId) {
        const node = sceneGraph.getGraph().getNode(initialNodeId as NodeId);
        if (node) return node.getId();
      }

      // Look for nodes of type "storyCard" that have no incoming StoryChoice edges
      const storyCardNodes = sceneGraph
        .getGraph()
        .getNodes()
        .filter((node) => node.getType() === "storyCard");

      for (const node of storyCardNodes) {
        const incomingEdges = sceneGraph
          .getGraph()
          .getIncomingEdges(node.getId());
        const isRoot = incomingEdges.every(
          (edge) =>
            edge.getType() !== "StoryChoice" &&
            edge.getType() !== "related" &&
            edge.getType() !== "explores" &&
            edge.getType() !== "includes"
        );

        if (isRoot) {
          return node.getId();
        }
      }

      // Fallback: return first storyCard node if no clear root
      return storyCardNodes.size() > 0
        ? (storyCardNodes.first()?.getId() ?? null)
        : null;
    };

    // Build the tree from the root node
    const rootNodeId = findRootNode();
    return rootNodeId ? buildNodeTree(rootNodeId) : null;
  }, [sceneGraph, initialNodeId]);

  // Initialize state when the story tree is built
  useEffect(() => {
    if (buildStoryTree) {
      setRootNode(buildStoryTree);
      setCurrentNode(buildStoryTree);
      setPath([buildStoryTree]);
    }
  }, [buildStoryTree]);

  // Load markdown content when needed
  useEffect(() => {
    if (
      currentNode?.markdownFile &&
      !markdownContents[currentNode.markdownFile]
    ) {
      loadMarkdownFile(currentNode.markdownFile).then((content) => {
        setMarkdownContents((prev) => ({
          ...prev,
          [currentNode.markdownFile!]: content,
        }));
      });
    }

    // Also preload markdown for child cards
    if (currentNode?.children) {
      currentNode.children.forEach((child) => {
        if (child.markdownFile && !markdownContents[child.markdownFile]) {
          loadMarkdownFile(child.markdownFile).then((content) => {
            setMarkdownContents((prev) => ({
              ...prev,
              [child.markdownFile!]: content,
            }));
          });
        }
      });
    }
  }, [currentNode, markdownContents]);

  const handleSelectCard = (child: StoryNode) => {
    if (transitioning || !child) return;

    setTransitioning(true);

    // Add short delay for transition effect
    setTimeout(() => {
      setCurrentNode(child);
      setPath([...path, child]);
      setTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    if (transitioning || path.length <= 1) return;

    setTransitioning(true);

    setTimeout(() => {
      const newPath = [...path];
      newPath.pop();
      setCurrentNode(newPath[newPath.length - 1]);
      setPath(newPath);
      setTransitioning(false);
    }, 300);
  };

  const handleRestart = () => {
    if (transitioning || !rootNode) return;

    setTransitioning(true);

    setTimeout(() => {
      setCurrentNode(rootNode);
      setPath([rootNode]);
      setTransitioning(false);
    }, 300);
  };

  // Show loading state if we don't have data yet
  if (!currentNode) {
    return (
      <div className="story-navigator-container loading">
        Loading story data...
      </div>
    );
  }

  return (
    <div className="story-navigator-container">
      <div className="story-path">
        {path.map((node, index) => (
          <span key={node.id} className="path-item">
            {index > 0 && <span className="path-separator">›</span>}
            <span
              className="path-node"
              onClick={() => {
                if (index < path.length - 1) {
                  setTransitioning(true);
                  setTimeout(() => {
                    setCurrentNode(node);
                    setPath(path.slice(0, index + 1));
                    setTransitioning(false);
                  }, 300);
                }
              }}
            >
              {node.title}
            </span>
          </span>
        ))}
      </div>

      <div
        className={`parent-card-container ${transitioning ? "transitioning" : ""}`}
      >
        <StoryCard
          node={currentNode}
          onBack={handleBack}
          onRestart={handleRestart}
          onSelectChild={handleSelectCard}
          showBackButton={path.length > 1}
          showRestartButton={path.length > 1}
          markdownContents={markdownContents}
        />
      </div>
    </div>
  );
};

export default StoryCardApp;
