import { useContext, useEffect } from "react";
import { useCommandProcessor } from "../commandPalette/CommandProcessor";
import {
  SemanticWebQueryContext,
  SemanticWebQueryContextType,
} from "./SemanticWebQueryContext";

const TOOL_ID = "semantic_tool";

export const SemanticTool: React.FC = () => {
  const ctx = useContext(SemanticWebQueryContext) as
    | SemanticWebQueryContextType
    | undefined;
  const { registerTool } = useCommandProcessor();

  useEffect(() => {
    if (!ctx) return;
    // Register the tool
    registerTool({
      tool_id: TOOL_ID,
      onCommand: (payload: any) => {
        // Expecting payload: { sessionId: string, query: string }
        const { sessionId, query } = payload;
        if (sessionId && typeof query === "string") {
          ctx.setSessionQuery(sessionId, query);
        } else {
          console.warn("SemanticTool: Invalid payload", payload);
        }
      },
    });
  }, [registerTool, ctx]);

  return null; // No UI
};
