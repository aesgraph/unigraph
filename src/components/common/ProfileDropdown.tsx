import React from "react";

interface ProfileDropdownProps {
  isVisible: boolean;
  onSignOut?: () => void;
  onSwitchAccount?: () => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
  panelId?: string;
  isSignedIn?: boolean;
  onSignIn?: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isVisible,
  onSignOut,
  onSwitchAccount,
  onToggleDarkMode,
  isDarkMode = false,
  panelId,
  isSignedIn = true,
  onSignIn,
}) => {
  if (!isVisible) return null;

  // Panel background: more neutral/dark grey for both modes
  const panelBg = isDarkMode ? "#23272f" : "#eceff1";
  const borderColor = isDarkMode ? "#444" : "#cfd8dc";

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
            color: isDarkMode ? "#e2e8f0" : "#222",
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
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
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
              transition: "left 0.18s cubic-bezier(.4,0,.2,1), background 0.18s",
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
          </>
        ) : (
          <button
            style={{
              width: "100%",
              padding: "10px 0",
              background: isDarkMode ? "#23272f" : "#fff",
              border: "1px solid #1976d2",
              borderRadius: 7,
              textAlign: "center",
              cursor: "pointer",
              fontSize: 15,
              color: "#1976d2",
              outline: "none",
              fontWeight: 600,
              transition: "background 0.15s",
            }}
            onClick={onSignIn}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileDropdown;
