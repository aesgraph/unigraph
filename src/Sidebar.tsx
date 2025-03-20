/* eslint-disable unused-imports/no-unused-vars */
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";
import { SubMenuItem } from "./configs/RightSidebarConfig";

interface SidebarProps {
  position: "left" | "right";
  title?: string;
  menuItems: MenuItem[];
  defaultIsOpen?: boolean;
  onToggle?: () => void;
  isDarkMode?: boolean;
  content?: React.ReactNode;
  footer?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  minimal?: boolean;
  style?: React.CSSProperties;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  content?: React.ReactNode;
  subMenus?: SubMenuItem[];
  hideHeader?: boolean;
  alwaysExpanded?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  position,
  title = "Unigraph",
  menuItems,
  defaultIsOpen = true,
  onToggle,
  isDarkMode,
  content,
  footer,
  minimal = false,
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({});

  const closeButton =
    position === "left" ? (
      <ChevronsLeft size={20} />
    ) : (
      <ChevronsRight size={20} />
    );

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
    onToggle?.();
  };

  const toggleMenu = (menuId: string) => {
    if (!isOpen) {
      setIsOpen(true);
      setExpandedMenus((prev) => ({ ...prev, [menuId]: true }));
    } else {
      setExpandedMenus((prev) => ({
        ...prev,
        [menuId]: !prev[menuId],
      }));
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setExpandedMenus({});
    }
  }, [isOpen]);

  if (minimal && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`${styles.minimalTab} ${styles[position]}`}
        aria-label="Open sidebar"
      >
        {position === "left" ? (
          <ChevronsRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    );
  }

  return (
    <div
      className={styles.sidebar}
      style={{
        width: isOpen ? "200px" : minimal ? "0px" : "60px",
        ...style,
      }}
    >
      <div className={styles.sidebarHeader}>
        {isOpen && <h1 className={styles.sidebarTitle}>{title}</h1>}
        <button
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? closeButton : <Menu size={20} />}
        </button>
      </div>

      <div className={styles.menuContainer}>
        {content ? (
          <div className={styles.sidebarContent}>{content}</div>
        ) : (
          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <div key={item.id} className={styles.menuItem}>
                {!item.hideHeader && (
                  <button
                    className={styles.menuButton}
                    onClick={() => toggleMenu(item.id)}
                  >
                    {item.icon}
                    {isOpen && (
                      <>
                        <span className={styles.menuText}>{item.label}</span>
                        {expandedMenus[item.id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </>
                    )}
                  </button>
                )}
                {isOpen && (expandedMenus[item.id] || item.alwaysExpanded) && (
                  <div className={styles.submenu}>
                    {item.content ||
                      item.subMenus?.map((subMenu, idx) => (
                        <div key={idx} className={styles.submenuItem}>
                          {subMenu.customRender || subMenu.content || (
                            <button
                              onClick={subMenu.onClick}
                              className={styles.submenuButton}
                            >
                              {subMenu.label}
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>

      {footer && typeof footer === "function" ? (
        <div className={styles.sidebarFooter}>{footer(isOpen)}</div>
      ) : (
        footer && <div className={styles.sidebarFooter}>{footer}</div>
      )}
    </div>
  );
};

export default Sidebar;
