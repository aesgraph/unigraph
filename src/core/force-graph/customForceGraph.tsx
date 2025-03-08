// import React, { useEffect, useRef } from "react";
// import ForceGraph3D from "3d-force-graph";
// import {
//   forceSimulation,
//   forceManyBody,
//   forceLink,
//   forceCenter,
// } from "d3-force-3d";

// interface NodeData {
//   id: number;
//   group: number;
//   size: number;
//   x?: number;
//   y?: number;
//   z?: number;
// }

// interface LinkData {
//   source: number;
//   target: number;
//   strength: number;
// }

// interface GraphData {
//   nodes: NodeData[];
//   links: LinkData[];
// }

// interface Props {
//   domElement: HTMLElement;
// }

// const CustomForceGraph: React.FC<Props> = ({ domElement }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const graphRef = useRef<any>(null);

//   // Sample data
//   const data: GraphData = {
//     nodes: Array.from({ length: 30 }, (_, i) => ({
//       id: i,
//       group: Math.floor(i / 10),
//       size: Math.random() * 10 + 5,
//     })),
//     links: Array.from({ length: 50 }, () => ({
//       source: Math.floor(Math.random() * 30),
//       target: Math.floor(Math.random() * 30),
//       strength: Math.random(),
//     })),
//   };

//   useEffect(() => {
//     if (!domElement) return;

//     // Initialize the force graph
//     const Graph = new ForceGraph3D(domElement)
//       .graphData(data)
//       .nodeLabel((node: NodeData) => `Node ${node.id}`)
//       .linkWidth((link: LinkData) => link.strength * 2)
//       .linkDirectionalParticles(3)
//       .linkDirectionalParticleSpeed((d: LinkData) => d.strength * 0.01)
//       .linkDirectionalParticleWidth(2);

//     // Custom force simulation
//     const simulation = forceSimulation<NodeData, LinkData>()
//       .force(
//         "link",
//         forceLink<NodeData, LinkData>()
//           .id((d: NodeData) => d.id)
//           .distance((d: LinkData) => 100 / (d.strength + 0.5))
//           .strength((d: LinkData) => d.strength * 0.2)
//       )
//       .force(
//         "charge",
//         forceManyBody<NodeData>()
//           .strength((d: NodeData) => -50 * d.size)
//           .distanceMax(300)
//       )
//       .force("center", forceCenter<NodeData>())
//       // Custom force to create orbital motion
//       .force("orbital", (nodes: NodeData[]) => {
//         nodes.forEach((node) => {
//           if (typeof node.x === "number" && typeof node.z === "number") {
//             const distance = Math.sqrt(node.x * node.x + node.z * node.z);
//             if (distance > 0) {
//               const angle = Math.atan2(node.z, node.x) + 0.001;
//               node.x = distance * Math.cos(angle);
//               node.z = distance * Math.sin(angle);
//             }
//           }
//         });
//       })
//       // Custom force for vertical separation by group
//       .force("group", (nodes: NodeData[]) => {
//         nodes.forEach((node) => {
//           if (typeof node.y === "number") {
//             node.y += (node.group * 50 - node.y) * 0.1;
//           }
//         });
//       });

//     Graph.d3Force("link", simulation.force("link"));
//     Graph.d3Force("charge", simulation.force("charge"));
//     Graph.d3Force("center", simulation.force("center"));
//     Graph.d3Force("orbital", simulation.force("orbital"));
//     Graph.d3Force("group", simulation.force("group"));

//     // Custom node animation
//     let angle = 0;
//     Graph.onEngineTick(() => {
//       angle += 0.002;
//       Graph.graphData().nodes.forEach((node: NodeData) => {
//         node.size = Math.abs(Math.sin(angle + node.id * 0.5)) * 5 + 5;
//       });
//     });

//     // Custom link animation
//     Graph.linkDirectionalParticleColor(() => {
//       const progress = (Date.now() / 1000) % 1;
//       return `hsl(${progress * 360}, 70%, 50%)`;
//     });

//     // Camera animation
//     let distance = 500;
//     Graph.cameraPosition({ x: distance, y: 50, z: 0 });

//     const rotateCameraInterval = setInterval(() => {
//       const angle = (Date.now() / 1000) % (2 * Math.PI);
//       Graph.cameraPosition({
//         x: distance * Math.cos(angle),
//         y: 50,
//         z: distance * Math.sin(angle),
//       });
//     }, 30);

//     graphRef.current = Graph;

//     // Cleanup
//     return () => {
//       Graph.pauseAnimation();
//       clearInterval(rotateCameraInterval);
//     };
//   }, [domElement]);

//   const handleNodeClick = (node: NodeData) => {
//     if (
//       !graphRef.current ||
//       typeof node.x !== "number" ||
//       typeof node.y !== "number" ||
//       typeof node.z !== "number"
//     )
//       return;

//     const distance = 200;
//     const angle = Math.random() * 2 * Math.PI;

//     const pos = graphRef.current.cameraPosition();
//     const targetPos = {
//       x: node.x + distance * Math.cos(angle),
//       y: node.y + 50,
//       z: node.z + distance * Math.sin(angle),
//     };

//     const startTime = Date.now();
//     const duration = 1000;

//     const animate = () => {
//       if (!graphRef.current) return;

//       const t = Math.min((Date.now() - startTime) / duration, 1);
//       const k = 1 - Math.pow(1 - t, 3); // Cubic easing

//       graphRef.current.cameraPosition({
//         x: pos.x + (targetPos.x - pos.x) * k,
//         y: pos.y + (targetPos.y - pos.y) * k,
//         z: pos.z + (targetPos.z - pos.z) * k,
//       });

//       if (t < 1) requestAnimationFrame(animate);
//     };

//     animate();
//   };

//   return (
//     <div className="w-full h-screen" ref={containerRef}>
//       <div className="absolute top-4 left-4 bg-white p-4 rounded shadow">
//         <h2 className="text-lg font-bold mb-2">Graph Controls</h2>
//         <ul className="text-sm">
//           <li>• Click nodes to focus camera</li>
//           <li>• Drag to rotate</li>
//           <li>• Scroll to zoom</li>
//           <li>• Right-click drag to pan</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default CustomForceGraph;
