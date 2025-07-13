import { v4 as uuidv4 } from "uuid";
import { NodeId } from "../../../core/model/Node";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { createDocument, updateDocument } from "../../../store/documentStore";
import { addNotification } from "../../../store/notificationStore";

interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool" | string;
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
          content:
            typeof node.message.content === "string"
              ? node.message.content
              : node.message.content.parts?.join("\n") || "",
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
 * Parse a conversations.json file format
 * @param data The parsed JSON data from the file
 * @returns Array of parsed conversations
 */
function parseConversationsJson(data: any): ParsedConversation[] {
  const conversations: ParsedConversation[] = [];

  try {
    // Check if this is an array of conversations
    if (Array.isArray(data)) {
      for (const conversation of data) {
        try {
          const parsedConversation = parseConversationItem(conversation);
          if (parsedConversation.messages.length > 0) {
            conversations.push(parsedConversation);
          }
        } catch (err) {
          console.error("Error parsing conversation item:", err);
        }
      }
    }
    // If it's a single conversation
    else if (data.title && data.mapping) {
      const parsedConversation = parseConversationItem(data);
      if (parsedConversation.messages.length > 0) {
        conversations.push(parsedConversation);
      }
    }
    // It's some other format
    else {
      throw new Error("Unsupported conversations.json format");
    }
  } catch (error) {
    console.error("Error parsing conversations.json:", error);
  }

  return conversations;
}

/**
 * Parse a single conversation item from a conversations.json file
 * @param conversation The conversation object
 * @returns Parsed conversation
 */
function parseConversationItem(conversation: any): ParsedConversation {
  const title = conversation.title || "Untitled Conversation";
  const messages: ChatMessage[] = [];
  const mapping = conversation.mapping || {};

  // console.log("Parsing conversation:", title);
  // console.log("Number of nodes in mapping:", Object.keys(mapping).length);

  // Find the root node and traverse the conversation tree
  let rootNodeId = conversation.current_node;

  // If there's a client-created-root, find the first child
  if (mapping["client-created-root"]) {
    rootNodeId = mapping["client-created-root"].children?.[0] || rootNodeId;
  }

  // Track which nodes were actually processed with content
  const nodesWithContent: string[] = [];

  // First, build the complete tree structure to navigate properly
  const nodeParents: Record<string, string> = {};
  const nodeChildren: Record<string, string[]> = {};

  for (const nodeId in mapping) {
    const node = mapping[nodeId];
    if (node.children) {
      for (const childId of node.children) {
        nodeParents[childId] = nodeId;
        if (!nodeChildren[nodeId]) {
          nodeChildren[nodeId] = [];
        }
        nodeChildren[nodeId].push(childId);
      }
    }
  }

  // DFS approach starting from current_node and working backwards
  const processedNodes = new Set<string>();
  const orderedNodeIds: string[] = [];

  // Start from the current node and go all the way back to the root
  let currentId = rootNodeId;
  while (currentId && mapping[currentId]) {
    if (!processedNodes.has(currentId)) {
      processedNodes.add(currentId);
      orderedNodeIds.push(currentId);
      currentId = mapping[currentId].parent;
    } else {
      break; // Avoid infinite loops
    }
  }

  // Reverse to get from oldest to newest
  orderedNodeIds.reverse();

  // Process nodes in order
  for (const nodeId of orderedNodeIds) {
    const node = mapping[nodeId];

    // Process this node's message if it exists
    if (node.message) {
      // Skip system messages with empty content or visually hidden messages
      const isHidden =
        node.message.metadata?.is_visually_hidden_from_conversation;

      // Improved empty content detection
      let isEmpty = true;
      let content = "";

      if (node.message.content) {
        // Handle different content formats
        if (typeof node.message.content === "string") {
          content = node.message.content;
          isEmpty = !content.trim();
        } else if (node.message.content.content_type === "text") {
          if (
            node.message.content.parts &&
            Array.isArray(node.message.content.parts)
          ) {
            content = node.message.content.parts.join("\n");
            isEmpty = !content.trim();
          }
        } else if (node.message.content.content_type === "code") {
          content = `\`\`\`${node.message.content.language || ""}\n${node.message.content.text || ""}\n\`\`\``;
          isEmpty = !content.trim();
        } else if (node.message.content.parts) {
          content = Array.isArray(node.message.content.parts)
            ? node.message.content.parts.join("\n")
            : "";
          isEmpty = !content.trim();
        }
      }

      console.log(
        `Node ${nodeId} (${node.message.author?.role}):`,
        isEmpty ? "EMPTY" : "HAS CONTENT"
      );

      if (!isHidden && !isEmpty) {
        nodesWithContent.push(nodeId);
        messages.push({
          role: node.message.author.role || "unknown",
          content: content,
          timestamp: node.message.create_time
            ? new Date(node.message.create_time * 1000).toISOString()
            : undefined,
        });
      }
    }
  }

  // console.log("Found messages with content:", messages.length);
  // console.log("Content nodes:", nodesWithContent.join(", "));

  return { title, messages };
}

/**
 * Creates a formatted document string from conversation messages
 * @param conversation The parsed conversation with messages
 * @returns Formatted string with all messages
 */
function createFormattedConversationDocument(
  conversation: ParsedConversation
): string {
  let formattedContent = `# ${conversation.title}\n\n`;

  conversation.messages.forEach((message, index) => {
    // Skip empty messages
    if (!message.content.trim()) return;

    // Add role header with formatting
    const roleLabel = getRoleLabel(message.role);
    formattedContent += `## ${roleLabel}\n\n`;

    // Add the message content
    formattedContent += `${message.content}\n\n`;

    // Add separator between messages except for the last one
    if (index < conversation.messages.length - 1) {
      formattedContent += `---\n\n`;
    }
  });

  return formattedContent;
}

/**
 * Get a formatted role label for the document
 */
function getRoleLabel(role: string): string {
  switch (role) {
    case "user":
      return "👤 User";
    case "assistant":
      return "🤖 Assistant";
    case "system":
      return "⚙️ System";
    case "tool":
      return "🔧 Tool";
    default:
      return `${role.charAt(0).toUpperCase() + role.slice(1)}`;
  }
}

/**
 * Imports a ChatGPT conversation from a shared URL into the scene graph
 * @param url The shared ChatGPT URL
 * @param sceneGraph The scene graph to import into
 * @param createMessageNodes Whether to create individual nodes for each message (default: true)
 * @returns The root conversation node ID
 */
export async function importChatGptConversation(
  url: string,
  sceneGraph: SceneGraph,
  createMessageNodes: boolean = true
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
    const _conversationNode = sceneGraph.getGraph().createNode({
      id: conversationId,
      label: conversation.title,
      type: "ConversationThread",
      description: `ChatGPT conversation imported from ${url}`,
    });

    // Store the mapping between URL and node ID for later analysis
    try {
      localStorage.setItem(`imported-node-${url}`, conversationId);
    } catch (e) {
      console.warn("Failed to save node mapping to localStorage:", e);
    }

    // Create a consolidated formatted document for the conversation thread
    const formattedConversation =
      createFormattedConversationDocument(conversation);

    // Create and update document for the conversation thread
    createDocument(conversationId);
    updateDocument(conversationId, {
      id: conversationId,
      nodeId: conversationId,
      lastModified: Date.now(),
      content: formattedConversation,
      lexicalState: "", // Let the editor create the lexical state
      tags: ["conversation", "chatgpt"],
    });

    // Only create individual message nodes if the flag is true
    if (createMessageNodes) {
      let previousNodeId: NodeId | null = null;
      for (const message of conversation.messages) {
        if (!message.content.trim()) {
          continue;
        }

        const messageId = uuidv4() as NodeId;
        const messageNode = sceneGraph.getGraph().createNode({
          id: messageId,
          label: getLabelForRole(message.role),
          type: getTypeForRole(message.role),
          description: message.content,
        });

        messageNode.addTag(message.role);

        sceneGraph.getGraph().createEdge(conversationId, messageId, {
          type: "contains",
          label: "contains",
        });

        if (previousNodeId) {
          sceneGraph.getGraph().createEdge(previousNodeId, messageId, {
            type: "nextMessage",
            label: "followed by",
          });
        }

        previousNodeId = messageId;
      }
    }

    addNotification({
      message: createMessageNodes
        ? `Imported conversation with ${conversation.messages.length} messages`
        : `Imported conversation as a single document node`,
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

/**
 * Helper function to get a label for a message based on its role
 */
function getLabelForRole(role: string): string {
  switch (role) {
    case "user":
      return "User Message";
    case "assistant":
      return "ChatGPT Response";
    case "system":
      return "System Message";
    case "tool":
      return "Tool Message";
    default:
      return `${role.charAt(0).toUpperCase() + role.slice(1)} Message`;
  }
}

/**
 * Helper function to get a type for a message based on its role
 */
function getTypeForRole(role: string): string {
  switch (role) {
    case "user":
      return "UserMessage";
    case "assistant":
      return "AssistantMessage";
    case "system":
      return "SystemMessage";
    case "tool":
      return "ToolMessage";
    default:
      return `${role.charAt(0).toUpperCase() + role.slice(1)}Message`;
  }
}

/**
 * Imports a ChatGPT conversation from a local JSON file
 * @param file The JSON file containing the conversation
 * @param sceneGraph The scene graph to import into
 * @param createMessageNodes Whether to create individual nodes for each message (default: true)
 * @param messageSampleRatio Ratio of messages to keep in each conversation (0.1 to 1.0, default: 1.0)
 * @param conversationSampleRatio Ratio of conversations to keep (0.1 to 1.0, default: 1.0)
 * @returns The root conversation node ID or array of IDs if multiple conversations were imported
 */
export async function importChatGptFromFile(
  file: File,
  sceneGraph: SceneGraph,
  createMessageNodes: boolean = true,
  conversationSampleRatio: number = 1.0
): Promise<NodeId | NodeId[] | null> {
  try {
    // Validate file type
    if (!file.name.endsWith(".json")) {
      addNotification({
        message: "Only JSON files are supported",
        type: "error",
        duration: 5000,
      });
      return null;
    }

    // Read file content
    const content = await file.text();
    let parsedData: any;

    try {
      parsedData = JSON.parse(content);
    } catch (error) {
      addNotification({
        message: `Invalid JSON file format: ${error instanceof Error ? error.message : "unknown error"}`,
        type: "error",
        duration: 5000,
      });
      return null;
    }

    // First check if this is a conversations.json file from OpenAI exports
    if (
      Array.isArray(parsedData) &&
      parsedData.length > 0 &&
      (parsedData[0].mapping || parsedData[0].title)
    ) {
      const conversations = parseConversationsJson(parsedData);
      console.log("Found ", conversations.length, " conversations");

      if (conversations.length > 0) {
        // Downsample the conversations if needed
        let processedConversations = conversations;
        if (conversationSampleRatio < 1.0) {
          processedConversations = downsampleConversations(
            conversations,
            conversationSampleRatio
          );
        }

        const conversationIds: NodeId[] = [];
        for (const conversation of processedConversations) {
          const conversationId = await importParsedConversation(
            conversation,
            sceneGraph,
            file.name,
            createMessageNodes
          );
          if (conversationId) {
            conversationIds.push(conversationId);
          }
        }

        if (conversationIds.length > 0) {
          addNotification({
            message: `Imported ${conversationIds.length} conversations with ${conversations.reduce((sum, conv) => sum + conv.messages.length, 0)} total messages`,
            type: "success",
            duration: 5000,
          });
          return conversationIds;
        } else {
          throw new Error("Failed to import any conversations");
        }
      }
    }

    // If not conversations.json, try other formats
    let conversation: ParsedConversation = {
      title: "",
      messages: [],
    };

    // Case 1: OpenAI's official export format for single conversation
    if (parsedData.mapping && parsedData.title) {
      const conversations = parseConversationsJson(parsedData);
      if (conversations.length > 0) {
        const conversationId = await importParsedConversation(
          conversations[0],
          sceneGraph,
          file.name,
          createMessageNodes // Pass the parameter
        );
        if (conversationId) {
          addNotification({
            message: `Imported conversation with ${conversations[0].messages.length} messages`,
            type: "success",
            duration: 5000,
          });
          return conversationId;
        }
        throw new Error("Failed to import conversation");
      }
    }
    // Case 2: Our own exported format
    else if (parsedData.title && Array.isArray(parsedData.messages)) {
      conversation = parsedData as ParsedConversation;
    }
    // Case 3: Simple array of messages
    else if (Array.isArray(parsedData)) {
      conversation = {
        title: "Imported Conversation",
        messages: parsedData.map((msg: any) => ({
          role: msg.role || "unknown",
          content: msg.content || "",
          timestamp: msg.timestamp,
        })),
      };
    }
    // Unrecognized format
    else {
      throw new Error(
        "Unrecognized JSON format. Please check the file structure."
      );
    }

    if (!conversation.messages || conversation.messages.length === 0) {
      addNotification({
        message: "No messages found in the file",
        type: "error",
        duration: 5000,
      });
      return null;
    }

    const conversationId = await importParsedConversation(
      conversation,
      sceneGraph,
      file.name,
      createMessageNodes // Pass the parameter
    );
    return conversationId;
  } catch (error) {
    console.error("Error importing ChatGPT conversation from file:", error);
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

/**
 * Helper function to import a parsed conversation into the scene graph
 * @param conversation The parsed conversation
 * @param sceneGraph The scene graph
 * @param fileName The name of the source file
 * @param createMessageNodes Whether to create individual nodes for each message
 * @param messageSampleRatio Ratio of messages to keep in each conversation (0.1 to 1.0, default: 1.0)
 * @returns The conversation node ID
 */
async function importParsedConversation(
  conversation: ParsedConversation,
  sceneGraph: SceneGraph,
  fileName: string,
  createMessageNodes: boolean
): Promise<NodeId | null> {
  if (!conversation.messages || conversation.messages.length === 0) {
    console.error("No messages found in conversation");
    return null;
  }

  // Create a root conversation node
  const conversationId = uuidv4() as NodeId;
  const _conversationNode = sceneGraph.getGraph().createNode({
    id: conversationId,
    label: conversation.title || "Imported Conversation",
    type: "ConversationThread",
    description: `ChatGPT conversation imported from ${fileName}`,
  });

  // Create a consolidated formatted document for the conversation thread
  const formattedConversation =
    createFormattedConversationDocument(conversation);

  // Create and update document for the conversation thread
  createDocument(conversationId);
  updateDocument(conversationId, {
    id: conversationId,
    nodeId: conversationId,
    lastModified: Date.now(),
    content: formattedConversation,
    lexicalState: "", // Let the editor create the lexical state
    tags: ["conversation", "chatgpt"],
  });

  if (createMessageNodes) {
    let previousNodeId: NodeId | null = null;
    for (const message of conversation.messages) {
      if (!message.content.trim()) {
        continue;
      }

      const messageId = uuidv4() as NodeId;
      const messageNode = sceneGraph.getGraph().createNode({
        id: messageId,
        label: getLabelForRole(message.role),
        type: getTypeForRole(message.role),
        description: message.content,
      });

      messageNode.addTag(message.role);

      sceneGraph.getGraph().createEdge(conversationId, messageId, {
        type: "contains",
        label: "contains",
      });

      if (previousNodeId) {
        sceneGraph.getGraph().createEdge(previousNodeId, messageId, {
          type: "nextMessage",
          label: "followed by",
        });
      }

      previousNodeId = messageId;
    }
  }

  return conversationId;
}

/**
 * Downsamples an array of conversations based on a ratio
 * @param conversations The conversations to downsample
 * @param ratio The ratio of conversations to keep (0.1 to 1.0)
 * @returns A downsampled array of conversations
 */
function downsampleConversations(
  conversations: ParsedConversation[],
  ratio: number
): ParsedConversation[] {
  // Ensure we have a valid ratio
  const validRatio = Math.max(0.1, Math.min(1, ratio));

  // If ratio is 1 or we have very few conversations, return all
  if (validRatio >= 1 || conversations.length <= 3) {
    return conversations;
  }

  // Calculate how many conversations to keep
  const targetCount = Math.max(
    1,
    Math.floor(conversations.length * validRatio)
  );

  // Always keep the first and last conversations for context
  const result: ParsedConversation[] = [];

  // Add the first conversation
  result.push(conversations[0]);

  // If we need more than just first and last, select from the middle
  if (targetCount > 2) {
    const middleConversations = conversations.slice(
      1,
      conversations.length - 1
    );
    const stride = middleConversations.length / (targetCount - 2);

    for (let i = 0; i < targetCount - 2; i++) {
      const index = Math.floor(i * stride);
      if (index < middleConversations.length) {
        result.push(middleConversations[index]);
      }
    }
  }

  // Add the last conversation if not already added and there is more than one conversation
  if (conversations.length > 1 && targetCount > 1) {
    result.push(conversations[conversations.length - 1]);
  }

  return result;
}
