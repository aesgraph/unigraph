import { CustomLayoutType } from "../../../core/layouts/CustomLayoutEngine";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
// Node interface to match the CSV structure
interface TreeNode {
  node_id: number;
  node_name: string;
  child_nodes: number;
  leaf_node: number;
  tolorg_link: number;
  extinct: number;
  confidence: number;
  phylesis: number;
}

// Edge interface to match the CSV structure
interface TreeLink {
  source_node_id: number;
  target_node_id: number;
}

/**
 * Creates a Graph representing the Tree of Life data from CSV
 */
const createGraph = (
  nodeData: TreeNode[] = [],
  linkData: TreeLink[] = [],
  maxNodes: number = 2000,
  maxEdges: number = 3000
): Graph => {
  // Limit the number of nodes and edges to prevent performance issues
  let limitedNodeData = nodeData;
  if (nodeData.length > maxNodes) {
    console.warn(
      `Limiting Tree of Life nodes to ${maxNodes} from ${nodeData.length}`
    );
    // Prioritize nodes with more connections and the root node
    limitedNodeData = [
      // Always include the root node (id: 1)
      ...nodeData.filter((node) => node.node_id === 1),
      // Then include nodes with the most children
      ...nodeData
        .filter((node) => node.node_id !== 1)
        .sort((a, b) => b.child_nodes - a.child_nodes)
        .slice(0, maxNodes - 1),
    ];
  }

  // Extract the IDs of the included nodes
  const includedNodeIds = new Set(limitedNodeData.map((node) => node.node_id));

  // Filter links to only include those connecting included nodes
  let limitedLinkData = linkData.filter(
    (link) =>
      includedNodeIds.has(link.source_node_id) &&
      includedNodeIds.has(link.target_node_id)
  );

  // Further limit edges if necessary
  if (limitedLinkData.length > maxEdges) {
    console.warn(
      `Limiting Tree of Life edges to ${maxEdges} from ${limitedLinkData.length}`
    );
    limitedLinkData = limitedLinkData.slice(0, maxEdges);
  }

  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Hierarchical level tracking for y-positioning
  const nodeLevels: Record<number, number> = {};
  const nodeXPositions: Record<number, number> = {};

  // First pass: determine hierarchical levels
  const determineNodeLevels = (nodeId: number, level: number) => {
    nodeLevels[nodeId] = level;

    // Find all children
    const childLinks = limitedLinkData.filter(
      (link) => link.source_node_id === nodeId
    );
    childLinks.forEach((link, index) => {
      determineNodeLevels(link.target_node_id, level + 1);
      // Assign x positions based on child index
      nodeXPositions[link.target_node_id] = index * 150;
    });
  };

  // Start with the root node (Life on Earth)
  determineNodeLevels(1, 0);

  // Balance x-coordinates for better visual appearance
  //   const maxLevel = Math.max(...Object.values(nodeLevels));
  const levelCounts: Record<number, number> = {};
  const levelCurrentIndex: Record<number, number> = {};

  // Count nodes per level
  for (const nodeId in nodeLevels) {
    const level = nodeLevels[nodeId];
    levelCounts[level] = (levelCounts[level] || 0) + 1;
    levelCurrentIndex[level] = 0;
  }

  // Create nodes with calculated positions
  limitedNodeData.forEach((node) => {
    const level = nodeLevels[node.node_id] || 0;
    const levelWidth = 800; // Max width for a level

    // Calculate X position
    let xPos;
    if (level === 0) {
      // Root node in center
      xPos = 0;
    } else {
      const spacing = levelWidth / (levelCounts[level] + 1);
      levelCurrentIndex[level] += 1;
      xPos = levelCurrentIndex[level] * spacing - levelWidth / 2;
    }

    // Y position based on level
    const yPos = level * 150; // 150px between levels

    // Node size based on number of children
    const nodeSize =
      node.child_nodes > 0 ? Math.min(2 + Math.log(node.child_nodes), 5) : 1;

    // Node color based on taxonomic level
    let nodeColor;
    if (level === 0) {
      nodeColor = "rgb(50, 50, 50)"; // Root
    } else if (node.confidence > 0) {
      nodeColor = "rgb(220, 100, 100)"; // High confidence
    } else if (node.leaf_node === 1) {
      nodeColor = "rgb(100, 220, 100)"; // Leaf node
    } else {
      nodeColor = "rgb(100, 100, 220)"; // Regular node
    }

    // Node shape based on extinct status
    // const nodeShape = node.extinct === 1 ? "diamond" : "circle";

    // Create node
    console.log("node is ", node);
    g.createNode({
      id: `node_${node.node_id}`,
      type: "treeoflife",
      label: node.node_name,
      position: { x: xPos, y: yPos, z: 0 },
      color: nodeColor,
      size: nodeSize,
      //   shape: nodeShape,
      userData: {
        id: node.node_id,
        childNodes: node.child_nodes,
        leafNode: node.leaf_node,
        tolorgLink: node.tolorg_link,
        extinct: node.extinct,
        confidence: node.confidence,
        phylesis: node.phylesis,
      },
    });
  });

  // Debug the filtering process
  console.log(`Original links count: ${linkData.length}`);
  console.log(`Included node IDs count: ${includedNodeIds.size}`);
  console.log(`Initial filtered links count: ${limitedLinkData.length}`);

  // If we have no links, try to include at least the direct children of the root
  if (limitedLinkData.length === 0 && nodeData.length > 0) {
    console.warn(
      "No links passed filtering. Adding essential connections to root node."
    );

    // Find direct children of root node (ID 1) and make sure they're included
    const rootLinks = linkData.filter((link) => link.source_node_id === 1);

    // Add these nodes to our includedNodeIds if they're not already there
    rootLinks.forEach((link) => {
      const targetNode = nodeData.find(
        (node) => node.node_id === link.target_node_id
      );
      if (targetNode && !includedNodeIds.has(targetNode.node_id)) {
        limitedNodeData.push(targetNode);
        includedNodeIds.add(targetNode.node_id);
      }
    });

    // Now include these essential links
    limitedLinkData = rootLinks.slice(0, Math.min(rootLinks.length, maxEdges));
    console.log(`Added ${limitedLinkData.length} essential root connections`);
  }

  // Create edges
  limitedLinkData.forEach((link) => {
    g.createEdgeIfMissing(
      `node_${link.source_node_id}`,
      `node_${link.target_node_id}`,
      {
        id: `edge_${link.source_node_id}_${link.target_node_id}`,
        type: "phylogenetic_link",
        // Edge width based on confidence level of target node
        //   width: 1,
        // Get target node data
        userData: {
          sourceId: link.source_node_id,
          targetId: link.target_node_id,
        },
      }
    );
  });

  return g;
};

/**
 * Load CSV file and parse its content to the appropriate format
 */
const loadCSVFile = async (filePath: string): Promise<string[][]> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch CSV: ${response.status} ${response.statusText}`
      );
    }

    const text = await response.text();
    const rows = text.split("\n").filter((row) => row.trim() !== "");

    return rows.map((row) => row.split("\t"));
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    return [];
  }
};

/**
 * Parse node data from CSV content
 */
const parseNodeData = (csvData: string[][]): TreeNode[] => {
  const result: TreeNode[] = [];

  for (let i = 1; i < csvData.length; i++) {
    // Each row is a single string in the first column, comma-delimited
    const row = csvData[i][0].split(",");
    if (row.length < 8) continue;

    result.push({
      node_id: parseInt(row[0]),
      node_name: row[1],
      child_nodes: parseInt(row[2]),
      leaf_node: parseInt(row[3]),
      tolorg_link: parseInt(row[4]),
      extinct: parseInt(row[5]),
      confidence: parseInt(row[6]),
      phylesis: parseInt(row[7]),
    });
  }

  return result;
};

/**
 * Parse link data from CSV content
 */
const parseEdgeData = (csvData: string[][]): TreeLink[] => {
  const result: TreeLink[] = [];

  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    const source = row[0].split(",")[0];
    const target = row[0].split(",")[1];

    result.push({
      source_node_id: parseInt(source),
      target_node_id: parseInt(target),
    });
  }

  return result;
};

/**
 * Creates a SceneGraph representing the Tree of Life based on CSV data
 * @param nodesCsvPath Optional path to a CSV file containing node data
 * @param edgesCsvPath Optional path to a CSV file containing edge data
 * @param maxNodes Maximum number of nodes to include in the graph (default: 1000)
 * @param maxEdges Maximum number of edges to include in the graph (default: 1000)
 */
export const createTreeOfLifeSceneGraph = async (
  nodesCsvPath: string = "/data/tree-of-life/treeoflife_nodes.csv",
  edgesCsvPath: string = "/data/tree-of-life/treeoflife_links.csv",
  maxNodes: number = 2000,
  maxEdges: number = 3000
): Promise<SceneGraph> => {
  let nodes: TreeNode[] = [];
  let links: TreeLink[] = [];

  // If CSV paths are provided, attempt to load and parse the data
  if (nodesCsvPath) {
    const nodesCsvData = await loadCSVFile(nodesCsvPath);
    if (nodesCsvData.length > 0) {
      nodes = parseNodeData(nodesCsvData);
    }
  }

  if (edgesCsvPath) {
    const edgesCsvData = await loadCSVFile(edgesCsvPath);
    if (edgesCsvData.length > 0) {
      links = parseEdgeData(edgesCsvData);
    }
  }

  return new SceneGraph({
    graph: createGraph(nodes, links, maxNodes, maxEdges),
    metadata: {
      name: "TreeOfLife",
      description:
        "A visualization of the Tree of Life data from CSV files showing taxonomic relationships.",
    },
    defaultAppConfig: {
      activeView: "ForceGraph3d",
      activeSceneGraph: "TreeOfLife",
      windows: {
        showEntityDataCard: false,
      },
      forceGraph3dOptions: {
        layout: "Layout",
      },
      activeLayout: CustomLayoutType.Box, // Use the positions we defined
      legendMode: "type",
      activeFilter: null,
    },
    forceGraphDisplayConfig: {
      nodeTextLabels: true,
      nodeSize: 1.5,
      nodeOpacity: 1,
      linkTextLabels: false,
      linkWidth: 1.0,
      linkOpacity: 0.8,
      chargeStrength: -30,
      backgroundColor: "rgba(255, 255, 255, 1)",
      fontSize: 12,
    },
    displayConfig: {
      mode: "type",
      nodeConfig: {
        types: {
          treeoflife: { color: "rgb(100, 100, 220)", isVisible: true },
        },
        tags: {},
      },
      edgeConfig: {
        types: {
          phylogenetic_link: { color: "rgb(150, 150, 150)", isVisible: true },
        },
        tags: {},
      },
      nodePositions: {},
    },
  });
};

// Export the function to create the Tree of Life visualization with optional CSV paths and limits
export const demo_SceneGraph_TreeOfLife = async (
  nodesCsvPath?: string,
  edgesCsvPath?: string,
  maxNodes: number = 2000,
  maxEdges: number = 3000
) =>
  await createTreeOfLifeSceneGraph(
    nodesCsvPath,
    edgesCsvPath,
    maxNodes,
    maxEdges
  );
