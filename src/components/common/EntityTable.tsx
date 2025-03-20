import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ContextMenuItem } from "./ContextMenu";
import styles from "./EntityTable.module.css";

interface EntityTableProps {
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
  onEntityClick?: (entity: Entity) => void;
  maxHeight?: string;
}

const EntityTable: React.FC<EntityTableProps> = ({
  container,
  onEntityClick,
  maxHeight = 600,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    entity: Entity | null;
  } | null>(null);

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

  const handleContextMenu = (event: React.MouseEvent, entity: Entity) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            entity,
          }
        : null
    );
  };

  const columns = useMemo<MRT_ColumnDef<Entity>[]>(() => {
    const COLUMN_ORDER = ["id", "type", "tags", "userData"];
    const allColumns = new Set<string>();

    container.forEach((entity) => {
      Object.keys(entity.getData()).forEach((key) => allColumns.add(key));
    });

    const orderedColumns = COLUMN_ORDER.filter((col) => allColumns.has(col));
    const remainingColumns = Array.from(allColumns).filter(
      (col) => !COLUMN_ORDER.includes(col)
    );

    return [...orderedColumns, ...remainingColumns].map((col) => ({
      accessorKey: `data.${col}`,
      header: col,
      size: 200, // Set default column width
      Cell: ({ row }) => {
        const value = (row.original.getData() as any)[col];
        return formatValue(value);
      },
      filterFn: (row, _columnId, filterValue) => {
        const value = (row.original.getData() as any)[col];
        return searchInValue(value, filterValue);
      },
    }));
  }, [container, searchInValue, formatValue]);

  const { setEditingEntity, setJsonEditEntity } = useAppContext();

  const _contextMenuItems: ContextMenuItem[] = [
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
      label: "Action 1",
      action: () => {
        console.log("Action 1 clicked");
        handleClose();
      },
    },
    {
      label: "Action 2",
      action: () => {
        console.log("Action 2 clicked");
        handleClose();
      },
    },
  ];

  const handleClose = () => {
    setContextMenu(null);
  };

  const table = useMaterialReactTable({
    columns,
    data: container.toArray(),
    enableColumnVirtualization: true,
    enableRowVirtualization: true,
    enablePagination: false,
    enableBottomToolbar: true,
    enableTopToolbar: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px`,
      },
    },
    muiTablePaperProps: {
      sx: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
      },
    },
    initialState: {
      density: "compact",
    },
    enableStickyHeader: true,
    rowVirtualizerOptions: { overscan: 10 },
    columnVirtualizerOptions: { overscan: 2 },
    defaultDisplayColumn: { enableResizing: true },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => onEntityClick?.(row.original),
      onContextMenu: (e) => handleContextMenu(e, row.original),
      sx: {
        cursor: onEntityClick ? "pointer" : "default",
      },
    }),
  });

  return (
    <div
      className={styles.container}
      onClick={(e) => e.stopPropagation()}
      style={{
        height: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px`,
      }}
    >
      <MaterialReactTable table={table} />
    </div>
  );
};

export default EntityTable;
