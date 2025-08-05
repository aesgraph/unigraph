import React, { useEffect, useRef, useState } from "react";
import { useUserStore } from "../../store/userStore";
import UserSettingsPanel from "./UserSettingsPanel";

// Simple generic profile SVG icon with blue border
const GenericProfileIcon = ({
  style = {},
}: {
  style?: React.CSSProperties;
}) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    style={{
      display: "block",
      borderRadius: "50%",
      boxShadow: "0 0 0 2px #1976d2, 0 0 4px 0 rgba(25,118,210,0.18)",
      ...style,
    }}
  >
    <circle cx="16" cy="16" r="16" fill="#e0e0e0" />
    <circle cx="16" cy="13" r="6" fill="#bdbdbd" />
    <ellipse cx="16" cy="24" rx="8" ry="5" fill="#bdbdbd" />
  </svg>
);

// Default profile icon for signed-in users without avatar
const SignedInProfileIcon = ({
  style = {},
  initials = "U",
}: {
  style?: React.CSSProperties;
  initials?: string;
}) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      backgroundColor: "#e0e0e0",
      color: "#666666",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: "bold",
      boxShadow: "0 0 0 2px #1976d2, 0 0 4px 0 rgba(25,118,210,0.18)",
      ...style,
    }}
  >
    {initials}
  </div>
);

interface ProfileIconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number; // Size in pixels
  onSignIn?: () => void;
  onSignOut?: () => void;
}

/**
 * A reusable profile icon component that handles user authentication state
 * and displays the user's avatar when signed in
 */
const ProfileIcon: React.FC<ProfileIconProps> = ({
  className = "",
  style = {},
  size = 32,
  onSignIn = () => {},
  onSignOut = () => {},
}) => {
  // Track user session and avatar
  const { isSignedIn, user, getAvatarUrl, signOut } = useUserStore();
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get avatar URL with fallbacks
  const avatarUrl = getAvatarUrl();

  // Get user initials for the default profile icon
  const getUserInitials = () => {
    if (!user) return "U";

    // Try to get initials from user metadata name
    if (user.user_metadata?.name) {
      const nameParts = user.user_metadata.name.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }

    // Fallback to first letter of email
    if (user.email) {
      return user.email[0].toUpperCase();
    }

    return "U";
  };

  // Reset avatar loaded state when URL changes
  useEffect(() => {
    setAvatarLoaded(false);
    setAvatarError(false);
  }, [avatarUrl]);

  // Handle sign out - improved with better error handling
  const handleSignOut = async () => {
    try {
      console.log("ProfileIcon: Sign out initiated");
      setShowDropdown(false);

      // Sign out using the centralized store
      await signOut();

      console.log("ProfileIcon: Sign out successful");

      // Call the provided callback
      onSignOut();

      return true;
    } catch (error) {
      console.error("ProfileIcon: Error signing out:", error);
      return false;
    }
  };

  // Handle button click: always open the panel
  const handleButtonClick = () => {
    setShowDropdown((v) => !v);
  };

  // Sign in handler for the panel
  const handleSignIn = () => {
    setShowDropdown(false);
    // Open signin page as popup with better dimensions and centering
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      "/signin",
      "signin",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
    );

    if (popup) {
      // Listen for messages from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "SIGNED_IN") {
          console.log("User signed in via popup:", event.data.user);
          window.removeEventListener("message", handleMessage);
        } else if (event.data.type === "SIGNIN_CANCELLED") {
          console.log("Sign-in was cancelled");
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);
    } else {
      // Popup was blocked, fallback to redirect
      window.location.href = "/signin";
    }
    onSignIn();
  };

  // Switch account handler - sign out first, then navigate to signin
  const handleSwitchAccount = async () => {
    setShowDropdown(false);
    console.log("ProfileIcon: Switch account clicked, signing out first");

    try {
      // Sign out the current user first
      await signOut();
      console.log("ProfileIcon: User signed out, opening signin page");

      // Open signin page as popup with better dimensions and centering
      const width = 400;
      const height = 500;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        "/signin",
        "signin",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
      );

      console.log("ProfileIcon: Popup created:", popup);

      if (popup) {
        // Listen for messages from popup
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "SIGNED_IN") {
            console.log("User switched account via popup:", event.data.user);
            window.removeEventListener("message", handleMessage);
          } else if (event.data.type === "SIGNIN_CANCELLED") {
            console.log("Account switch was cancelled");
            window.removeEventListener("message", handleMessage);
          }
        };

        window.addEventListener("message", handleMessage);

        // Focus the popup
        popup.focus();
      } else {
        // Popup was blocked, fallback to redirect
        console.log(
          "ProfileIcon: Popup was blocked, redirecting to signin page"
        );
        window.location.href = "/signin";
      }
    } catch (error) {
      console.error("ProfileIcon: Error switching account:", error);
      // If sign out fails, still try to open signin
      window.location.href = "/signin";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Only close if the click is outside BOTH the button and the panel
      const panel = document.getElementById("profile-dropdown-panel");
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        (!panel || !panel.contains(e.target as Node))
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={buttonRef}
        className={`sign-in-button ${className}`}
        style={{
          padding: 0,
          border: "none",
          background: "none",
          borderRadius: "50%",
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundColor: "#fff",
          position: "relative",
          overflow: "hidden",
          transition:
            "transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s cubic-bezier(.4,0,.2,1)",
          ...style,
        }}
        title={user ? "Profile" : "Sign In"}
        onClick={handleButtonClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 0 0 2px #1976d2, 0 0 12px 2px rgba(25,118,210,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        {/* Avatar container */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Generic icon shown while avatar is loading or if there's an error */}
          {(!isSignedIn || !avatarUrl || !avatarLoaded || avatarError) && (
            <div
              style={{
                position: avatarUrl && !avatarError ? "absolute" : "static",
                width: "100%",
                height: "100%",
              }}
            >
              {isSignedIn ? (
                <SignedInProfileIcon
                  style={{ width: "100%", height: "100%" }}
                  initials={getUserInitials()}
                />
              ) : (
                <GenericProfileIcon style={{ width: "100%", height: "100%" }} />
              )}
            </div>
          )}

          {/* User avatar */}
          {isSignedIn && avatarUrl && !avatarError && (
            <img
              src={avatarUrl}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                opacity: avatarLoaded ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
                position: "absolute",
              }}
              onLoad={() => {
                setAvatarLoaded(true);
                setAvatarError(false);
              }}
              onError={() => {
                setAvatarError(true);
                setAvatarLoaded(false);
              }}
            />
          )}
        </div>
      </button>

      <UserSettingsPanel
        isVisible={showDropdown}
        onSignOut={handleSignOut}
        onSwitchAccount={handleSwitchAccount}
        onSignIn={handleSignIn}
        isSignedIn={isSignedIn}
        user={user}
        panelId="profile-dropdown-panel"
      />
    </div>
  );
};

export default ProfileIcon;
