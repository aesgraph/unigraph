import { ForceGraph3DInstance } from "3d-force-graph";
import { v4 as uuidv4 } from "uuid";
import { SceneGraph } from "../../core/model/SceneGraph";
import { getRandomColorFromPalette } from "../../utils/colorUtils";

const NODE_TYPES = [
  "type0",
  "type1",
  "type2",
  "type3",
  "type4",
  "type5",
  "type6",
  "type7",
  "type8",
  "type9",
];

const NODE_TAGS = [
  "tag0",
  "tag1",
  "tag2",
  "tag3",
  "tag4",
  "tag5",
  "tag6",
  "tag7",
  "tag8",
  "tag9",
];

const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomTags = (count: number = 2): Set<string> => {
  const tags = new Set<string>();
  while (tags.size < count) {
    tags.add(getRandomItem(NODE_TAGS));
  }
  return tags;
};

export const addRandomNodes = (
  sceneGraph: SceneGraph,
  forceGraph3DInstance: ForceGraph3DInstance,
  count: number = 1
) => {
  const newNodes = [];

  for (let i = 0; i < count; i++) {
    const nodeId = uuidv4();

    const node = sceneGraph.getGraph().createNode({
      id: nodeId,
      type: getRandomItem(NODE_TYPES),
      tags: getRandomTags(),
    });

    let addedToConfig = false;
    if (!sceneGraph.getData().displayConfig.nodeConfig.types[node.getType()]) {
      sceneGraph.getData().displayConfig.nodeConfig.types[node.getType()] = {
        color: getRandomColorFromPalette(),
        isVisible: true,
      };
      addedToConfig = true;
    }

    node.getTags().forEach((tag) => {
      if (!sceneGraph.getData().displayConfig.nodeConfig.tags[tag]) {
        sceneGraph.getData().displayConfig.nodeConfig.tags[tag] = {
          color: getRandomColorFromPalette(),
          isVisible: true,
        };
        addedToConfig = true;
      }
    });

    newNodes.push({
      id: nodeId,
      // Add random initial position for better force layout
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 100 - 50,
    });

    if (addedToConfig) {
      console.log("Added new node configuration!");
      sceneGraph.notifyDisplayConfigChanged();
    }
  }

  // Update force graph with new nodes
  const currentData = forceGraph3DInstance.graphData();
  forceGraph3DInstance.graphData({
    nodes: [...currentData.nodes, ...newNodes],
    links: currentData.links,
  });
};
