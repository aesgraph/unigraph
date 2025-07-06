import React from "react";

interface ProfileDropdownProps {
  isVisible: boolean;
  onSignOut: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onSwitchAccount?: () => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isVisible,
  onSignOut,
  buttonRef,
  onSwitchAccount,
  onToggleDarkMode,
  isDarkMode = false,
}) => {
  if (!isVisible) return null;

  // Position the panel floating in the bottom left, always fully visible
  return (
    <div
      style={{
        position: "fixed",
        left: 72, // Add margin so it doesn't cover the left sidebar (e.g. sidebar width + margin)
        bottom: 16,
        zIndex: 10000,
        background: isDarkMode ? "#23272f" : "#f5f6fa",
        border: isDarkMode ? "1px solid #444" : "1px solid #d1d5db",
        borderRadius: 12,
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
        minWidth: 220,
        maxWidth: "calc(100vw - 88px)", // 72px left + 16px right
        padding: "18px 0 14px 0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "stretch",
      }}
    >
      <div style={{ padding: "0 20px 8px 20px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 15,
            color: isDarkMode ? "#e2e8f0" : "#222",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="radio"
            checked={!isDarkMode}
            onChange={() => {
              if (isDarkMode && onToggleDarkMode) onToggleDarkMode();
            }}
            style={{
              accentColor: "#1976d2",
              marginRight: 6,
              width: 16,
              height: 16,
            }}
            name="theme"
          />
          Light Mode
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 15,
            color: isDarkMode ? "#e2e8f0" : "#222",
            cursor: "pointer",
            userSelect: "none",
            marginTop: 4,
          }}
        >
          <input
            type="radio"
            checked={isDarkMode}
            onChange={() => {
              if (!isDarkMode && onToggleDarkMode) onToggleDarkMode();
            }}
            style={{
              accentColor: "#1976d2",
              marginRight: 6,
              width: 16,
              height: 16,
            }}
            name="theme"
          />
          Dark Mode
        </label>
      </div>
      <div
        style={{
          padding: "0 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "10px 0",
            background: isDarkMode ? "#23272f" : "#fff",
            border: "1px solid #bdbdbd",
            borderRadius: 7,
            textAlign: "center",
            cursor: "pointer",
            fontSize: 15,
            color: isDarkMode ? "#e2e8f0" : "#222",
            outline: "none",
            transition: "background 0.15s",
          }}
          onClick={onSwitchAccount}
        >
          Switch Account
        </button>
        <button
          style={{
            width: "100%",
            padding: "10px 0",
            background: isDarkMode ? "#23272f" : "#fff",
            border: "1px solid #bdbdbd",
            borderRadius: 7,
            textAlign: "center",
            cursor: "pointer",
            fontSize: 15,
            color: "#e53935",
            outline: "none",
            transition: "background 0.15s",
          }}
          onClick={onSignOut}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
