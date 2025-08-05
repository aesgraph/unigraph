import React from "react";
import WorkspaceStateManager from "./WorkspaceStateManager";
import { setShowWorkspaceManager } from "../../store/dialogStore";

interface WorkspaceManagerDialogProps {
  isOpen: boolean;
}

const WorkspaceManagerDialog: React.FC<WorkspaceManagerDialogProps> = ({
  isOpen,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowWorkspaceManager(false);
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <WorkspaceStateManager onClose={() => setShowWorkspaceManager(false)} />
      </div>
    </div>
  );
};

export default WorkspaceManagerDialog;
