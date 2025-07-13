import { WebLLMClient } from "./WebLLMClient";

export const webllmClient = new WebLLMClient({
  model: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  initProgressCallback: (progress) =>
    console.log("Loading progress:", progress),
});

export async function main() {
  await webllmClient.load();

  console.log("Model loaded:", webllmClient.getModel(), "sending message");

  // Simple completion
  const reply = await webllmClient.chatCompletion([
    {
      role: "system",
      content: "You are a helpful assistant.",
      id: "1",
      timestamp: new Date(),
    },
    {
      role: "user",
      content: "Tell me a story about a cat.",
      id: "2",
      timestamp: new Date(),
    },
  ]);

  console.log("Full Reply:", reply);

  // Streaming completion
  const reply2 = await webllmClient.streamChatCompletion([
    {
      role: "system",
      content: "You are a helpful assistant.",
      id: "3",
      timestamp: new Date(),
    },
    {
      role: "user",
      content: "Give me a joke.",
      id: "4",
      timestamp: new Date(),
    },
  ]);

  console.log(reply2);
}

main();
