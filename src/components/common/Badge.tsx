import React from "react";

interface BadgeProps {
  text: string;
  color: string;
  small?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ text, color, small }) => {
  return (
    <span
      style={{
        backgroundColor: `${color}33`, // 20% opacity
        color: color,
        borderRadius: "4px",
        padding: small ? "2px 6px" : "3px 8px",
        fontSize: small ? "11px" : "12px",
        fontWeight: 500,
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
};
