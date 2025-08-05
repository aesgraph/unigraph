import React, { useState } from "react";

import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  menuBar: {
    position: "fixed",
    top: "8px",
    left: "8px",
    display: "flex",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d1d1",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
  },
  menuItem: {
    position: "relative",
    margin: 0,
    padding: 0,
  },
  menuButton: {
    padding: "8px 16px",
    fontSize: "14px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    outline: "none",
  },
  menuButtonHover: {
    backgroundColor: "#f0f0f0",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    minWidth: "180px",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d1d1",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    zIndex: 1001,
  },
  dropdownItem: {
    width: "100%",
    padding: "8px 16px",
    fontSize: "14px",
    textAlign: "left",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    outline: "none",
  },
  separator: {
    height: "1px",
    backgroundColor: "#d1d1d1",
    margin: "4px 0",
  },
};

const FloatingMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | undefined>(undefined);
  const [hoveredItem, setHoveredItem] = useState<string | undefined>(undefined);

  const menuItems: { [key: string]: string[] } = {
    File: ["New", "Open", "Save", "Save As...", "Exit"],
    Edit: ["Undo", "Redo", "Cut", "Copy", "Paste"],
    View: ["Zoom In", "Zoom Out", "Reset Zoom"],
    Help: ["Documentation", "About"],
  };

  const handleMouseEnter = (menuName: string | undefined) => {
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    setActiveMenu(undefined);
    setHoveredItem(undefined);
  };

  const handleItemHover = (item: string | undefined) => {
    setHoveredItem(item);
  };

  return (
    <nav style={styles.menuBar} onMouseLeave={handleMouseLeave}>
      {Object.keys(menuItems).map((menuName) => (
        <div
          key={menuName}
          style={styles.menuItem}
          onMouseEnter={() => handleMouseEnter(menuName)}
        >
          <button
            style={{
              ...styles.menuButton,
              ...(activeMenu === menuName ? styles.menuButtonHover : {}),
            }}
          >
            {menuName}
          </button>

          {activeMenu === menuName && (
            <div style={styles.dropdownMenu}>
              {menuItems[menuName].map((item, index) => (
                <div key={item}>
                  {index !== 0 && item === "Exit" && (
                    <div style={styles.separator} />
                  )}
                  <button
                    style={{
                      ...styles.dropdownItem,
                      backgroundColor:
                        hoveredItem === item ? "#0078d4" : "transparent",
                      color: hoveredItem === item ? "#ffffff" : "#000000",
                    }}
                    onMouseEnter={() => handleItemHover(item)}
                    onMouseLeave={() => handleItemHover(undefined)}
                    onClick={() => {
                      console.log(`Clicked: ${item}`);
                      setActiveMenu(undefined);
                    }}
                  >
                    {item}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default FloatingMenu;
