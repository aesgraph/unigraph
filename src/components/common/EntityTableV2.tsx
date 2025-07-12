import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeBalham,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { useAppContext } from "../../context/AppContext";
import { RenderingManager } from "../../controllers/RenderingManager";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { Node as ModelNode } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ContextMenuItem } from "./ContextMenu";
import EntityJsonViewer from "./EntityJsonViewer";
import styles from "./EntityTableV2.module.css";
import EntityTagsSelectorDropdown from "./EntityTagsSelectorDropdown";
import EntityTypeSelectDropdown from "./EntityTypeSelectDropdown";

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

  // Actions cell renderer component
  const ActionsCellRenderer = useCallback(
    (props: { data: Entity }) => {
      const handleGoTo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEntityClick && props.data) {
          onEntityClick(props.data);
        }
      };

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            height: "100%",
          }}
        >
          <button
            onClick={handleGoTo}
            style={{
              background: "#007acc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#005a9e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#007acc";
            }}
            title="Go to entity"
          >
            Go to
          </button>
        </div>
      );
    },
    [onEntityClick]
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

        // Trigger a refresh of the grid
        if (gridRef.current?.api) {
          gridRef.current.api.refreshCells();
        }
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
          const eventTarget = event.target as Node;
          const dropdownNode = dropdownRef.current as HTMLDivElement | null;
          const cellNode = cellRef.current as HTMLDivElement | null;
          if (
            isEditing &&
            dropdownNode &&
            !dropdownNode.contains(eventTarget) &&
            cellNode &&
            !cellNode.contains(eventTarget)
          ) {
            setIsEditing(false);
          }
        };

        if (isEditing) {
          document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
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

          // Trigger a refresh of the grid
          if (gridRef.current?.api) {
            gridRef.current.api.refreshCells();
          }
        }
        setIsEditing(false);
      };

      //   const handleCancel = () => {
      //     setEditValue(props.value || "");
      //     setIsEditing(false);
      //   };

      //   const handleKeyDown = (e: React.KeyboardEvent) => {
      //     if (e.key === "Escape") {
      //       handleCancel();
      //     }
      //   };

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
    [TypeCellRendererComponent]
  );

  // Tags cell renderer component with portal-based dropdown
  const TagsCellRendererComponent = React.memo(
    (props: { data: Entity; value: string[] }) => {
      const [isEditing, setIsEditing] = useState(false);
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
          if (
            isEditing &&
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            cellRef.current &&
            !cellRef.current.contains(event.target as Node)
          ) {
            setIsEditing(false);
          }
        };
        if (isEditing) {
          document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
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
          if (gridRef.current?.api) {
            gridRef.current.api.refreshCells();
          }
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
    const colorPickerRef = React.useRef<HTMLInputElement>(null);

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
      cellRenderer: ActionsCellRenderer,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
      },
    };

    // Create data columns
    const dataColumns = finalColumns.map((col) => ({
      headerName: col,
      flex: col === "label" ? 2 : col === "type" || col === "tags" ? 1.5 : 1, // Expand label, type, and tags columns
      minWidth:
        col === "label" ? 200 : col === "type" || col === "tags" ? 180 : 120,
      maxWidth:
        col === "label" ? 500 : col === "type" || col === "tags" ? 400 : 300,
      sortable: true,
      resizable: true,
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
        buttons: ["apply", "reset"],
        closeOnApply: true,
      },
      // Custom filter function for complex search
      filterValueGetter: (params: any) => {
        if (!params.data) return "";
        const value = (params.data.getData() as any)[col];
        return value;
      },
      // Custom filter function
      filter: (params: any) => {
        if (!params.data) return false;
        const value = (params.data.getData() as any)[col];
        const filterValue = params.filterValue;
        if (!filterValue) return true;
        return searchInValue(value, filterValue);
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

    // Return actions column + data columns
    return [actionsColumn, ...dataColumns];
  }, [
    container,
    ActionsCellRenderer,
    TypeCellRenderer,
    TagsCellRendererComponent,
    formatValue,
    searchInValue,
  ]);

  // Default column definition
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      minWidth: 120,
      maxWidth: 300,
      filter: true,
      filterParams: {
        filterOptions: ["contains", "equals", "startsWith", "endsWith"],
        buttons: ["apply", "reset"],
        closeOnApply: true,
      },
    }),
    []
  );

  // Convert entities to array for AG Grid
  const rowData = useMemo(() => {
    const data = container.toArray();
    return data;
  }, [container]);

  // Grid API reference
  const gridRef = useRef<AgGridReact<Entity>>(null);

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

  return (
    <div
      className={styles.container}
      style={{
        height: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px`,
        width: "100%",
      }}
    >
      <div
        className={`${styles.agGridContainer} ${styles.customScrollbar}`}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <AgGridReact
          ref={gridRef}
          theme={themeBalham}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="normal"
          rowSelection="single"
          animateRows={true}
          suppressCellFocus={true}
          enableRangeSelection={true}
          suppressContextMenu={false}
          allowContextMenuWithControlKey={false}
          suppressMenuHide={false}
          pagination={true}
          suppressRowClickSelection={true}
          suppressRowDeselection={true}
          suppressHorizontalScroll={false}
          suppressColumnVirtualisation={false}
          getRowStyle={() => ({
            display: "flex",
            alignItems: "center",
            cursor: onEntityClick ? "pointer" : "default",
          })}
          onRowClicked={onRowClicked}
          // onRowDoubleClicked={onRowDoubleClicked}
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
          overlayNoRowsTemplate={`<span style="color:#888;">No entities found</span>`}
          overlayLoadingTemplate={`<span style="color:#1976d2;">Loading entities...</span>`}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
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
