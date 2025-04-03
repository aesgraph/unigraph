import { v4 as uuidv4 } from "uuid";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { addNotification } from "../../store/notificationStore";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

interface ParsedConversation {
  title: string;
  messages: ChatMessage[];
  error?: string;
}

/**
 * Fetches and parses a ChatGPT conversation from a shared URL
 * @param url The shared ChatGPT URL
 * @returns Parsed conversation data or error
 */
export async function fetchChatGptConversation(
  url: string
): Promise<ParsedConversation> {
  try {
    // Validate URL format
    if (!url.includes("chatgpt.com/share/")) {
      return {
        title: "",
        messages: [],
        error:
          "Invalid ChatGPT share URL. Please use a URL from chatgpt.com/share/",
      };
    }

    // Fetch the HTML content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    // Extract conversation data
    const dataMatch = html.match(/window\.__NEXT_DATA__ = (.+?);\s*</);
    if (!dataMatch || !dataMatch[1]) {
      return {
        title: "Unknown Conversation",
        messages: [],
        error: "Could not extract conversation data from the page",
      };
    }

    const jsonData = JSON.parse(dataMatch[1]);
    const shareData = jsonData?.props?.pageProps?.serverResponse?.data;

    if (!shareData) {
      return {
        title: "Unknown Conversation",
        messages: [],
        error: "Invalid conversation data structure",
      };
    }

    // Process conversation data
    const title = shareData.title || "ChatGPT Conversation";
    const messages = shareData.mapping || {};

    // Convert the mapping to an ordered array of messages
    const orderedMessages: ChatMessage[] = [];
    let currentNodeId = shareData.current_node;

    // Set of processed node IDs to avoid infinite loops
    const processedNodes = new Set<string>();

    // Traverse the linked message structure
    while (
      currentNodeId &&
      !processedNodes.has(currentNodeId) &&
      messages[currentNodeId]
    ) {
      processedNodes.add(currentNodeId);
      const node = messages[currentNodeId];

      if (node.message && node.message.content) {
        orderedMessages.unshift({
          role: node.message.author.role,
          content: node.message.content.parts.join("\n"),
          timestamp: node.message.create_time
            ? new Date(node.message.create_time * 1000).toISOString()
            : undefined,
        });
      }

      // Move to the parent node
      currentNodeId = node.parent;
    }

    return { title, messages: orderedMessages };
  } catch (error) {
    console.error("Error fetching ChatGPT conversation:", error);
    return {
      title: "Error",
      messages: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Imports a ChatGPT conversation from a shared URL into the scene graph
 * @param url The shared ChatGPT URL
 * @param sceneGraph The scene graph to import into
 * @returns The root conversation node ID
 */
export async function importChatGptConversation(
  url: string,
  sceneGraph: SceneGraph
): Promise<NodeId | null> {
  try {
    const conversation = await fetchChatGptConversation(url);

    if (conversation.error || conversation.messages.length === 0) {
      addNotification({
        message: conversation.error || "No messages found in the conversation",
        type: "error",
        duration: 5000,
      });
      return null;
    }

    // Create a root conversation node
    const conversationId = uuidv4() as NodeId;
    const conversationNode = sceneGraph.getGraph().createNode({
      id: conversationId,
      label: conversation.title,
      type: "ConversationThread",
      description: `ChatGPT conversation imported from ${url}`,
    });

    // Create nodes for each message
    let previousNodeId: NodeId | null = null;
    for (const message of conversation.messages) {
      const messageId = uuidv4() as NodeId;
      const messageNode = sceneGraph.getGraph().createNode({
        id: messageId,
        label: message.role === "user" ? "User Message" : "ChatGPT Response",
        type: message.role === "user" ? "UserMessage" : "AssistantMessage",
        description: message.content,
        //
        // properties: {
        //   role: message.role,
        //   content: message.content,
        // },
        userData: {
          createdAt: message.timestamp,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
        },
      });

      // Add tags based on role
      messageNode.addTag(message.role);

      // Connect message to conversation
      sceneGraph.getGraph().createEdge(conversationId, messageId, {
        type: "contains",
        label: "contains",
      });

      // Connect messages in sequence
      if (previousNodeId) {
        sceneGraph.getGraph().createEdge(previousNodeId, messageId, {
          type: "nextMessage",
          label: "followed by",
        });
      }

      previousNodeId = messageId;
    }

    // Notify graph changed to update the UI
    sceneGraph.notifyGraphChanged();

    addNotification({
      message: `Imported conversation with ${conversation.messages.length} messages`,
      type: "success",
      duration: 5000,
    });

    return conversationId;
  } catch (error) {
    console.error("Error importing ChatGPT conversation:", error);
    addNotification({
      message:
        error instanceof Error
          ? error.message
          : "Unknown error importing conversation",
      type: "error",
      duration: 5000,
    });
    return null;
  }
}
