/* eslint-disable unused-imports/no-unused-vars */
import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useWorkspaceConfigStore, {
  updateSectionWidth,
} from "../../store/workspaceConfigStore";
import { SubMenuItem } from "./RightSidebarConfig";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  position: "left" | "right";
  title?: string;
  menuItems: MenuItem[];
  bottomElements?: React.ReactNode; // Added property for bottom elements
  onToggle?: () => void;
  isDarkMode?: boolean;
  content?: React.ReactNode;
  footer?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  minimal?: boolean;
  mode: "collapsed" | "full";
  style?: React.CSSProperties;
  hideHeader?: boolean; // Add option to hide the header entirely
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
  bottomElements, // Add the new prop
  onToggle,
  isDarkMode,
  content,
  footer,
  minimal = false,
  style = {},
  mode = "full",
  hideHeader = true,
}) => {
  const [isOpen, setIsOpen] = useState(mode === "full");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { theme } = useTheme();

  // Get the config based on sidebar position
  const {
    leftSidebarConfig,
    rightSidebarConfig,
    setLeftPanelWidth,
    setRightPanelWidth,
    sectionWidths,
  } = useWorkspaceConfigStore();

  // Initialize from the correct config based on position
  const configPanelWidth =
    position === "left"
      ? leftSidebarConfig.panelWidth
      : rightSidebarConfig.panelWidth;

  const activeSectionId =
    position === "left"
      ? leftSidebarConfig.activeSectionId
      : rightSidebarConfig.activeSectionId;

  // Get the initial width directly from sectionWidths or fall back to config
  const getInitialWidth = useCallback(
    (sectionId: string | null) => {
      if (!sectionId) return configPanelWidth;
      return sectionWidths[sectionId] || configPanelWidth;
    },
    [configPanelWidth, sectionWidths]
  );

  // Remove panelWidth state and use ref to track current width during resize
  const lastWidthRef = useRef<number>(getInitialWidth(activeSectionId));

  // Update the width when active section changes
  useEffect(() => {
    if (activeSectionId) {
      const width = getInitialWidth(activeSectionId);
      lastWidthRef.current = width;

      // Apply width immediately to DOM
      if (panelRef.current) {
        panelRef.current.style.width = `${width}px`;
      }
    }
  }, [activeSectionId, getInitialWidth]);

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const {
    showToolbar,
    getActiveSection,
    setLeftActiveSection,
    setRightActiveSection,
  } = useWorkspaceConfigStore();

  useEffect(() => {
    setIsOpen(mode === "full");
  }, [mode]);

  // Sync active section from config when it changes, but only if not already syncing
  useEffect(() => {
    // Get active section from workspace config store to coordinate across sidebars
    const configBasedActiveSection =
      position === "left"
        ? leftSidebarConfig.activeSectionId
        : rightSidebarConfig.activeSectionId;

    if (configBasedActiveSection != activeSection) {
      setActiveSection(configBasedActiveSection);
    }
  }, [
    leftSidebarConfig.activeSectionId,
    rightSidebarConfig.activeSectionId,
    position,
    getActiveSection,
    activeSection,
  ]);

  // Handler for section click - updates local state only
  const handleSectionClick = (menuId: string) => {
    const newValue = activeSection === menuId ? null : menuId;
    setActiveSection(newValue);

    // Update the store directly instead of relying on effect
    if (position === "left") {
      setLeftActiveSection(newValue);
    } else {
      setRightActiveSection(newValue);
    }
  };

  // Properly handle the close button click to update both local state and store
  const handleCloseSection = () => {
    setActiveSection(null);
    if (position === "left") {
      setLeftActiveSection(null);
    } else {
      setRightActiveSection(null);
    }
  };

  // Get toolbar height from CSS or use default
  const toolbarHeight =
    getComputedStyle(document.documentElement).getPropertyValue(
      "--toolbar-height"
    ) || "40px";

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

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startWidth: lastWidthRef.current,
    };
    // Add a class to the body to disable text selection during resize
    document.body.classList.add("resizing");
  };

  const handleResizeMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;

      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smoother updates
      rafRef.current = requestAnimationFrame(() => {
        if (!resizeRef.current) return;

        const delta =
          position === "left"
            ? e.clientX - resizeRef.current.startX
            : resizeRef.current.startX - e.clientX;

        const newWidth = Math.max(
          250,
          Math.min(600, resizeRef.current.startWidth + delta)
        );

        lastWidthRef.current = newWidth;

        // Directly update the DOM element style for better performance
        if (panelRef.current) {
          panelRef.current.style.width = `${newWidth}px`;
        }
      });
    },
    [isResizing, position]
  );

  // Handle resize end updated to save section width
  const handleResizeEnd = React.useCallback(() => {
    setIsResizing(false);
    resizeRef.current = null;
    document.body.classList.remove("resizing");

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const newWidth = lastWidthRef.current;

    // Save the width to both the section config and panel width
    if (activeSectionId) {
      updateSectionWidth(activeSectionId, newWidth);
    }

    // Update panel width in store
    if (position === "left") {
      setLeftPanelWidth(newWidth);
    } else {
      setRightPanelWidth(newWidth);
    }
  }, [position, setLeftPanelWidth, setRightPanelWidth, activeSectionId]);

  useLayoutEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove, {
        passive: true,
      });
      document.addEventListener("mouseup", handleResizeEnd);

      document.body.style.cursor =
        position === "left" ? "e-resize" : "w-resize";
    } else {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);

      document.body.style.cursor = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
      document.body.style.cursor = "";

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [handleResizeMove, handleResizeEnd, isResizing, position]);

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
    <>
      <div
        className={styles.sidebar}
        style={{
          width: isOpen ? "150px" : minimal ? "0px" : "60px",
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
          color: getColor(theme.colors, "text"),
          ...style,
        }}
      >
        {!hideHeader && (
          <div
            className={styles.sidebarHeader}
            style={{
              borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
            }}
          >
            {isOpen && (
              <h1
                className={styles.sidebarTitle}
                style={{
                  color: getColor(theme.colors, "text"),
                }}
              >
                {title}
              </h1>
            )}
            <button
              onClick={toggleSidebar}
              className={styles.toggleButton}
              style={{
                color: getColor(theme.colors, "text"),
              }}
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? closeButton : <Menu size={20} />}
            </button>
          </div>
        )}

        <div
          className={`${styles.menuContainer} ${hideHeader ? styles.noHeaderMenuContainer : ""}`}
        >
          {content ? (
            <div className={styles.sidebarContent}>{content}</div>
          ) : (
            <nav className={styles.nav}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.menuItem} ${
                    activeSection === item.id ? styles.active : ""
                  }`}
                >
                  {!item.hideHeader && (
                    <button
                      className={`${styles.menuButton} ${
                        activeSection === item.id ? styles.activeMenuButton : ""
                      }`}
                      onClick={() => handleSectionClick(item.id)}
                      title={item.label} // Add tooltip that shows on hover
                      aria-label={item.label} // For accessibility
                      style={{
                        color: getColor(theme.colors, "text"),
                      }}
                    >
                      {item.icon}
                      {isOpen && (
                        <>
                          <span
                            className={styles.menuText}
                            style={{
                              color: getColor(theme.colors, "text"),
                            }}
                          >
                            {item.label}
                          </span>
                          {activeSection === item.id ? (
                            <ChevronRight
                              size={16}
                              className={styles.activeIcon}
                              style={{
                                color: getColor(theme.colors, "text"),
                              }}
                            />
                          ) : (
                            <ChevronLeft
                              size={16}
                              style={{
                                color: getColor(theme.colors, "textSecondary"),
                              }}
                            />
                          )}
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Render bottom elements if provided */}
        {bottomElements && (
          <div className={styles.bottomElements}>{bottomElements}</div>
        )}

        {footer && typeof footer === "function" ? (
          <div className={styles.sidebarFooter}>{footer(isOpen)}</div>
        ) : (
          footer && <div className={styles.sidebarFooter}>{footer}</div>
        )}
      </div>

      {/* Side panel as adjacent element in flex container */}
      {activeSection &&
        menuItems.find((item) => item.id === activeSection)?.content && (
          <div
            ref={panelRef}
            className={styles.sidePanel}
            style={{
              width: `${getInitialWidth(activeSectionId)}px`,
              willChange: isResizing ? "width" : "auto",
              transitionProperty: isResizing ? "none" : "width",
              backgroundColor: getColor(theme.colors, "backgroundSecondary"),
              color: getColor(theme.colors, "text"),
            }}
          >
            <div
              className={styles.sidePanelHeader}
              style={{
                borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
              }}
            >
              <h3
                style={{
                  color: getColor(theme.colors, "text"),
                }}
              >
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h3>
              <button
                onClick={handleCloseSection}
                className={styles.closeButton}
                style={{
                  color: getColor(theme.colors, "text"),
                }}
              >
                {position === "left" ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
            <div className={styles.sidePanelContent}>
              {menuItems.find((item) => item.id === activeSection)?.content}
            </div>

            {/* Add resize handle */}
            <div
              className={`${styles.resizeHandle} ${styles[position]}`}
              onMouseDown={handleResizeStart}
            />
          </div>
        )}
    </>
  );
};

export default Sidebar;
