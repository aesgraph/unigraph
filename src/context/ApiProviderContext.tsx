import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiProvider } from "../components/ai/aiQueryLogic";
import { checkLLMStudioAvailability } from "../components/applets/ChatGptImporter/services/llmStudioService";
import { getEnvVar } from "../utils/envUtils";

interface ApiProviderContextType {
  apiProvider: ApiProvider;
  apiAvailable: boolean | null;
  openaiApiKey: string;
  liveChatUrl: string;
  isCustomEndpoint: boolean;
  isVercelEndpoint: boolean;
  getEndpointType: () => "Custom" | "Server";
  setApiProvider: (provider: ApiProvider) => void;
  refreshApiAvailability: () => Promise<void>;
}

const ApiProviderContext = createContext<ApiProviderContextType | undefined>(
  undefined
);

interface ApiProviderProviderProps {
  children: React.ReactNode;
}

export const ApiProviderProvider: React.FC<ApiProviderProviderProps> = ({
  children,
}) => {
  const [apiProvider, setApiProvider] = useState<ApiProvider>("llm-studio");
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // Get environment variables
  const openaiApiKey = getEnvVar("VITE_OPENAI_API_KEY") || "";
  const liveChatUrl =
    getEnvVar("VITE_LIVE_CHAT_URL") || getEnvVar("VITE_DEFAULT_CHAT_URL") || "";

  // Determine if this is a custom endpoint or production
  const isCustomEndpoint = useCallback(() => {
    const defaultUrl = getEnvVar("VITE_DEFAULT_CHAT_URL");
    return liveChatUrl !== defaultUrl;
  }, [liveChatUrl]);

  // Check if we're using a Vercel endpoint (should hide endpoint info)
  const isVercelEndpoint = useCallback(() => {
    if (!liveChatUrl) return false;
    try {
      const url = new URL(liveChatUrl);
      return url.hostname.includes("vercel");
    } catch {
      return false;
    }
  }, [liveChatUrl]);

  const getEndpointType = useCallback(() => {
    if (isCustomEndpoint()) {
      return "Custom";
    }
    return "Server";
  }, [isCustomEndpoint]);

  // Check API availability and determine provider
  const checkApiAvailability = useCallback(async () => {
    if (openaiApiKey) {
      // If we have an OpenAI API key, use that first
      setApiProvider("openai");
      setApiAvailable(true);
    } else if (liveChatUrl) {
      // If using a custom endpoint (like localhost), use live chat without auth requirement
      setApiProvider("live-chat");
      setApiAvailable(true);
    } else {
      // Check if LLM Studio is available
      try {
        const available = await checkLLMStudioAvailability();
        setApiProvider("llm-studio");
        setApiAvailable(available);
      } catch (error) {
        console.error("LLM Studio not available:", error);
        setApiAvailable(false);
      }
    }
  }, [openaiApiKey, liveChatUrl]);

  // Refresh API availability (for manual refresh)
  const refreshApiAvailability = useCallback(async () => {
    await checkApiAvailability();
  }, [checkApiAvailability]);

  // Initial API availability check
  useEffect(() => {
    checkApiAvailability();
  }, [checkApiAvailability]);

  const value: ApiProviderContextType = {
    apiProvider,
    apiAvailable,
    openaiApiKey,
    liveChatUrl,
    isCustomEndpoint: isCustomEndpoint(),
    isVercelEndpoint: isVercelEndpoint(),
    getEndpointType,
    setApiProvider,
    refreshApiAvailability,
  };

  return (
    <ApiProviderContext.Provider value={value}>
      {children}
    </ApiProviderContext.Provider>
  );
};

export const useApiProvider = (): ApiProviderContextType => {
  const context = useContext(ApiProviderContext);
  if (context === undefined) {
    throw new Error(
      "useApiProvider must be used within an ApiProviderProvider"
    );
  }
  return context;
};
