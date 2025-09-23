// WebLLMClient.ts

import {
  ChatCompletion,
  CompletionCreateParams,
  MLCEngine,
} from "@mlc-ai/web-llm";
import { ChatMessage } from "../../../../store/chatHistoryStore";

export interface WebLLMClientConfig {
  model: string;
  initProgressCallback?: (report: { progress: number }) => void;
}

// Extended params type to include our new singleMessage option
export interface ExtendedCompletionParams
  extends Omit<CompletionCreateParams, "messages"> {
  singleMessage?: boolean;
  forceNewConvo?: boolean;
}

export class WebLLMClient {
  private engine: MLCEngine | null = null;
  private model: string;
  private initProgressCallback?: (report: { progress: number }) => void;

  public getModel(): string {
    return this.model;
  }

  constructor(config: WebLLMClientConfig) {
    this.model = config.model;
    this.initProgressCallback = config.initProgressCallback;
  }

  public async load(): Promise<void> {
    if (this.engine) return; // already loaded
    this.engine = new MLCEngine({
      initProgressCallback: (report) =>
        this.initProgressCallback?.({ progress: report.progress }),
    });
    await this.engine.reload(this.model);
  }

  public async reload(): Promise<void> {
    if (!this.engine) throw new Error("Engine not initialized");
    await this.engine.reload(this.model);
  }

  public isLoaded(): boolean {
    return this.engine !== null;
  }

  /**
   * Generate a response from the LLM for the given messages
   * @param messages Array of chat messages
   * @param params Additional parameters including temperature and whether to use only the last message
   * @returns The generated text response
   */
  public async chatCompletion(
    messages: ChatMessage[],
    params?: ExtendedCompletionParams
  ): Promise<string> {
    if (!this.engine) throw new Error("Engine not loaded");

    // Extract our custom params and standard MLCEngine params
    const {
      singleMessage = false,
      forceNewConvo = false,
      ...engineParams
    } = params || {};

    // Filter out messages with invalid roles (like 'error') and convert to API format
    const validMessages = messages
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

    // If singleMessage is true, only use the last message in the array
    const messagesToUse = singleMessage
      ? [validMessages[validMessages.length - 1]]
      : validMessages;

    // If forceNewConvo is true, clear the conversation history first
    if (forceNewConvo) {
      await this.engine.resetChat();
    }

    const reply = (await this.engine.chat.completions.create({
      messages: messagesToUse,
      stream: false,
      ...engineParams,
    })) as ChatCompletion;

    return reply.choices[0]?.message?.content ?? "";
  }

  public async streamChatCompletion(messages: ChatMessage[]): Promise<string> {
    if (!this.engine) throw new Error("Engine not loaded");

    // Filter out messages with invalid roles (like 'error') and convert to API format
    const validMessages = messages
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

    // Chunks is an AsyncGenerator object
    const chunks = await this.engine.chat.completions.create({
      messages: validMessages,
      temperature: 1,
      stream: true, // <-- Enable streaming
      stream_options: { include_usage: true },
    });

    let reply = "";
    for await (const chunk of chunks) {
      reply += chunk.choices[0]?.delta.content || "";
      console.log(reply);
      if (chunk.usage) {
        console.log(chunk.usage); // only last chunk has usage
      }
    }

    const fullReply = await this.engine.getMessage();
    return fullReply;
  }

  public async getMessage(): Promise<string> {
    if (!this.engine) throw new Error("Engine not loaded");
    return await this.engine.getMessage();
  }
}
