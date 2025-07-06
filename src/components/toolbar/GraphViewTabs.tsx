import React, { useEffect, useState } from "react";
import { getSelectedNodeIds } from "../../store/graphInteractionStore";
import { supabase } from "../../utils/supabaseClient";

interface GraphViewTabsProps {
  activeView: string;
  onViewChange: (view: string) => void;
  simulationList: string[];
  selectedSimulation: string;
}

// Simple generic profile SVG icon
const GenericProfileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#e0e0e0" />
    <circle cx="16" cy="13" r="6" fill="#bdbdbd" />
    <ellipse cx="16" cy="24" rx="8" ry="5" fill="#bdbdbd" />
  </svg>
);

const GraphViewTabs: React.FC<GraphViewTabsProps> = ({
  activeView,
  onViewChange,
  simulationList,
  selectedSimulation,
}) => {
  // Track whether to show the editor tab
  const [showEditorTab, setShowEditorTab] = useState(false);

  // Track user session and avatar
  const [user, setUser] = useState<any>(null);

  // Add state for dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  // Update showEditorTab when activeView changes
  useEffect(() => {
    setShowEditorTab(activeView === "Editor" && getSelectedNodeIds().size > 0);
  }, [activeView]);

  useEffect(() => {
    // Get current user from Supabase
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Check if current view is a simulation
  const isSimulation = simulationList.includes(activeView);

  // Get avatar URL if available
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.identities?.[0]?.identity_data?.avatar_url ||
    null;

  return (
    <div className="tab-container">
      {showEditorTab && (
        <button
          className={`tab ${activeView === "Editor" ? "active" : ""}`}
          style={{ maxWidth: "10px" }}
          onClick={() => onViewChange("Editor")}
        >
          Editor
        </button>
      )}
      <button
        className={`tab ${activeView === "Yasgui" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Yasgui")}
      >
        Yasgui
      </button>
      <button
        className={`tab ${activeView === "Gallery" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Gallery")}
      >
        Gallery
      </button>
      <button
        className={`tab ${activeView === "Graphviz" ? "active" : ""}`}
        style={{ maxWidth: "10px" }}
        onClick={() => onViewChange("Graphviz")}
      >
        Graphviz
      </button>
      <button
        className={`tab ${activeView === "ForceGraph3d" ? "active" : ""}`}
        onClick={() => onViewChange("ForceGraph3d")}
      >
        3D
      </button>
      <button
        className={`tab ${activeView === "ReactFlow" ? "active" : ""}`}
        onClick={() => onViewChange("ReactFlow")}
      >
        Flow
      </button>
      <button
        className={`tab ${isSimulation ? "active" : ""}`}
        onClick={() => onViewChange(selectedSimulation)}
      >
        Sim
      </button>
      <button
        className="tab profile-tab"
        style={{
          marginLeft: 12,
          marginRight: 16,
          padding: 0,
          border: "none",
          background: "none",
          boxShadow: "0 0 0 2px #1976d2",
          borderRadius: "50%",
          width: 32,
          height: 32,
          minWidth: 32,
          minHeight: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundColor: "#fff",
          position: "relative",
        }}
        title={user ? "Profile" : "Sign In"}
        onClick={() => {
          if (user) {
            setShowDropdown((v) => !v);
          } else {
            window.location.href = "/signin";
          }
        }}
      >
        {user && avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <GenericProfileIcon />
        )}
        {/* Dropdown for logout */}
        {user && showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              right: 0,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 100,
              minWidth: 100,
            }}
          >
            <button
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 14,
              }}
              onClick={async () => {
                setShowDropdown(false);
                await supabase.auth.signOut();
                window.location.reload();
              }}
            >
              Log out
            </button>
          </div>
        )}
      </button>
    </div>
  );
};

export default GraphViewTabs;
