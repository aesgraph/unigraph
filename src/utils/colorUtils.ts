/**
 * Converts a hex color to RGB.
 * @param hex - The hex color string.
 * @returns An object with r, g, and b properties.
 */
export const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Calculates the luminance of an RGB color.
 * @param r - Red component (0-255).
 * @param g - Green component (0-255).
 * @param b - Blue component (0-255).
 * @returns The luminance value.
 */
export const luminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

/**
 * Determines whether text color should be white or black based on background color.
 * @param backgroundColor - The background color in hex format.
 * @returns "white" or "black" based on the luminance of the background color.
 */
export const getTextColorBasedOnBackground = (
  backgroundColor: string
): string => {
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff");
  const blackContrast = getContrastRatio(backgroundColor, "#000000");

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
};

// Color palettes inspired by design systems and nature
export const colorPalettes = {
  // Soft and professional
  gentle: [
    "#91a7ff", // Soft blue
    "#ff9aa2", // Soft pink
    "#98ddca", // Soft teal
    "#ffdda1", // Soft yellow
    "#c5a3ff", // Soft purple
    "#a8e6cf", // Soft mint
    "#ffd3b6", // Soft orange
    "#caffbf", // Soft green
    "#bdb2ff", // Soft violet
    "#ffc6ff", // Soft magenta
  ],

  // Muted natural tones
  muted: [
    "#8d99ae", // Muted blue
    "#cdb4db", // Muted purple
    "#b8d4bc", // Muted green
    "#ddbea9", // Muted orange
    "#a2aebb", // Muted gray blue
    "#b7b7a4", // Muted sage
    "#cab8a2", // Muted brown
    "#c5baaf", // Muted taupe
    "#a4ac86", // Muted olive
    "#9a8c98", // Muted mauve
  ],

  // Pastel professional
  pastel: [
    "#dee2ff", // Pastel blue
    "#ffd6d6", // Pastel pink
    "#dcedc1", // Pastel green
    "#ffe8d6", // Pastel peach
    "#e0c3fc", // Pastel purple
    "#d4e4bc", // Pastel sage
    "#fbe4d8", // Pastel orange
    "#cae9ff", // Pastel sky
    "#f0defd", // Pastel lavender
    "#dbece5", // Pastel mint
  ],

  // Earthy and calming
  earth: [
    "#a7c4bc", // Sage
    "#e6ccb2", // Sand
    "#b5838d", // Mauve
    "#c9ada7", // Rose taupe
    "#9caea9", // Dusty blue
    "#bcb8b1", // Warm gray
    "#a69f98", // Stone
    "#8e9aaf", // Dusty blue gray
    "#c7b7a3", // Tan
    "#a98467", // Soft brown
  ],

  // Subtle and professional
  subtle: [
    "#acc2ef", // Light blue
    "#cfd7e3", // Gray blue
    "#bac7be", // Gray green
    "#d1b3c4", // Dusty rose
    "#b0c4b1", // Sage green
    "#c2bbba", // Warm gray
    "#adb5bd", // Cool gray
    "#b7c0ee", // Periwinkle
    "#c5baaf", // Warm taupe
    "#bfacaa", // Dusty mauve
  ],

  // Ocean inspired but softer
  ocean: [
    "#bcd4e6", // Sky blue
    "#99c1de", // Ocean blue
    "#a7c5eb", // Light blue
    "#8fb8de", // Steel blue
    "#c7d3e3", // Gray blue
    "#b8d0eb", // Powder blue
    "#9bafd4", // Dusty blue
    "#a6cad4", // Sea foam
    "#89a7c2", // Navy blue
    "#97b3d0", // Slate blue
  ],
};

// Function to get a random color from a specific palette
export const getRandomColorFromPalette = (
  palette: keyof typeof colorPalettes = "gentle"
): string => {
  const colors = colorPalettes[palette];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Function to get a deterministic color from a palette based on a string
export const getHashedColor = (
  str: string,
  palette: keyof typeof colorPalettes = "gentle"
): string => {
  const colors = colorPalettes[palette];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Function to get a sequence of unique colors from a palette
export const getColorSequence = (
  count: number,
  palette: keyof typeof colorPalettes = "gentle"
): string[] => {
  const colors = [...colorPalettes[palette]];
  const result: string[] = [];

  // If we need more colors than are in the palette, we'll cycle through
  while (result.length < count) {
    const remaining = count - result.length;
    const shuffled = colors
      .slice(0, Math.min(remaining, colors.length))
      .sort(() => Math.random() - 0.5);
    result.push(...shuffled);
  }

  return result;
};

interface RGB {
  r: number;
  g: number;
  b: number;
}

// Convert RGB to hex
const rgbToHex = ({ r, g, b }: RGB): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Slightly modify a color while maintaining its theme
const tweakColor = (color: RGB, amount: number = 20): RGB => {
  return {
    r: Math.min(255, Math.max(0, color.r + (Math.random() - 0.5) * amount)),
    g: Math.min(255, Math.max(0, color.g + (Math.random() - 0.5) * amount)),
    b: Math.min(255, Math.max(0, color.b + (Math.random() - 0.5) * amount)),
  };
};

// Blend two colors with a given ratio
const blendColors = (color1: RGB, color2: RGB, ratio: number): RGB => {
  return {
    r: Math.round(color1.r * (1 - ratio) + color2.r * ratio),
    g: Math.round(color1.g * (1 - ratio) + color2.g * ratio),
    b: Math.round(color1.b * (1 - ratio) + color2.b * ratio),
  };
};

export const getRandColorFromInspiration = (
  palette: keyof typeof colorPalettes
): string => {
  const colors = colorPalettes[palette];

  // Pick two random colors from the palette
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];

  // Convert hex colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Generate a random ratio for blending
  const ratio = Math.random();

  // Blend the colors
  let resultColor = blendColors(rgb1, rgb2, ratio);

  // Add some random variation while maintaining the theme
  resultColor = tweakColor(resultColor, 15);
  console.log("result color is ", resultColor);

  // Convert back to hex
  return rgbToHex(resultColor);
};

// Function to get a random color with a guaranteed minimum contrast from a base color
export const getContrastingColorFromPalette = (
  basePalette: keyof typeof colorPalettes,
  baseColor: string,
  minContrast: number = 4.5
): string => {
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const newColor = getRandColorFromInspiration(basePalette);
    if (getContrastRatio(baseColor, newColor) >= minContrast) {
      return newColor;
    }
    attempts++;
  }

  // If we couldn't find a contrasting color, return a color from the palette
  return colorPalettes[basePalette][0];
};

// Calculate relative luminance for RGB values
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const getRandomColor = () => {
  const colors = [0xffff00, 0x00ffff, 0xff00ff, 0xff8800, 0x00ff88, 0x8800ff];
  return colors[Math.floor(Math.random() * colors.length)];
};
