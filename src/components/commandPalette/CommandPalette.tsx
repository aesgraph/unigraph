import React, { useEffect, useState } from "react";
import { Command } from "../../hooks/useCommandPalette";
import "./CommandPalette.css";

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

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter commands based on query
  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
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
          if (filteredCommands[selectedIndex]) {
            onExecuteCommand(filteredCommands[selectedIndex]);
            onClose();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose, onExecuteCommand]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <input
          className="command-palette-input"
          autoFocus
          placeholder="Type a command..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
        />
        <div className="command-palette-list">
          {filteredCommands.length === 0 ? (
            <div className="command-palette-no-results">No commands found</div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`command-palette-item ${
                  index === selectedIndex ? "selected" : ""
                }`}
                onClick={() => {
                  onExecuteCommand(command);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="command-title">{command.title}</div>
                {command.description && (
                  <div className="command-description">
                    {command.description}
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
