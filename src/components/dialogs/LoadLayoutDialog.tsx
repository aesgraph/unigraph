import React, { useState, useEffect } from "react";
import { useTheme } from "@aesgraph/app-shell";
import { layoutManager } from "../../utils/layoutManager";
import { LayoutState } from "../../types/LayoutState";

interface LoadLayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad?: (layout: LayoutState) => void;
}

const LoadLayoutDialog: React.FC<LoadLayoutDialogProps> = ({
  isOpen,
  onClose,
  onLoad,
}) => {
  const { theme } = useTheme();
  const [layouts, setLayouts] = useState<LayoutState[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load layouts when dialog opens
      const savedLayouts = layoutManager.getAllLayouts();
      setLayouts(savedLayouts);
      setSelectedLayout(null);
    }
  }, [isOpen]);

  const handleLoad = async () => {
    if (!selectedLayout) {
      alert("Please select a layout to load");
      return;
    }

    setIsLoading(true);
    try {
      const layout = layoutManager.loadLayout(selectedLayout);
      if (!layout) {
        alert("Layout not found!");
        return;
      }

      // Restore the layout
      layoutManager.restoreWorkspaceState(layout);

      // Call onLoad callback if provided
      if (onLoad) {
        onLoad(layout);
      }

      onClose();
    } catch (error) {
      console.error("Failed to load layout:", error);
      alert("Failed to load layout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (layoutId: string) => {
    if (confirm("Are you sure you want to delete this layout?")) {
      layoutManager.deleteLayout(layoutId);
      // Refresh the list
      setLayouts(layoutManager.getAllLayouts());
      if (selectedLayout === layoutId) {
        setSelectedLayout(null);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatLayoutInfo = (layout: LayoutState) => {
    const { panelSizes } = layout;
    return `Panels: L=${panelSizes.leftWidth.toFixed(1)}%, R=${panelSizes.rightWidth.toFixed(1)}%, B=${panelSizes.bottomHeight.toFixed(1)}%`;
  };

  const formatTabInfo = (layout: LayoutState) => {
    const totalTabs = layout.tabContainers.reduce(
      (sum, container) => sum + container.tabs.length,
      0
    );
    return `${totalTabs} tabs across ${layout.tabContainers.length} panels`;
  };

  if (!isOpen) return null;

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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.sizes.borderRadius.lg,
          padding: theme.sizes.spacing.lg,
          minWidth: "600px",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: theme.sizes.shadow.lg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: `0 0 ${theme.sizes.spacing.md} 0`,
            color: theme.colors.text,
            fontSize: theme.sizes.fontSize.xl,
            fontWeight: "600",
          }}
        >
          Load Layout
        </h2>

        <p
          style={{
            margin: `0 0 ${theme.sizes.spacing.lg} 0`,
            color: theme.colors.textSecondary,
            fontSize: theme.sizes.fontSize.sm,
          }}
        >
          Select a saved layout to restore your workspace configuration.
        </p>

        {layouts.length === 0 ? (
          <div
            style={{
              padding: theme.sizes.spacing.xl,
              textAlign: "center",
              color: theme.colors.textMuted,
              border: `2px dashed ${theme.colors.border}`,
              borderRadius: theme.sizes.borderRadius.md,
            }}
          >
            <p style={{ margin: 0, fontSize: theme.sizes.fontSize.md }}>
              No saved layouts found.
            </p>
            <p
              style={{
                margin: `${theme.sizes.spacing.sm} 0 0 0`,
                fontSize: theme.sizes.fontSize.sm,
              }}
            >
              Save a layout first to see it here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.sizes.spacing.md,
              marginBottom: theme.sizes.spacing.lg,
            }}
          >
            {layouts.map((layout) => (
              <div
                key={layout.id}
                style={{
                  padding: theme.sizes.spacing.md,
                  border:
                    selectedLayout === layout.id
                      ? `2px solid ${theme.colors.primary}`
                      : `1px solid ${theme.colors.border}`,
                  borderRadius: theme.sizes.borderRadius.md,
                  backgroundColor:
                    selectedLayout === layout.id
                      ? theme.colors.surfaceActive
                      : theme.colors.background,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedLayout(layout.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: `0 0 ${theme.sizes.spacing.xs} 0`,
                        color: theme.colors.text,
                        fontSize: theme.sizes.fontSize.lg,
                        fontWeight: "600",
                      }}
                    >
                      {layout.name}
                    </h4>
                    {layout.description && (
                      <p
                        style={{
                          margin: `0 0 ${theme.sizes.spacing.xs} 0`,
                          color: theme.colors.textSecondary,
                          fontSize: theme.sizes.fontSize.sm,
                        }}
                      >
                        {layout.description}
                      </p>
                    )}
                    <div
                      style={{
                        fontSize: theme.sizes.fontSize.xs,
                        color: theme.colors.textMuted,
                        lineHeight: "1.4",
                      }}
                    >
                      <p style={{ margin: "2px 0" }}>
                        Created: {formatDate(layout.timestamp)}
                      </p>
                      <p style={{ margin: "2px 0" }}>
                        {formatLayoutInfo(layout)}
                      </p>
                      <p style={{ margin: "2px 0" }}>{formatTabInfo(layout)}</p>
                      <p style={{ margin: "2px 0" }}>Theme: {layout.theme}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: theme.sizes.spacing.xs }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(layout.id);
                      }}
                      style={{
                        padding: `${theme.sizes.spacing.xs} ${theme.sizes.spacing.sm}`,
                        backgroundColor: theme.colors.error,
                        color: theme.colors.textInverse,
                        border: "none",
                        borderRadius: theme.sizes.borderRadius.sm,
                        cursor: "pointer",
                        fontSize: theme.sizes.fontSize.xs,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: theme.sizes.spacing.sm,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: `${theme.sizes.spacing.sm} ${theme.sizes.spacing.md}`,
              backgroundColor: "transparent",
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.sizes.borderRadius.sm,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: theme.sizes.fontSize.sm,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleLoad}
            disabled={!selectedLayout || isLoading}
            style={{
              padding: `${theme.sizes.spacing.sm} ${theme.sizes.spacing.md}`,
              backgroundColor:
                selectedLayout && !isLoading
                  ? theme.colors.primary
                  : theme.colors.textMuted,
              color: theme.colors.textInverse,
              border: "none",
              borderRadius: theme.sizes.borderRadius.sm,
              cursor: selectedLayout && !isLoading ? "pointer" : "not-allowed",
              fontSize: theme.sizes.fontSize.sm,
            }}
          >
            {isLoading ? "Loading..." : "Load Layout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadLayoutDialog;
