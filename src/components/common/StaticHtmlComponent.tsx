import React, { useRef } from "react";

interface StaticHtmlComponentProps {
  html: string | null;
  className?: string;
  style?: React.CSSProperties;
  contentRef?: React.RefObject<HTMLDivElement>;
  onContextMenu?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * A component that renders HTML content and only re-renders when the HTML content changes.
 * This helps preserve text selections when interacting with the content.
 */
const StaticHtmlComponent = React.memo(
  ({
    html,
    className,
    style,
    contentRef,
    onContextMenu,
    onClick,
  }: StaticHtmlComponentProps) => {
    // Use the provided ref or create a new one
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = contentRef || internalRef;

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
        onContextMenu={onContextMenu}
        onClick={onClick}
      />
    );
  },
  // Custom comparison function to only re-render when html changes
  (prevProps, nextProps) => {
    return (
      prevProps.html === nextProps.html &&
      prevProps.className === nextProps.className &&
      // We don't compare other props as they are functions that might change identity
      // but don't affect the rendered content
      JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
    );
  }
);

StaticHtmlComponent.displayName = "StaticHtmlComponent";

export default StaticHtmlComponent;
