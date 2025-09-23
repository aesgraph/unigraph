import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DEMO_SCENE_GRAPHS } from "../../data/DemoSceneGraphs";
import "./SceneGraphTreeView.css";

interface SceneGraphNode {
  name: string;
  key: string;
  type: "category" | "sceneGraph";
  children?: SceneGraphNode[];
  isExpanded?: boolean;
  category?: string;
  description?: string;
  metadata?: {
    name?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
}

interface SceneGraphTreeViewProps {
  onSceneGraphSelect?: (graphKey: string) => void;
  selectedSceneGraph?: string;
  className?: string;
}

const SceneGraphTreeView: React.FC<SceneGraphTreeViewProps> = ({
  onSceneGraphSelect,
  selectedSceneGraph,
  className = "",
}) => {
  const { theme } = useTheme();
  const [sceneGraphTree, setSceneGraphTree] = useState<SceneGraphNode[]>([]);
  const [filteredTree, setFilteredTree] = useState<SceneGraphNode[]>([]);
  const [loading, _setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Convert DEMO_SCENE_GRAPHS to tree structure
  useEffect(() => {
    const buildTree = () => {
      const tree: SceneGraphNode[] = [];

      Object.entries(DEMO_SCENE_GRAPHS).forEach(([categoryKey, category]) => {
        const categoryNode: SceneGraphNode = {
          name: category.label,
          key: categoryKey,
          type: "category",
          isExpanded: false,
          children: [],
        };

        // Add scene graphs as children of the category
        Object.keys(category.graphs).forEach((graphKey) => {
          // Use template descriptions based on category instead of calling functions
          const getTemplateDescription = (
            categoryKey: string,
            _graphKey: string
          ) => {
            switch (categoryKey) {
              case "Thinker Graphs":
                return "A knowledge graph of thinkers, their works, and relationships.";
              case "Writings":
                return "Documentation and conceptual writings about Unigraph.";
              case "Test":
                return "Test and demonstration scene graphs.";
              case "Base":
                return "Base scene graph templates and examples.";
              case "Service Topologies":
                return "Service mesh and topology visualizations.";
              case "Demo Graphs":
                return "Interactive demonstration graphs.";
              case "Math Graphs":
                return "Mathematical and geometric visualizations.";
              case "Mesh Graphs":
                return "3D mesh and geometric visualizations.";
              case "Test Graphs":
                return "Testing and validation scene graphs.";
              case "Image Graphs":
                return "Image gallery and visualization graphs.";
              default:
                return `Scene graph from ${category.label} category`;
            }
          };

          const metadata = {
            name: graphKey,
            description: getTemplateDescription(categoryKey, graphKey),
          };

          categoryNode.children!.push({
            name: graphKey,
            key: graphKey,
            type: "sceneGraph",
            category: categoryKey,
            metadata,
          });
        });

        tree.push(categoryNode);
      });

      setSceneGraphTree(tree);
      setFilteredTree(tree);
    };

    buildTree();
  }, []);

  // Filter tree based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTree(sceneGraphTree);
      return;
    }

    const filterTree = (nodes: SceneGraphNode[]): SceneGraphNode[] => {
      return nodes
        .map((node) => {
          if (node.type === "category") {
            // Filter children of category
            const filteredChildren = filterTree(node.children || []);
            if (filteredChildren.length > 0) {
              return {
                ...node,
                children: filteredChildren,
              };
            }
            return null;
          } else {
            // Check if scene graph matches search
            const matchesSearch =
              node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              node.category?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch ? node : null;
          }
        })
        .filter((node): node is SceneGraphNode => node !== null);
    };

    setFilteredTree(filterTree(sceneGraphTree));
  }, [searchTerm, sceneGraphTree]);

  const toggleNode = (node: SceneGraphNode) => {
    if (node.type === "category") {
      const updateNode = (nodes: SceneGraphNode[]): SceneGraphNode[] => {
        return nodes.map((n) => {
          if (n.key === node.key) {
            return { ...n, isExpanded: !n.isExpanded };
          }
          if (n.children) {
            return { ...n, children: updateNode(n.children) };
          }
          return n;
        });
      };

      setSceneGraphTree(updateNode(sceneGraphTree));
      setFilteredTree(updateNode(filteredTree));
    } else {
      // Handle scene graph selection
      onSceneGraphSelect?.(node.key);
    }
  };

  const renderNode = (
    node: SceneGraphNode,
    depth: number = 0
  ): React.ReactNode => {
    const isSelected = selectedSceneGraph === node.key;
    const indent = depth * 20;

    if (node.type === "category") {
      return (
        <div key={node.key} className="scene-graph-category-row">
          <div
            className={`scene-graph-tree-node ${isSelected ? "selected" : ""}`}
            onClick={() => toggleNode(node)}
            style={{ paddingLeft: `${indent}px` }}
          >
            <div className="scene-graph-tree-node-content">
              <div className="scene-graph-tree-icon">
                {node.isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </div>
              <div className="scene-graph-tree-icon">
                {node.isExpanded ? (
                  <FolderOpen size={14} />
                ) : (
                  <Folder size={14} />
                )}
              </div>
              <span className="scene-graph-tree-name">{node.name}</span>
              <span className="scene-graph-tree-count">
                ({node.children?.length || 0})
              </span>
            </div>
          </div>
          {node.isExpanded && node.children && (
            <div className="scene-graph-tree-children">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      // Scene graph node - render as table row
      return (
        <div key={node.key} className="scene-graph-table-row">
          <div className="scene-graph-table-name-cell">
            <div
              className={`scene-graph-tree-node ${isSelected ? "selected" : ""}`}
              onClick={() => toggleNode(node)}
              style={{ paddingLeft: `${indent}px` }}
            >
              <div className="scene-graph-tree-node-content">
                <div className="scene-graph-tree-icon-placeholder" />
                <div className="scene-graph-tree-icon">
                  <FileText size={14} />
                </div>
                <span className="scene-graph-tree-name">
                  {node.metadata?.name || node.name}
                </span>
              </div>
            </div>
          </div>
          <div className="scene-graph-table-description-cell">
            {node.metadata?.description || `Scene graph: ${node.name}`}
            {/* Debug: {JSON.stringify(node.metadata)} */}
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className={`scene-graph-tree-container ${className}`}
      style={
        {
          backgroundColor: getColor(theme.colors, "background"),
          color: getColor(theme.colors, "text"),
          "--border-color": getColor(theme.colors, "border"),
          "--background-secondary": getColor(
            theme.colors,
            "backgroundSecondary"
          ),
          "--surface-hover": getColor(theme.colors, "backgroundTertiary"),
          "--text-muted": getColor(theme.colors, "textMuted"),
          "--text-secondary": getColor(theme.colors, "textSecondary"),
        } as React.CSSProperties
      }
    >
      <div className="scene-graph-tree-header">
        <div className="scene-graph-tree-search">
          <div className="scene-graph-tree-search-input-wrapper">
            <Search size={14} className="scene-graph-tree-search-icon" />
            <input
              type="text"
              placeholder="Search scene graphs..."
              className="scene-graph-tree-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: getColor(theme.colors, "backgroundSecondary"),
                borderColor: getColor(theme.colors, "border"),
                color: getColor(theme.colors, "text"),
              }}
            />
          </div>
        </div>
      </div>
      <div className="scene-graph-tree-content">
        {loading ? (
          <div className="scene-graph-tree-loading">Loading...</div>
        ) : filteredTree.length === 0 ? (
          <div className="scene-graph-tree-no-results">
            {searchTerm ? "No scene graphs found" : "No scene graphs available"}
          </div>
        ) : (
          <div className="scene-graph-tree-table">
            <div className="scene-graph-table-header">
              <div className="scene-graph-table-header-name">Name</div>
              <div className="scene-graph-table-header-description">
                Description
              </div>
            </div>
            <div className="scene-graph-table-body">
              {filteredTree.map((node) => renderNode(node))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneGraphTreeView;
