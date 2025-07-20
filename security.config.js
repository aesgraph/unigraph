// Security configuration to prevent secrets from being bundled
module.exports = {
  // Patterns that should never appear in built files
  forbiddenPatterns: [
    // OpenAI API keys
    /sk-[a-zA-Z0-9]{48}/,
    // Generic API keys
    /[a-zA-Z0-9]{32,}/,
    // Common secret patterns
    /password\s*[:=]\s*['"][^'"]+['"]/,
    /api_key\s*[:=]\s*['"][^'"]+['"]/,
    /secret\s*[:=]\s*['"][^'"]+['"]/,
  ],

  // Files to scan
  scanPaths: ["dist/**/*.js", "dist/**/*.css", "dist/**/*.html"],

  // Environment variables that should be used instead
  requiredEnvVars: [
    "VITE_OPENAI_API_KEY",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
  ],
};
