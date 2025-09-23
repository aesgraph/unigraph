# 2D Map Setup Guide

## Overview

The 2D Map view has been added to your Unigraph application! This map component uses React Leaflet with OpenStreetMap data and includes:

- Custom markers with different colors for different location types
- Interactive popups with location details
- Multiple map types (roadmap, satellite, terrain, dark)
- Theme-aware styling that adapts to your app's theme
- Sample San Francisco locations for demonstration
- **Completely free** - no API keys required!
- **AI Integration** - Control the map with natural language commands
- **Path/Routing Support** - Create visual paths between multiple locations

## AI Map Control

The 2D Map supports AI-powered control through the chat interface! You can use natural language commands like:

- "Go to Tokyo on the map"
- "Add a marker for the Eiffel Tower"
- "Switch to satellite view"
- "Zoom in to level 15"
- "Clear all markers"
- "Create a path from Tokyo to Kyoto to Osaka"
- "Show me a route through Paris, London, and Berlin"

### How to Use AI Map Control

1. Open the AI Chat panel in your workspace
2. Type commands like:
   - `"Navigate to New York City"`
   - `"Add a marker for the Great Wall of China"`
   - `"Switch to terrain view"`
   - `"Zoom to level 10"`
   - `"Clear all markers"`
   - `"Create a path from Tokyo to Kyoto to Osaka called 'Japan Trip'"`

The AI will automatically:

- Geocode the location using OpenStreetMap's Nominatim service
- Update the map center and zoom level
- Add markers with descriptions
- Change map types and settings
- Create visual paths between multiple locations

### Supported AI Commands

- **Navigation**: "Go to [location]" - Centers the map on a specific location
- **Markers**: "Add a marker for [location]" - Adds a marker with optional description
- **Zoom**: "Zoom to level [number]" - Sets the zoom level (1-18)
- **Map Type**: "Switch to [roadmap/satellite/terrain/dark] view" - Changes map type
- **Clear**: "Clear all markers" - Removes all custom markers
- **Paths**: "Create a path from [location1] to [location2] to [location3]" - Creates visual paths between locations

## Features

### Interactive Map Controls

- **Map Type Toggle**: Switch between roadmap, satellite, terrain, and dark views
- **Location Counter**: Shows the total number of locations on the map
- **Legend**: Color-coded legend showing different location types and paths

### Location Types

- **Landmarks** (Red): Major landmarks and attractions
- **Businesses** (Teal): Commercial establishments
- **Points of Interest** (Blue): General points of interest

### Map Types Available

- **Roadmap**: Standard OpenStreetMap tiles
- **Satellite**: High-resolution satellite imagery from Esri
- **Terrain**: Topographic map with elevation data
- **Dark**: Dark-themed map for low-light environments

### Path Features

- **Visual Paths**: Colored polylines connecting multiple locations
- **Interactive Popups**: Click on paths to see details
- **Smart Zooming**: Automatically adjusts to show entire path
- **Random Colors**: Each path gets a unique color for identification

### Customization

The map component is fully customizable:

- Add your own locations by modifying the `locations` array in `Map2DView.tsx`
- Customize marker colors and styles
- Integrate with your data sources
- Add custom map controls and features

## Usage

1. Open your Unigraph application
2. Look for the "2D Map" view in the view selector (🗺️ icon)
3. Click to open the interactive map
4. Click on markers to see location details in popups
5. Use the map type buttons to switch between different map views
6. Use AI chat to control the map with natural language commands
7. Create paths by asking the AI to connect multiple locations

## No Setup Required!

This implementation uses free OpenStreetMap data and requires no API keys or setup. The map will work immediately after installation.

## Troubleshooting

### Map Not Loading

- Check that `react-leaflet` and `leaflet` are properly installed
- Ensure the Leaflet CSS is being loaded
- Check the browser console for any JavaScript errors

### Missing Markers

- Check the browser console for any JavaScript errors
- Ensure the `locations` array is properly formatted

### Styling Issues

- The component automatically adapts to your app's theme
- Customize colors and styling in the `Map2DView.tsx` file

### AI Map Control Not Working

- Ensure the AI Chat panel is open and connected
- Check that the map view is active in your workspace
- Verify that the location name is recognizable by geocoding services

## Technical Details

### Map Tile Providers

- **Roadmap**: OpenStreetMap (free)
- **Satellite**: Esri World Imagery (free)
- **Terrain**: OpenTopoMap (free)
- **Dark**: CARTO Dark Matter (free)

### Geocoding Service

- **Nominatim**: OpenStreetMap's free geocoding service
- No API key required
- Supports worldwide locations
- Handles natural language queries

### Dependencies

- `react-leaflet`: React wrapper for Leaflet
- `leaflet`: Core mapping library
- `@types/leaflet`: TypeScript definitions

## Next Steps

- Integrate with your data sources to show real locations
- Add custom markers and popups
- Implement location search and filtering
- Add routing and directions features
- Customize map styling and controls
- Extend AI commands for more complex map operations

## Advantages of React Leaflet

- **Free**: No API keys or usage limits
- **Open Source**: Full control over the implementation
- **Flexible**: Easy to customize and extend
- **Fast**: Lightweight and performant
- **Privacy**: No data sent to third-party services
- **AI-Ready**: Built-in support for natural language control
- **Path Support**: Visual routing between multiple locations
