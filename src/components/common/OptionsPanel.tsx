import React from "react";
import "./OptionsPanel.css";

interface OptionsPanelProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  children,
  isDarkMode = false,
}) => {
  return (
    <div className={`options-panel ${isDarkMode ? "dark" : "light"}`}>
      {children}
    </div>
  );
};

export default OptionsPanel;
