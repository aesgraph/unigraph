import { LucideIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ContextMenu.module.css";

export type ContextMenuDisplayMode = "list" | "grid";

export interface ContextMenuItem {
  label: string;
  action?: () => void;
  submenu?: ContextMenuItem[];
  displayMode?: ContextMenuDisplayMode; // Controls how submenu is displayed
  gridColumns?: number; // Number of columns for grid layout
  information?: boolean; // New prop to mark item as informational (non-clickable)
  separator?: boolean; // New prop to mark item as a visual separator
  style?: "default" | "primary" | "warning" | "caution"; // Styling options
  icon?: LucideIcon; // Lucide React icon component
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  isDarkMode?: boolean;
  displayMode?: ContextMenuDisplayMode; // Allow specifying grid vs list mode
  gridColumns?: number; // Allow custom grid columns
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  onClose,
  isDarkMode,
  displayMode = "list",
  gridColumns = 3,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<{
    items: ContextMenuItem[];
    position: { x: number; y: number };
    displayMode?: ContextMenuDisplayMode;
    gridColumns?: number;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.contextMenu}`)) {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  // Handle item mouse enter - open submenu
  const handleItemMouseEnter = (
    item: ContextMenuItem,
    event: React.MouseEvent
  ) => {
    // Don't process submenu for information items
    if (item.information) {
      setActiveSubmenu(null);
      return;
    }

    if (item.submenu && item.submenu.length > 0) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setActiveSubmenu({
        items: item.submenu,
        position: { x: rect.right, y: rect.top },
        displayMode: item.displayMode,
        gridColumns: item.gridColumns,
      });
    } else {
      setActiveSubmenu(null);
    }
  };

  // Handle mouse leave - close submenu
  const handleMouseLeave = () => {
    // We only close if we're not moving to a submenu
    // Let the submenus manage their own state
  };

  // Handle item click
  const handleItemClick = (item: ContextMenuItem) => {
    // Don't process clicks for information items
    if (item.information) {
      return;
    }

    if (!item.submenu) {
      item.action?.();
      onClose();
    }
  };

  // Get correct class names based on display mode
  const getMenuClassNames = () => {
    return `${styles.contextMenu} ${displayMode === "grid" ? styles.gridMenu : ""} ${isDarkMode ? styles.dark : ""}`;
  };

  // Render items based on display mode
  const renderItems = () => {
    return items.map((item, index) => {
      // Determine class name based on item type and display mode
      const baseClass =
        displayMode === "grid" ? styles.gridMenuItem : styles.contextMenuItem;
      let itemClass = baseClass;

      if (item.separator) {
        itemClass = `${baseClass} ${styles.informationItem}`;
      } else if (item.information) {
        itemClass = `${baseClass} ${styles.informationItem}`;
      } else if (item.style) {
        itemClass = `${baseClass} ${styles[item.style]}`;
      }

      return (
        <div
          key={index}
          className={itemClass}
          data-separator={item.separator ? "true" : undefined}
          onMouseEnter={(e) => handleItemMouseEnter(item, e)}
          onClick={() => handleItemClick(item)}
        >
          {item.icon && (
            <span className={styles.icon}>
              <item.icon size={16} />
            </span>
          )}
          {item.label}
          {item.submenu && displayMode !== "grid" && !item.information && (
            <span className={styles.submenuIndicator}>▶</span>
          )}
        </div>
      );
    });
  };

  // Calculate styles for grid mode
  const gridStyle =
    displayMode === "grid"
      ? { gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }
      : {};

  return (
    <>
      <div
        ref={menuRef}
        className={getMenuClassNames()}
        style={{
          position: "fixed",
          left: x,
          top: y,
          zIndex: 10000,
          ...gridStyle,
        }}
        onMouseLeave={handleMouseLeave}
      >
        {renderItems()}
      </div>

      {activeSubmenu && (
        <ContextMenu
          x={activeSubmenu.position.x}
          y={activeSubmenu.position.y}
          items={activeSubmenu.items}
          onClose={onClose}
          isDarkMode={isDarkMode}
          displayMode={activeSubmenu.displayMode || "list"}
          gridColumns={activeSubmenu.gridColumns || 3}
        />
      )}
    </>
  );
};

export default ContextMenu;
