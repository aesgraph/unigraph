import React, { useEffect, useState } from "react";
import { Command } from "../../hooks/useCommandPalette";
import styles from "./CommandPalette.module.css";

interface CommandPaletteProps {
  isOpen: boolean;
  commands: Command[];
  onClose: () => void;
  onExecuteCommand: (command: Command) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  commands,
  onClose,
  onExecuteCommand,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandStack, setCommandStack] = useState<Command[][]>([commands]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setCommandStack([commands]);
    }
  }, [isOpen, commands]);

  const currentCommands = commandStack[commandStack.length - 1];

  // Filter commands based on query
  const filteredCommands = currentCommands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  // Handle selection (enter/click)
  const handleSelect = React.useCallback(
    (command: Command) => {
      if (command.children && command.children.length > 0) {
        setCommandStack((prevStack) => [...prevStack, command.children ?? []]);
        setQuery("");
        setSelectedIndex(0);
      } else if (command.id === "demos") {
        // Special case: Demos command triggers a repopulation, not close
        onExecuteCommand(command);
        // Do NOT close the palette here!
        // The parent will update the commands prop, which will reset the stack
        // and show the demo list.
      } else {
        onExecuteCommand(command);
        onClose();
      }
    },
    [onExecuteCommand, onClose]
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Backspace":
        case "Delete":
        case "Escape":
          if (commandStack.length > 1) {
            setCommandStack(commandStack.slice(0, -1));
            setQuery("");
            setSelectedIndex(0);
          } else if (e.key === "Escape") {
            onClose();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? filteredCommands.length - 1 : prev - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === filteredCommands.length - 1 ? 0 : prev + 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    selectedIndex,
    filteredCommands,
    onClose,
    onExecuteCommand,
    commandStack,
    handleSelect,
  ]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <input
          className={styles.input}
          autoFocus
          placeholder="Type a command..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
        />
        <div
          className={styles.list}
          style={{ maxHeight: 320, overflowY: "auto" }}
        >
          {commandStack.length > 1 && (
            <div
              className={styles.item}
              onClick={() => {
                setCommandStack(commandStack.slice(0, -1));
                setQuery("");
                setSelectedIndex(0);
              }}
              style={{ fontStyle: "italic", color: "#888" }}
            >
              ← Back
            </div>
          )}
          {filteredCommands.length === 0 ? (
            <div className={styles.noResults}>No commands found</div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`${styles.itemRow} ${
                  index === selectedIndex ? styles.selected : ""
                }`}
                onClick={() => handleSelect(command)}
                onMouseEnter={() => setSelectedIndex(index)}
                ref={(el) => {
                  if (index === selectedIndex && el) {
                    el.scrollIntoView({ block: "nearest" });
                  }
                }}
              >
                <div className={styles.itemLeft}>
                  <div className={styles.title}>{command.title}</div>
                  {command.description && (
                    <div className={styles.description}>
                      {command.description}
                    </div>
                  )}
                </div>
                {command.children && command.children.length > 0 && (
                  <div className={styles.itemRight}>
                    <span style={{ float: "right", color: "#888" }}>→</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
