import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import ForceGraph3D from "3d-force-graph";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const UnifiedForceGraphs = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<any>(null);
  const customLinesRef = useRef<THREE.Line[]>([]);

  useEffect(() => {
    // Sample data for two separate graphs
    const graph1Data = {
      nodes: [
        { id: "A1", group: 1, x: -50 }, // Offset first graph to the left
        { id: "B1", group: 1, x: -50 },
        { id: "C1", group: 2, x: -50 },
        { id: "D1", group: 2, x: -50 },
      ],
      links: [
        { source: "A1", target: "B1", group: 1 },
        { source: "B1", target: "C1", group: 1 },
        { source: "C1", target: "D1", group: 1 },
        { source: "D1", target: "A1", group: 1 },
      ],
    };

    const graph2Data = {
      nodes: [
        { id: "A2", group: 2, x: 50 }, // Offset second graph to the right
        { id: "B2", group: 2, x: 50 },
        { id: "C2", group: 2, x: 50 },
        { id: "D2", group: 2, x: 50 },
      ],
      links: [
        { source: "A2", target: "B2", group: 2 },
        { source: "B2", target: "C2", group: 2 },
        { source: "C2", target: "D2", group: 2 },
        { source: "D2", target: "A2", group: 2 },
      ],
    };

    // Combine both graphs into a single dataset
    const combinedData = {
      nodes: [...graph1Data.nodes, ...graph2Data.nodes],
      links: [...graph1Data.links, ...graph2Data.links],
    };

    // Initialize the force graph
    const Graph = new ForceGraph3D(containerRef.current!)
      .graphData(combinedData)
      .nodeColor((node) => ((node as any).group === 1 ? "#ff6b6b" : "#4ecdc4"))
      .linkColor((link) => ((link as any).group === 1 ? "#ff6b6b" : "#4ecdc4"))
      .nodeLabel((node) => (node as any).id)
      .width(800)
      .height(600);

    // Custom force configuration to keep graphs separated
    if (Graph) {
      Graph.d3Force("charge")!.strength(-120);
      Graph.d3Force("link")!.distance(30);
    }

    // Add custom force to maintain separation between graphs
    Graph.d3Force("group", () => {
      combinedData.nodes.forEach((node: any) => {
        if (node.group === 1) {
          node.fx = node.x < 0 ? node.x : -50; // Keep group 1 on the left
        } else {
          node.fx = node.x > 0 ? node.x : 50; // Keep group 2 on the right
        }
      });
    });

    const controls = Graph.controls() as OrbitControls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.8;

    // Custom rendering logic to draw lines between nodes of the two graphs
    const customLinks = [
      { source: "A1", target: "A2" },
      { source: "B1", target: "B2" },
      { source: "C1", target: "C2" },
      { source: "D1", target: "D2" },
    ];

    const lineMaterial = new THREE.LineBasicMaterial({ color: "#888" });

    Graph.onEngineTick(() => {
      // Remove previous lines
      customLinesRef.current.forEach((line) => {
        Graph.scene().remove(line);
      });
      customLinesRef.current = [];

      customLinks.forEach((link) => {
        const sourceNode = Graph.graphData().nodes.find(
          (node: any) => node.id === link.source
        );
        const targetNode = Graph.graphData().nodes.find(
          (node: any) => node.id === link.target
        );

        if (sourceNode && targetNode) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
            new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z),
          ]);

          const line = new THREE.Line(geometry, lineMaterial);
          Graph.scene().add(line);
          customLinesRef.current.push(line);
        }
      });
    });

    // Store reference for cleanup
    graphRef.current = Graph;

    // Cleanup
    return () => {
      Graph._destructor();
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-4">Unified Force Graphs</h1>
      <div ref={containerRef} className="w-full h-96 bg-gray-100 rounded-lg" />
      <div className="mt-4 text-sm text-gray-600">
        Two force-directed graphs rendered in the same WebGL scene
      </div>
    </div>
  );
};

export default UnifiedForceGraphs;
