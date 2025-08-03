import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: ".",
  plugins: [
    react(),
    eslint({
      include: ["src/**/*.{js,jsx,ts,tsx}"],
    }),
    viteStaticCopy({
      targets: [
        {
          src: "public/data",
          dest: "data",
        },
        {
          src: "public/images",
          dest: "images",
        },
        {
          src: "public/svgs",
          dest: "svgs",
        },
        {
          src: "public/storyCardFiles",
          dest: "storyCardFiles",
        },
        {
          src: "public/writing_samples",
          dest: "writing_samples",
        },
        {
          src: "public/docs-structure.json",
          dest: "",
        },
        {
          src: "public/markdowns-structure.json",
          dest: "",
        },
        {
          src: "docs/*",
          dest: "docs",
        },
      ],
    }),
  ],

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
    // Ensure proper MIME types for all image formats
    middlewareMode: false,
    fs: {
      allow: [".."],
    },
  },

  // Build configuration
  build: {
    outDir: "dist",
    sourcemap: true,
    // Increase chunk size warning limit for large dependencies
    chunkSizeWarningLimit: 1000,
  },

  // Path resolution
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      path: "path-browserify",
    },
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },

  // Define environment variables and polyfills
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    // Add global polyfill for Node.js packages used in browser
    global: "globalThis",
    // Add process polyfill
    "process.env": {},
    // Inject Vercel environment variables into the client
    __VERCEL_ENV_VARS__: JSON.stringify(
      Object.keys(process.env)
        .filter((key) => key.startsWith("VITE_"))
        .reduce(
          (acc, key) => {
            const value = process.env[key];
            if (value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string>
        )
    ),
  },

  // Security: Prevent environment variables from being bundled
  envPrefix: "VITE_",

  // CSS configuration
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },

  // Web Workers support
  worker: {
    format: "es",
  },

  // Optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "three",
      "@xyflow/react",
      "cytoscape",
      "graphology",
    ],
    exclude: ["@aesgraph/app-shell"],
    force: true,
    esbuildOptions: {
      resolveExtensions: [".tsx", ".ts", ".js", ".jsx", ".css"],
    },
  },

  // Asset handling
  assetsInclude: [
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.png",
    "**/*.svg",
    "**/*.gif",
    "**/*.webp",
  ],
});
