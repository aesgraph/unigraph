import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [
    react(),
    eslint({
      include: ['src/**/*.{js,jsx,ts,tsx}']
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',
          dest: ''
        },
        {
          src: 'docs/*',
          dest: 'docs'
        }
      ]
    })
  ],
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
    // Ensure proper MIME types for all image formats
    middlewareMode: false,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Increase chunk size warning limit for large dependencies
    chunkSizeWarningLimit: 1000,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'path': 'path-browserify'
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },

  // Define environment variables and polyfills
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    // Add global polyfill for Node.js packages used in browser
    global: 'globalThis',
    // Add process polyfill
    'process.env': {},
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },

  // Web Workers support
  worker: {
    format: 'es'
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@xyflow/react',
      'cytoscape',
      'graphology'
    ]
  },

  // Asset handling
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg', '**/*.gif', '**/*.webp']
})
