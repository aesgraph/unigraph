# ForceGraph3D Instance Initialization Refactoring

## Summary
Successfully refactored the ForceGraph3D instance initialization logic from `App.tsx` into a reusable utility file to support both main app instances and tab-specific instances.

## Changes Made

### 1. Created Utility File
**File**: `/src/utils/forceGraphInitializer.ts`

- **Core Function**: `initializeForceGraphInstance(options)` - Generic initialization function that can create ForceGraph3D instances for any use case
- **Convenience Functions**:
  - `initializeMainForceGraph()` - For the main app instance (sets as main instance in zustand store)
  - `initializeTabForceGraph()` - For tab-specific instances (doesn't interfere with main instance)

**Key Features**:
- Uses zustand stores for all context/state dependencies
- Supports both "Physics" and "Layout" modes  
- Handles mouse event binding (optional)
- Applies interactivity flags from scene graph configuration
- Sets up engine ticking

### 2. Updated App.tsx
**File**: `/src/App.tsx`

- **Replaced** inline `initializeForceGraph` logic with call to `initializeMainForceGraph()`
- **Removed** unused imports (`createForceGraph`, `bindEventsToGraphInstance`)
- **Maintained** all existing functionality and context dependencies
- **Kept** the same callback structure and dependencies

### 3. Enhanced ForceGraph3DView
**File**: `/src/components/views/ForceGraph3DView.tsx`

- **Added** support for two modes:
  - `useMainInstance={true}` - Uses the main ForceGraph3D instance from the app
  - `useMainInstance={false}` - Creates its own dedicated instance using `initializeTabForceGraph()`
- **Improved** error handling and loading states
- **Added** proper cleanup for tab-specific instances
- **Fixed** syntax errors that were present

### 4. State Management Integration
All context and state dependencies are handled through existing zustand stores:
- `appConfigStore` - Scene graph, force graph instance management
- `activeLayoutStore` - Layout results and positions  
- `mouseControlsStore` - Mouse click mode and interactivity settings

## Benefits

1. **Reusability**: ForceGraph3D instances can now be created in any component
2. **Isolation**: Tab instances don't interfere with the main app instance
3. **Consistency**: All instances use the same initialization logic
4. **Maintainability**: Centralized logic makes debugging and updates easier
5. **Future-Ready**: Foundation for more advanced multi-instance features

## Usage Examples

### Main App Instance (existing behavior)
```typescript
// In App.tsx - creates and sets as main instance
const instance = initializeMainForceGraph(
  container,
  handleNodesRightClick,
  handleBackgroundRightClick,
  "Layout"
);
```

### Tab-Specific Instance
```typescript  
// In ForceGraph3DView.tsx - creates isolated instance
const instance = initializeTabForceGraph(
  container,
  sceneGraph, // optional override
  "Layout"
);
```

### Custom Instance
```typescript
// Full control over initialization
const instance = initializeForceGraphInstance({
  container,
  sceneGraph: mySceneGraph,
  layout: "Physics", 
  onNodesRightClick: myHandler,
  onBackgroundRightClick: myHandler,
  setAsMainInstance: false,
  instanceId: "custom-tab-1" // future use
});
```

## Files Modified
- ✅ `/src/utils/forceGraphInitializer.ts` (created)
- ✅ `/src/App.tsx` (refactored to use utility)
- ✅ `/src/components/views/ForceGraph3DView.tsx` (enhanced with multi-instance support)

## Testing Status
- ✅ Syntax validation passed
- ✅ Import/export structure validated
- ✅ ForceGraph3DView syntax errors fixed
- 🟡 TypeScript compilation has unrelated configuration issues (not caused by this refactoring)

## Next Steps
1. Test tab-specific instance creation in app-shell integration
2. Validate cleanup logic for tab instances
3. Add instance persistence/restoration if needed
4. Consider adding instance registry for advanced management
