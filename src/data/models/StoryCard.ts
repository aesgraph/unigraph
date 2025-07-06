import { EdgeId } from "../../core/model/Edge";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";

/**
 * Interface representing a story card node
 */
export interface StoryCard {
  id: string;
  title: string;
  description: string;
  markdownFile?: string; // Path to markdown file - can be absolute (public/storyCardFiles/file.md, docs/file.md) or relative
  metadata?: {
    tags?: string[];
    author?: string;
    createdAt?: string;
    difficulty?: number;
    imageUrl?: string;
    position?: { x: number; y: number; z: number };
  };
}

/**
 * Interface for entity representation in Unigraph
 */
export interface StoryCardEntity {
  id: string;
  type: "StoryCard";
  data: StoryCard;
}

/**
 * Creates a new story card
 */
export function createStoryCard(
  id: string,
  title: string,
  description: string
): StoryCard {
  return {
    id,
    title,
    description,
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Creates a new story card with markdown content
 */
export function createMarkdownStoryCard(
  id: string,
  title: string,
  markdownFile: string
): StoryCard {
  return {
    id,
    title,
    description: `Loading content from ${markdownFile}...`,
    markdownFile,
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Adds a story card to a scene graph
 * @param sceneGraph The scene graph to add the card to
 * @param card The story card to add
 * @returns The node ID of the created card
 */
export function addStoryCardToGraph(
  sceneGraph: SceneGraph,
  card: StoryCard
): NodeId {
  const node = sceneGraph.getGraph().createNode({
    id: card.id,
    label: card.title,
    type: "StoryCard",
    description: card.description,
    userData: card,
  });

  // If position information exists, set the node position
  if (card.metadata?.position) {
    node.setPosition(card.metadata.position);
  }

  return node.getId();
}

/**
 * Creates a choice connection between two story cards
 * @param sceneGraph The scene graph to add the connection to
 * @param parentCardId The ID of the parent card
 * @param childCardId The ID of the child card
 * @param choiceLabel Optional label for the choice
 * @returns The edge ID of the created connection
 */
export function createStoryChoice(
  sceneGraph: SceneGraph,
  parentCardId: NodeId,
  childCardId: NodeId,
  choiceLabel?: string
): EdgeId {
  const edge = sceneGraph.getGraph().createEdge(parentCardId, childCardId, {
    type: "StoryChoice",
    label: choiceLabel || "Choice",
  });

  return edge.getId();
}

/**
 * Gets all child story cards for a given parent
 * @param sceneGraph The scene graph to search in
 * @param parentCardId The ID of the parent card
 * @returns An array of child story card nodes
 */
export function getChildStoryCards(
  sceneGraph: SceneGraph,
  parentCardId: NodeId
): NodeId[] {
  const outgoingEdges = sceneGraph.getGraph().getEdgesFrom(parentCardId);
  return outgoingEdges
    .filter((edge) => edge.getType() === "StoryChoice")
    .map((edge) => edge.getTarget());
}

/**
 * Gets the parent story card for a given child
 * @param sceneGraph The scene graph to search in
 * @param childCardId The ID of the child card
 * @returns The parent card node ID, or null if no parent exists
 */
export function getParentStoryCard(
  sceneGraph: SceneGraph,
  childCardId: NodeId
): NodeId | null {
  const incomingEdges = sceneGraph.getGraph().getEdgesTo(childCardId);
  const parentEdges = incomingEdges.filter(
    (edge) => edge.getType() === "StoryChoice"
  );

  if (parentEdges.length === 0) {
    return null;
  }

  return parentEdges[0].getSource();
}

/**
 * Finds the root card of a story tree
 * @param sceneGraph The scene graph to search in
 * @returns The root card node ID, or null if no root is found
 */
export function findRootStoryCard(sceneGraph: SceneGraph): NodeId | null {
  const storyCardNodes = sceneGraph
    .getGraph()
    .getNodes()
    .filter((node) => node.getType() === "StoryCard");

  for (const node of storyCardNodes) {
    const incomingEdges = sceneGraph.getGraph().getEdgesTo(node.getId());
    const isRoot = incomingEdges.every(
      (edge) => edge.getType() !== "StoryChoice"
    );

    if (isRoot) {
      return node.getId();
    }
  }

  return null;
}

/**
 * Reconstructs a hierarchical story tree from a flat graph representation
 * This is useful for UI display purposes
 * @param sceneGraph The scene graph containing the story cards
 * @param rootNodeId The ID of the root story card node
 * @returns The reconstructed hierarchical story tree
 */
export function reconstructStoryHierarchy(
  sceneGraph: SceneGraph,
  rootNodeId: NodeId
): {
  card: StoryCard;
  children: Array<{ card: StoryCard; children: any[] }>;
} | null {
  const rootNode = sceneGraph.getGraph().getNode(rootNodeId);
  if (!rootNode) return null;

  const processedNodes = new Set<NodeId>();

  function buildHierarchy(nodeId: NodeId): {
    card: StoryCard;
    children: any[];
  } {
    if (processedNodes.has(nodeId)) {
      // Prevent cycles
      return {
        card: {
          id: nodeId,
          title: "[Circular Reference]",
          description: "This is a circular reference.",
        },
        children: [],
      };
    }

    processedNodes.add(nodeId);

    const node = sceneGraph.getGraph().getNode(nodeId);
    const childIds = getChildStoryCards(sceneGraph, nodeId);
    const children = childIds.map((childId) => buildHierarchy(childId));

    const nodeData = node.getData() as any;
    const card: StoryCard = {
      id: node.getId(),
      title: node.getLabel(),
      description: node.getDescription(),
      metadata: nodeData.metadata || {},
    };

    return { card, children };
  }

  return buildHierarchy(rootNodeId);
}

/**
 * Adds a complete story tree to a scene graph using a compositional approach
 * @param sceneGraph The scene graph to add to
 * @param storyTree The hierarchical story tree to add
 * @returns A map of story card IDs to their node IDs in the graph
 */
export function addStoryTreeToGraph(
  sceneGraph: SceneGraph,
  storyTree: any
): Map<string, NodeId> {
  const nodeMap = new Map<string, NodeId>();

  function processNode(node: any, parentId?: NodeId) {
    const card: StoryCard = {
      id: node.id,
      title: node.title,
      description: node.description,
      metadata: node.metadata || {},
    };

    const nodeId = addStoryCardToGraph(sceneGraph, card);
    nodeMap.set(card.id, nodeId);

    if (parentId) {
      createStoryChoice(sceneGraph, parentId, nodeId);
    }

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        processNode(child, nodeId);
      }
    }
  }

  processNode(storyTree);
  return nodeMap;
}

// The sample data remains the same but is conceptually different -
// it's a hierarchical representation that will be converted to a flat graph structure
export const SAMPLE_STORY_TREE = {
  id: "start",
  title: "The Beginning of Your Journey",
  description: "You stand at a crossroads, uncertain of which path to take...",
  children: [
    {
      id: "forest",
      title: "The Enchanted Forest",
      description:
        "A path leads into a mysterious forest filled with ancient magic.",
      children: [
        {
          id: "forest-fairy",
          title: "Meet the Fairy Queen",
          description:
            "You encounter a gathering of luminous beings led by their ethereal queen.",
          children: [
            {
              id: "forest-fairy-help",
              title: "Offer Your Help",
              description:
                "You pledge to assist the fairy folk with their mysterious ritual.",
            },
            {
              id: "forest-fairy-learn",
              title: "Learn Their Magic",
              description:
                "You ask to be taught the ancient ways of fairy magic.",
            },
            {
              id: "forest-fairy-leave",
              title: "Respectfully Decline",
              description:
                "You thank them for their hospitality but continue your journey elsewhere.",
            },
          ],
        },
        {
          id: "forest-cottage",
          title: "The Witch's Cottage",
          description:
            "You discover a quaint cottage with herbs hanging from the eaves and a garden of unusual plants.",
          children: [
            {
              id: "forest-cottage-knock",
              title: "Knock on the Door",
              description:
                "You decide to see if anyone is home and might offer guidance.",
            },
            {
              id: "forest-cottage-garden",
              title: "Explore the Garden",
              description:
                "The strange plants in the garden seem to call to you.",
            },
            {
              id: "forest-cottage-leave",
              title: "Pass By",
              description:
                "Something feels unsettling about this place. You continue on your way.",
            },
          ],
        },
        {
          id: "forest-river",
          title: "The Whispering River",
          description:
            "You come upon a river whose waters seem to murmur secrets of the forest.",
          children: [
            {
              id: "forest-river-drink",
              title: "Drink the Water",
              description:
                "The crystal clear water is tempting, perhaps it holds special properties.",
            },
            {
              id: "forest-river-follow",
              title: "Follow Upstream",
              description: "You decide to follow the river to its source.",
            },
            {
              id: "forest-river-cross",
              title: "Cross to the Other Side",
              description:
                "You search for a way to cross the river and continue your journey.",
            },
          ],
        },
      ],
    },
    {
      id: "mountain",
      title: "The Towering Mountains",
      description: "Steep paths wind their way up into cloud-covered peaks.",
      children: [
        {
          id: "mountain-cave",
          title: "The Dragon's Cave",
          description:
            "You discover a massive cave entrance with ancient claw marks around its edges.",
          children: [
            {
              id: "mountain-cave-enter",
              title: "Enter Cautiously",
              description: "You steel your nerves and step into the darkness.",
            },
            {
              id: "mountain-cave-call",
              title: "Call Into the Cave",
              description:
                "You decide to announce your presence before entering.",
            },
            {
              id: "mountain-cave-avoid",
              title: "Find Another Route",
              description:
                "The signs of a dragon are too clear - you search for a safer path.",
            },
          ],
        },
        {
          id: "mountain-village",
          title: "The Sky Village",
          description:
            "You encounter a village built into the mountainside, with rope bridges connecting homes carved into the rock.",
          children: [
            {
              id: "mountain-village-stay",
              title: "Seek Lodging",
              description:
                "You're tired from your journey and could use a warm meal and bed.",
            },
            {
              id: "mountain-village-trade",
              title: "Trade for Supplies",
              description:
                "Your pack is light and these people might have goods you need.",
            },
            {
              id: "mountain-village-guide",
              title: "Request a Guide",
              description:
                "The mountain paths ahead look treacherous. Perhaps someone can guide you.",
            },
          ],
        },
        {
          id: "mountain-shrine",
          title: "The Ancient Shrine",
          description:
            "You discover a weathered shrine dedicated to forgotten gods of the mountain.",
          children: [
            {
              id: "mountain-shrine-pray",
              title: "Offer a Prayer",
              description:
                "Though you don't know these gods, it seems respectful to acknowledge them.",
            },
            {
              id: "mountain-shrine-study",
              title: "Study the Carvings",
              description:
                "The shrine is covered in intricate carvings that might hold knowledge.",
            },
            {
              id: "mountain-shrine-camp",
              title: "Camp Nearby",
              description:
                "The shrine offers shelter from the mountain winds. You decide to rest here.",
            },
          ],
        },
      ],
    },
    {
      id: "coast",
      title: "The Misty Coastline",
      description:
        "Salt-laden air and the distant cry of gulls guide you toward the sea.",
      children: [
        {
          id: "coast-port",
          title: "The Bustling Harbor",
          description:
            "You find yourself in a busy port town, full of traders from distant lands.",
          children: [
            {
              id: "coast-port-ship",
              title: "Book Passage on a Ship",
              description: "Perhaps your destiny lies across the sea.",
            },
            {
              id: "coast-port-tavern",
              title: "Visit the Sailor's Tavern",
              description:
                "Where better to hear tales of adventure and opportunity?",
            },
            {
              id: "coast-port-market",
              title: "Explore the Market",
              description:
                "Exotic goods from across the world are bought and sold here.",
            },
          ],
        },
        {
          id: "coast-lighthouse",
          title: "The Lonely Lighthouse",
          description:
            "A tall lighthouse stands on a rocky outcropping, its beam sweeping across the foggy waters.",
          children: [
            {
              id: "coast-lighthouse-keeper",
              title: "Meet the Keeper",
              description:
                "Someone maintains this lighthouse. Perhaps they have stories to tell.",
            },
            {
              id: "coast-lighthouse-climb",
              title: "Climb to the Top",
              description: "The view from the top must be spectacular.",
            },
            {
              id: "coast-lighthouse-search",
              title: "Search the Shoreline",
              description:
                "The rocks below the lighthouse might hide treasures from shipwrecks.",
            },
          ],
        },
        {
          id: "coast-cove",
          title: "The Hidden Cove",
          description:
            "You discover a secluded cove, sheltered from prying eyes and the worst of the sea's fury.",
          children: [
            {
              id: "coast-cove-swim",
              title: "Swim in the Clear Waters",
              description:
                "The protected waters look invitingly calm and clear.",
            },
            {
              id: "coast-cove-cave",
              title: "Explore the Sea Cave",
              description:
                "A dark opening in the cliff face suggests there might be more to discover.",
            },
            {
              id: "coast-cove-boat",
              title: "Investigate the Abandoned Boat",
              description:
                "A small boat has been pulled up on the shore. Who left it here?",
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Converts a StoryCard to a format compatible with Unigraph entity cache
 */
export function convertStoryCardToEntity(card: StoryCard): StoryCardEntity {
  return {
    id: card.id,
    type: "StoryCard",
    data: { ...card },
  };
}

/**
 * Creates a scene graph from a hierarchical story tree
 * @param storyTree The hierarchical story tree
 * @returns A scene graph with the story tree added
 */
export function createStoryGraphFromTree(storyTree: any): SceneGraph {
  const sceneGraph = new SceneGraph();
  sceneGraph.getMetadata().name = `Story: ${storyTree.title}`;
  sceneGraph.getMetadata().description = storyTree.description;

  addStoryTreeToGraph(sceneGraph, storyTree);

  return sceneGraph;
}

/**
 * Exports the story tree from a scene graph in a format suitable for saving/loading
 * @param sceneGraph The scene graph containing the story cards
 * @param rootNodeId Optional root node ID (if not provided, will attempt to find root)
 * @returns The story tree as a serializable object
 */
export function exportStoryTree(
  sceneGraph: SceneGraph,
  rootNodeId?: NodeId
): any {
  const rootId = rootNodeId || findRootStoryCard(sceneGraph);
  if (!rootId) return null;

  return reconstructStoryHierarchy(sceneGraph, rootId);
}
