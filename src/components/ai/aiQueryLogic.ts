import { ChatMessage } from "../../store/chatHistoryStore";
import { supabase } from "../../utils/supabaseClient";
import { callLLMStudioAPI } from "../applets/ChatGptImporter/services/llmStudioService";
import { OpenAITool, ToolCall } from "./aiTools";

export type ApiProvider = "openai" | "llm-studio" | "live-chat";

export interface AIResponse {
  content: string;
  toolCalls?: ToolCall[];
}

export async function callOpenAIAPI(
  chatMessages: ChatMessage[],
  openaiApiKey: string,
  temperature: number,
  tools?: OpenAITool[]
): Promise<AIResponse> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not found");
  }

  const body: any = {
    model: "gpt-4.1",
    messages: chatMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature,
  };
  if (tools) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const message = data.choices[0]?.message;

  return {
    content: message?.content || "No response received",
    toolCalls: message?.tool_calls || undefined,
  };
}

export async function callLiveChatAPI(
  chatMessages: ChatMessage[],
  liveChatUrl: string,
  isCustomEndpoint: boolean,
  isSignedIn: boolean,
  user: any,
  temperature: number
): Promise<string> {
  if (!isCustomEndpoint && (!isSignedIn || !user)) {
    throw new Error("User not authenticated");
  }
  if (!liveChatUrl) {
    throw new Error("Live chat URL not configured");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!isCustomEndpoint) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      } else {
        throw new Error("No access token available");
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      throw new Error("Authentication failed");
    }
  }
  const response = await fetch(liveChatUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messages: chatMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature,
      max_tokens: 1000,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 0 || response.statusText === "") {
      if (
        errorData &&
        typeof errorData.error === "string" &&
        errorData.error.includes("User is not authorized")
      ) {
        throw new Error("User is not authorized");
      }
      throw new Error(`Please log in to use chat`);
    }
    if (
      response.status === 403 &&
      errorData.error &&
      errorData.error.includes("aesgraph@gmail.com")
    ) {
      throw new Error(`🔒 Access Denied: ${errorData.error}`);
    }
    throw new Error(
      `Live Chat API error: ${response.status} ${response.statusText} - ${errorData.error || "Unknown error"}`
    );
  }
  const data = await response.json();
  return data.message || "No response received";
}

export async function sendAIMessage({
  chatMessages,
  apiProvider,
  openaiApiKey,
  liveChatUrl,
  isCustomEndpoint,
  isSignedIn,
  user,
  temperature,
  tools,
}: {
  chatMessages: ChatMessage[];
  apiProvider: ApiProvider;
  openaiApiKey: string;
  liveChatUrl: string;
  isCustomEndpoint: boolean;
  isSignedIn: boolean;
  user: any;
  temperature: number;
  tools?: OpenAITool[];
}): Promise<AIResponse> {
  if (apiProvider === "openai") {
    return callOpenAIAPI(chatMessages, openaiApiKey, temperature, tools);
  } else if (apiProvider === "live-chat") {
    const content = await callLiveChatAPI(
      chatMessages,
      liveChatUrl,
      isCustomEndpoint,
      isSignedIn,
      user,
      temperature
    );
    return { content };
  } else {
    const content = await callLLMStudioAPI(chatMessages, { temperature });
    return { content };
  }
}
