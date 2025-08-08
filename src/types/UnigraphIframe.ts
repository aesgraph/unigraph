import React from "react";

/**
 * Props interface for the UnigraphIframe component
 */
export interface UnigraphIframeProps {
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
 * Configuration for embedding interactive diagrams
 */
export interface InteractiveDiagramConfig {
  /** The source URL for the diagram */
  src: string;
  /** Title of the diagram */
  title: string;
  /** Initial dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Whether the diagram should be interactive */
  interactive?: boolean;
  /** Custom styling for the diagram container */
  containerStyle?: React.CSSProperties;
}

/**
 * Configuration for documentation structure visualization
 */
export interface DocumentationStructureConfig {
  /** The source URL for the documentation structure */
  src: string;
  /** Title of the documentation structure */
  title: string;
  /** Whether to show navigation controls */
  showNavigation?: boolean;
  /** Whether to allow zooming */
  allowZoom?: boolean;
  /** Whether to show search functionality */
  showSearch?: boolean;
  /** Custom styling for the documentation structure */
  style?: React.CSSProperties;
}

/**
 * Event handlers for iframe interactions
 */
export interface UnigraphIframeEventHandlers {
  /** Called when the iframe content loads successfully */
  onLoad?: () => void;
  /** Called when the iframe fails to load */
  onError?: (error: Event) => void;
  /** Called when the iframe enters fullscreen mode */
  onFullscreenEnter?: () => void;
  /** Called when the iframe exits fullscreen mode */
  onFullscreenExit?: () => void;
  /** Called when the iframe is refreshed */
  onRefresh?: () => void;
  /** Called when the external link is opened */
  onExternalLink?: () => void;
}

/**
 * Theme configuration for the iframe component
 */
export interface UnigraphIframeTheme {
  /** Primary color for the component */
  primaryColor?: string;
  /** Background color for the container */
  backgroundColor?: string;
  /** Border color for the container */
  borderColor?: string;
  /** Text color for loading and error messages */
  textColor?: string;
  /** Whether to use dark mode */
  darkMode?: boolean;
}
