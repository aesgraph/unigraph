// import { ForceGraph3DInstance } from "3d-force-graph";
// import { SceneGraph } from "../../model/SceneGraphv2";

// interface BurstConfig {
//   numNodes?: number; // Number of nodes to spawn in burst
//   burstRadius?: number; // Radius of burst sphere
//   nodeColor?: string; // Color of spawned nodes
//   nodeSize?: number; // Size of spawned nodes
//   edgesPerNode?: number; // Number of connections per new node
//   linkColor?: string; // Color of connections
//   expandDuration?: number; // How long the burst takes to expand (ms)
//   springLength?: number; // Length of connection springs
// }

// const DEFAULT_CONFIG: BurstConfig = {
//   numNodes: 20,
//   burstRadius: 100,
//   nodeColor: "#88ccff",
//   nodeSize: 5,
//   edgesPerNode: 3,
//   linkColor: "#88ccff44",
//   expandDuration: 1000,
//   springLength: 50,
// };

// export function createBurst(
//   graph: ForceGraph3DInstance,
//   sceneGraph: SceneGraph,
//   centerNodeId: string,
//   config: BurstConfig = {}
// ) {
//   const finalConfig = { ...DEFAULT_CONFIG, ...config };
//   const graphData = graph.graphData();
//   let nodeIdCounter = 0;

//   // Helper to generate a point on a sphere
//   function getRandomSpherePoint(radius: number): [number, number, number] {
//     const theta = 2 * Math.PI * Math.random();
//     const phi = Math.acos(2 * Math.random() - 1);
//     return [
//       radius * Math.sin(phi) * Math.cos(theta),
//       radius * Math.sin(phi) * Math.sin(theta),
//       radius * Math.cos(phi),
//     ];
//   }

//   // Find center node
//   const centerNode = graphData.nodes.find((n) => n.id === centerNodeId);
//   if (!centerNode) {
//     console.error("Center node not found");
//     return;
//   }

//   // Create burst nodes
//   const newNodes = Array(finalConfig.numNodes)
//     .fill(0)
//     .map(() => {
//       const nodeId = `burst-${nodeIdCounter++}`;
//       const [x, y, z] = getRandomSpherePoint(0.1); // Start very close to center

//       // Create node in scene graph
//       sceneGraph.getGraph().createNode(nodeId, {
//         type: "burst-node",
//         tags: new Set(["burst"]),
//       });

//       return {
//         id: nodeId,
//         x: centerNode.x + x,
//         y: centerNode.y + y,
//         z: centerNode.z + z,
//         color: finalConfig.nodeColor,
//         size: finalConfig.nodeSize,
//         __targetPos: getRandomSpherePoint(finalConfig.burstRadius!),
//       };
//     });

//   // Create edges
//   const newLinks = [];
//   for (const node of newNodes) {
//     // Always connect to center
//     const centerEdge = sceneGraph.getGraph().createEdge(centerNodeId, node.id, {
//       type: "burst-edge",
//       tags: new Set(["burst"]),
//     });

//     newLinks.push({
//       source: centerNodeId,
//       target: node.id,
//       color: finalConfig.linkColor,
//       id: centerEdge.getId(),
//     });

//     // Connect to random other new nodes
//     for (let i = 0; i < finalConfig.edgesPerNode!; i++) {
//       const otherNode = newNodes[Math.floor(Math.random() * newNodes.length)];
//       if (otherNode.id !== node.id) {
//         const edge = sceneGraph.getGraph().createEdge(node.id, otherNode.id, {
//           type: "burst-edge",
//           tags: new Set(["burst"]),
//         });

//         newLinks.push({
//           source: node.id,
//           target: otherNode.id,
//           color: finalConfig.linkColor,
//           id: edge.getId(),
//         });
//       }
//     }
//   }

//   // Add all new elements to graph
//   graphData.nodes.push(...newNodes);
//   graphData.links.push(...newLinks);
//   graph.graphData(graphData);

//   // Animate expansion
//   const startTime = Date.now();
//   function animate() {
//     const elapsedTime = Date.now() - startTime;
//     const progress = Math.min(elapsedTime / finalConfig.expandDuration!, 1);

//     // Update positions
//     newNodes.forEach((node) => {
//       const [targetX, targetY, targetZ] = node.__targetPos;
//       node.x = centerNode.x + targetX * progress;
//       node.y = centerNode.y + targetY * progress;
//       node.z = centerNode.z + targetZ * progress;
//     });

//     graph.refresh();

//     if (progress < 1) {
//       requestAnimationFrame(animate);
//     }
//   }

//   // Start animation
//   requestAnimationFrame(animate);

//   // Return cleanup function
//   return () => {
//     // Remove burst nodes and edges from both graph and scene graph
//     const nodeIds = newNodes.map((n) => n.id);
//     graphData.nodes = graphData.nodes.filter((n) => !nodeIds.includes(n.id));
//     graphData.links = graphData.links.filter(
//       (l) => !nodeIds.includes(l.source.id) && !nodeIds.includes(l.target.id)
//     );
//     graph.graphData(graphData);

//     nodeIds.forEach((id) => {
//       sceneGraph.getGraph().removeNode(id);
//     });
//   };
// }

// // Example usage:
// /*
// const cleanup = createBurst(forceGraphInstance, sceneGraph, centerNodeId, {
//   numNodes: 30,
//   burstRadius: 150,
//   nodeColor: "#ff88cc",
//   nodeSize: 5,
//   edgesPerNode: 2,
//   linkColor: "#ff88cc44",
//   expandDuration: 1500,
//   springLength: 80
// });

// // Later, to clean up:
// cleanup();
// */
