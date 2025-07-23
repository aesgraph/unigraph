# Local App-Shell Development Guide

## 🎯 **Overview**

This project now uses the local `app-shell` package instead of the published npm version. This allows for real-time debugging and development of the app-shell component.

## 📦 **Current Setup**

- **Local Dependency**: `@aesgraph/app-shell: "file:../app-shell"`
- **Location**: `../app-shell/` (relative to unigraph directory)
- **Build Output**: `../app-shell/dist/`

## 🚀 **Development Workflows**

### **Option 1: Manual Build (Recommended for debugging)**

```bash
# Build app-shell after making changes
npm run dev:app-shell

# Start unigraph dev server
npm run dev
```

### **Option 2: Automatic Watch Mode**

```bash
# Run both unigraph dev server and app-shell watcher
npm run dev:full
```

### **Option 3: Separate Terminals**

```bash
# Terminal 1: Watch app-shell for changes
npm run watch:app-shell

# Terminal 2: Run unigraph dev server
npm run dev
```

## 🔧 **Making Changes**

1. **Edit app-shell code** in `../app-shell/src/`
2. **Build the package** (if not using watch mode):
   ```bash
   npm run dev:app-shell
   ```
3. **Refresh unigraph** - changes should be reflected immediately

## 📁 **Key Files**

### **App-Shell Source** (`../app-shell/src/`)

- `components/Workspace.tsx` - Main workspace component
- `components/Pane.tsx` - Individual pane component
- `contexts/WorkspaceContext.tsx` - State management
- `types/WorkspaceConfig.ts` - Configuration types

### **Unigraph Integration** (`unigraph/src/`)

- `components/views/AppShellView.tsx` - App-shell integration
- `components/WorkspaceTest.tsx` - Test component

## 🐛 **Debugging Tips**

1. **Check Build Output**: Ensure `../app-shell/dist/` is updated after changes
2. **Clear Cache**: If changes don't appear, restart the dev server
3. **Console Logs**: Add logs in app-shell components to debug state changes
4. **TypeScript Errors**: Check both app-shell and unigraph for type issues

## 🔄 **Switching Back to Published Package**

To switch back to the published npm package:

```bash
# Remove local dependency
npm uninstall @aesgraph/app-shell

# Install published package
npm install @aesgraph/app-shell@latest
```

## 📝 **Notes**

- The local dependency uses a file path, so changes to app-shell source require a rebuild
- The watch mode automatically rebuilds when you save changes in app-shell
- TypeScript types are generated in the build process
- CSS styles are also included in the build output

## 🎯 **Current Issues Being Debugged**

- Bottom pane collapse functionality
- Workspace manager state synchronization
- Pane resize behavior in container mode
