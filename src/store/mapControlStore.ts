import { create } from "zustand";

export interface MapLocation {
  lat: number;
  lng: number;
  zoom?: number;
  name?: string;
}

export interface MapMarker {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  description: string;
  type: "landmark" | "business" | "point-of-interest";
}

export interface MapPath {
  id: string;
  name: string;
  locations: MapLocation[];
  color: string;
  description?: string;
}

interface MapControlState {
  // Current map state
  center: MapLocation;
  zoom: number;
  mapType: "roadmap" | "satellite" | "terrain" | "dark";

  // Markers
  markers: MapMarker[];

  // Paths
  paths: MapPath[];

  // Actions
  setCenter: (location: MapLocation) => void;
  setZoom: (zoom: number) => void;
  setMapType: (mapType: "roadmap" | "satellite" | "terrain" | "dark") => void;
  addMarker: (marker: MapMarker) => void;
  removeMarker: (markerId: string) => void;
  clearMarkers: () => void;
  addPath: (path: MapPath) => void;
  removePath: (pathId: string) => void;
  clearPaths: () => void;
  goToLocation: (location: string) => Promise<void>;
  addLocationMarker: (location: string, description?: string) => Promise<void>;
  createPath: (locations: string[], pathName?: string) => Promise<void>;
}

// Geocoding function using OpenStreetMap Nominatim API
async function geocodeLocation(location: string): Promise<MapLocation> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Location not found: ${location}`);
  }

  const result = data[0];
  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    name: result.display_name,
  };
}

export const useMapControlStore = create<MapControlState>((set, _get) => ({
  // Initial state
  center: { lat: 37.7749, lng: -122.4194, name: "San Francisco" }, // Default to San Francisco
  zoom: 12,
  mapType: "roadmap",
  markers: [
    {
      id: "1",
      name: "Golden Gate Bridge",
      position: { lat: 37.8199, lng: -122.4783 },
      description:
        "Iconic suspension bridge connecting San Francisco to Marin County",
      type: "landmark",
    },
    {
      id: "2",
      name: "Alcatraz Island",
      position: { lat: 37.827, lng: -122.423 },
      description: "Historic federal prison and current tourist attraction",
      type: "landmark",
    },
    {
      id: "3",
      name: "Fisherman's Wharf",
      position: { lat: 37.808, lng: -122.4158 },
      description: "Popular tourist area known for seafood and attractions",
      type: "point-of-interest",
    },
    {
      id: "4",
      name: "Chinatown",
      position: { lat: 37.7941, lng: -122.4079 },
      description: "Largest Chinatown outside of Asia",
      type: "point-of-interest",
    },
  ],
  paths: [],

  // Actions
  setCenter: (location: MapLocation) => {
    set({ center: location });
  },

  setZoom: (zoom: number) => {
    set({ zoom: Math.max(1, Math.min(18, zoom)) }); // Clamp zoom between 1-18
  },

  setMapType: (mapType: "roadmap" | "satellite" | "terrain" | "dark") => {
    set({ mapType });
  },

  addMarker: (marker: MapMarker) => {
    set((state) => ({
      markers: [...state.markers, marker],
    }));
  },

  removeMarker: (markerId: string) => {
    set((state) => ({
      markers: state.markers.filter((marker) => marker.id !== markerId),
    }));
  },

  clearMarkers: () => {
    set({ markers: [] });
  },

  addPath: (path: MapPath) => {
    set((state) => ({
      paths: [...state.paths, path],
    }));
  },

  removePath: (pathId: string) => {
    set((state) => ({
      paths: state.paths.filter((path) => path.id !== pathId),
    }));
  },

  clearPaths: () => {
    set({ paths: [] });
  },

  createPath: async (locations: string[], pathName?: string) => {
    try {
      const geocodedLocations: MapLocation[] = [];

      // Geocode all locations
      for (const location of locations) {
        const geocodedLocation = await geocodeLocation(location);
        geocodedLocations.push(geocodedLocation);
      }

      // Create path with random color
      const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const path: MapPath = {
        id: `path-${Date.now()}`,
        name: pathName || `Path ${locations.length} locations`,
        locations: geocodedLocations,
        color: randomColor,
        description: `Path through: ${locations.join(" → ")}`,
      };

      set((state) => ({
        paths: [...state.paths, path],
        // Center map on the first location
        center: geocodedLocations[0],
        zoom: 10, // Zoom out to show the whole path
      }));
    } catch (error) {
      console.error("Failed to create path:", error);
      throw error;
    }
  },

  goToLocation: async (location: string) => {
    try {
      const geocodedLocation = await geocodeLocation(location);
      set({
        center: geocodedLocation,
        zoom: 12, // Default zoom for new locations
      });
    } catch (error) {
      console.error("Failed to go to location:", error);
      throw error;
    }
  },

  addLocationMarker: async (location: string, description?: string) => {
    try {
      const geocodedLocation = await geocodeLocation(location);
      const marker: MapMarker = {
        id: `marker-${Date.now()}`,
        name: location,
        position: { lat: geocodedLocation.lat, lng: geocodedLocation.lng },
        description: description || `Location: ${location}`,
        type: "point-of-interest",
      };

      set((state) => ({
        markers: [...state.markers, marker],
        center: geocodedLocation, // Also center on the new marker
        zoom: 12,
      }));
    } catch (error) {
      console.error("Failed to add location marker:", error);
      throw error;
    }
  },
}));
