import { Theme, ThemeId, commonSizes } from "@aesgraph/app-shell";

/**
 * Custom Unigraph theme with a modern, vibrant color palette
 * Inspired by cyberpunk aesthetics with excellent readability
 * Uses rgba() for better transparency control and layering
 */
export const customUnigraphTheme: Theme = {
  id: "unigraph-custom" as ThemeId,
  name: "Unigraph Neon",
  colors: {
    // Core brand colors - vibrant and modern with alpha support
    primary: "rgba(0, 212, 255, 1)", // Electric cyan
    secondary: "rgba(139, 92, 246, 1)", // Purple
    accent: "rgba(255, 107, 53, 1)", // Orange-red accent

    // Background layers - deep dark with subtle variations and transparency
    background: "rgba(10, 10, 15, 1)", // Very dark blue-black
    backgroundSecondary: "rgba(19, 19, 24, 0.95)", // Slightly lighter dark with slight transparency
    backgroundTertiary: "rgba(26, 26, 36, 0.9)", // Medium dark with blue tint and transparency

    // Interactive surfaces with subtle transparency for layering
    surface: "rgba(30, 30, 46, 0.9)", // Card/panel background
    surfaceHover: "rgba(38, 38, 64, 0.95)", // Hover state with more opacity
    surfaceActive: "rgba(45, 45, 74, 1)", // Active/pressed state - fully opaque

    // Text hierarchy - high contrast for readability
    text: "rgba(240, 240, 245, 1)", // Primary text - very light
    textSecondary: "rgba(201, 201, 214, 0.9)", // Secondary text with slight transparency
    textMuted: "rgba(139, 139, 156, 0.7)", // Muted/disabled text with transparency
    textInverse: "rgba(10, 10, 15, 1)", // Text on light backgrounds

    // Border system with transparency for subtle layering
    border: "rgba(42, 42, 58, 0.6)", // Subtle borders with transparency
    borderFocus: "rgba(0, 212, 255, 1)", // Focus ring color (matches primary)
    borderHover: "rgba(64, 64, 85, 0.8)", // Hover border with transparency

    // Status colors - modern and accessible with full opacity
    success: "rgba(0, 255, 136, 1)", // Bright green
    warning: "rgba(255, 184, 77, 1)", // Warm orange
    error: "rgba(255, 71, 87, 1)", // Bright red
    info: "rgba(0, 212, 255, 1)", // Matches primary

    // Links with hover transparency effect
    link: "rgba(0, 212, 255, 1)", // Matches primary
    linkHover: "rgba(51, 221, 255, 0.9)", // Lighter on hover with slight transparency

    // Workspace-specific colors with enhanced transparency and layering
    workspaceBackground: "rgba(10, 10, 15, 1)", // Deep background - fully opaque
    workspacePanel: "rgba(19, 19, 24, 0.95)", // Panel background with slight transparency
    workspaceTitleBackground: "rgba(26, 26, 36, 0.9)", // Title bar background with transparency
    workspaceTitleText: "rgba(0, 212, 255, 1)", // Bright cyan title text
    workspaceResizer: "rgba(42, 42, 58, 0.8)", // Resizer handle with transparency
    workspaceResizerHover: "rgba(0, 212, 255, 0.9)", // Bright hover state with slight transparency
    workspaceScrollbar: "rgba(64, 64, 85, 0.7)", // Scrollbar with transparency
    workspaceScrollbarHover: "rgba(139, 92, 246, 0.9)", // Purple scrollbar hover with transparency
  },
  sizes: commonSizes, // Use the shared size definitions from app-shell
};

/**
 * Alternative warm-themed variant with earth tones and gold accents
 * Uses rgba() for sophisticated transparency and color layering effects
 */
export const unigraphWarmTheme: Theme = {
  id: "unigraph-warm" as ThemeId,
  name: "Unigraph Warm",
  colors: {
    // Warm, sophisticated color palette with alpha support
    primary: "rgba(245, 158, 11, 1)", // Golden yellow
    secondary: "rgba(220, 38, 38, 1)", // Warm red
    accent: "rgba(5, 150, 105, 1)", // Forest green

    // Rich dark backgrounds with warm undertones and transparency
    background: "rgba(28, 25, 23, 1)", // Warm black - fully opaque
    backgroundSecondary: "rgba(41, 37, 36, 0.96)", // Dark brown with slight transparency
    backgroundTertiary: "rgba(68, 64, 60, 0.92)", // Medium brown with more transparency

    // Interactive surfaces with warmth and subtle transparency
    surface: "rgba(68, 64, 60, 0.9)", // Card/panel background with transparency
    surfaceHover: "rgba(87, 83, 78, 0.94)", // Hover state with more opacity
    surfaceActive: "rgba(107, 114, 128, 1)", // Active/pressed state - fully opaque

    // Text with warm undertones and transparency control
    text: "rgba(251, 191, 36, 1)", // Warm gold - fully opaque for readability
    textSecondary: "rgba(214, 211, 209, 0.92)", // Light warm gray with slight transparency
    textMuted: "rgba(168, 162, 158, 0.75)", // Muted warm gray with more transparency
    textInverse: "rgba(28, 25, 23, 1)", // Dark text on light backgrounds

    // Warm border system with transparency
    border: "rgba(87, 83, 78, 0.65)", // Subtle warm borders with transparency
    borderFocus: "rgba(245, 158, 11, 1)", // Golden focus ring - fully opaque
    borderHover: "rgba(120, 113, 108, 0.85)", // Hover border with transparency

    // Status colors with warm variants and full opacity
    success: "rgba(16, 185, 129, 1)", // Green
    warning: "rgba(249, 115, 22, 1)", // Warm orange
    error: "rgba(220, 38, 38, 1)", // Warm red
    info: "rgba(14, 165, 233, 1)", // Sky blue

    // Warm links with transparency effects
    link: "rgba(251, 191, 36, 1)", // Golden link
    linkHover: "rgba(245, 158, 11, 0.9)", // Darker gold on hover with transparency

    // Workspace-specific colors with warm palette and transparency
    workspaceBackground: "rgba(28, 25, 23, 1)", // Warm dark background - fully opaque
    workspacePanel: "rgba(41, 37, 36, 0.96)", // Warm panel with slight transparency
    workspaceTitleBackground: "rgba(68, 64, 60, 0.92)", // Warm title bar with transparency
    workspaceTitleText: "rgba(251, 191, 36, 1)", // Golden title text - fully opaque
    workspaceResizer: "rgba(87, 83, 78, 0.8)", // Warm resizer with transparency
    workspaceResizerHover: "rgba(245, 158, 11, 0.95)", // Golden hover with slight transparency
    workspaceScrollbar: "rgba(120, 113, 108, 0.75)", // Warm scrollbar with transparency
    workspaceScrollbarHover: "rgba(220, 38, 38, 0.9)", // Red scrollbar hover with transparency
  },
  sizes: commonSizes,
};
