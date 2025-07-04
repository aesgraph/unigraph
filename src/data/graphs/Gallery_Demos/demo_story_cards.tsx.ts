import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { createSampleStoryCardEntities } from "../../../core/types/StoryCard";

export const demo_SceneGraph_StoryCards = () => {
  const graph = new Graph();

  for (const storyCard of createSampleStoryCardEntities()) {
    graph.createNode({
      id: storyCard.getId(),
      type: "storyCard",
      userData: {
        title: storyCard.getTitle(),
        description: storyCard.getDescription(),
        tags: storyCard.getData().tags,
        storyCard: storyCard,
      },
    });
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "StoryCard Demo",
      description: "For demonstrating story cards in a scene graph.",
    },
  });
};
