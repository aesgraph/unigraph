import { ForceGraph3DInstance } from "3d-force-graph";
import { SongAnnotationData } from "../../../mp3/SongAnnotation";
import { SceneGraph } from "../../model/SceneGraph";

interface SpawnerConfig {
  maxNodes?: number; // Maximum number of nodes to spawn per annotation
  spawnRadius?: number; // Distance from parent node
  nodeColor?: string; // Color of spawned nodes
  nodeSize?: number; // Size of spawned nodes
  fadeOutDuration?: number; // How long nodes take to fade out (ms)
  linkColor?: string; // Color of links to parent nodes
}

const DEFAULT_CONFIG: SpawnerConfig = {
  maxNodes: 3,
  spawnRadius: 30,
  nodeColor: "#ff88cc",
  nodeSize: 5,
  fadeOutDuration: 2000,
  linkColor: "#ff88cc44",
};

export function createAnnotationNodeSpawner(
  graph: ForceGraph3DInstance,
  annotations: SongAnnotationData[],
  config: SpawnerConfig = {},
  sceneGraph: SceneGraph
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let isPlaying = false;
  let startTime: number | null = null;
  let lastSpawnTime = 0;
  let nodeIdCounter = 0;
  let animationFrame: number;

  // Get initial graph data
  const graphData = graph.graphData();
  const existingNodes = new Set(graphData.nodes.map((node) => node.id));

  function _getRandomExistingNode() {
    const nodes = graphData.nodes.filter((node) => existingNodes.has(node.id));
    return nodes[Math.floor(Math.random() * nodes.length)];
  }

  function getRandomNode() {
    return graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)];
  }

  function createSpawnedNode(parentNode: any, annotation: SongAnnotationData) {
    const angle = Math.random() * Math.PI * 2;
    const distance = finalConfig.spawnRadius!;

    const spawnedNode = {
      id: `spawn-${nodeIdCounter++}`,
      x: parentNode.x + distance * Math.cos(angle),
      y: parentNode.y + distance * Math.sin(angle),
      z: parentNode.z + (Math.random() - 0.5) * distance,
      color: finalConfig.nodeColor,
      size: finalConfig.nodeSize,
      annotation: annotation,
      __spawnTime: Date.now(),
    };

    const link = {
      source: parentNode.id,
      target: spawnedNode.id,
      color: finalConfig.linkColor,
    };

    // Add new elements
    console.log("adding elements", spawnedNode, link);
    sceneGraph.getGraph().createNode(spawnedNode.id);
    const edge = sceneGraph.getGraph().createEdge(link.source, link.target);
    graphData.nodes.push(spawnedNode);
    graphData.links.push({ ...link, id: edge.getId() } as any);
    graph.refresh();

    // Schedule fadeout
    setTimeout(() => {
      //   graphData.nodes = graphData.nodes.filter((n) => n.id !== spawnedNode.id);
      //   graphData.links = graphData.links.filter(
      //     (l) => l.target !== spawnedNode.id
      //   );
      //   graph.graphData(graphData);
    }, finalConfig.fadeOutDuration);

    return spawnedNode;
  }

  function spawnNodesForAnnotation(annotation: SongAnnotationData) {
    const numNodesToSpawn = Math.ceil(Math.random() * finalConfig.maxNodes!);

    for (let i = 0; i < numNodesToSpawn; i++) {
      //   const parentNode = getRandomExistingNode();
      const parentNode = getRandomNode();
      if (parentNode) {
        createSpawnedNode(parentNode, annotation);
      }
    }

    // Update the graph
    graph.graphData(graphData);
  }

  function animate(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const currentTime = (timestamp - startTime) / 1000; // Convert to seconds

    updateSpawner(currentTime);

    if (isPlaying) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function updateSpawner(currentTime: number) {
    if (!isPlaying) return;

    const currentTimeFixed = Number(currentTime.toFixed(2));
    const lastSpawnTimeFixed = Number(lastSpawnTime.toFixed(2));

    annotations.forEach((annotation) => {
      const annotationTimeFixed = Number(annotation.time.toFixed(2));

      if (
        annotationTimeFixed > lastSpawnTimeFixed &&
        annotationTimeFixed <= currentTimeFixed
      ) {
        console.log(
          `Spawning nodes for annotation at time ${annotationTimeFixed}`
        );
        spawnNodesForAnnotation(annotation);
      }
    });

    lastSpawnTime = currentTime;
  }

  return {
    start: () => {
      isPlaying = true;
      startTime = null;
      lastSpawnTime = 0;
      animationFrame = requestAnimationFrame(animate);
    },
    stop: () => {
      isPlaying = false;
      startTime = null;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    },
    updateTime: updateSpawner, // Keep this for optional external time control
  };
}

// Example usage:
/*
const spawner = createAnnotationNodeSpawner(forceGraphInstance, annotations, {
  maxNodes: 5,
  spawnRadius: 50,
  nodeColor: '#ff88cc',
  nodeSize: 8,
  fadeOutDuration: 3000,
  linkColor: '#ff88cc44'
});

// Start spawning
spawner.start();

// Update on audio time change
audioPlayer.addEventListener('timeupdate', (event) => {
  spawner.updateTime(event.currentTime);
});

// Stop spawning
spawner.stop();
*/
