import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useState } from "react";
import {
  customUnigraphTheme,
  unigraphWarmTheme,
} from "../../themes/customUnigraphTheme";

interface UserSettingsPanelProps {
  isVisible: boolean;
  onSignOut?: () => void;
  onSwitchAccount?: () => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
  panelId?: string;
  isSignedIn?: boolean;
  onSignIn?: () => void;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      picture?: string;
      name?: string;
    };
  } | null;
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
  user,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Get theme context
  const { theme, themeId, setTheme, themes: availableThemes } = useTheme();

  if (!isVisible) return null;

  // Add custom Unigraph themes to available themes
  const allThemes = {
    ...availableThemes,
    "unigraph-custom": customUnigraphTheme,
    "unigraph-warm": unigraphWarmTheme,
  };

  // Helper function to get button styles with hover effects
  const getButtonStyles = (buttonType: string, baseColor: string) => {
    const isHovered = hoveredButton === buttonType;
    const baseBg = getColor(theme.colors, "surface");
    const hoverBg = getColor(theme.colors, "surfaceHover");

    // Determine border color on hover based on button type
    let hoverBorderColor = baseColor;
    if (isHovered) {
      if (buttonType === "logout") {
        hoverBorderColor = getColor(theme.colors, "error");
      } else {
        hoverBorderColor = getColor(theme.colors, "primary");
      }
    }

    return {
      width: "100%",
      padding: `${theme.sizes.spacing.sm} 0`,
      background: isHovered ? hoverBg : baseBg,
      border: `1px solid ${hoverBorderColor}`,
      borderRadius: theme.sizes.borderRadius.md,
      textAlign: "center" as const,
      cursor: "pointer",
      fontSize: theme.sizes.fontSize.sm,
      color: baseColor,
      outline: "none",
      fontWeight: buttonType === "signIn" ? 600 : "normal",
      transition: "all 0.15s ease",
      boxShadow: isHovered ? theme.sizes.shadow.sm : "none",
    };
  };

  // Helper function to get theme option styles
  const getThemeOptionStyles = (themeKey: string) => {
    const isSelected = themeKey === themeId;
    const isHovered = hoveredTheme === themeKey;
    const themeData = allThemes[themeKey as keyof typeof allThemes];

    if (!themeData) return {};

    return {
      padding: `${theme.sizes.spacing.xs} ${theme.sizes.spacing.sm}`,
      background: isSelected
        ? getColor(theme.colors, "primary")
        : isHovered
          ? getColor(theme.colors, "surfaceHover")
          : getColor(theme.colors, "surface"),
      color: isSelected
        ? getColor(theme.colors, "textInverse")
        : getColor(theme.colors, "text"),
      borderRadius: theme.sizes.borderRadius.sm,
      fontSize: theme.sizes.fontSize.xs,
      border: `1px solid ${
        isSelected
          ? getColor(theme.colors, "primary")
          : getColor(theme.colors, "border")
      }`,
      cursor: "pointer",
      transition: "all 0.15s ease",
      boxShadow: isHovered ? theme.sizes.shadow.sm : "none",
    };
  };

  return (
    <div
      id={panelId || "profile-dropdown-panel"}
      style={{
        position: "fixed",
        left: 80, // To the right of the left sidebar (72px + 8px margin)
        bottom: 40, // Above the status bar (30px + 10px margin)
        zIndex: 10000,
        background: getColor(theme.colors, "surface"),
        border: `1px solid ${getColor(theme.colors, "border")}`,
        borderRadius: theme.sizes.borderRadius.lg,
        boxShadow: theme.sizes.shadow.lg,
        minWidth: 280,
        maxWidth: "calc(100vw - 100px)",
        padding: `${theme.sizes.spacing.md} 0 ${theme.sizes.spacing.sm} 0`,
        display: "flex",
        flexDirection: "column",
        gap: theme.sizes.spacing.sm,
        alignItems: "stretch",
      }}
    >
      {/* Theme Selection Section */}
      <div
        style={{
          padding: `0 ${theme.sizes.spacing.md}`,
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          paddingBottom: theme.sizes.spacing.sm,
        }}
      >
        <div
          style={{
            fontSize: theme.sizes.fontSize.sm,
            color: getColor(theme.colors, "text"),
            fontWeight: 600,
            marginBottom: theme.sizes.spacing.sm,
            userSelect: "none",
          }}
        >
          Theme
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: theme.sizes.spacing.xs,
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          {Object.entries(allThemes).map(([key, themeData]) => (
            <div
              key={key}
              style={{
                ...getThemeOptionStyles(key),
                textAlign: "center",
                padding: `${theme.sizes.spacing.xs} ${theme.sizes.spacing.xs}`,
                fontSize: theme.sizes.fontSize.xs,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => setTheme(key)}
              onMouseEnter={() => setHoveredTheme(key)}
              onMouseLeave={() => setHoveredTheme(null)}
              title={themeData.name}
            >
              {themeData.name}
            </div>
          ))}
        </div>
      </div>

      {/* Legacy Dark Mode Toggle (for backward compatibility) */}
      {onToggleDarkMode && (
        <div
          style={{
            padding: `0 ${theme.sizes.spacing.md}`,
            display: "flex",
            alignItems: "center",
            gap: theme.sizes.spacing.sm,
          }}
        >
          <span
            style={{
              fontSize: theme.sizes.fontSize.sm,
              color: getColor(theme.colors, "text"),
              flex: 1,
              userSelect: "none",
            }}
          >
            Legacy Dark Mode
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
              border: `1px solid ${
                isDarkMode
                  ? getColor(theme.colors, "primary")
                  : getColor(theme.colors, "border")
              }`,
              background: isDarkMode
                ? getColor(theme.colors, "primary")
                : getColor(theme.colors, "surface"),
              cursor: "pointer",
              padding: 0,
              transition: "all 0.15s ease",
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
                background: isDarkMode
                  ? getColor(theme.colors, "textInverse")
                  : getColor(theme.colors, "textMuted"),
                position: "absolute",
                left: isDarkMode ? 16 : 2,
                top: 1.5,
                transition: "left 0.18s cubic-bezier(.4,0,.2,1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: getColor(theme.colors, "textInverse"),
                fontSize: 13,
              }}
            >
              {isDarkMode ? "🌙" : "☀️"}
            </div>
          </button>
        </div>
      )}

      {/* Auth-related actions */}
      <div
        style={{
          padding: `0 ${theme.sizes.spacing.sm}`,
          display: "flex",
          flexDirection: "column",
          gap: theme.sizes.spacing.xs,
        }}
      >
        {isSignedIn ? (
          <>
            {/* User email display */}
            {user?.email && (
              <div
                style={{
                  padding: `${theme.sizes.spacing.sm} ${theme.sizes.spacing.md}`,
                  fontSize: theme.sizes.fontSize.sm,
                  color: getColor(theme.colors, "text"),
                  backgroundColor: getColor(theme.colors, "primary"),
                  borderRadius: theme.sizes.borderRadius.md,
                  marginBottom: theme.sizes.spacing.sm,
                  fontWeight: 500,
                  textAlign: "center" as const,
                  border: `1px solid ${getColor(theme.colors, "primary")}`,
                  boxShadow: `0 1px 3px rgba(0, 0, 0, 0.1)`,
                }}
              >
                {user.email}
              </div>
            )}
            <button
              style={getButtonStyles(
                "switchAccount",
                getColor(theme.colors, "text")
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
              style={getButtonStyles("logout", getColor(theme.colors, "error"))}
              onClick={onSignOut}
              onMouseEnter={() => setHoveredButton("logout")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Log out
            </button>
          </>
        ) : (
          <button
            style={getButtonStyles("signIn", getColor(theme.colors, "primary"))}
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
