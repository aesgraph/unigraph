import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useEffect } from "react";
import "./TextBasedContextMenu.module.css";

export interface TextContextMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface TextBasedContextMenuProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  items: TextContextMenuItem[];
  onClose: () => void;
}

/**
 * A specialized context menu for text operations like annotation
 * Appears when text is selected and right-clicked
 */
const TextBasedContextMenu: React.FC<TextBasedContextMenuProps> = ({
  position,
  // eslint-disable-next-line unused-imports/no-unused-vars
  selectedText,
  items,
  onClose,
}) => {
  const { theme } = useTheme();
  // Function to prevent text deselection
  const preventTextDeselection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Effect to ensure selection is preserved globally
  useEffect(() => {
    // Store the current selection when the menu is opened
    const selection = window.getSelection();
    const range = selection?.rangeCount
      ? selection.getRangeAt(0).cloneRange()
      : null;

    // If menu is closed, don't do anything special
    if (!position || !range) return;

    // Function to ensure selection is restored if it gets lost
    const checkAndRestoreSelection = () => {
      if (selection && selection.rangeCount === 0 && range) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };

    // Check periodically to restore selection if needed
    const intervalId = setInterval(checkAndRestoreSelection, 100);

    // Clean up
    return () => {
      clearInterval(intervalId);
    };
  }, [position]);

  if (!position) return null;

  // Calculate position to keep menu in viewport
  const adjustPosition = () => {
    if (!position) return { left: 0, top: 0 };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 160; // Slightly bigger width
    const menuHeight = items.length * 28; // Slightly bigger height per item

    let left = position.x;
    let top = position.y;

    // Adjust horizontal position
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 5;
    }

    // Adjust vertical position
    if (top + menuHeight > viewportHeight) {
      top = viewportHeight - menuHeight - 5;
    }

    return { left, top };
  };

  const { left, top } = adjustPosition();

  return (
    <div
      className="text-context-menu"
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 10000,
        background: getColor(theme.colors, "surface"),
        boxShadow: `0 4px 12px ${getColor(theme.colors, "border")}`,
        borderRadius: theme.sizes.borderRadius.sm,
        fontSize: theme.sizes.fontSize.sm,
        padding: "3px 0",
        minWidth: "140px",
        maxWidth: "160px",
        userSelect: "none", // Prevent selection in the menu itself
        border: `1px solid ${getColor(theme.colors, "border")}`,
      }}
      // Prevent deselection when interacting with menu
      onMouseDown={preventTextDeselection}
      onMouseUp={preventTextDeselection}
      onClick={preventTextDeselection}
    >
      {/* Menu items - removed text preview section */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={(e) => {
            // Prevent default behavior to keep selection
            e.preventDefault();
            e.stopPropagation();

            if (!item.disabled) {
              // Store the selection before the action
              const selection = window.getSelection();
              const range = selection?.rangeCount
                ? selection.getRangeAt(0).cloneRange()
                : null;

              // Execute the action
              item.onClick();

              // Only close if not the annotate option (which may need selection)
              if (item.id !== "annotate") {
                onClose();
              }

              // Restore selection if needed (for annotate action)
              if (item.id === "annotate" && range && selection) {
                // Small delay to ensure selection is restored after other operations
                setTimeout(() => {
                  selection.removeAllRanges();
                  selection.addRange(range);
                }, 10);
              }
            }
          }}
          style={{
            padding: "6px 10px",
            cursor: item.disabled ? "default" : "pointer",
            opacity: item.disabled ? 0.5 : 1,
            backgroundColor: "transparent",
            color: getColor(theme.colors, "text"),
            whiteSpace: "nowrap",
            fontSize: theme.sizes.fontSize.md,
            borderRadius: theme.sizes.borderRadius.sm,
            margin: "1px 4px",
          }}
          onMouseOver={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = getColor(
                theme.colors,
                "surfaceHover"
              );
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          // Prevent deselection on each menu item
          onMouseDown={preventTextDeselection}
          onMouseUp={preventTextDeselection}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default TextBasedContextMenu;
