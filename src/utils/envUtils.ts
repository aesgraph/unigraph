/**
 * Environment variable utilities for handling multiple sources
 * Supports Vite, Vercel, and runtime environment variables
 */

// Type for environment variable sources
// type EnvSource = "vite" | "vercel" | "window" | "process";

// Interface for environment variables
interface EnvVars {
  VITE_OPENAI_API_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_LIVE_CHAT_URL?: string;
  VITE_DEFAULT_CHAT_URL?: string;
  [key: string]: string | undefined;
}

/**
 * Get environment variable from multiple sources in order of preference
 * 1. Vite import.meta.env (build-time)
 * 2. Vercel runtime environment variables
 * 3. Window object (for client-side overrides)
 * 4. Process.env (fallback)
 */
export function getEnvVar(key: string): string | undefined {
  // 1. Try Vite import.meta.env first (build-time variables)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const viteValue = import.meta.env[key];
    if (viteValue) {
      return viteValue;
    }
  }

  // 2. Try Vercel runtime environment variables
  // Vercel injects these into the window object
  if (typeof window !== "undefined" && window.__VERCEL_ENV_VARS__) {
    const vercelValue = window.__VERCEL_ENV_VARS__[key];
    if (vercelValue) {
      return vercelValue;
    }
  }

  // 3. Try window object (for client-side overrides)
  if (typeof window !== "undefined" && window.__ENV_VARS__) {
    const windowValue = window.__ENV_VARS__[key];
    if (windowValue) {
      return windowValue;
    }
  }

  // 4. Try process.env (fallback for Node.js environments)
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }

  return undefined;
}

/**
 * Get all environment variables from all sources
 */
export function getAllEnvVars(): EnvVars {
  const envVars: EnvVars = {};

  // Collect from all sources
  const sources = [
    // Vite
    typeof import.meta !== "undefined" ? import.meta.env : {},
    // Vercel
    typeof window !== "undefined" && window.__VERCEL_ENV_VARS__
      ? window.__VERCEL_ENV_VARS__
      : {},
    // Window
    typeof window !== "undefined" && window.__ENV_VARS__
      ? window.__ENV_VARS__
      : {},
    // Process
    typeof process !== "undefined" ? process.env : {},
  ];

  // Merge all sources, with earlier sources taking precedence
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      if (source[key] && !envVars[key]) {
        envVars[key] = source[key];
      }
    });
  });

  return envVars;
}

/**
 * Check if we're running on Vercel
 */
export function isVercel(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("vercel.com") ||
      !!window.__VERCEL_ENV_VARS__)
  );
}

/**
 * Check if we're running in development
 */
export function isDevelopment(): boolean {
  return (
    getEnvVar("NODE_ENV") === "development" ||
    getEnvVar("VITE_NODE_ENV") === "development" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"))
  );
}

/**
 * Debug function to log all environment variables (development only)
 */
export function debugEnvVars(): void {
  if (!isDevelopment()) return;

  console.group("🔧 Environment Variables Debug");
  console.log("Environment:", isDevelopment() ? "Development" : "Production");
  console.log("Platform:", isVercel() ? "Vercel" : "Other");

  const allVars = getAllEnvVars();
  const viteVars = Object.keys(allVars).filter((key) =>
    key.startsWith("VITE_")
  );

  console.log("VITE_ variables found:", viteVars.length);
  viteVars.forEach((key) => {
    const value = allVars[key];
    const maskedValue = value
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : "undefined";
    console.log(`  ${key}: ${maskedValue}`);
  });

  console.groupEnd();
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __VERCEL_ENV_VARS__?: Record<string, string>;
    __ENV_VARS__?: Record<string, string>;
  }
}

// Export commonly used environment variables as constants
export const ENV = {
  OPENAI_API_KEY: getEnvVar("VITE_OPENAI_API_KEY"),
  SUPABASE_URL: getEnvVar("VITE_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnvVar("VITE_SUPABASE_ANON_KEY"),
  LIVE_CHAT_URL: getEnvVar("VITE_LIVE_CHAT_URL"),
  DEFAULT_CHAT_URL: getEnvVar("VITE_DEFAULT_CHAT_URL"),
  NODE_ENV: getEnvVar("NODE_ENV") || getEnvVar("VITE_NODE_ENV"),
} as const;
