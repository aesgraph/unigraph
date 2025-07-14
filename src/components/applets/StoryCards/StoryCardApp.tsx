import React, { useEffect, useMemo, useState } from "react";
import { NodeId } from "../../../core/model/Node";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { loadMarkdownFile } from "../../markdown/markdownLoader";
import { StoryNode } from "../../types/StoryTypes";
import "./StoryCardApp.css";
import StoryCard from "./cards/StoryCard";

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
  const [lastClickTime, setLastClickTime] = useState(0);

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
      loadMarkdownFile(currentNode.markdownFile)
        .then((content) => {
          setMarkdownContents((prev) => ({
            ...prev,
            [currentNode.markdownFile!]: content,
          }));
        })
        .catch((error) => {
          console.error("Error loading markdown for current node:", error);
          // Set a fallback content to prevent infinite loading
          setMarkdownContents((prev) => ({
            ...prev,
            [currentNode.markdownFile!]:
              "# Error Loading Content\n\nThere was an error loading this content.",
          }));
        });
    }

    // Also preload markdown for child cards
    if (currentNode?.children) {
      currentNode.children.forEach((child) => {
        if (child.markdownFile && !markdownContents[child.markdownFile]) {
          loadMarkdownFile(child.markdownFile)
            .then((content) => {
              setMarkdownContents((prev) => ({
                ...prev,
                [child.markdownFile!]: content,
              }));
            })
            .catch((error) => {
              console.error("Error loading markdown for child node:", error);
              // Set a fallback content to prevent infinite loading
              setMarkdownContents((prev) => ({
                ...prev,
                [child.markdownFile!]:
                  "# Error Loading Content\n\nThere was an error loading this content.",
              }));
            });
        }
      });
    }
  }, [currentNode, markdownContents]);

  const handleSelectCard = (child: StoryNode) => {
    // Prevent rapid clicking
    const now = Date.now();
    if (now - lastClickTime < 100) {
      return;
    }
    setLastClickTime(now);

    if (transitioning || !child) return;

    setTransitioning(true);

    // Add short delay for transition effect
    setTimeout(() => {
      try {
        // Safety check: ensure child is valid
        if (!child || !child.id) {
          console.error("Invalid child node in handleSelectCard");
          setTransitioning(false);
          return;
        }

        setCurrentNode(child);
        setPath([...path, child]);
      } catch (error) {
        console.error("Error in handleSelectCard:", error);
      } finally {
        setTransitioning(false);
      }
    }, 300);
  };

  const handleBack = () => {
    // Prevent rapid clicking
    const now = Date.now();
    if (now - lastClickTime < 100) {
      return;
    }
    setLastClickTime(now);

    if (transitioning || path.length <= 1) return;

    setTransitioning(true);

    setTimeout(() => {
      try {
        // Create a new path array without mutating the original
        const newPath = path.slice(0, -1);

        // Safety check: ensure we have a valid path
        if (newPath.length === 0) {
          console.error("Back navigation would result in empty path");
          setTransitioning(false);
          return;
        }

        const previousNode = newPath[newPath.length - 1];

        // Safety check: ensure the previous node exists
        if (!previousNode) {
          console.error("Previous node is undefined");
          setTransitioning(false);
          return;
        }

        setCurrentNode(previousNode);
        setPath(newPath);
      } catch (error) {
        console.error("Error in handleBack:", error);
        // Reset to a safe state
        if (rootNode) {
          setCurrentNode(rootNode);
          setPath([rootNode]);
        }
      } finally {
        setTransitioning(false);
      }
    }, 300);
  };

  const handleRestart = () => {
    // Prevent rapid clicking
    const now = Date.now();
    if (now - lastClickTime < 100) {
      return;
    }
    setLastClickTime(now);

    if (transitioning || !rootNode) return;

    setTransitioning(true);

    setTimeout(() => {
      try {
        // Safety check: ensure rootNode is valid
        if (!rootNode || !rootNode.id) {
          console.error("Invalid root node in handleRestart");
          setTransitioning(false);
          return;
        }

        setCurrentNode(rootNode);
        setPath([rootNode]);
      } catch (error) {
        console.error("Error in handleRestart:", error);
      } finally {
        setTransitioning(false);
      }
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
