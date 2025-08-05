import { CommandTool } from "../commandPalette/CommandProcessor";

export interface CodeGenerationPayload {
  code: string;
  language?: string;
  description?: string;
  replace?: boolean; // If true, replace entire content; if false, append
}

export interface MonacoEditorCodeToolState {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  getCurrentLanguage: () => string;
  getCurrentCode: () => string;
}

export class MonacoEditorCodeTool implements CommandTool {
  tool_id = "monaco_editor_code_tool";
  private state: MonacoEditorCodeToolState | null = null;

  constructor(state: MonacoEditorCodeToolState) {
    this.state = state;
  }

  onCommand(payload: CodeGenerationPayload): void {
    if (!this.state) {
      console.error("MonacoEditorCodeTool state not initialized");
      return;
    }

    try {
      const { code, language, replace = true } = payload;

      // Update language if specified
      if (language) {
        this.state.setLanguage(language);
      }

      // Update code content
      if (replace) {
        // Replace entire content
        this.state.setCode(code);
      } else {
        // Append to existing content
        const currentCode = this.state.getCurrentCode();
        const separator = currentCode.trim() ? "\n\n" : "";
        this.state.setCode(currentCode + separator + code);
      }
    } catch (error) {
      console.error("Error in MonacoEditorCodeTool:", error);
    }
  }

  // Method to update the state reference (useful for React components)
  updateState(newState: MonacoEditorCodeToolState): void {
    this.state = newState;
  }
}

// Helper function to create the tool
export function createMonacoEditorCodeTool(
  state: MonacoEditorCodeToolState
): MonacoEditorCodeTool {
  return new MonacoEditorCodeTool(state);
}
