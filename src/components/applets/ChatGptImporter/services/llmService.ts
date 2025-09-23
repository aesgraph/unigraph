import { addNotification } from "../../../../store/notificationStore";
import { WebLLMClient } from "./WebLLMClient";

// Default model to use
const DEFAULT_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

// Singleton instance
let clientInstance: WebLLMClient | null = null;
let isLoading = false;
export let webllmIsLoaded = false;
let currentModel = DEFAULT_MODEL;

/**
 * Get the shared WebLLMClient instance
 * If no instance exists, one will be created with the default model
 */
export const getSharedLLMClient = async (): Promise<WebLLMClient> => {
  if (!clientInstance) {
    isLoading = true;

    addNotification({
      message: `Loading conversation model ${currentModel}...`,
      type: "info",
      duration: 3000,
    });

    clientInstance = new WebLLMClient({
      model: currentModel,
      initProgressCallback: (_report) => {
        // if (report.progress % 20 === 0 || report.progress > 95) {
        //   addNotification({
        //     message: `Loading ${currentModel}: ${report.progress.toFixed(2)}%`,
        //     type: "info",
        //     duration: 2000,
        //   });
        // }
      },
    });

    try {
      await clientInstance.load();
      addNotification({
        message: `${currentModel} loaded successfully!`,
        type: "success",
        duration: 3000,
      });
      webllmIsLoaded = true;
    } catch (error) {
      console.error("Error loading LLM model:", error);
      addNotification({
        message: `Failed to load model: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
        duration: 5000,
      });
      clientInstance = null;
      throw error;
    } finally {
      isLoading = false;
    }
  }

  return clientInstance;
};

/**
 * Switch to a different model
 * @param model The model to switch to
 * @returns The WebLLMClient instance with the new model loaded
 */
export const switchModel = async (model: string): Promise<WebLLMClient> => {
  if (isLoading) {
    throw new Error("Model is currently loading, please wait");
  }

  // If model is the same and client exists, just return it
  if (clientInstance && currentModel === model) {
    return clientInstance;
  }

  currentModel = model;
  isLoading = true;

  // Create a new instance with the specified model
  const newClient = new WebLLMClient({
    model,
    initProgressCallback: (report) => {
      if (report.progress % 20 === 0 || report.progress > 95) {
        addNotification({
          message: `Loading ${model}: ${report.progress.toFixed(0)}%`,
          type: "info",
          duration: 2000,
        });
      }
    },
  });

  try {
    addNotification({
      message: `Loading ${model}. This may take a while on first use.`,
      type: "info",
      duration: 5000,
    });

    await newClient.load();

    // Update the singleton instance
    clientInstance = newClient;

    addNotification({
      message: `${model} loaded successfully!`,
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    console.error(`Error switching to model ${model}:`, error);
    addNotification({
      message: `Failed to load model: ${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: 5000,
    });
    throw error;
  } finally {
    isLoading = false;
  }

  return clientInstance;
};

/**
 * Check if a model is currently loading
 */
export const isModelLoading = (): boolean => isLoading;

/**
 * Get the currently loaded model
 */
export const getCurrentModel = (): string => currentModel;

/**
 * Check if the client is initialized and loaded
 */
export const isClientReady = (): boolean => !!clientInstance;
