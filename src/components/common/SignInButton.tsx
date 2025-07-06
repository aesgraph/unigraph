import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import ProfileDropdown from "./ProfileDropdown";

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
      background: "#fff",
      ...style,
    }}
  >
    <circle cx="16" cy="16" r="16" fill="#e0e0e0" />
    <circle cx="16" cy="13" r="6" fill="#bdbdbd" />
    <ellipse cx="16" cy="24" rx="8" ry="5" fill="#bdbdbd" />
  </svg>
);

interface SignInButtonProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number; // Size in pixels
  onSignIn?: () => void;
  onSignOut?: () => void;
}

/**
 * A reusable sign-in button that handles user authentication state
 * and displays the user's avatar when signed in
 */
const SignInButton: React.FC<SignInButtonProps> = ({
  className = "",
  style = {},
  size = 32,
  onSignIn = () => {},
  onSignOut = () => {},
}) => {
  // Track user session and avatar
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch and track user authentication state
  useEffect(() => {
    // Get current user from Supabase
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
      setAvatarError(false); // Reset error state when user changes
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAvatarError(false); // Reset error state when user changes
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Get avatar URL with fallbacks
  const getAvatarUrl = () => {
    if (!user) return null;

    // Try different possible locations for avatar URL
    const avatarUrl =
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      user?.identities?.[0]?.identity_data?.avatar_url ||
      user?.identities?.[0]?.identity_data?.picture;

    return avatarUrl && !avatarError ? avatarUrl : null;
  };

  const avatarUrl = getAvatarUrl();

  // Reset avatar loaded state when URL changes
  useEffect(() => {
    setAvatarLoaded(false);
  }, [avatarUrl]);

  // Handle sign out - improved with better error handling
  const handleSignOut = async () => {
    try {
      console.log("SignInButton: Sign out initiated");
      setShowDropdown(false);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log("SignInButton: Supabase signout successful");

      // Reset user state
      setUser(null);

      // Call the provided callback
      onSignOut();

      // Force page reload to ensure all auth state is cleared
      window.location.reload();

      return true;
    } catch (error) {
      console.error("SignInButton: Error signing out:", error);
      return false;
    }
  };

  // Handle button click
  const handleButtonClick = () => {
    if (user) {
      setShowDropdown((v) => !v);
    } else {
      window.location.href = "/signin";
      onSignIn();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
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
          {(!user || !avatarUrl || !avatarLoaded) && (
            <div
              style={{
                position: avatarUrl ? "absolute" : "static",
                width: "100%",
                height: "100%",
              }}
            >
              <GenericProfileIcon style={{ width: "100%", height: "100%" }} />
            </div>
          )}

          {/* User avatar */}
          {user && avatarUrl && (
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

      {/* Use the ProfileDropdown component with the improved signout handler */}
      <ProfileDropdown
        isVisible={!!user && showDropdown}
        onSignOut={handleSignOut}
        buttonRef={buttonRef as React.RefObject<HTMLButtonElement>}
      />
    </div>
  );
};

export default SignInButton;
