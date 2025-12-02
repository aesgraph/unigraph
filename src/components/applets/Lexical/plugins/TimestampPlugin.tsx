import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  LexicalEditor,
  NodeKey,
  TextNode,
} from "lexical";
import React, { useCallback, useEffect } from "react";

export interface TimestampPluginProps {
  onInsertTimestamp?: (insertFn: (timestamp: string) => void) => void;
}

// Custom Lexical node for timestamp tags
export class TimestampNode extends TextNode {
  static getType(): string {
    return "timestamp";
  }

  static clone(node: TimestampNode): TimestampNode {
    return new TimestampNode(node.__timestamp, node.__key);
  }

  constructor(timestamp: string, key?: NodeKey) {
    super(`[${timestamp}]`, key);
    this.__timestamp = timestamp;
  }

  __timestamp: string;

  getTimestamp(): string {
    return this.__timestamp;
  }

  setTimestamp(timestamp: string): void {
    const writable = this.getWritable();
    writable.__timestamp = timestamp;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "timestamp-tag";
    span.textContent = `[${this.__timestamp}]`;
    span.style.cssText = `
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
      font-weight: 500;
      margin: 0 2px;
      border: 1px solid #bbdefb;
      cursor: pointer;
      user-select: none;
      position: relative;
      display: inline-block;
    `;

    // Add click handler to make timestamps clickable for video navigation
    span.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Emit custom event for YouTube player to handle timestamp navigation
      const event = new CustomEvent("timestampClick", {
        detail: { timestamp: this.__timestamp },
      });
      document.dispatchEvent(event);
    });

    // Add hover effect to indicate it's clickable for navigation
    span.addEventListener("mouseenter", () => {
      span.style.backgroundColor = "#e8f5e8";
      span.style.borderColor = "#4caf50";
      span.style.color = "#2e7d32";
      span.style.transform = "scale(1.05)";
      span.style.transition = "all 0.2s ease";
    });

    span.addEventListener("mouseleave", () => {
      span.style.backgroundColor = "#e3f2fd";
      span.style.borderColor = "#bbdefb";
      span.style.color = "#1976d2";
      span.style.transform = "scale(1)";
    });

    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): true {
    return true;
  }

  // Override canInsertTextBefore to prevent text insertion before timestamps
  canInsertTextBefore(): boolean {
    return false;
  }

  // Override canInsertTextAfter to prevent text insertion after timestamps
  canInsertTextAfter(): boolean {
    return false;
  }

  // Override isSegmented to make timestamps behave as single units
  isSegmented(): boolean {
    return true;
  }

  static importJSON(serializedNode: any): TimestampNode {
    const { timestamp } = serializedNode;
    return new TimestampNode(timestamp);
  }

  exportJSON(): any {
    return {
      timestamp: this.__timestamp,
      type: "timestamp",
      version: 1,
    };
  }
}

// Helper function to create a timestamp node
export function $createTimestampNode(timestamp: string): TimestampNode {
  return new TimestampNode(timestamp);
}

// Helper function to check if a node is a timestamp node
export function $isTimestampNode(node: any): node is TimestampNode {
  return node instanceof TimestampNode;
}

// Helper function to parse timestamp string to seconds
export function parseTimestampToSeconds(timestamp: string): number {
  // Remove brackets if present
  const cleanTimestamp = timestamp.replace(/[[\]]/g, "");

  // Split by colon
  const parts = cleanTimestamp.split(":");

  if (parts.length === 2) {
    // mm:ss format
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    // Validate that both values are valid numbers
    if (isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // hh:mm:ss format
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    // Validate that all values are valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

// Plugin component
export const TimestampPlugin: React.FC<TimestampPluginProps> = ({
  onInsertTimestamp,
}) => {
  const [editor] = useLexicalComposerContext();

  // Function to insert timestamp at current cursor position
  const insertTimestamp = useCallback(
    (timestamp: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Create a timestamp node
          const timestampNode = $createTimestampNode(timestamp);

          // Insert the timestamp node at the current selection
          selection.insertNodes([timestampNode]);

          // Add a space after the timestamp for better UX
          const spaceNode = $createTextNode(" ");
          selection.insertNodes([spaceNode]);

          // Move cursor to the end of the inserted content
          spaceNode.select();
        }
      });
    },
    [editor]
  );

  // Handle keyboard deletion of timestamps
  useEffect(() => {
    // Register keyboard commands for deletion
    const removeDeleteListener = editor.registerCommand(
      KEY_DELETE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          const timestampNodes = nodes.filter($isTimestampNode);

          if (timestampNodes.length > 0) {
            timestampNodes.forEach((node) => {
              node.remove();
            });
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const removeBackspaceListener = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          const timestampNodes = nodes.filter($isTimestampNode);

          if (timestampNodes.length > 0) {
            timestampNodes.forEach((node) => {
              node.remove();
            });
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeDeleteListener();
      removeBackspaceListener();
    };
  }, [editor]);

  // Expose the insert function to parent components
  useEffect(() => {
    if (onInsertTimestamp) {
      onInsertTimestamp(insertTimestamp);
    }
  }, [insertTimestamp, onInsertTimestamp]);

  return null;
};

// Hook to use the timestamp insertion functionality
export const useTimestampInsertion = (editor: LexicalEditor) => {
  return useCallback(
    (timestamp: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Create a timestamp node
          const timestampNode = $createTimestampNode(timestamp);

          // Insert the timestamp node at the current selection
          selection.insertNodes([timestampNode]);

          // Add a space after the timestamp for better UX
          const spaceNode = $createTextNode(" ");
          selection.insertNodes([spaceNode]);

          // Move cursor to the end of the inserted content
          spaceNode.select();
        }
      });
    },
    [editor]
  );
};

export default TimestampPlugin;
