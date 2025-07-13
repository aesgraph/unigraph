import { NodeId } from "../../../../core/model/Node";
import { SceneGraph } from "../../../../core/model/SceneGraph";
import { addNotification } from "../../../../store/notificationStore";

interface Metadata {
  summary: string;
  keywords: string[];
  sentiment: "positive" | "negative";
  topic: string;
}

interface Conversation {
  id: number;
  title: string;
  excerpt: string;
  message_count: number;
  char_length: number;
  metadata: Metadata;
  hash: string;
  timestamp: number;
}

interface ConversationsData {
  source_file: string;
  conversation_count: number;
  conversations: Conversation[];
  completed: boolean;
}

/**
 * Imports conversations from a JSON file and links them to existing nodes with matching titles
 *
 * @param jsonFilePath Path to the JSON file containing conversations
 * @param sceneGraph The scene graph to add connections to
 * @returns A promise that resolves when the import is complete
 */
export async function importConversations(
  jsonFilePath: string,
  sceneGraph: SceneGraph
): Promise<{ imported: number; matched: number }> {
  try {
    // Load the JSON file
    const response = await fetch(jsonFilePath);
    if (!response.ok) {
      throw new Error(
        `Failed to load conversations file: ${response.statusText}`
      );
    }

    const data = (await response.json()) as ConversationsData;
    console.log(
      `Loaded ${data.conversation_count} conversations from ${data.source_file}`
    );

    let imported = 0;
    let matched = 0;
    const existingNodes = sceneGraph.getNodes();

    // Create a map of lowercase node titles for case-insensitive matching
    const titleToNodeMap = new Map<string, NodeId>();
    existingNodes.forEach((node) => {
      if (node.getData()?.label) {
        titleToNodeMap.set(
          node.getData().label?.toLowerCase() ?? node.getId(),
          node.getId()
        );
      }
    });

    // Process each conversation
    for (const conversation of data.conversations) {
      // Try to find a matching node by title
      const matchingNodeId = titleToNodeMap.get(
        conversation.title.toLowerCase()
      );

      if (matchingNodeId) {
        // Create a conversation node
        const conversationNodeId = sceneGraph.getGraph().createNode({
          id: conversation.id.toString() as NodeId,
          label: `Chat: ${conversation.title}`,
          type: "conversation",
          userData: {
            id: conversation.id,
            excerpt: conversation.excerpt,
            message_count: conversation.message_count,
            char_length: conversation.char_length,
            summary: conversation.metadata.summary,
            keywords: conversation.metadata.keywords,
            sentiment: conversation.metadata.sentiment,
            topic: conversation.metadata.topic,
            timestamp: new Date(conversation.timestamp * 1000).toISOString(),
          },
        });

        // Connect the conversation node to the existing node
        sceneGraph
          .getGraph()
          .createEdgeIfMissing(matchingNodeId, conversationNodeId.getId(), {
            label: "has conversation",
            type: "reference",
          });

        matched++;
      } else {
        // Create a standalone conversation node
        sceneGraph.getGraph().createNode({
          id: conversation.id.toString() as NodeId,
          label: conversation.title,
          type: "conversation",
          userData: {
            id: conversation.id,
            excerpt: conversation.excerpt,
            message_count: conversation.message_count,
            char_length: conversation.char_length,
            summary: conversation.metadata.summary,
            keywords: conversation.metadata.keywords,
            sentiment: conversation.metadata.sentiment,
            topic: conversation.metadata.topic,
            timestamp: new Date(conversation.timestamp * 1000).toISOString(),
          },
        });
      }

      imported++;
    }

    addNotification({
      message: `Imported ${imported} conversations, matched ${matched} with existing nodes`,
      type: "success",
      duration: 5000,
    });

    return { imported, matched };
  } catch (error) {
    console.error("Error importing conversations:", error);
    addNotification({
      message: `Failed to import conversations: ${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: 5000,
    });

    throw error;
  }
}

/**
 * Creates topic nodes from the conversations and links them to conversation nodes
 *
 * @param sceneGraph The scene graph to add topic nodes to
 * @returns A promise that resolves when the topic nodes are created
 */
export function createTopicNodes(sceneGraph: SceneGraph): {
  topics: number;
  connections: number;
} {
  const conversationNodes = sceneGraph
    .getNodes()
    .filter(
      (node) =>
        node.getData()?.type === "conversation" &&
        node.getData()?.userData?.topic
    );

  // Create a map of topics
  const topicMap = new Map<string, NodeId>();
  let connections = 0;

  // Create topic nodes
  conversationNodes.forEach((node) => {
    const topic = node.getData()?.userData?.topic;
    if (!topic) return;

    // Create topic node if it doesn't exist yet
    if (!topicMap.has(topic)) {
      const topicNodeId = sceneGraph.getGraph().createNode({
        id: `Topic: ${topic}`,
        label: `Topic: ${topic}`,
        type: "topic",
        tags: ["topic"],
      });
      topicMap.set(topic, topicNodeId.getId());
    }

    // Connect conversation node to topic node
    const topicNodeId = topicMap.get(topic)!;
    sceneGraph.getGraph().createEdgeIfMissing(node.getId(), topicNodeId, {
      label: "has topic",
      type: "categorization",
    });

    connections++;
  });

  addNotification({
    message: `Created ${topicMap.size} topic nodes with ${connections} connections`,
    type: "info",
    duration: 5000,
  });

  return { topics: topicMap.size, connections };
}

/**
 * Creates keyword nodes from the conversations and links them to conversation nodes
 *
 * @param sceneGraph The scene graph to add keyword nodes to
 * @param minOccurrences Minimum number of occurrences for a keyword to be included
 * @returns A promise that resolves when the keyword nodes are created
 */
export function createKeywordNodes(
  sceneGraph: SceneGraph,
  minOccurrences: number = 3
): { keywords: number; connections: number } {
  const conversationNodes = sceneGraph
    .getNodes()
    .filter(
      (node) =>
        node.getData()?.type === "conversation" &&
        node.getData()?.userData?.keywords
    );

  // Count keyword occurrences
  const keywordCounts = new Map<string, number>();
  conversationNodes.forEach((node) => {
    const keywords = node.getData()?.userData?.keywords || [];
    keywords.forEach((keyword: string) => {
      if (
        typeof keyword === "string" &&
        keyword.trim() &&
        !keyword.includes("would include") &&
        !keyword.startsWith("**")
      ) {
        const normalizedKeyword = keyword.toLowerCase().trim();
        keywordCounts.set(
          normalizedKeyword,
          (keywordCounts.get(normalizedKeyword) || 0) + 1
        );
      }
    });
  });

  // Create keyword nodes for frequently occurring keywords
  const keywordMap = new Map<string, NodeId>();
  let connections = 0;

  // Create connections between conversations and keywords
  conversationNodes.forEach((node) => {
    const keywords = node.getData()?.userData?.keywords || [];
    keywords.forEach((keyword: string) => {
      if (
        typeof keyword === "string" &&
        keyword.trim() &&
        !keyword.includes("would include") &&
        !keyword.startsWith("**")
      ) {
        const normalizedKeyword = keyword.toLowerCase().trim();

        // Only process keywords that meet the minimum occurrence threshold
        if ((keywordCounts.get(normalizedKeyword) || 0) >= minOccurrences) {
          // Create keyword node if it doesn't exist yet
          if (!keywordMap.has(normalizedKeyword)) {
            const keywordNodeId = sceneGraph.getGraph().createNode({
              id: `keyword: ${keyword}`,
              label: keyword,
              type: "keyword",
              tags: ["keyword"],
              userData: {
                occurrences: keywordCounts.get(normalizedKeyword),
              },
            });
            keywordMap.set(normalizedKeyword, keywordNodeId.getId());
          }

          // Connect conversation node to keyword node
          const keywordNodeId = keywordMap.get(normalizedKeyword)!;
          sceneGraph
            .getGraph()
            .createEdgeIfMissing(node.getId(), keywordNodeId, {
              label: "has keyword",
              type: "keyword",
            });

          connections++;
        }
      }
    });
  });

  addNotification({
    message: `Created ${keywordMap.size} keyword nodes with ${connections} connections`,
    type: "info",
    duration: 5000,
  });

  return { keywords: keywordMap.size, connections };
}

/**
 * Imports conversations from a JSON file and creates a graph structure
 *
 * @param jsonFilePath Path to the JSON file containing conversations
 * @param sceneGraph The scene graph to add data to
 * @param createTopics Whether to create topic nodes
 * @param createKeywords Whether to create keyword nodes
 * @returns A promise that resolves with the import statistics
 */
export async function importConversationsWithStructure(
  jsonFilePath: string,
  sceneGraph: SceneGraph,
  createTopics: boolean = true,
  createKeywords: boolean = true,
  keywordMinOccurrences: number = 3
): Promise<{
  imported: number;
  matched: number;
  topics?: { topics: number; connections: number };
  keywords?: { keywords: number; connections: number };
}> {
  const result = await importConversations(jsonFilePath, sceneGraph);

  const response: {
    imported: number;
    matched: number;
    topics?: { topics: number; connections: number };
    keywords?: { keywords: number; connections: number };
  } = { ...result };

  if (createTopics) {
    response.topics = createTopicNodes(sceneGraph);
  }

  if (createKeywords) {
    response.keywords = createKeywordNodes(sceneGraph, keywordMinOccurrences);
  }

  return response;
}
