import { addViewAsTab, useTheme } from "@aesgraph/app-shell";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { ArrowUpLeft, Trash2 } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";

import { useAppContext } from "../../context/AppContext";

import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { Node as ModelNode, NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import {
  setHoveredNodeId,
  setSelectedNodeId,
} from "../../store/graphInteractionStore";
import { useTagStore } from "../../store/tagStore";
import { createThemedAgGridContainer } from "../../utils/aggridThemeUtils";
import { ContextMenuItem } from "./ContextMenu";
import EntityJsonViewer from "./EntityJsonViewer";
import styles from "./EntityTableV2.module.css";
import EntityTagsSelectorDropdown from "./EntityTagsSelectorDropdown";
import EntityTypeSelectDropdown from "./EntityTypeSelectDropdown";
import HtmlPageViewer from "./HtmlPageViewer";
import WebResourcePreviewCard from "./WebResourcePreviewCard";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface EntityTableV2Props {
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
  onEntityClick?: (entity: Entity) => void;
  maxHeight?: string | number;
  entityType?: string; // Add entity type for custom configurations
  toolbar?: React.ReactNode; // Optional toolbar area for actions
}

const EntityTableV2 = forwardRef<any, EntityTableV2Props>(
  (
    {
      container,
      sceneGraph,
      onEntityClick,
      maxHeight = 600,
      entityType,
      toolbar,
    },
    ref
  ) => {
    const [contextMenu, setContextMenu] = useState<{
      mouseX: number;
      mouseY: number;
      entity: Entity | null;
    } | null>(null);

    const [jsonViewerEntity, setJsonViewerEntity] = useState<Entity | null>(
      null
    );
    const [htmlPageViewerData, setHtmlPageViewerData] = useState<{
      resourceId: string;
      title: string;
    } | null>(null);

    // Hover preview state for web resources
    const [hoveredWebResource, setHoveredWebResource] = useState<{
      webpage: any;
      position: { x: number; y: number };
    } | null>(null);

    const { setEditingEntity, setJsonEditEntity } = useAppContext();

    // Get theme from app-shell
    const { theme } = useTheme();

    // Get tag store functions
    const { getTagMetadata } = useTagStore();

    // Grid API reference - moved up so cell renderers can access it
    const gridRef = useRef<AgGridReact<Entity>>(null);

    // Expose gridRef to parent component via ref
    React.useImperativeHandle(ref, () => ({
      gridRef,
    }));

    // Search functionality
    const searchInValue = useCallback(
      (value: any, searchText: string): boolean => {
        const searchLower = searchText.toLowerCase();

        if (value === null || value === undefined) {
          return false;
        }

        // Handle Sets
        if (value instanceof Set) {
          return Array.from(value).some((item) =>
            searchInValue(item, searchText)
          );
        }

        // Handle Arrays
        if (Array.isArray(value)) {
          return value.some((item) => searchInValue(item, searchText));
        }

        // Handle Objects (including userData)
        if (typeof value === "object") {
          return Object.values(value).some((val) =>
            searchInValue(val, searchText)
          );
        }

        // Handle primitive values
        return String(value).toLowerCase().includes(searchLower);
      },
      []
    );

    // Value formatting
    const formatValue = useCallback((value: any): string => {
      if (value === null) return "null";
      if (value === undefined) return "undefined";
      if (value instanceof Set) return `[${Array.from(value).join(", ")}]`;
      if (Array.isArray(value)) return `[${value.join(", ")}]`;

      // Special handling for SPARQL result objects with {type, value} structure
      if (
        typeof value === "object" &&
        value !== null &&
        "value" in value &&
        "type" in value
      ) {
        return String(value.value);
      }

      if (typeof value === "object") {
        // Special handling for empty objects
        if (Object.keys(value).length === 0) return "{}";

        try {
          const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key: string, value: any) => {
              if (typeof value === "object" && value !== null) {
                if (seen.has(value)) return "[Circular]";
                seen.add(value);
              }
              return value;
            };
          };

          // Compact formatting for small objects
          const json = JSON.stringify(value, getCircularReplacer());
          if (json.length < 50) {
            return json; // Show inline if small
          }

          // Pretty print for larger objects
          return JSON.stringify(value, getCircularReplacer(), 2);
        } catch (e) {
          return `[Complex Object] ${e}`;
        }
      }

      return String(value);
    }, []);

    // Context menu handling
    const handleContextMenu = useCallback(
      (event: React.MouseEvent, entity: Entity) => {
        event.preventDefault();
        setContextMenu((prevContextMenu) =>
          prevContextMenu === null
            ? {
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
                entity,
              }
            : null
        );
      },
      []
    );

    const handleClose = () => {
      setContextMenu(null);
    };

    // Context menu items
    const contextMenuItems: ContextMenuItem[] = [
      {
        label: "Edit",
        action: () => {
          if (contextMenu?.entity) {
            // For documents, use inline rename instead of node editor (no graph node exists)
            if (entityType === "documents") {
              const entityId = contextMenu.entity.getId();
              window.dispatchEvent(
                new CustomEvent("startDocumentRename", {
                  detail: { entityId, entity: contextMenu.entity },
                })
              );
            } else if (entityType === "web-resources") {
              // Web resources also use inline rename UX
              const entityId = contextMenu.entity.getId();
              window.dispatchEvent(
                new CustomEvent("startWebResourceRename", {
                  detail: { entityId, entity: contextMenu.entity },
                })
              );
            } else {
              setEditingEntity(contextMenu.entity);
            }
          }
          handleClose();
        },
      },
      {
        label: "Advanced Edit",
        action: () => {
          if (contextMenu?.entity) {
            setJsonEditEntity(contextMenu.entity);
          }
          handleClose();
        },
      },
      {
        label: "Rename",
        action: () => {
          if (contextMenu?.entity) {
            // For web resources, use the inline editing approach
            if (entityType === "web-resources") {
              // Store the entity to edit in a way that LabelCellRenderer can access
              // We'll use a custom approach that doesn't rely on the general editing system
              const entityId = contextMenu.entity.getId();
              // Trigger a custom event that the LabelCellRenderer can listen for
              window.dispatchEvent(
                new CustomEvent("startWebResourceRename", {
                  detail: { entityId, entity: contextMenu.entity },
                })
              );
            } else if (entityType === "documents") {
              const entityId = contextMenu.entity.getId();
              window.dispatchEvent(
                new CustomEvent("startDocumentRename", {
                  detail: { entityId, entity: contextMenu.entity },
                })
              );
            } else {
              // For other entity types, use the general editing system
              setEditingEntity(contextMenu.entity);
            }
          }
          handleClose();
        },
      },
      {
        label: "View as JSON",
        action: () => {
          if (contextMenu?.entity) {
            setJsonViewerEntity(contextMenu.entity);
          }
          handleClose();
        },
      },
      // Add web resource specific options
      ...(entityType === "web-resources" && contextMenu?.entity
        ? [
            {
              label: "View saved page",
              action: () => {
                if (contextMenu?.entity) {
                  const entityData = contextMenu.entity.getData() as any;
                  const resourceId = entityData.id;
                  const url = entityData.url;
                  const title =
                    entityData.label || entityData.title || entityData.url;

                  if (resourceId) {
                    const timestamp = Date.now();
                    const tabId = `html-page-viewer-${resourceId}-${timestamp}`;
                    const tabTitle = title || `Page Viewer - ${resourceId}`;

                    addViewAsTab({
                      viewId: "html-page-viewer",
                      pane: "center",
                      tabId: tabId,
                      title: tabTitle,
                      props: {
                        resourceId: resourceId,
                        title: title,
                        url: url,
                        tabId: tabId,
                      },
                      activate: true,
                    });
                  }
                }
                handleClose();
              },
            } as ContextMenuItem,
            {
              label: "Open link",
              action: () => {
                if (contextMenu?.entity) {
                  const entityData = contextMenu.entity.getData() as any;
                  const url = entityData.url;

                  if (url) {
                    // Open the URL in a new tab outside of Unigraph
                    window.open(url, "_blank");
                  }
                }
                handleClose();
              },
            } as ContextMenuItem,
          ]
        : []),
      // Add document specific options
      ...(entityType === "documents" && contextMenu?.entity
        ? [
            {
              label: "Open in Document Editor",
              action: () => {
                if (contextMenu?.entity) {
                  const entityData = contextMenu.entity.getData() as any;
                  const documentId = entityData.id;
                  const documentTitle =
                    entityData.label || entityData.title || "Document";
                  const documentExtension = entityData.extension || "txt";

                  if (documentId) {
                    const tabId = `document-editor-${documentId}`;
                    const tabTitle = `${documentTitle}.${documentExtension}`;

                    addViewAsTab({
                      viewId: "document-editor",
                      pane: "center",
                      tabId: tabId,
                      title: tabTitle,
                      props: {
                        documentId: documentId,
                        filename: `${documentTitle}.${documentExtension}`,
                        userId: entityData.userId,
                        projectId: entityData.project_id,
                      },
                      activate: true,
                    });
                  }
                }
                handleClose();
              },
            } as ContextMenuItem,
          ]
        : []),
    ];

    // Actions cell renderer component with improved stability
    const ActionsCellRendererComponent = React.memo(
      (props: { data: Entity }) => {
        const [showMoreOptions, setShowMoreOptions] = useState(false);
        // Use a ref to track dropdown state across renders
        const showMoreOptionsRef = useRef(showMoreOptions);
        // Update ref when state changes
        useEffect(() => {
          showMoreOptionsRef.current = showMoreOptions;
        }, [showMoreOptions]);

        const [dropdownPosition, setDropdownPosition] = useState({
          top: 0,
          left: 0,
          width: 0,
        });
        const moreOptionsRef = useRef<HTMLDivElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const handleGoTo = (e: React.MouseEvent) => {
          e.stopPropagation();

          // Get the entity ID
          const entityId = props.data?.getId();
          if (!entityId) {
            console.warn("No entity ID found for go to action");
            return;
          }

          console.log("Go to entity:", entityId);

          // Select the node in the graph interaction store
          setSelectedNodeId(entityId as NodeId);

          // Call the global zoom function if available
          if ((window as any).reactFlowZoomToNode) {
            (window as any).reactFlowZoomToNode(entityId);
          }

          // Call the original onEntityClick if provided
          if (onEntityClick && props.data) {
            onEntityClick(props.data);
          }
        };

        const handleRename = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (props.data) {
            // For web resources, use the inline editing approach
            if (entityType === "web-resources") {
              const entityId = props.data.getId();
              // Trigger a custom event that the LabelCellRenderer can listen for
              window.dispatchEvent(
                new CustomEvent("startWebResourceRename", {
                  detail: { entityId, entity: props.data },
                })
              );
            } else {
              // For other entity types, use the general editing system
              setEditingEntity(props.data);
            }
          }
          setShowMoreOptions(false);
        };

        const handleMoreOptionsClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          setShowMoreOptions(!showMoreOptions);

          // Calculate position for the portal dropdown
          if (moreOptionsRef.current) {
            const rect = moreOptionsRef.current.getBoundingClientRect();
            const dropdownWidth = 200;
            const padding = 8; // small gap from edge
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;
            let left;
            // Prefer right if enough space, else left, else side with more space
            if (spaceRight >= dropdownWidth + padding) {
              left = rect.left;
            } else if (spaceLeft >= dropdownWidth + padding) {
              left = rect.right - dropdownWidth;
            } else {
              // Not enough space either side, pick the side with more space
              left =
                spaceRight > spaceLeft
                  ? Math.max(rect.left, padding)
                  : Math.max(rect.right - dropdownWidth, padding);
            }
            setDropdownPosition({
              top: rect.bottom + window.scrollY,
              left,
              width: dropdownWidth,
            });
          }
        };

        // Handle click outside to close dropdown - improved to resist ForceGraph3D mousemove rerenders
        useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
            // Only process actual mouse clicks (not mousemove events)
            if (event.type !== "mousedown") return;

            const target = event.target as Node;

            // Check if the click is inside the dropdown or the trigger button
            const isInsideDropdown = dropdownRef.current?.contains(target);
            const isInsideTrigger = moreOptionsRef.current?.contains(target);

            // Only close if click is outside both the dropdown and trigger
            if (
              showMoreOptionsRef.current &&
              !isInsideDropdown &&
              !isInsideTrigger
            ) {
              setShowMoreOptions(false);
            }
          };

          if (showMoreOptions) {
            // Only listen for mousedown events (not mousemove)
            document.addEventListener("mousedown", handleClickOutside, {
              capture: true,
            });
          }

          return () => {
            document.removeEventListener("mousedown", handleClickOutside, {
              capture: true,
            });
          };
        }, [showMoreOptions]);

        // Portal dropdown component
        const DropdownPortal = () => {
          if (!showMoreOptions) return null;

          return ReactDOM.createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 2147483647,
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.sizes.borderRadius.sm,
                boxShadow: theme.sizes.shadow.md,
                margin: 0,
                padding: 0,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleGoTo}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: theme.colors.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Go to Entity
              </button>
              <button
                onClick={handleRename}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: theme.colors.primary,
                  borderTop: `1px solid ${theme.colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Rename
              </button>
            </div>,
            document.body
          );
        };

        return (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                width: "100%",
                height: "100%",
                position: "relative",
                background: "transparent",
              }}
            >
              <button
                onClick={handleGoTo}
                style={{
                  background: "transparent",
                  color: theme.colors.primary,
                  border: "none",
                  borderRadius: "50%",
                  padding: "4px",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = theme.colors.surfaceHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                title="Go to entity"
              >
                <ArrowUpLeft size={16} />
              </button>

              <div ref={moreOptionsRef} style={{ position: "relative" }}>
                <button
                  onClick={handleMoreOptionsClick}
                  style={{
                    background: "transparent",
                    color: theme.colors.textSecondary,
                    border: "none",
                    borderRadius: "50%",
                    padding: "4px",
                    fontSize: "18px",
                    cursor: "pointer",
                    minWidth: "24px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      theme.colors.surfaceHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  title="More options"
                >
                  {"\u22EE"}
                </button>
              </div>
            </div>
            <DropdownPortal />
          </>
        );
      }
    );

    ActionsCellRendererComponent.displayName = "ActionsCellRendererComponent";

    // Actions cell renderer callback for AG Grid
    const ActionsCellRenderer = useCallback(
      (props: { data: Entity }) => {
        return <ActionsCellRendererComponent {...props} />;
      },
      [ActionsCellRendererComponent] // Remove dependency on ActionsCellRendererComponent since it's already memoized
    );

    // Label cell renderer component with inline editing
    const LabelCellRenderer = (props: { data: Entity; value: string }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [editValue, setEditValue] = useState(props.value || "");
      const inputRef = useRef<HTMLInputElement>(null);

      // Listen for custom rename events
      useEffect(() => {
        const handleRenameEvent = (event: CustomEvent) => {
          if (event.detail.entityId === props.data.getId()) {
            setIsEditing(true);
            setEditValue(props.value || "");
            // Focus the input after a brief delay to ensure it's rendered
            setTimeout(() => {
              inputRef.current?.focus();
              inputRef.current?.select();
            }, 10);
          }
        };

        window.addEventListener(
          "startWebResourceRename",
          handleRenameEvent as EventListener
        );
        window.addEventListener(
          "startDocumentRename",
          handleRenameEvent as EventListener
        );
        return () => {
          window.removeEventListener(
            "startWebResourceRename",
            handleRenameEvent as EventListener
          );
          window.removeEventListener(
            "startDocumentRename",
            handleRenameEvent as EventListener
          );
        };
      }, [props.data.getId(), props.value]);

      // Intercept keyboard events at document level when input is focused
      useEffect(() => {
        if (isEditing && inputRef.current) {
          const input = inputRef.current;

          const handleKeyDown = (e: KeyboardEvent) => {
            // Only intercept if the target is our input or its container
            if (e.target === input || input.contains(e.target as Node)) {
              e.stopPropagation();

              // Handle Enter and Escape keys
              if (e.key === "Enter") {
                e.preventDefault();
                // Get current value from input element
                const currentValue = (e.target as HTMLInputElement).value;

                // Trigger save logic directly
                if (props.data && currentValue !== props.value) {
                  const originalValue = props.value || "";
                  setIsEditing(false);
                  props.data.setLabel(currentValue);

                  const entityData = props.data.getData() as any;
                  if (entityData) {
                    entityData.label = currentValue;
                    entityData.title = currentValue;
                  }

                  // Save to Supabase for web resources
                  if (entityType === "web-resources") {
                    (async () => {
                      try {
                        const entityData = props.data.getData() as any;
                        const { supabase } = await import(
                          "../../utils/supabaseClient"
                        );
                        const { data: userData, error: userError } =
                          await supabase.auth.getUser();

                        if (userError || !userData?.user?.id) {
                          console.error(
                            "User authentication error:",
                            userError
                          );
                          return;
                        }

                        const { updateWebpageTitle } = await import(
                          "../../api/webpagesApi"
                        );
                        await updateWebpageTitle(
                          entityData.id || props.data.getId(),
                          currentValue
                        );
                        console.log(
                          "Webpage title updated in Supabase:",
                          currentValue
                        );
                      } catch (error) {
                        console.error("Error saving webpage label:", error);
                        props.data.setLabel(originalValue);
                        alert("Failed to save changes. Please try again.");
                      }
                    })();
                  }
                  // Save to Supabase for documents
                  else if (entityType === "documents") {
                    (async () => {
                      try {
                        console.log("Starting document rename save process...");
                        const entityData = props.data.getData() as any;
                        const documentId = entityData.id || props.data.getId();
                        if (!documentId) {
                          console.error("Missing document id for rename");
                          throw new Error("Missing document id for rename");
                        }

                        console.log(
                          "Document ID:",
                          documentId,
                          "New value:",
                          currentValue
                        );

                        // Parse potential extension from entered value
                        let baseTitle = currentValue.trim();
                        let newExtension: string | undefined;
                        const lastDot = baseTitle.lastIndexOf(".");
                        if (lastDot > 0) {
                          const maybeExt = baseTitle
                            .substring(lastDot + 1)
                            .toLowerCase();
                          if (["md", "txt", "pdf"].includes(maybeExt)) {
                            newExtension = maybeExt;
                            baseTitle = baseTitle.substring(0, lastDot);
                          }
                        }

                        console.log(
                          "Parsed title:",
                          baseTitle,
                          "Extension:",
                          newExtension
                        );

                        const { updateDocument } = await import(
                          "../../api/documentsApi"
                        );
                        await updateDocument({
                          id: documentId,
                          title: baseTitle,
                          ...(newExtension ? { extension: newExtension } : {}),
                        });

                        console.log(
                          "Document updated in Supabase successfully"
                        );

                        // Update local model
                        entityData.label = baseTitle;
                        entityData.title = baseTitle;
                        if (newExtension) entityData.extension = newExtension;

                        // Refresh the grid to show updated values
                        if (gridRef.current?.api) {
                          const rowNode = gridRef.current.api.getRowNode(
                            props.data.getId()
                          );
                          if (rowNode) {
                            gridRef.current.api.refreshCells({
                              rowNodes: [rowNode],
                              force: true,
                            });
                            console.log("Grid refreshed successfully");
                          }
                        } else {
                          // Fallback: trigger a full row data refresh
                          setRowData(container.toArray());
                          console.log("Full row data refresh triggered");
                        }

                        // Emit event to refresh documents tab
                        try {
                          const { emitDocumentEvent } = await import(
                            "../../store/documentEventsStore"
                          );
                          emitDocumentEvent({
                            type: "document:renamed",
                            id: documentId,
                            title: baseTitle,
                            extension: newExtension || entityData.extension,
                          });
                          console.log("Document event emitted successfully");
                        } catch (eventError) {
                          console.warn(
                            "Failed to emit document event:",
                            eventError
                          );
                        }
                      } catch (error) {
                        console.error("Error saving document title:", error);
                        props.data.setLabel(originalValue);
                        alert("Failed to save changes. Please try again.");
                      }
                    })();
                  }
                } else {
                  setIsEditing(false);
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setEditValue(props.value || "");
                setIsEditing(false);
              }
              // Don't prevent default for arrow keys - let the input handle them
            }
          };

          const handleKeyUp = (e: KeyboardEvent) => {
            if (e.target === input || input.contains(e.target as Node)) {
              e.stopPropagation();
            }
          };

          const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target === input || input.contains(e.target as Node)) {
              e.stopPropagation();
            }
          };

          // Use capture phase to intercept events before AG Grid
          document.addEventListener("keydown", handleKeyDown, true);
          document.addEventListener("keyup", handleKeyUp, true);
          document.addEventListener("keypress", handleKeyPress, true);

          return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
            document.removeEventListener("keyup", handleKeyUp, true);
            document.removeEventListener("keypress", handleKeyPress, true);
          };
        }
      }, [isEditing]);

      const handleSave = async () => {
        if (props.data && editValue !== props.value) {
          const originalValue = props.value || "";

          // Exit edit mode first to prevent flicker
          setIsEditing(false);

          // Then update the entity data
          props.data.setLabel(editValue);

          // Update the model data that AG Grid uses
          const entityData = props.data.getData() as any;
          if (entityData) {
            // Update the label in the model data
            entityData.label = editValue;
            entityData.title = editValue; // Also update title for web resources
          }

          // No need to refresh cells since valueGetter reads directly from entity
          // The cell will automatically show the updated value on next render

          try {
            // For web resources, also save to Supabase
            if (entityType === "web-resources") {
              const entityData = props.data.getData() as any;
              console.log("Entity data for save:", entityData);

              // Get current user for authentication
              const { supabase } = await import("../../utils/supabaseClient");
              const { data: userData, error: userError } =
                await supabase.auth.getUser();

              if (userError || !userData?.user?.id) {
                console.error("User authentication error:", userError);
                throw new Error("User not authenticated");
              }

              console.log("Webpage title to update:", editValue);

              // Import the updateWebpageTitle function
              const { updateWebpageTitle } = await import(
                "../../api/webpagesApi"
              );
              try {
                const result = await updateWebpageTitle(
                  entityData.id || props.data.getId(),
                  editValue
                );
                console.log("Update result:", result);
                console.log("Webpage title updated in Supabase:", editValue);
              } catch (updateError) {
                console.error("UpdateWebpageTitle error:", updateError);
                throw updateError;
              }
            }
            // For documents, save title (and optional extension) to Supabase
            else if (entityType === "documents") {
              const entityData = props.data.getData() as any;
              const documentId = entityData.id || props.data.getId();
              if (!documentId) {
                throw new Error("Missing document id for rename");
              }

              // Parse potential extension from entered value
              let baseTitle = editValue.trim();
              let newExtension: string | undefined;
              const lastDot = baseTitle.lastIndexOf(".");
              if (lastDot > 0) {
                const maybeExt = baseTitle.substring(lastDot + 1).toLowerCase();
                if (["md", "txt", "pdf"].includes(maybeExt)) {
                  newExtension = maybeExt;
                  baseTitle = baseTitle.substring(0, lastDot);
                }
              }

              const { updateDocument } = await import("../../api/documentsApi");
              await updateDocument({
                id: documentId,
                title: baseTitle,
                ...(newExtension ? { extension: newExtension } : {}),
              });

              // Update local model
              entityData.label = baseTitle;
              entityData.title = baseTitle;
              if (newExtension) entityData.extension = newExtension;

              // Refresh the grid to show updated values
              if (gridRef.current?.api) {
                const rowNode = gridRef.current.api.getRowNode(
                  props.data.getId()
                );
                if (rowNode) {
                  gridRef.current.api.refreshCells({
                    rowNodes: [rowNode],
                    force: true,
                  });
                }
              } else {
                // Fallback: trigger a full row data refresh
                setRowData(container.toArray());
              }

              // Emit event to refresh documents tab
              try {
                const { emitDocumentEvent } = await import(
                  "../../store/documentEventsStore"
                );
                emitDocumentEvent({
                  type: "document:renamed",
                  id: documentId,
                  title: baseTitle,
                  extension: newExtension || entityData.extension,
                });
              } catch (_) {
                /* ignore */
              }
            }
          } catch (error) {
            console.error("Error saving webpage label:", error);
            // Revert the local change if Supabase save failed
            props.data.setLabel(originalValue);
            // No need to refresh - valueGetter will automatically show the reverted value

            alert("Failed to save changes. Please try again.");
          }
        }
      };

      const handleCancel = () => {
        setEditValue(props.value || "");
        setIsEditing(false);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        // Prevent AG Grid from handling keyboard events when input is focused
        e.stopPropagation();

        if (e.key === "Enter") {
          e.preventDefault();
          handleSave();
        } else if (e.key === "Escape") {
          e.preventDefault();
          handleCancel();
        }
        // For all other keys (including arrow keys), let the input handle them normally
      };

      const handleBlur = () => {
        handleSave();
      };

      if (isEditing) {
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={(e) => e.stopPropagation()}
              onKeyPress={(e) => e.stopPropagation()}
              onBlur={handleBlur}
              style={{
                width: "100%",
                height: "100%",
                border: "2px solid #007acc",
                borderRadius: "4px",
                padding: "4px 8px",
                fontSize: "14px",
                outline: "none",
                background: "white",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              onInput={(e) => e.stopPropagation()}
              onCompositionStart={(e) => e.stopPropagation()}
              onCompositionEnd={(e) => e.stopPropagation()}
              onCompositionUpdate={(e) => e.stopPropagation()}
            />
          </div>
        );
      }

      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "8px",
            cursor: "text",
            userSelect: "text",
          }}
        >
          {props.value || ""}
        </div>
      );
    };

    // Type cell renderer component with portal-based dropdown
    const TypeCellRendererComponent = React.memo(
      (props: { data: Entity; value: string }) => {
        const [isEditing, setIsEditing] = useState(false);
        // Use ref to track state across renders
        const isEditingRef = useRef(isEditing);
        useEffect(() => {
          isEditingRef.current = isEditing;
        }, [isEditing]);

        const [editValue, setEditValue] = useState(props.value || "");
        const [dropdownPosition, setDropdownPosition] = useState({
          top: 0,
          left: 0,
          width: 0,
        });
        const cellRef = useRef<HTMLDivElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        // Handle click outside to close dropdown
        useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
            // Only process actual mouse clicks (not mousemove events)
            if (event.type !== "mousedown") return;

            const eventTarget = event.target as Node;
            const dropdownNode = dropdownRef.current as HTMLDivElement | null;
            const cellNode = cellRef.current as HTMLDivElement | null;

            // Check if the click is inside the dropdown or the cell
            const isInsideDropdown = dropdownNode?.contains(eventTarget);
            const isInsideCell = cellNode?.contains(eventTarget);

            if (isEditingRef.current && !isInsideDropdown && !isInsideCell) {
              setIsEditing(false);
            }
          };

          if (isEditing) {
            document.addEventListener("mousedown", handleClickOutside, {
              capture: true,
            });
          }

          return () => {
            document.removeEventListener("mousedown", handleClickOutside, {
              capture: true,
            });
          };
        }, [isEditing]);

        const handleDoubleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsEditing(true);
          setEditValue(props.value || "");

          // Calculate position for the portal dropdown to fit exactly on top of the column
          if (cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();
            setDropdownPosition({
              top: rect.top + window.scrollY, // Position at the top of the cell, not bottom
              left: rect.left + window.scrollX,
              width: rect.width,
            });
          }
        };

        const handleSave = (newType: string) => {
          if (props.data && newType !== props.value) {
            // Update the entity's type using the proper setter method
            props.data.setType(newType);

            // Force refresh the entire row to update all cell values
            if (gridRef.current?.api) {
              const rowNode = gridRef.current.api.getRowNode(
                props.data.getId()
              );
              if (rowNode) {
                // Refresh the entire row to ensure all cells get updated values
                gridRef.current.api.refreshCells({
                  rowNodes: [rowNode],
                  force: true,
                  suppressFlash: true,
                });
              }
            }
            // Update rowData state to trigger AG Grid re-render
            setRowData(container.toArray());
          }
          setIsEditing(false);
        };

        // Portal dropdown component
        const DropdownPortal = () => {
          if (!isEditing) return null;

          return ReactDOM.createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 2147483647,
                backgroundColor: "white",
                margin: 0,
                padding: 0, // Override SelectDropdown.module.css margin-top
                // No border, border-radius, or box-shadow for perfect fit
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <EntityTypeSelectDropdown
                sceneGraph={sceneGraph}
                nodeId={null}
                value={editValue}
                setValue={handleSave}
                isDarkMode={false}
              />
            </div>,
            document.body
          );
        };

        return (
          <>
            <div
              ref={cellRef}
              onDoubleClick={handleDoubleClick}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "8px",
                cursor: "pointer",
                userSelect: "text",
              }}
              title="Double-click to edit"
            >
              {props.value || ""}
            </div>
            <DropdownPortal />
          </>
        );
      }
    );

    TypeCellRendererComponent.displayName = "TypeCellRendererComponent";

    // Type cell renderer callback for AG Grid
    const TypeCellRenderer = useCallback(
      (props: { data: Entity; value: string }) => {
        return <TypeCellRendererComponent {...props} />;
      },
      [TypeCellRendererComponent] // Remove dependency on TypeCellRendererComponent since it's already memoized
    );

    // Tags cell renderer component with portal-based dropdown
    const TagsCellRendererComponent = React.memo(
      (props: { data: Entity; value: string[] }) => {
        const { getTagColor, setTagColor } = useTagStore();
        const [isEditing, setIsEditing] = useState(false);
        // Use ref to track state across renders
        const isEditingRef = useRef(isEditing);
        useEffect(() => {
          isEditingRef.current = isEditing;
        }, [isEditing]);

        const [editValue, setEditValue] = useState(
          Array.isArray(props.value)
            ? props.value.map((tag) => ({
                value: tag,
                label: tag,
                color: getTagColor(tag),
              }))
            : []
        );
        const [dropdownPosition, setDropdownPosition] = useState({
          top: 0,
          left: 0,
          width: 0,
        });
        const cellRef = useRef<HTMLDivElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        // Click outside to close
        useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
            // Only process actual mouse clicks (not mousemove events)
            if (event.type !== "mousedown") return;

            const target = event.target as Node;

            // Check if the click is inside the dropdown or the cell
            const isInsideDropdown = dropdownRef.current?.contains(target);
            const isInsideCell = cellRef.current?.contains(target);

            if (isEditingRef.current && !isInsideDropdown && !isInsideCell) {
              setIsEditing(false);
            }
          };
          if (isEditing) {
            document.addEventListener("mousedown", handleClickOutside, {
              capture: true,
            });
          }
          return () => {
            document.removeEventListener("mousedown", handleClickOutside, {
              capture: true,
            });
          };
        }, [isEditing]);

        const handleDoubleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsEditing(true);
          setEditValue(
            Array.isArray(props.value)
              ? props.value.map((tag) => ({
                  value: tag,
                  label: tag,
                  color: getTagColor(tag),
                }))
              : []
          );
          if (cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();
            setDropdownPosition({
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
            });
          }
        };

        const handleSave = (
          newTags: { value: string; label: string; color: string }[]
        ) => {
          if (props.data && Array.isArray(newTags)) {
            const tagSet = new Set(newTags.map((t) => t.value));
            if (typeof (props.data as ModelNode).setTags === "function") {
              (props.data as ModelNode).setTags(tagSet);
            } else {
              // fallback
              const entityData = props.data.getData();
              (entityData as any).tags = tagSet;
            }
            // Force refresh the entire row to update all cell values
            if (gridRef.current?.api) {
              const rowNode = gridRef.current.api.getRowNode(
                props.data.getId()
              );
              if (rowNode) {
                // Refresh the entire row to ensure all cells get updated values
                gridRef.current.api.refreshCells({
                  rowNodes: [rowNode],
                  force: true,
                  suppressFlash: true,
                });
              }
            }
            // Update rowData state to trigger AG Grid re-render
            setRowData(container.toArray());
          }
          setIsEditing(false);
        };

        // Portal dropdown component
        const DropdownPortal = () => {
          if (!isEditing) return null;
          return ReactDOM.createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 2147483647,
                backgroundColor: "white",
                margin: 0,
                padding: 0,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <EntityTagsSelectorDropdown
                sceneGraph={sceneGraph}
                nodeId={props.data.getId?.()}
                values={editValue}
                setValues={handleSave}
                isDarkMode={false}
              />
            </div>,
            document.body
          );
        };

        return (
          <>
            <div
              ref={cellRef}
              onDoubleClick={handleDoubleClick}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "8px",
                cursor: "pointer",
                userSelect: "text",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title="Double-click to edit"
            >
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {Array.isArray(props.value) &&
                  props.value.map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        background: getTagColor(tag),
                        color: "#fff",
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontSize: 12,
                        fontWeight: 500,
                        display: "inline-block",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
            <DropdownPortal />
          </>
        );
      }
    );

    TagsCellRendererComponent.displayName = "TagsCellRendererComponent";

    // Color cell renderer component
    const DescriptionCellRenderer = (props: {
      data: Entity;
      value: string;
    }) => {
      const { setTagMetadata, getTagMetadata, getTagColor } = useTagStore();
      const [isEditing, setIsEditing] = useState(false);
      const [editValue, setEditValue] = useState(props.value || "");
      const inputRef = useRef<HTMLInputElement>(null);

      // Get the tag name from the entity data
      const entityData = props.data.getData();
      const tagName = entityData.label; // For tags, the label is the tag name

      const handleDoubleClick = (e: React.MouseEvent) => {
        console.log("DescriptionCellRenderer handleDoubleClick called", {
          entityType,
          tagName,
          propsValue: props.value,
        });
        e.stopPropagation();
        if (entityType === "tags") {
          console.log("Setting editing mode to true");
          setIsEditing(true);
          setEditValue(props.value || "");
          setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
          }, 10);
        } else {
          console.log("Not tags entity type, ignoring double-click");
        }
      };

      // Add document-level event listeners to prevent AG Grid interference
      useEffect(() => {
        if (!isEditing) return;

        const handleDocumentKeyDown = (e: KeyboardEvent) => {
          // Only handle events for our input
          if (e.target !== inputRef.current) return;

          // Stop propagation for all keyboard events
          e.stopPropagation();

          // Allow arrow keys and other navigation keys to work normally
          if (
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "Home" ||
            e.key === "End" ||
            e.key === "Backspace" ||
            e.key === "Delete"
          ) {
            return; // Let these keys work normally
          }

          // Handle Enter and Escape
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        };

        document.addEventListener("keydown", handleDocumentKeyDown, {
          capture: true,
        });

        return () => {
          document.removeEventListener("keydown", handleDocumentKeyDown, {
            capture: true,
          });
        };
      }, [isEditing]);

      const handleSave = () => {
        console.log("DescriptionCellRenderer handleSave called", {
          entityType,
          tagName,
          editValue,
          entityData,
          propsData: props.data.getData(),
        });

        if (entityType === "tags" && tagName) {
          const currentMetadata = getTagMetadata(tagName);
          console.log("Current tag metadata before save:", currentMetadata);

          setTagMetadata(tagName, {
            color: currentMetadata?.color || getTagColor(tagName),
            description: editValue,
            usageCount: currentMetadata?.usageCount || 0,
            isDescriptionUserSet: true, // Mark as user-set
          });
          console.log("Updated tag description in store:", tagName, editValue);

          // Verify the save worked
          const updatedMetadata = getTagMetadata(tagName);
          console.log("Tag metadata after save:", updatedMetadata);

          // Force refresh the grid to pick up the new description
          if (gridRef.current?.api) {
            const rowNode = gridRef.current.api.getRowNode(props.data.getId());
            if (rowNode) {
              // Refresh the entire row to ensure all cells get updated values
              gridRef.current.api.refreshCells({
                rowNodes: [rowNode],
                force: true,
                suppressFlash: true,
              });
            }
            // Also update the entire grid row data to trigger re-render
            setRowData(container.toArray());
          }
        } else {
          console.log("Save skipped - missing entityType or tagName", {
            entityType,
            tagName,
          });
        }
        setIsEditing(false);
      };

      const handleCancel = () => {
        setEditValue(props.value || "");
        setIsEditing(false);
      };

      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              padding: "4px 8px",
              border: `1px solid ${theme.colors.primary}`,
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            }}
          />
        );
      }

      return (
        <div
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: entityType === "tags" ? "pointer" : "default",
            width: "100%",
            padding: "4px 8px",
            fontSize: "14px",
            color: theme.colors.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={
            entityType === "tags" ? "Double-click to edit description" : ""
          }
        >
          {props.value || ""}
        </div>
      );
    };

    const ColorCellRenderer = (props: { data: Entity; value: string }) => {
      const { setTagColor } = useTagStore();
      // For Node entities, color is in the NodeData, for other entities it might be in userData
      const entityData = props.data.getData();
      const colorValue = props.value || (entityData as any)?.color || "";
      const [showColorPicker, setShowColorPicker] = React.useState(false);
      const [currentColor, setCurrentColor] = React.useState(
        colorValue || "#000000"
      );
      const showColorPickerRef = React.useRef(showColorPicker);
      const colorPickerRef = React.useRef<HTMLInputElement>(null);

      React.useEffect(() => {
        showColorPickerRef.current = showColorPicker;
      }, [showColorPicker]);

      // Add click outside handler for color picker
      React.useEffect(() => {
        if (!showColorPicker) return;

        const handleOutsideClick = (e: MouseEvent) => {
          if (e.type !== "mousedown") return;

          const target = e.target as Node;
          const isColorPickerClick = colorPickerRef.current?.contains(target);

          if (showColorPickerRef.current && !isColorPickerClick) {
            setShowColorPicker(false);
          }
        };

        document.addEventListener("mousedown", handleOutsideClick, {
          capture: true,
        });
        return () =>
          document.removeEventListener("mousedown", handleOutsideClick, {
            capture: true,
          });
      }, [showColorPicker]);

      const handleColorClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent table row selection
        setShowColorPicker(true);
        // Focus the color picker after a brief delay to ensure it's rendered
        setTimeout(() => {
          colorPickerRef.current?.click();
        }, 10);
      };

      const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setCurrentColor(newColor);
        console.log("Color changed to:", newColor);

        // Get the tag name from the entity data
        const entityData = props.data.getData();
        const tagName = entityData.label; // For tags, the label is the tag name

        // Update the tag store if this is a tag entity
        if (entityType === "tags" && tagName) {
          setTagColor(tagName, newColor);
          console.log("Updated tag color in store:", tagName, newColor);
        } else {
          // Update the entity's color using the proper setter method if available
          if (
            props.data &&
            typeof (props.data as ModelNode).setColor === "function"
          ) {
            (props.data as ModelNode).setColor(newColor);
          } else {
            // Fallback: update the data directly
            (entityData as any).color = newColor;
          }
        }

        // Force refresh the entire row to update all cell values
        if (gridRef.current?.api) {
          const rowNode = gridRef.current.api.getRowNode(props.data.getId());
          if (rowNode) {
            // Refresh the entire row to ensure all cells get updated values
            gridRef.current.api.refreshCells({
              rowNodes: [rowNode],
              force: true,
              suppressFlash: true,
            });
          }
        }
        // Update rowData state to trigger AG Grid re-render
        setRowData(container.toArray());

        setShowColorPicker(false);
      };

      const handleColorPickerBlur = () => {
        // Small delay to allow for color picker interaction
        setTimeout(() => {
          setShowColorPicker(false);
        }, 200);
      };

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          <div
            data-color-picker="swatch"
            style={{
              width: "24px",
              height: "24px",
              backgroundColor: currentColor || "#ccc",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: currentColor ? "#fff" : "#666",
              textShadow: "0 0 2px rgba(0,0,0,0.5)",
            }}
            onClick={handleColorClick}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            title="Click to change color"
          >
            {!currentColor && "?"}
          </div>

          {showColorPicker && (
            <input
              ref={colorPickerRef}
              type="color"
              value={currentColor}
              onChange={handleColorChange}
              onBlur={handleColorPickerBlur}
              data-color-picker="input"
              style={{
                width: "32px",
                height: "24px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onMouseEnter={(e) => e.stopPropagation()}
              onMouseLeave={(e) => e.stopPropagation()}
            />
          )}

          <span
            style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {currentColor || "No color"}
          </span>
        </div>
      );
    };

    // Delete cell renderer component
    const DeleteCellRenderer = (props: { data: Entity }) => {
      const handleDelete = async () => {
        if (props.data) {
          const entityData = props.data.getData() as any;
          const entityId = props.data.getId();

          // For web resources, show confirmation dialog
          if (entityType === "web-resources") {
            const title =
              entityData.title ||
              entityData.label ||
              entityData.url ||
              "this webpage";
            const confirmed = window.confirm(
              `Are you sure you want to delete "${title}"? This will permanently remove it from your saved pages.`
            );

            if (!confirmed) {
              return;
            }

            // Store original data for potential revert
            const originalEntity = props.data;
            const originalRowData = container.toArray();

            // Optimistically remove from the table immediately
            if (gridRef.current?.api) {
              gridRef.current.api.applyTransaction({
                remove: [props.data],
              });
            }

            // Delete from the graph immediately
            const nodeId = entityId as NodeId;
            if (nodeId) {
              console.log(`Deleting node: ${nodeId}`);
              sceneGraph.getGraph().deleteNode(nodeId);
              sceneGraph.notifyGraphChanged();
            }

            // Then delete from Supabase in the background
            (async () => {
              try {
                const { deleteWebpage } = await import("../../api/webpagesApi");
                await deleteWebpage(entityId);
                console.log(`Deleted webpage from Supabase: ${entityId}`);
              } catch (error) {
                console.error(
                  `Error deleting webpage from Supabase: ${entityId}`,
                  error
                );

                // Revert the optimistic change if Supabase deletion failed
                if (gridRef.current?.api) {
                  // Add the row back to the grid
                  gridRef.current.api.applyTransaction({
                    add: [originalEntity],
                  });
                }

                // Restore the node in the graph
                if (nodeId) {
                  const entityData = originalEntity.getData();
                  const { id, ...nodeData } = entityData; // Remove id from data to avoid duplication
                  const restoredNode = new ModelNode({
                    id: nodeId,
                    ...nodeData,
                  });
                  sceneGraph.getGraph().addNode(restoredNode);
                  sceneGraph.notifyGraphChanged();
                }

                alert(
                  "Failed to delete webpage from server. The item has been restored."
                );
              }
            })();
          } else {
            // For non-web resources, use the original delete logic
            try {
              const nodeId = entityId as NodeId;
              if (nodeId) {
                console.log(`Deleting node: ${nodeId}`);
                sceneGraph.getGraph().deleteNode(nodeId);

                // Refresh the grid to reflect the deleted node
                if (gridRef.current?.api) {
                  // Remove the deleted row from the grid
                  gridRef.current.api.applyTransaction({
                    remove: [props.data],
                  });

                  // Update rowData state to trigger AG Grid re-render
                  setRowData(container.toArray());
                }
                sceneGraph.notifyGraphChanged();
              }
            } catch (error) {
              console.error(`Error deleting entity: ${entityId}`, error);
            }
          }
        }
      };

      return (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            height: "100%",
          }}
        >
          <button
            onClick={handleDelete}
            style={{
              background: "transparent",
              color: theme.colors.error,
              border: "none",
              borderRadius: "50%",
              padding: "4px",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = `${theme.colors.error}20`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            title="Delete entity"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    };

    // Generate column definitions dynamically
    const columnDefs = useMemo<ColDef<any>[]>(() => {
      // For annotations, use a simplified column set
      if (entityType === "annotations") {
        const COLUMN_ORDER = [
          "label",
          "type",
          "tags",
          "selected_text",
          "image_url",
          "page_url",
          "comment",
          "secondary_comment",
          "id",
        ];
        const EXCLUDED_COLUMNS = [
          "userData",
          "position",
          "isvisible",
          "color",
          "size",
          "opacity",
          "page_url",
          "id",
          "html_content",
          "screenshot_url",
          "parent_resource_id",
          "created_at",
          "last_updated_at",
        ];
        const allColumns = new Set<string>();

        container.forEach((entity) => {
          Object.keys(entity.getData()).forEach((key) => {
            if (!EXCLUDED_COLUMNS.includes(key)) {
              allColumns.add(key);
            }
          });
        });

        const orderedColumns = COLUMN_ORDER.filter((col) =>
          allColumns.has(col)
        );
        const remainingColumns = Array.from(allColumns).filter(
          (col) => !COLUMN_ORDER.includes(col)
        );

        const finalColumns = [...orderedColumns, ...remainingColumns];

        // Create data columns for annotations
        const dataColumns = finalColumns.map((col) => ({
          headerName: col === "label" ? "Annotation" : col,
          field: col,
          flex: col === "label" ? 2 : 1,
          minWidth: col === "label" ? 200 : 120,
          maxWidth: col === "label" ? 500 : 300,
          sortable: true,
          resizable: true,
          filter: "agTextColumnFilter",
          floatingFilter: true,
          cellRenderer:
            col === "label"
              ? LabelCellRenderer
              : col === "type"
                ? TypeCellRenderer
                : col === "tags"
                  ? TagsCellRendererComponent
                  : undefined,
          valueGetter: (params: any) => {
            if (!params.data) return "";
            const value = (params.data.getData() as any)[col];
            if (col === "tags") {
              // console.log(
              //   "Tags valueGetter - col:",
              //   col,
              //   "value:",
              //   value,
              //   "type:",
              //   typeof value,
              //   "isArray:",
              //   Array.isArray(value)
              // );
              if (value instanceof Set) {
                return Array.from(value);
              }
              return value;
            }
            return formatValue(value);
          },
          filterParams: {
            filterOptions: ["contains", "equals", "startsWith", "endsWith"],
            buttons: ["reset"],
            closeOnApply: false,
            suppressAndOrCondition: true,
            debounceMs: 200,
            applyButton: false,
            clearButton: true,
          },
          filterValueGetter: (params: any) => {
            if (!params.data) return "";
            const value = (params.data.getData() as any)[col];
            return value;
          },
          cellStyle: {
            display: "flex",
            alignItems: "center",
            padding: "8px",
            fontSize: "14px",
            lineHeight: "1.4",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }));

        // Create the actions column
        const actionsColumn = {
          headerName: "Actions",
          field: "actions",
          flex: 0.5,
          minWidth: 80,
          maxWidth: 100,
          sortable: false,
          resizable: false,
          filter: false,
          floatingFilter: false,
          cellRenderer: ActionsCellRenderer,
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
          },
        };

        // Create the delete column
        const deleteColumn = {
          headerName: "",
          field: "delete",
          flex: 0.3,
          minWidth: 48,
          maxWidth: 56,
          sortable: false,
          resizable: false,
          filter: false,
          floatingFilter: false,
          cellRenderer: DeleteCellRenderer,
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "4px",
          },
        };

        return [actionsColumn, ...dataColumns, deleteColumn];
      }

      // Default column configuration for other entity types
      let COLUMN_ORDER: string[];
      let EXCLUDED_COLUMNS: string[];

      if (entityType === "web-resources") {
        // Web resources specific configuration
        COLUMN_ORDER = [
          "label",
          "type",
          "tags",
          "url",
          "html_content",
          "screenshot_url",
          "id",
        ];
        EXCLUDED_COLUMNS = [
          "userData",
          "title",
          "metadata",
          "created_at",
          "last_updated_at",
          "id",
        ]; // Exclude title since we have label
        console.log(
          "Web-resources configuration - COLUMN_ORDER:",
          COLUMN_ORDER
        );
        console.log(
          "Web-resources configuration - EXCLUDED_COLUMNS:",
          EXCLUDED_COLUMNS
        );
      } else if (entityType === "documents") {
        // Documents specific configuration
        COLUMN_ORDER = ["label", "type", "extension", "project_id"];
        EXCLUDED_COLUMNS = [
          "userData",
          "metadata",
          "created_at",
          "last_updated_at",
          "parent_id",
          "id",
        ];
        console.log("Documents configuration - COLUMN_ORDER:", COLUMN_ORDER);
        console.log(
          "Documents configuration - EXCLUDED_COLUMNS:",
          EXCLUDED_COLUMNS
        );
      } else if (entityType === "tags") {
        // Tags specific configuration
        COLUMN_ORDER = ["label", "color", "description", "usage_count"];
        EXCLUDED_COLUMNS = ["userData", "id", "type"];
        console.log("Tags configuration - COLUMN_ORDER:", COLUMN_ORDER);
        console.log("Tags configuration - EXCLUDED_COLUMNS:", EXCLUDED_COLUMNS);
      } else {
        // Default configuration for other entity types
        COLUMN_ORDER = [
          "label",
          "type",
          "tags",
          "id",
          "position",
          "isvisible",
          "color",
          "size",
          "opacity",
        ];
        EXCLUDED_COLUMNS = ["userData"];
      }
      const allColumns = new Set<string>();

      container.forEach((entity) => {
        Object.keys(entity.getData()).forEach((key) => {
          if (!EXCLUDED_COLUMNS.includes(key)) {
            allColumns.add(key);
          }
        });
      });

      if (entityType === "web-resources") {
        console.log("Web-resources - allColumns:", Array.from(allColumns));
      }

      const orderedColumns = COLUMN_ORDER.filter((col) => allColumns.has(col));
      const remainingColumns = Array.from(allColumns).filter(
        (col) => !COLUMN_ORDER.includes(col)
      );

      const finalColumns = [...orderedColumns, ...remainingColumns];

      if (entityType === "web-resources") {
        console.log("Web-resources - orderedColumns:", orderedColumns);
        console.log("Web-resources - remainingColumns:", remainingColumns);
        console.log("Web-resources - finalColumns:", finalColumns);
      }

      // Create the actions column
      const actionsColumn = {
        headerName: "Actions",
        field: "actions",
        flex: 0.5,
        minWidth: 80,
        maxWidth: 100,
        sortable: false,
        resizable: false,
        filter: false, // Disable filter entirely for actions column
        floatingFilter: false, // Disable floating filter
        cellRenderer: ActionsCellRenderer,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
        },
      };

      // Create the delete column (rightmost)
      const deleteColumn = {
        headerName: "",
        field: "delete",
        flex: 0.3,
        minWidth: 48,
        maxWidth: 56,
        sortable: false,
        resizable: false,
        filter: false, // Disable filter entirely for delete column
        floatingFilter: false, // Disable floating filter
        cellRenderer: DeleteCellRenderer,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "4px",
        },
      };

      // Create data columns
      const dataColumns = finalColumns.map((col) => ({
        headerName: col,
        field: col, // Add field property to match the column name
        flex: col === "label" ? 2 : col === "type" || col === "tags" ? 1.5 : 1,
        minWidth:
          col === "label" ? 200 : col === "type" || col === "tags" ? 180 : 120,
        maxWidth:
          col === "label" ? 500 : col === "type" || col === "tags" ? 400 : 300,
        sortable: true,
        resizable: true,
        filter: "agTextColumnFilter", // Explicitly set filter type
        floatingFilter: true, // Explicitly enable floating filter
        cellRenderer:
          col === "color"
            ? ColorCellRenderer
            : col === "description"
              ? DescriptionCellRenderer
              : col === "label"
                ? LabelCellRenderer
                : col === "type"
                  ? TypeCellRenderer
                  : col === "tags"
                    ? TagsCellRendererComponent
                    : undefined,
        valueGetter: (params: any) => {
          if (!params.data) return "";

          // For label column, always get the current value from the entity
          if (col === "label") {
            return params.data.getLabel() || "";
          }

          // For description column in tags entity type, read from tag store
          if (col === "description" && entityType === "tags") {
            const entityData = params.data.getData();
            const tagName = entityData.label;
            console.log("ValueGetter for description column:", {
              entityType,
              tagName,
              entityData,
            });

            if (tagName) {
              const tagMetadata = getTagMetadata(tagName);
              console.log("Retrieved tag metadata:", tagMetadata);
              const description = tagMetadata?.description || "";
              console.log("Returning description:", description);
              return description;
            }
            return "";
          }

          const value = (params.data.getData() as any)[col];

          // Debug logging for annotation fields
          if (
            col === "selected_text" ||
            col === "image_url" ||
            col === "page_url"
          ) {
            console.log(`Column ${col}:`, value, "Type:", typeof value);
          }

          if (col === "tags") {
            // console.log(
            //   "Tags valueGetter called - value:",
            //   value,
            //   "type:",
            //   typeof value
            // );
            if (value instanceof Set) {
              return Array.from(value);
            }
            return value;
          }
          return formatValue(value);
        },
        filterParams: {
          filterOptions: ["contains", "equals", "startsWith", "endsWith"],
          buttons: ["reset"], // Remove apply button - filtering happens immediately
          closeOnApply: false, // Don't close automatically
          suppressAndOrCondition: true, // Simplify filter UI
          debounceMs: 200, // Add debounce for smoother typing experience
          applyButton: false, // No apply button needed
          clearButton: true, // Include clear button for convenience
        },
        // Custom filter function for complex search
        filterValueGetter: (params: any) => {
          if (!params.data) return "";
          const value = (params.data.getData() as any)[col];
          return value;
        },
        cellStyle: {
          display: "flex",
          alignItems: "center",
          padding: "8px",
          fontSize: "14px",
          lineHeight: "1.4",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      }));

      // Return actions column + data columns + delete column
      return [actionsColumn, ...dataColumns, deleteColumn];
      // unfortunately there is an issue with the cell renderer dependencies
      // and forcegraph3d causing them to rerender on every mouse move
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container, formatValue, searchInValue, getTagMetadata, entityType]);

    // Default column definition
    const defaultColDef = useMemo(
      () => ({
        sortable: true,
        resizable: true,
        minWidth: 120,
        maxWidth: 300,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        suppressMenu: false, // Make sure filter menu is available
        filterParams: {
          // Default filter parameters for all columns
          buttons: ["reset"],
          closeOnApply: false,
          debounceMs: 200,
          applyButton: false,
          clearButton: true,
          filterOptions: ["contains"],
        },
      }),
      []
    );

    // Convert entities to array for AG Grid
    const [rowData, setRowData] = useState(container.toArray());

    // Update rowData when container changes
    useEffect(() => {
      setRowData(container.toArray());
    }, [container]);

    // Memoize the row style function to prevent unnecessary re-renders
    const getRowStyle = useCallback(
      () => ({
        display: "flex",
        alignItems: "center",
        cursor: onEntityClick ? "pointer" : "default",
      }),
      [onEntityClick]
    );

    // Handle row click - disabled to prevent window closing
    const onRowClicked = useCallback((event: any) => {
      // Disabled row click to prevent entity selection and window closing
      // Check if the click target is part of a color picker
      const target = event.event?.target;
      if (target) {
        // Check if the click is on a color picker element
        const isColorPickerClick =
          target.closest('input[type="color"]') ||
          target.closest("[data-color-picker]") ||
          target.type === "color";

        if (isColorPickerClick) {
          return; // Don't trigger row click for color picker interactions
        }
      }

      // Don't call onEntityClick to prevent window closing
      // if (onEntityClick && event.data) {
      //   onEntityClick(event.data);
      // }
    }, []);

    // Handle row double click
    const onRowDoubleClicked = useCallback(
      (event: any) => {
        if (event.data) {
          const entityData = event.data.getData
            ? event.data.getData()
            : event.data;

          // For web resources, double-click should open the saved page
          if (entityType === "web-resources" && entityData) {
            const resourceId = entityData.id;
            const url = entityData.url;
            const title =
              entityData.label || entityData.title || entityData.url;

            if (resourceId) {
              const timestamp = Date.now();
              const tabId = `html-page-viewer-${resourceId}-${timestamp}`;
              const tabTitle = title || `Page Viewer - ${resourceId}`;

              addViewAsTab({
                viewId: "html-page-viewer",
                pane: "center",
                tabId: tabId,
                title: tabTitle,
                props: {
                  resourceId: resourceId,
                  title: title,
                  url: url,
                  tabId: tabId,
                },
                activate: true,
              });
            }
          }
          // For PDF documents, double-click should open in PDF viewer
          else if (
            entityType === "documents" &&
            entityData &&
            entityData.extension === "pdf"
          ) {
            const documentId = entityData.id;

            if (documentId) {
              // Load the document title from Supabase first
              (async () => {
                try {
                  const { getDocument } = await import(
                    "../../api/documentsApi"
                  );
                  const document = await getDocument(documentId);
                  const actualTitle = document.title || "PDF Document";

                  const timestamp = Date.now();
                  const tabId = `pdf-viewer-${documentId}-${timestamp}`;

                  addViewAsTab({
                    viewId: "pdf-viewer",
                    pane: "center",
                    tabId: tabId,
                    title: actualTitle,
                    props: {
                      documentId: documentId,
                      title: actualTitle,
                    },
                    activate: true,
                  });
                } catch (error) {
                  console.error("Error loading document title:", error);
                  // Fallback to the entity data title
                  const fallbackTitle = entityData.title || "PDF Document";
                  const timestamp = Date.now();
                  const tabId = `pdf-viewer-${documentId}-${timestamp}`;

                  addViewAsTab({
                    viewId: "pdf-viewer",
                    pane: "center",
                    tabId: tabId,
                    title: fallbackTitle,
                    props: {
                      documentId: documentId,
                      title: fallbackTitle,
                    },
                    activate: true,
                  });
                }
              })();
            }
          }
          // For Markdown documents, double-click should open in Markdown viewer
          else if (
            entityType === "documents" &&
            entityData &&
            (entityData.extension === "md" ||
              entityData.extension === "markdown")
          ) {
            const documentId = entityData.id;

            if (documentId) {
              (async () => {
                try {
                  const { getDocument } = await import(
                    "../../api/documentsApi"
                  );
                  const document = await getDocument(documentId);
                  const actualTitle = document.title || "Markdown";
                  const markdownContent = document.content || "";

                  const timestamp = Date.now();
                  const tabId = `markdown-viewer-${documentId}-${timestamp}`;

                  addViewAsTab({
                    viewId: "markdown-viewer",
                    pane: "center",
                    tabId: tabId,
                    title: `${actualTitle}.md`,
                    props: {
                      filename: `${actualTitle}.md`,
                      overrideMarkdown: markdownContent,
                      showRawToggle: true,
                      tabId: tabId,
                    },
                    activate: true,
                  });
                } catch (error) {
                  console.error("Error loading markdown document:", error);
                }
              })();
            }
          } else if (onEntityClick) {
            // For other entity types, use the default click handler
            onEntityClick(event.data);
          }
        }
      },
      [entityType, onEntityClick]
    );

    // Handle context menu
    const onCellContextMenu = useCallback(
      (event: any) => {
        // Prevent default browser context menu
        event.event.preventDefault();
        event.event.stopPropagation();

        if (event.data) {
          handleContextMenu(event.event, event.data);
        }
      },
      [handleContextMenu]
    );

    // Handle global search
    // eslint-disable-next-line unused-imports/no-unused-vars
    const onFilterChanged = useCallback((event: any) => {}, []);

    // Handle column resizing to prevent stuck resize mode
    const onColumnResized = useCallback((_e: any) => {
      // Only refresh if there are ongoing operations
      setTimeout(() => {
        if (gridRef.current?.api) {
          gridRef.current.api.refreshCells();
        }
      }, 0);
    }, []);

    // Prevent unnecessary grid refreshes by memoizing the grid configuration
    const gridConfig = useMemo(
      () => ({
        domLayout: "normal" as const,
        rowSelection: "single" as const,
        animateRows: true,
        suppressCellFocus: true,
        enableRangeSelection: true,
        suppressContextMenu: false,
        allowContextMenuWithControlKey: false,
        suppressMenuHide: false,
        pagination: true,
        suppressRowClickSelection: true,
        suppressRowDeselection: true,
        suppressHorizontalScroll: false,
        suppressColumnVirtualisation: false,
      }),
      []
    );

    // Handle row hover for web resources and nodes using onModelUpdated
    const onModelUpdated = useCallback(
      (event: any) => {
        // Add hover listeners to all rows
        setTimeout(() => {
          const rows = document.querySelectorAll(".ag-row");
          rows.forEach((row) => {
            const rowId = row.getAttribute("row-id");
            if (rowId) {
              const rowData = event.api.getDisplayedRowAtIndex(parseInt(rowId));
              if (rowData && rowData.data) {
                const entityData = rowData.data.getData
                  ? rowData.data.getData()
                  : rowData.data;

                // Remove existing listeners
                const existingHoverHandler = (row as any)._hoverHandler;
                const existingLeaveHandler = (row as any)._leaveHandler;
                if (existingHoverHandler) {
                  row.removeEventListener("mouseenter", existingHoverHandler);
                }
                if (existingLeaveHandler) {
                  row.removeEventListener("mouseleave", existingLeaveHandler);
                }

                // Add new listeners
                (row as any)._hoverHandler = (e: MouseEvent) => {
                  if (entityData && entityData.id) {
                    // Handle node hover - update graph interaction store
                    // console.log("Node hover - entityData:", entityData);
                    // console.log("Setting hovered node ID:", entityData.id);
                    setHoveredNodeId(entityData.id as NodeId);
                  }
                };

                (row as any)._leaveHandler = () => {
                  setHoveredNodeId(null);
                };

                row.addEventListener("mouseenter", (row as any)._hoverHandler);
                row.addEventListener("mouseleave", (row as any)._leaveHandler);
              }
            }
          });
        }, 100);
      },
      [entityType]
    );

    // Make the grid more stable against unnecessary rerenders
    const memoizedAgGrid = useMemo(
      () => (
        <AgGridReact
          ref={gridRef}
          {...gridConfig}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          suppressMenuHide={false} // Make sure menus are visible
          getRowStyle={getRowStyle}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          onCellContextMenu={onCellContextMenu}
          onFilterChanged={onFilterChanged}
          onModelUpdated={onModelUpdated}
          onColumnResized={onColumnResized}
          onGridReady={(params) => {
            console.log("AG Grid ready with params:", params);
            console.log("Grid API:", params.api);
            console.log("Row data at grid ready:", rowData);
            console.log("Column definitions at grid ready:", columnDefs);
          }}
          overlayNoRowsTemplate={`<span style="color:${theme.colors.textMuted};">No entities found</span>`}
          overlayLoadingTemplate={`<span style="color:${theme.colors.primary};">Loading entities...</span>`}
        />
      ),
      [
        rowData,
        columnDefs,
        defaultColDef,
        getRowStyle,
        onRowClicked,
        onRowDoubleClicked,
        onCellContextMenu,
        onFilterChanged,
        onModelUpdated,
        onColumnResized,
        gridConfig,
        theme.colors.textMuted,
        theme.colors.primary,
      ]
    );

    return (
      <div
        className={styles.container}
        style={{
          height: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px`,
          width: "100%",
        }}
      >
        {toolbar && (
          <div
            className={styles.toolbar}
            style={{
              backgroundColor: theme.colors.surface,
              borderBottom: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
            }}
          >
            {toolbar}
          </div>
        )}
        <div
          className={`${styles.agGridContainer} ${styles.customScrollbar} ag-theme-alpine`}
          style={createThemedAgGridContainer(theme)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {memoizedAgGrid}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className={styles.contextMenu}
            style={{
              top: contextMenu.mouseY,
              left: contextMenu.mouseX,
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.sizes.borderRadius.sm,
              boxShadow: theme.sizes.shadow.md,
              color: theme.colors.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenuItems.map((item, index) => (
              <div
                key={index}
                className={styles.contextMenuItem}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  }
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}

        {/* Click outside to close context menu */}
        {contextMenu && (
          <div className={styles.contextMenuOverlay} onClick={handleClose} />
        )}

        {/* Entity JSON Viewer */}
        {jsonViewerEntity && (
          <EntityJsonViewer
            entity={jsonViewerEntity}
            onClose={() => setJsonViewerEntity(null)}
          />
        )}

        {/* HTML Page Viewer Modal */}
        {htmlPageViewerData && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "90vw",
                height: "90vh",
                backgroundColor: "white",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <HtmlPageViewer
                resourceId={htmlPageViewerData.resourceId}
                title={htmlPageViewerData.title}
                onClose={() => setHtmlPageViewerData(null)}
              />
            </div>
          </div>
        )}

        {/* Web Resource Preview Card */}
        {hoveredWebResource && (
          <WebResourcePreviewCard
            webpage={hoveredWebResource.webpage}
            isVisible={true}
            position={hoveredWebResource.position}
            onClose={() => setHoveredWebResource(null)}
          />
        )}
      </div>
    );
  }
);

EntityTableV2.displayName = "EntityTableV2";

export default EntityTableV2;
