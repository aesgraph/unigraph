import React, { useEffect, useState } from "react";
import styles from "./ContextMenu.module.css";

export interface ContextMenuItem {
  label: string;
  action?: () => void;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  isDarkMode?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  onClose,
  isDarkMode,
}) => {
  const [submenu, setSubmenu] = useState<ContextMenuItem[] | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

  const handleItemMouseEnter = (
    item: ContextMenuItem,
    event: React.MouseEvent
  ) => {
    if (item.submenu) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setSubmenu(item.submenu);
      setSubmenuPosition({ x: rect.right, y: rect.top });
    } else {
      setSubmenu(null);
    }
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.submenu) {
      item.action?.();
      onClose();
    }
  };

  return (
    <>
      <div
        className={`${styles.contextMenu} ${isDarkMode ? styles.dark : ""}`}
        style={{
          position: "fixed",
          left: x,
          top: y,
          zIndex: 10000,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={styles.contextMenuItem}
            onMouseEnter={(e) => handleItemMouseEnter(item, e)}
            onClick={() => handleItemClick(item)}
          >
            {item.label}
            {item.submenu && (
              <span className={styles.submenuIndicator}>▶</span>
            )}
          </div>
        ))}
      </div>
      {submenu && submenuPosition && (
        <ContextMenu
          x={submenuPosition.x}
          y={submenuPosition.y}
          items={submenu}
          onClose={onClose}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default ContextMenu;
