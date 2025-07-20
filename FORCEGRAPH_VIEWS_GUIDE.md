# ForceGraph3D Views Registered in App-Shell

## Overview
I've registered several ForceGraph3D-related views in the app-shell system to help debug and test the initialization issues.

## Registered Views

### 1. **ForceGraph 3D** (`force-graph-3d`)
- **Icon:** 🌐
- **Category:** visualization
- **Component:** `ForceGraph3DView`
- **Description:** Full-featured ForceGraph 3D visualization with support for main and tab instances
- **Usage:** The main production component with all features

### 2. **ForceGraph 3D (Simple)** (`force-graph-3d-simple`)
- **Icon:** 🔍
- **Category:** debug
- **Component:** `ForceGraph3DViewSimple`
- **Description:** Simplified ForceGraph 3D component for debugging initialization issues
- **Usage:** **Start with this one** - it shows detailed logs and step-by-step initialization

### 3. **ForceGraph Debug Info** (`force-graph-debug-info`)
- **Icon:** 🐛
- **Category:** debug
- **Component:** `ForceGraphDebugInfo`
- **Description:** Shows current status and debug information for ForceGraph 3D system
- **Usage:** View system status (scene graph, main instance, etc.) without creating instances

### 4. **ForceGraph Test Suite** (`force-graph-test-suite`)
- **Icon:** 🧪
- **Category:** debug
- **Component:** `ForceGraphTestSuite`
- **Description:** Combined view with debug info and simple ForceGraph for testing
- **Usage:** **Best for debugging** - shows both system status and initialization in one view

## How to Access

1. Open the app-shell interface
2. Click the "Add View" or "+" button to add a new tab
3. Look for the ForceGraph views in the view picker
4. The debug views should appear in the "debug" category

## Debugging Workflow

1. **Start with "ForceGraph Test Suite"** - gives you the complete picture
2. **Check "ForceGraph Debug Info"** - see if scene graph and main instance are available
3. **Try "ForceGraph 3D (Simple)"** - see detailed initialization logs
4. **Finally try "ForceGraph 3D"** - the full component

## What to Look For

With these views, you should be able to see:
- Whether a scene graph is loaded
- Whether the main ForceGraph3D instance exists
- Detailed initialization logs in the browser console
- Exact error messages if initialization fails
- System status at each step

The "initializing forever" issue should now be much easier to diagnose!
