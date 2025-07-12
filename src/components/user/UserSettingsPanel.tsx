import React, { useState } from "react";

interface UserSettingsPanelProps {
  isVisible: boolean;
  onSignOut?: () => void;
  onSwitchAccount?: () => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
  panelId?: string;
  isSignedIn?: boolean;
  onSignIn?: () => void;
}

const UserSettingsPanel: React.FC<UserSettingsPanelProps> = ({
  isVisible,
  onSignOut,
  onSwitchAccount,
  onToggleDarkMode,
  isDarkMode = false,
  panelId,
  isSignedIn = true,
  onSignIn,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  if (!isVisible) return null;

  // Panel background: pleasant, neutral grey for both modes
  const panelBg = "#4a5568";
  const borderColor = isDarkMode ? "#444" : "#cfd8dc";

  // Helper function to get button styles with hover effects
  const getButtonStyles = (buttonType: string, baseColor: string) => {
    const isHovered = hoveredButton === buttonType;
    const baseBg = isDarkMode ? "#23272f" : "#fff";
    const hoverBg = isDarkMode ? "#2d3748" : "#f8f9fa";

    // Determine border color on hover based on button type
    let hoverBorderColor = baseColor;
    if (isHovered) {
      if (buttonType === "logout") {
        hoverBorderColor = "#e53935"; // Red for logout
      } else if (isDarkMode) {
        hoverBorderColor = "#666"; // Light gray for dark mode
      } else {
        hoverBorderColor = "#1976d2"; // Blue for light mode
      }
    }

    return {
      width: "100%",
      padding: "10px 0",
      background: isHovered ? hoverBg : baseBg,
      border: `1px solid ${hoverBorderColor}`,
      borderRadius: 7,
      textAlign: "center" as const,
      cursor: "pointer",
      fontSize: 15,
      color: baseColor,
      outline: "none",
      fontWeight: buttonType === "signIn" ? 600 : "normal",
      transition:
        "background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
      boxShadow: isHovered
        ? isDarkMode
          ? `0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)`
          : `0 0 0 1px rgba(25,118,210,0.2), 0 2px 8px rgba(0,0,0,0.1)`
        : "none",
    };
  };

  return (
    <div
      id={panelId || "profile-dropdown-panel"}
      style={{
        position: "fixed",
        left: 72, // margin from left sidebar
        bottom: 16,
        zIndex: 10000,
        background: panelBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
        minWidth: 220,
        maxWidth: "calc(100vw - 88px)",
        padding: "16px 0 12px 0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "stretch",
      }}
    >
      {/* Theme toggle row */}
      <div
        style={{
          padding: "0 18px 8px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 15,
            color: isDarkMode ? "#ffffff" : "#ffffff",
            flex: 1,
            userSelect: "none",
          }}
        >
          Theme
        </span>
        <button
          onClick={onToggleDarkMode}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 22,
            borderRadius: 12,
            border: `1px solid ${isDarkMode ? "#1976d2" : "#bdbdbd"}`,
            background: isDarkMode ? "#222b36" : "#fff",
            cursor: "pointer",
            padding: 0,
            transition: "background 0.15s, border 0.15s",
            position: "relative",
          }}
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: isDarkMode ? "#1976d2" : "#bdbdbd",
              position: "absolute",
              left: isDarkMode ? 16 : 2,
              top: 1.5,
              transition:
                "left 0.18s cubic-bezier(.4,0,.2,1), background 0.18s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 13,
            }}
          >
            {isDarkMode ? "🌙" : "☀️"}
          </div>
        </button>
      </div>
      {/* Auth-related actions */}
      <div
        style={{
          padding: "0 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {isSignedIn ? (
          <>
            <button
              style={getButtonStyles(
                "switchAccount",
                isDarkMode ? "#e2e8f0" : "#222"
              )}
              onClick={() => {
                console.log("UserSettingsPanel: Switch Account button clicked");
                onSwitchAccount?.();
              }}
              onMouseEnter={() => setHoveredButton("switchAccount")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Switch Account
            </button>
            <button
              style={getButtonStyles("logout", "#e53935")}
              onClick={onSignOut}
              onMouseEnter={() => setHoveredButton("logout")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Log out
            </button>
          </>
        ) : (
          <button
            style={getButtonStyles("signIn", "#1976d2")}
            onClick={onSignIn}
            onMouseEnter={() => setHoveredButton("signIn")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSettingsPanel;
