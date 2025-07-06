import React from "react";

interface ProfileDropdownProps {
  isVisible: boolean;
  onSignOut: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isVisible,
  onSignOut,
  buttonRef,
}) => {
  if (!isVisible) return null;

  // Improved logout handler with direct approach
  const handleLogout = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log("Logout initiated");
      // Call the provided signout function
      await onSignOut();
      console.log("Logout completed");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: buttonRef.current?.getBoundingClientRect().bottom || 0,
        left: buttonRef.current?.getBoundingClientRect().right
          ? buttonRef.current.getBoundingClientRect().right - 100
          : 0,
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          minWidth: 120,
        }}
      >
        <div
          role="button"
          tabIndex={0}
          style={{
            width: "100%",
            padding: "8px 12px",
            textAlign: "left",
            cursor: "pointer",
            fontSize: 14,
            color: "#333",
          }}
          onClick={handleLogout}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleLogout(e);
            }
          }}
        >
          Log out
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
