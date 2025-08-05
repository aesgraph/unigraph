import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { ArrowUpLeft, Trash2 } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { useTheme } from "@aesgraph/app-shell";
import { useAppContext } from "../../context/AppContext";
import { RenderingManager } from "../../controllers/RenderingManager";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { Node as ModelNode, NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ContextMenuItem } from "./ContextMenu";
import EntityJsonViewer from "./EntityJsonViewer";
import styles from "./EntityTableV2.module.css";
import EntityTagsSelectorDropdown from "./EntityTagsSelectorDropdown";
import EntityTypeSelectDropdown from "./EntityTypeSelectDropdown";
import { createThemedAgGridContainer } from "../../utils/aggridThemeUtils";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface EntityTableV2Props {
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
  onEntityClick?: (entity: Entity) => void;
  maxHeight?: string | number;
}

const EntityTableV2: React.FC<EntityTableV2Props> = ({
  container,
  sceneGraph,
  onEntityClick,
  maxHeight = 600,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    entity: Entity | null;
  } | null>(null);

  const [jsonViewerEntity, setJsonViewerEntity] = useState<Entity | null>(null);

  const { setEditingEntity, setJsonEditEntity } = useAppContext();

  // Get theme from app-shell
  const { theme } = useTheme();

  // Grid API reference - moved up so cell renderers can access it
  const gridRef = useRef<AgGridReact<Entity>>(null);

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
          setEditingEntity(contextMenu.entity);
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
      label: "View as JSON",
      action: () => {
        if (contextMenu?.entity) {
          setJsonViewerEntity(contextMenu.entity);
        }
        handleClose();
      },
    },
  ];

  // Actions cell renderer component with improved stability
  const ActionsCellRendererComponent = React.memo((props: { data: Entity }) => {
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
      if (onEntityClick && props.data) {
        onEntityClick(props.data);
      }
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
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Go to Entity
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
              background: theme.colors.surface,
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
              (e.currentTarget.style.background = theme.colors.surface)
            }
            title="Go to entity"
          >
            <ArrowUpLeft size={16} />
          </button>

          <div ref={moreOptionsRef} style={{ position: "relative" }}>
            <button
              onClick={handleMoreOptionsClick}
              style={{
                background: theme.colors.surface,
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
                (e.currentTarget.style.background = theme.colors.surfaceHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = theme.colors.surface)
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
  });

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

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditValue(props.value || "");
      // Focus the input after a brief delay to ensure it's rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    };

    const handleSave = () => {
      if (props.data && editValue !== props.value) {
        // Update the entity's label using the proper setter method
        props.data.setLabel(editValue);

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
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(props.value || "");
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    };

    const handleBlur = () => {
      handleSave();
    };

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
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
        />
      );
    }

    return (
      <div
        onDoubleClick={handleDoubleClick}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "8px",
          cursor: "text",
          userSelect: "text",
        }}
        title="Double-click to edit"
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
      const [isEditing, setIsEditing] = useState(false);
      // Use ref to track state across renders
      const isEditingRef = useRef(isEditing);
      useEffect(() => {
        isEditingRef.current = isEditing;
      }, [isEditing]);

      const [editValue, setEditValue] = useState(
        Array.isArray(props.value)
          ? props.value.map((tag) => ({ value: tag, label: tag, color: "" }))
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
            ? props.value.map((tag) => ({ value: tag, label: tag, color: "" }))
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
                      background: RenderingManager.getColorByKeySimple(
                        tag,
                        sceneGraph.getDisplayConfig().nodeConfig.tags
                      ),
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
  const ColorCellRenderer = (props: { data: Entity; value: string }) => {
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

      // Update the entity's color using the proper setter method if available
      if (
        props.data &&
        typeof (props.data as ModelNode).setColor === "function"
      ) {
        (props.data as ModelNode).setColor(newColor);
      } else {
        // Fallback: update the data directly
        const entityData = props.data.getData();
        (entityData as any).color = newColor;
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

        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
          {currentColor || "No color"}
        </span>
      </div>
    );
  };

  // Delete cell renderer component
  const DeleteCellRenderer = (props: { data: Entity }) => {
    const handleDelete = () => {
      if (props.data) {
        // Use the sceneGraph.getGraph().deleteNode() method
        try {
          const nodeId = props.data.getId() as NodeId;
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
          console.error(`Error deleting entity: ${props.data.getId()}`, error);
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
            background: theme.colors.surface,
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
            (e.currentTarget.style.background = theme.colors.surface)
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
    const COLUMN_ORDER = [
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
    const EXCLUDED_COLUMNS = ["userData"]; // Exclude userData from columns
    const allColumns = new Set<string>();

    container.forEach((entity) => {
      Object.keys(entity.getData()).forEach((key) => {
        if (!EXCLUDED_COLUMNS.includes(key)) {
          allColumns.add(key);
        }
      });
    });

    const orderedColumns = COLUMN_ORDER.filter((col) => allColumns.has(col));
    const remainingColumns = Array.from(allColumns).filter(
      (col) => !COLUMN_ORDER.includes(col)
    );

    const finalColumns = [...orderedColumns, ...remainingColumns];

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
          : col === "label"
            ? LabelCellRenderer
            : col === "type"
              ? TypeCellRenderer
              : col === "tags"
                ? TagsCellRendererComponent
                : undefined,
      valueGetter: (params: any) => {
        if (!params.data) return "";
        const value = (params.data.getData() as any)[col];
        if (col === "tags" && value instanceof Set) {
          return Array.from(value);
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
  }, [container, formatValue, searchInValue]);

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
  // const onRowDoubleClicked = useCallback(
  //   (event: any) => {
  //     if (onEntityClick && event.data) {
  //       onEntityClick(event.data);
  //     }
  //   },
  //   [onEntityClick]
  // );

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

  // Handle model updated
  // eslint-disable-next-line unused-imports/no-unused-vars
  const onModelUpdated = useCallback((event: any) => {}, []);

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
    </div>
  );
};

export default EntityTableV2;
