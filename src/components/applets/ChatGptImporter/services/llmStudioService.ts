import { ChatMessage } from "../../../../store/chatHistoryStore";
import { addNotification } from "../../../../store/notificationStore";
import { sceneGraphController } from "./sceneGraphController";

const API_URL = "http://localhost:1234/v1/chat/completions";

export interface LLMStudioOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  model?: string;
}

// Interface for SceneGraph commands
export interface SceneGraphCommand {
  action: string;
  parameters?: Record<string, any>;
}

/**
 * Generate a system prompt with scene graph command information
 */
function getSystemPromptWithCommands(): string {
  const basePrompt =
    "You are a helpful assistant that can understand and suggest graph modification commands.";
  return `${basePrompt}\n\n${getCommandsContextForLLM()}`;
}

/**
 * Get the command context string for the LLM
 */
function getCommandsContextForLLM(): string {
  return (
    `AVAILABLE GRAPH COMMANDS:\n${sceneGraphController.getCommandsDescription()}\n\n` +
    "When the user asks to modify the graph, you can directly use these commands with the proper API syntax in your response. " +
    "Commands must start with '/graph' followed by the command name and parameters. " +
    "For example: '/graph addNode type=Button label=Submit position=(100,200)'\n\n" +
    "You can include multiple commands in a single response by putting each command on its own line:\n" +
    "/graph addNode type=TextBox label=Title\n" +
    "/graph addNode type=Button label=Submit\n" +
    "/graph createEdge source=node1 target=node2\n\n" +
    "All commands will be executed in sequence and the results will be shown."
  );
}

/**
 * Call the local LLM Studio API
 * @param messages Array of chat messages
 * @param options Additional parameters like temperature
 * @returns The generated response
 */
export async function callLLMStudioAPI(
  messages: ChatMessage[],
  options: LLMStudioOptions = {}
): Promise<string> {
  try {
    // Validate messages
    if (!messages || messages.length === 0) {
      throw new Error("'messages' field is required and cannot be empty");
    }

    // Check if the last message contains graph modification commands
    const lastMessage = messages[messages.length - 1];

    // Process last message if it contains commands, regardless of role
    if (sceneGraphController.containsCommandKeywords(lastMessage.content)) {
      console.log("Detected command(s) in message:", lastMessage.content);
      // Process all commands in the message
      try {
        const commandResult =
          await sceneGraphController.processMultipleCommands(
            lastMessage.content
          );
        return commandResult;
      } catch (error) {
        console.error("Error processing commands:", error);
        return `Error processing commands: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    console.log("last message was ", lastMessage);

    // Format messages for the API - ensure role and content are present
    let formattedMessages = messages.map(({ role, content }) => ({
      role: role || "user", // Default to user if role is missing
      content: content || "", // Default to empty string if content is missing
    }));

    // Ensure there's always a system prompt
    let systemPrompt = getEnhancedSystemPrompt();
    if (!formattedMessages.some((msg) => msg.role === "system")) {
      // Add system message at the beginning of the array
      formattedMessages.unshift({
        role: "system",
        content: systemPrompt,
      });
    } else {
      // Update existing system message with command information if needed
      const systemMsgIndex = formattedMessages.findIndex(
        (msg) => msg.role === "system"
      );
      if (systemMsgIndex >= 0) {
        // Append command info if it's not already there
        if (
          !formattedMessages[systemMsgIndex].content.includes(
            "AVAILABLE GRAPH COMMANDS"
          )
        ) {
          formattedMessages[systemMsgIndex].content +=
            "\n\n" + getCommandsContextForLLM();
        }
        systemPrompt = formattedMessages[systemMsgIndex].content;

        // Remove system message from the array, we'll use it separately
        // formattedMessages.splice(systemMsgIndex, 1);
      }
    }

    // Ensure messages alternate user/assistant correctly
    // Filter out messages with invalid roles (like 'error') before normalizing
    const validFormattedMessages = formattedMessages
      .filter(
        (msg) =>
          msg.role === "system" ||
          msg.role === "user" ||
          msg.role === "assistant"
      )
      .map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

    formattedMessages = normalizeMessages(validFormattedMessages);

    console.log(
      "Sending to API with normalized conversation history:",
      formattedMessages
    );

    // Filter out messages with invalid roles (like 'error') before sending to API
    const validMessages = formattedMessages.filter(
      (msg) =>
        msg.role === "system" || msg.role === "user" || msg.role === "assistant"
    );

    console.log(
      "Sending to API with normalized conversation history:",
      validMessages
    );

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 1,
        max_tokens: options.max_tokens || 2048,
        stream: false,
        model: options.model || "mistral-nemu-instruct-2407", // Explicitly specify the model
        prompt_template:
          "{% if messages[0]['role'] == 'system' %}{% set loop_messages = messages[1:] %}{% set system_message = messages[0]['content'] %}{% else %}{% set loop_messages = messages %}{% set system_message = '' %}{% endif %}{% if system_message != '' %}{{ system_message }}\n\n{% endif %}{% for message in loop_messages %}{% if message['role'] == 'user' %}{{ 'USER: ' + message['content'] + '\n\n' }}{% elif message['role'] == 'assistant' %}{{ 'ASSISTANT: ' + message['content'] + '\n\n' }}{% endif %}{% endfor %}ASSISTANT:",
      }),
    });

    // Log the request for debugging
    console.log("API Request:", {
      url: API_URL,
      messageCount: formattedMessages.length,
      temperature: options.temperature || 0.7,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM Studio API error: ${error}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices?.[0]?.message?.content || "";

    // Check if LLM response contains graph commands and process them if present
    if (sceneGraphController.containsCommandKeywords(generatedResponse)) {
      console.log("LLM generated graph command(s):", generatedResponse);

      try {
        // Process all commands in the response
        const commandResults =
          await sceneGraphController.processMultipleCommands(generatedResponse);

        // If the response is just commands with no explanation
        interface Line {
          trim: () => string;
        }

        const isOnlyCommands: boolean = generatedResponse
          .split("\n")
          .every(
            (line: Line | string): boolean =>
              line.trim() === "" ||
              line.trim().startsWith("/graph") ||
              line.trim().startsWith("```")
          );

        if (isOnlyCommands) {
          return commandResults;
        }

        // Otherwise, include both response and results
        return `${generatedResponse}\n\n---\nCommand Results:\n${commandResults}`;
      } catch (error) {
        console.error("Error processing LLM commands:", error);
        return `${generatedResponse}\n\n---\nError processing commands: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    return generatedResponse;
  } catch (error) {
    console.error("Error calling LLM Studio API:", error);
    addNotification({
      message: `API error: ${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: 5000,
    });
    throw error;
  }
}

/**
 * Normalizes conversation messages to ensure they alternate user/assistant
 * This is required by Mistral and similar models
 */
function normalizeMessages(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
): { role: "user" | "assistant" | "system"; content: string }[] {
  const result: { role: "user" | "assistant" | "system"; content: string }[] =
    [];
  let systemMsg: {
    role: "user" | "assistant" | "system";
    content: string;
  } | null = null;

  // Extract system message if present
  if (messages.length > 0 && messages[0].role === "system") {
    systemMsg = messages[0];
    messages = messages.slice(1);
  }

  // If no messages after system, add a dummy user message to start the conversation
  if (messages.length === 0) {
    messages.push({ role: "user", content: "Hello" });
  }

  // Ensure first message is from user
  if (messages[0].role !== "user") {
    result.push({ role: "user", content: "Hello" });
  }

  // Process all messages ensuring alternation
  let lastRole = "assistant"; // Start with assistant so first message must be user

  for (const msg of messages) {
    // If same role appears twice in sequence, insert dummy message from other role
    if (msg.role === lastRole) {
      const dummyRole = lastRole === "user" ? "assistant" : "user";
      const dummyContent =
        dummyRole === "user" ? "Continue." : "I'll continue.";
      result.push({ role: dummyRole, content: dummyContent });
    }

    result.push(msg);
    lastRole = msg.role;
  }

  // Ensure conversation ends with user message so model can respond
  if (lastRole === "assistant") {
    result.push({ role: "user", content: "Continue." });
  }

  // Add system message back at beginning if it existed
  if (systemMsg) {
    result.unshift(systemMsg);
  }

  return result;
}

/**
 * Generate an enhanced system prompt that encourages the LLM to generate graph commands
 */
function getEnhancedSystemPrompt(): string {
  const basePrompt =
    "You are a helpful assistant that can understand and generate graph modification commands. " +
    "When appropriate, you can directly create or modify graph elements by using the API commands below. " +
    "You can issue multiple commands in sequence to build more complex structures by putting each command on a new line. " +
    "The commands follow a strict format starting with '/graph' followed by the command name and parameters.";

  return `${basePrompt}\n\n${getCommandsContextForLLM()}`;
}

/**
 * Check if the LLM Studio API is available
 * @returns True if the API is available, false otherwise
 */
export async function checkLLMStudioAvailability(): Promise<boolean> {
  try {
    // Make sure we're sending a valid request with required fields
    // Using a properly alternating conversation format
    const testRequest = {
      messages: [
        {
          role: "system",
          content: getSystemPromptWithCommands(),
        },
        {
          role: "user",
          content: "Hello",
        },
      ],
      max_tokens: 1, // Minimal request just to check availability
      temperature: 0.7, // Include temperature to make the request more complete
      prompt_template:
        "{% if messages[0]['role'] == 'system' %}{% set loop_messages = messages[1:] %}{% set system_message = messages[0]['content'] %}{% else %}{% set loop_messages = messages %}{% set system_message = '' %}{% endif %}{% if system_message != '' %}{{ system_message }}\n\n{% endif %}{% for message in loop_messages %}{% if message['role'] == 'user' %}{{ 'USER: ' + message['content'] + '\n\n' }}{% elif message['role'] == 'assistant' %}{{ 'ASSISTANT: ' + message['content'] + '\n\n' }}{% endif %}{% endfor %}ASSISTANT:",
    };

    console.log("Testing API availability with:", testRequest);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("API availability check failed:", errorText);
    }

    return response.ok;
  } catch (error) {
    console.warn("API availability check error:", error);
    return false;
  }
}
