import { ChatMessage } from "../store/chatHistoryStore";
import { addNotification } from "../store/notificationStore";

const API_URL = "http://localhost:1234/v1/chat/completions";

export interface LLMStudioOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
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

    // Format messages for the API - ensure role and content are present
    const formattedMessages = messages.map(({ role, content }) => ({
      role: role || "user", // Default to user if role is missing
      content: content || "", // Default to empty string if content is missing
    }));

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
    return data.choices?.[0]?.message?.content || "";
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
 * Check if the LLM Studio API is available
 * @returns True if the API is available, false otherwise
 */
export async function checkLLMStudioAvailability(): Promise<boolean> {
  try {
    // Make sure we're sending a valid request with required fields
    const testRequest = {
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Hello",
        },
      ],
      max_tokens: 1, // Minimal request just to check availability
      temperature: 0.7, // Include temperature to make the request more complete
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
