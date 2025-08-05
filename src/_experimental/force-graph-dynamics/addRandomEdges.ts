import { ForceGraph3DInstance } from "3d-force-graph";
import { SceneGraph } from "../../core/model/SceneGraph";
import { GetRandomNodeFromSceneGraph } from "../../core/model/utils";
import { getRandomColorFromPalette } from "../../utils/colorUtils";

const EDGE_TYPES = [
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

const EDGE_TAGS = [
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
    tags.add(getRandomItem(EDGE_TAGS));
  }
  return tags;
};

export const addRandomEdges = (
  sceneGraph: SceneGraph,
  forceGraph3DInstance: ForceGraph3DInstance
) => {
  const node1 = GetRandomNodeFromSceneGraph(sceneGraph);
  const node2 = GetRandomNodeFromSceneGraph(sceneGraph);

  const edge = sceneGraph
    .getGraph()
    .createEdgeIfMissing(node1.getId(), node2.getId(), {
      type: getRandomItem(EDGE_TYPES),
      tags: getRandomTags(),
    });

  let addedToConfig = false;
  if (!sceneGraph.getData().displayConfig.edgeConfig.types[edge.getType()]) {
    sceneGraph.getData().displayConfig.edgeConfig.types[edge.getType()] = {
      color: getRandomColorFromPalette(),
      isVisible: true,
    };
    addedToConfig = true;
  }

  edge.getTags().forEach((tag) => {
    if (!sceneGraph.getData().displayConfig.edgeConfig.tags[tag]) {
      sceneGraph.getData().displayConfig.edgeConfig.tags[tag] = {
        color: getRandomColorFromPalette(),
        isVisible: true,
      };
      addedToConfig = true;
    }
  });

  if (addedToConfig) {
    console.log("added to config!");
    sceneGraph.notifyDisplayConfigChanged();
  }

  forceGraph3DInstance.graphData({
    nodes: forceGraph3DInstance.graphData().nodes,
    links: sceneGraph
      .getGraph()
      .getEdges()
      .map((edge) => ({
        id: edge.getId(),
        source: edge.getSource(),
        target: edge.getTarget(),
      })),
  });
};
