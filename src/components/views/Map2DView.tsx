import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import React, { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { useMapControlStore } from "../../store/mapControlStore";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Location {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  description: string;
  type: "landmark" | "business" | "point-of-interest";
}

interface Map2DViewProps {
  theme?: any;
  [key: string]: any;
}

// Custom hook to handle map type changes
const MapTypeController: React.FC<{ mapType: string }> = ({ mapType }) => {
  const map = useMap();

  React.useEffect(() => {
    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let newTileLayer: L.TileLayer;

    switch (mapType) {
      case "satellite":
        newTileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          }
        );
        break;
      case "terrain":
        newTileLayer = L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          {
            attribution:
              'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          }
        );
        break;
      case "dark":
        newTileLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        );
        break;
      default: // roadmap
        newTileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        );
        break;
    }

    newTileLayer.addTo(map);
  }, [map, mapType]);

  return null;
};

// Custom hook to handle map center changes
const MapCenterController: React.FC<{
  center: { lat: number; lng: number };
}> = ({ center }) => {
  const map = useMap();

  React.useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [map, center]);

  return null;
};

const Map2DView: React.FC<Map2DViewProps> = ({ theme, ..._props }) => {
  // Use the map control store
  const { center, zoom, mapType, markers, paths, setMapType } =
    useMapControlStore();

  const mapCenter = useMemo(
    () => ({ lat: center.lat, lng: center.lng }),
    [center]
  );

  const getMarkerIcon = (type: Location["type"]) => {
    const colors = {
      landmark: "#FF6B6B",
      business: "#4ECDC4",
      "point-of-interest": "#45B7D1",
    };

    return L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: ${colors[type]};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        ">
          ${type === "landmark" ? "🏛️" : type === "business" ? "🏢" : "📍"}
        </div>
      `,
      className: "custom-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const getMapTypeIcon = (type: typeof mapType) => {
    switch (type) {
      case "satellite":
        return "🛰️";
      case "terrain":
        return "🏔️";
      case "dark":
        return "🌙";
      default:
        return "🗺️";
    }
  };

  const getMapTypeName = (type: typeof mapType) => {
    switch (type) {
      case "satellite":
        return "Satellite";
      case "terrain":
        return "Terrain";
      case "dark":
        return "Dark";
      default:
        return "Roadmap";
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme?.colors?.background || "#f5f5f5",
      }}
    >
      {/* Map Controls */}
      <div
        style={{
          padding: "12px",
          backgroundColor: theme?.colors?.backgroundSecondary || "#ffffff",
          borderBottom: `1px solid ${theme?.colors?.border || "#e0e0e0"}`,
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
          }}
        >
          <MapPin size={16} color={theme?.colors?.primary || "#4f46e5"} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: theme?.colors?.text || "#333",
            }}
          >
            {markers.length} locations
          </span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {(["roadmap", "satellite", "terrain", "dark"] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => setMapType(type)}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${mapType === type ? theme?.colors?.primary || "#4f46e5" : theme?.colors?.border || "#e0e0e0"}`,
                  borderRadius: "6px",
                  backgroundColor:
                    mapType === type
                      ? theme?.colors?.primary || "#4f46e5"
                      : "transparent",
                  color:
                    mapType === type
                      ? "#ffffff"
                      : theme?.colors?.text || "#333",
                  cursor: "pointer",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{getMapTypeIcon(type)}</span>
                <span>{getMapTypeName(type)}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <MapTypeController mapType={mapType} />
          <MapCenterController center={center} />

          {markers.map((location) => (
            <Marker
              key={location.id}
              position={[location.position.lat, location.position.lng]}
              icon={getMarkerIcon(location.type)}
            >
              <Popup>
                <div
                  style={{
                    padding: "8px",
                    maxWidth: "200px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor:
                          location.type === "landmark"
                            ? "#FF6B6B"
                            : location.type === "business"
                              ? "#4ECDC4"
                              : "#45B7D1",
                      }}
                    />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "600",
                        color: theme?.colors?.text || "#333",
                      }}
                    >
                      {location.name}
                    </h3>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: theme?.colors?.textSecondary || "#666",
                      lineHeight: "1.4",
                    }}
                  >
                    {location.description}
                  </p>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "4px 8px",
                      backgroundColor:
                        theme?.colors?.backgroundTertiary || "#f0f0f0",
                      borderRadius: "4px",
                      fontSize: "10px",
                      color: theme?.colors?.textMuted || "#888",
                      textTransform: "capitalize",
                    }}
                  >
                    {location.type.replace("-", " ")}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Display paths */}
          {paths.map((path) => (
            <Polyline
              key={path.id}
              positions={path.locations.map((loc) => [loc.lat, loc.lng])}
              color={path.color}
              weight={4}
              opacity={0.8}
            >
              <Popup>
                <div
                  style={{
                    padding: "8px",
                    maxWidth: "200px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "600",
                      color: theme?.colors?.text || "#333",
                    }}
                  >
                    {path.name}
                  </h3>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "12px",
                      color: theme?.colors?.textSecondary || "#666",
                      lineHeight: "1.4",
                    }}
                  >
                    {path.description}
                  </p>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "4px 8px",
                      backgroundColor: path.color,
                      borderRadius: "4px",
                      fontSize: "10px",
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    {path.locations.length} locations
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "12px",
          backgroundColor: theme?.colors?.backgroundSecondary || "#ffffff",
          borderTop: `1px solid ${theme?.colors?.border || "#e0e0e0"}`,
          fontSize: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: theme?.colors?.textSecondary || "#666",
              fontWeight: "500",
            }}
          >
            Legend:
          </span>
          {Object.entries({
            landmark: "#FF6B6B",
            business: "#4ECDC4",
            "point-of-interest": "#45B7D1",
          }).map(([type, color]) => (
            <div
              key={type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
              />
              <span
                style={{
                  color: theme?.colors?.textSecondary || "#666",
                  textTransform: "capitalize",
                }}
              >
                {type.replace("-", " ")}
              </span>
            </div>
          ))}
          {paths.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginLeft: "8px",
                paddingLeft: "8px",
                borderLeft: `1px solid ${theme?.colors?.border || "#e0e0e0"}`,
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "3px",
                  backgroundColor: "#4ECDC4",
                }}
              />
              <span
                style={{
                  color: theme?.colors?.textSecondary || "#666",
                  fontSize: "11px",
                }}
              >
                Paths ({paths.length})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map2DView;
