import React, { createContext, ReactNode, useContext, useRef } from "react";

// Tool interface
export interface CommandTool {
  tool_id: string;
  onCommand: (payload: any) => void;
}

interface CommandProcessorContextType {
  registerTool: (tool: CommandTool) => void;
  processCommand: (tool_id: string, payload: any) => void;
}

const CommandProcessorContext = createContext<
  CommandProcessorContextType | undefined
>(undefined);

export const CommandProcessorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Map of tool_id -> tool
  const toolsRef = useRef<Record<string, CommandTool>>({});

  const registerTool = (tool: CommandTool) => {
    toolsRef.current[tool.tool_id] = tool;
  };

  const processCommand = (tool_id: string, payload: any) => {
    const tool = toolsRef.current[tool_id];
    if (tool) {
      tool.onCommand(payload);
    } else {
      console.warn(`No tool registered for tool_id: ${tool_id}`);
    }
  };

  return (
    <CommandProcessorContext.Provider value={{ registerTool, processCommand }}>
      {children}
    </CommandProcessorContext.Provider>
  );
};

export function useCommandProcessor() {
  const ctx = useContext(CommandProcessorContext);
  if (!ctx)
    throw new Error(
      "useCommandProcessor must be used within a CommandProcessorProvider"
    );
  return ctx;
}
