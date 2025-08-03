import { ExternalLink, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import "./UnigraphIframe.css";

interface UnigraphIframeProps {
  /** The URL to embed in the iframe */
  src: string;
  /** Title for the iframe (used for accessibility and display) */
  title: string;
  /** Width of the iframe (default: 100%) */
  width?: string | number;
  /** Height of the iframe (default: 400px) */
  height?: string | number;
  /** Whether the iframe should be resizable */
  resizable?: boolean;
  /** Whether to show controls (fullscreen, refresh, etc.) */
  showControls?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Callback when iframe loads */
  onLoad?: () => void;
  /** Callback when iframe fails to load */
  onError?: (error: Event) => void;
  /** Whether to show a loading state */
  showLoading?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
  /** Whether to allow fullscreen mode */
  allowFullscreen?: boolean;
  /** Additional iframe attributes */
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
}

/**
 * UnigraphIframe - A React component for embedding HTML elements into markdown files
 *
 * This component provides a clean, interactive iframe wrapper with optional controls
 * for embedding interactive diagrams, documentation structures, and other HTML content
 * into markdown documentation.
 */
const UnigraphIframe: React.FC<UnigraphIframeProps> = ({
  src,
  title,
  width = "100%",
  height = "400px",
  resizable = false,
  showControls = true,
  className = "",
  style = {},
  onLoad,
  onError,
  showLoading = true,
  loadingMessage = "Loading interactive content...",
  allowFullscreen = true,
  iframeProps = {},
}) => {
  const [isLoading, setIsLoading] = useState(showLoading);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(showLoading);
    setHasError(false);
  }, [src, showLoading]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleIframeError = (error: Event) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      // Reload the iframe by temporarily clearing and resetting the src
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 10);
    }
  };
  const handleFullscreenToggle = () => {
    if (!allowFullscreen) return;

    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleExternalLink = () => {
    window.open(src, "_blank", "noopener,noreferrer");
  };

  const containerStyles: React.CSSProperties = {
    position: "relative",
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#fafafa",
    ...style,
  };

  const iframeStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
    display: isLoading ? "none" : "block",
  };

  const controlsStyles: React.CSSProperties = {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    gap: "4px",
    zIndex: 10,
  };

  const buttonStyles: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "4px 6px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s ease",
  };

  const loadingStyles: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    color: "#666",
  };

  const errorStyles: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    color: "#d32f2f",
    padding: "16px",
  };

  return (
    <div
      ref={containerRef}
      className={`unigraph-iframe-container ${className}`}
      style={containerStyles}
    >
      {/* Controls */}
      {showControls && (
        <div style={controlsStyles}>
          <button
            onClick={handleRefresh}
            style={buttonStyles}
            title="Refresh content"
          >
            <RefreshCw size={12} />
          </button>
          {allowFullscreen && (
            <button
              onClick={handleFullscreenToggle}
              style={buttonStyles}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
          <button
            onClick={handleExternalLink}
            style={buttonStyles}
            title="Open in new tab"
          >
            <ExternalLink size={12} />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={loadingStyles}>
          <RefreshCw size={20} className="animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div style={errorStyles}>
          <div>Failed to load content</div>
          <button
            onClick={handleRefresh}
            style={{
              ...buttonStyles,
              marginTop: "8px",
            }}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        style={iframeStyles}
        onLoad={handleIframeLoad}
        onError={(event) => handleIframeError(event.nativeEvent)}
        allowFullScreen={allowFullscreen}
        {...iframeProps}
      />

      {/* Resize Handle */}
      {resizable && (
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "20px",
            height: "20px",
            cursor: "nw-resize",
            background:
              "linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 70%, transparent 70%)",
          }}
          title="Drag to resize"
        />
      )}
    </div>
  );
};

export default UnigraphIframe;
