import { v4 as uuidv4 } from "uuid";
import { Graph } from "../core/model/Graph";
import { NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";
import { getRandomColor } from "./colorUtils";

interface RandomNodeOptions {
  nodeCount?: number;
  nodeTypes?: string[];
  nodeTags?: string[][];
  labelPrefix?: string;
  addRandomTags?: boolean;
  minTagsPerNode?: number;
  maxTagsPerNode?: number;
}

interface RandomEdgeOptions {
  edgeCount?: number;
  edgeTypes?: string[];
  edgeTags?: string[][];
  labelPrefix?: string;
  addRandomTags?: boolean;
  minTagsPerEdge?: number;
  maxTagsPerEdge?: number;
  connectionDensity?: number; // 0-1, percentage of possible connections to create
  allowSelfLoops?: boolean;
  allowMultiEdges?: boolean; // Allow multiple edges between same nodes
}

/**
 * Generates random nodes and adds them to a SceneGraph
 * @param sceneGraph The SceneGraph to add nodes to
 * @param options Configuration options for node generation
 * @returns Array of generated node IDs
 */
export function generateRandomNodes(
  graph: Graph,
  options: RandomNodeOptions = {}
): NodeId[] {
  const {
    nodeCount = 10,
    nodeTypes = ["Person", "Concept", "Event", "Place", "Document"],
    nodeTags = [
      ["important", "draft"],
      ["research", "personal"],
      ["historical", "current"],
    ],
    labelPrefix = "Node",
    addRandomTags = true,
    minTagsPerNode = 0,
    maxTagsPerNode = 3,
  } = options;

  const generatedNodeIds: NodeId[] = [];

  for (let i = 0; i < nodeCount; i++) {
    // Generate random properties
    const id = uuidv4() as NodeId;
    const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    const label = `${labelPrefix}_${i}_${type}`;

    // Generate random tags if enabled
    const tags: string[] = [];
    if (addRandomTags && nodeTags.length > 0) {
      const tagCount =
        Math.floor(Math.random() * (maxTagsPerNode - minTagsPerNode + 1)) +
        minTagsPerNode;
      for (let j = 0; j < tagCount; j++) {
        const tagGroup = nodeTags[Math.floor(Math.random() * nodeTags.length)];
        const tag = tagGroup[Math.floor(Math.random() * tagGroup.length)];
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      }
    }

    // Create node with userData
    const node = graph.createNode(id, {
      type,
      label,
      userData: {
        color: getRandomColor(),
        description: `Random ${type} node generated for testing`,
        createdAt: new Date().toISOString(),
        importance: Math.floor(Math.random() * 10) + 1,
      },
    });

    // Add tags to the node
    tags.forEach((tag) => node.addTag(tag));

    generatedNodeIds.push(id);
  }

  return generatedNodeIds;
}

/**
 * Generates random edges between existing nodes in a SceneGraph
 * @param sceneGraph The SceneGraph to add edges to
 * @param nodeIds Array of node IDs to connect with edges
 * @param options Configuration options for edge generation
 * @returns Number of edges generated
 */
export function generateRandomEdges(
  graph: Graph,
  nodeIds: NodeId[],
  options: RandomEdgeOptions = {}
): number {
  const {
    edgeTypes = [
      "CONNECTS",
      "RELATES_TO",
      "INFLUENCES",
      "PART_OF",
      "REFERENCES",
    ],
    edgeTags = [
      ["strong", "weak"],
      ["direct", "indirect"],
      ["verified", "unverified"],
    ],
    labelPrefix = "Edge",
    addRandomTags = true,
    minTagsPerEdge = 0,
    maxTagsPerEdge = 2,
    connectionDensity = 0.3, // Default 30% of possible connections
    allowSelfLoops = false,
    allowMultiEdges = false,
  } = options;

  if (nodeIds.length < 2) return 0;

  let edgeCount = 0;
  const connections = new Set<string>(); // Track created connections to avoid duplicates

  // Calculate how many edges to create based on density
  const maxPossibleEdges = allowSelfLoops
    ? nodeIds.length * nodeIds.length
    : nodeIds.length * (nodeIds.length - 1);

  const targetEdgeCount = Math.floor(maxPossibleEdges * connectionDensity);

  while (edgeCount < targetEdgeCount) {
    // Select random source and target nodes
    const sourceIndex = Math.floor(Math.random() * nodeIds.length);
    const targetIndex = Math.floor(Math.random() * nodeIds.length);
    const source = nodeIds[sourceIndex];
    const target = nodeIds[targetIndex];

    // Skip if self-loop is not allowed
    if (!allowSelfLoops && source === target) continue;

    const connectionKey = `${source}-${target}`;

    // Skip if connection already exists and multi-edges not allowed
    if (!allowMultiEdges && connections.has(connectionKey)) continue;

    // Generate random properties
    const type = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];
    const label = `${labelPrefix}_${edgeCount}_${type}`;

    // Generate random tags
    const tags: string[] = [];
    if (addRandomTags && edgeTags.length > 0) {
      const tagCount =
        Math.floor(Math.random() * (maxTagsPerEdge - minTagsPerEdge + 1)) +
        minTagsPerEdge;
      for (let j = 0; j < tagCount; j++) {
        const tagGroup = edgeTags[Math.floor(Math.random() * edgeTags.length)];
        const tag = tagGroup[Math.floor(Math.random() * tagGroup.length)];
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      }
    }

    // Create the edge
    const edge = graph.createEdge(source, target, {
      type,
      label,
      userData: {
        weight: Math.random() * 10,
        strength: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date().toISOString(),
      },
    });

    // Add tags to the edge
    tags.forEach((tag) => edge.addTag(tag));

    connections.add(connectionKey);
    edgeCount++;
  }

  return edgeCount;
}

/**
 * Creates a completely random graph with nodes and edges
 * @param sceneGraph The SceneGraph to add the random graph to
 * @param nodeOptions Configuration options for node generation
 * @param edgeOptions Configuration options for edge generation
 * @returns An object containing the generated node IDs and edge count
 */
export function generateRandomGraph(
  sceneGraph: SceneGraph,
  nodeOptions: RandomNodeOptions = {},
  edgeOptions: RandomEdgeOptions = {}
): { nodeIds: NodeId[]; edgeCount: number } {
  // First create random nodes
  const nodeIds = generateRandomNodes(sceneGraph.getGraph(), nodeOptions);

  // Then create random edges between those nodes
  const edgeCount = generateRandomEdges(
    sceneGraph.getGraph(),
    nodeIds,
    edgeOptions
  );

  // Notify that the graph has changed
  sceneGraph.notifyGraphChanged();

  return { nodeIds, edgeCount };
}

/**
 * Adds a random cluster of interconnected nodes around a specified center node
 * @param sceneGraph The SceneGraph to add the cluster to
 * @param centerNodeId The ID of the node to build the cluster around
 * @param clusterSize Number of nodes in the cluster
 * @param connectivityDensity Density of connections within the cluster (0-1)
 * @returns The IDs of all nodes in the cluster (including the center)
 */
export function addRandomCluster(
  sceneGraph: SceneGraph,
  centerNodeId: NodeId,
  clusterSize: number = 5,
  connectivityDensity: number = 0.7
): NodeId[] {
  const clusterNodeIds = [centerNodeId];

  // Create cluster nodes
  const newNodes = generateRandomNodes(sceneGraph.getGraph(), {
    nodeCount: clusterSize,
    addRandomTags: true,
    labelPrefix: `Cluster_${centerNodeId.substring(0, 4)}`,
  });

  clusterNodeIds.push(...newNodes);

  // Connect all nodes to center
  for (const nodeId of newNodes) {
    sceneGraph.getGraph().createEdge(centerNodeId, nodeId, {
      type: "CLUSTER_LINK",
      userData: {
        weight: 2,
        strength: 5,
      },
    });
  }

  // Add additional interconnections based on density
  generateRandomEdges(sceneGraph.getGraph(), newNodes, {
    connectionDensity: connectivityDensity,
    edgeTypes: ["CLUSTER_INTERNAL"],
    allowSelfLoops: false,
  });

  sceneGraph.notifyGraphChanged();

  return clusterNodeIds;
}
