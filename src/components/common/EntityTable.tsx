import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { SceneGraph } from "../../core/model/SceneGraph";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import styles from "./EntityTable.module.css";

interface EntityTableProps {
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
  onEntityClick?: (entity: Entity) => void;
  renderActions?: (entity: Entity) => React.ReactNode;
  isDarkMode?: boolean;
  maxHeight?: string;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

const EntityTable: React.FC<EntityTableProps> = ({
  container,
  sceneGraph,
  onEntityClick,
  renderActions,
  isDarkMode = false,
  maxHeight = 400,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "id",
    direction: "asc",
  });
  const [filterText, setFilterText] = useState("");
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    entity: Entity | null;
  } | null>(null);
  // const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  // const [jsonEditEntity, setJsonEditEntity] = useState<Entity | null>(null);

  const THEME = {
    light: {
      background: "#ffffff",
      tableBackground: "rgba(255, 255, 255, 0.8)",
      headerBackground: "rgba(255, 255, 255, 0.95)",
      rowBackground: "rgba(255, 255, 255, 0.6)",
      rowHover: "rgba(0, 122, 255, 0.1)",
      text: "#000000",
      mutedText: "#666666",
      border: "rgba(0, 0, 0, 0.1)",
      input: {
        background: "rgba(0, 0, 0, 0.05)",
        focusBackground: "rgba(0, 0, 0, 0.08)",
        text: "#000000",
        placeholder: "#666666",
      },
      tag: {
        background: "rgba(0, 122, 255, 0.1)",
        text: "#0066cc",
      },
      code: {
        background: "rgba(0, 0, 0, 0.05)",
        text: "#333333",
      },
    },
    dark: {
      background: "#1a1a1a",
      tableBackground: "rgba(0, 0, 0, 0.3)",
      headerBackground: "rgba(30, 30, 30, 0.95)",
      rowBackground: "rgba(255, 255, 255, 0.03)",
      rowHover: "rgba(255, 255, 255, 0.05)",
      text: "#ffffff",
      mutedText: "#999999",
      border: "rgba(255, 255, 255, 0.1)",
      input: {
        background: "rgba(255, 255, 255, 0.05)",
        focusBackground: "rgba(255, 255, 255, 0.08)",
        text: "#ffffff",
        placeholder: "#999999",
      },
      tag: {
        background: "rgba(64, 156, 255, 0.2)",
        text: "#409cff",
      },
      code: {
        background: "rgba(255, 255, 255, 0.05)",
        text: "#e2e8f0",
      },
    },
  };

  const theme = isDarkMode ? THEME.dark : THEME.light;

  // Define fixed column order
  const COLUMN_ORDER = ["id", "type", "tags", "userData"];

  // Get columns maintaining the fixed order
  const columns = useMemo(() => {
    const allColumns = new Set<string>();
    container.forEach((entity) => {
      Object.keys(entity.getData()).forEach((key) => allColumns.add(key));
    });

    // First add ordered columns
    const orderedColumns = COLUMN_ORDER.filter((col) => allColumns.has(col));

    // Then add any remaining columns
    const remainingColumns = Array.from(allColumns).filter(
      (col) => !COLUMN_ORDER.includes(col)
    );

    return [...orderedColumns, ...remainingColumns];
  }, [container]);

  const searchInValue = (value: any, searchText: string): boolean => {
    const searchLower = searchText.toLowerCase();

    if (value === null || value === undefined) {
      return false;
    }

    // Handle Sets
    if (value instanceof Set) {
      return Array.from(value).some((item) => searchInValue(item, searchText));
    }

    // Handle Arrays
    if (Array.isArray(value)) {
      return value.some((item) => searchInValue(item, searchText));
    }

    // Handle Objects (including userData)
    if (typeof value === "object") {
      return Object.values(value).some((val) => searchInValue(val, searchText));
    }

    // Handle primitive values
    return String(value).toLowerCase().includes(searchLower);
  };

  // Sort and filter entities
  const sortedAndFilteredEntities = useMemo(() => {
    let entities = container.toArray();

    // Filter with deep search
    if (filterText) {
      entities = entities.filter((entity) =>
        Object.entries(entity.getData()).some(([key, value]) =>
          searchInValue(value, filterText)
        )
      );
    }

    // Filter by column filters
    Object.entries(columnFilters).forEach(([column, filter]) => {
      if (filter) {
        entities = entities.filter((entity) =>
          searchInValue(entity.getData()[column], filter)
        );
      }
    });

    // Sort
    return [...entities].sort((a, b) => {
      const aValue = a.getData()[sortConfig.key];
      const bValue = b.getData()[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [container, sortConfig, filterText, columnFilters]);

  const handleSort = (column: string) => {
    setSortConfig((current) => ({
      key: column,
      direction:
        current.key === column && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleColumnFilterChange = (column: string, value: string) => {
    setColumnFilters((prevFilters) => ({
      ...prevFilters,
      [column]: value,
    }));
  };

  const formatValue = (value: any): string => {
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
        return "[Complex Object]";
      }
    }

    return String(value);
  };

  const highlightSearchMatch = (text: string, searchText: string) => {
    if (!searchText) return text;

    const parts = text.split(new RegExp(`(${searchText})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === searchText.toLowerCase() ? (
            <span
              key={i}
              className={`${styles.highlight} ${
                isDarkMode ? styles.darkHighlight : ""
              }`}
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const renderCellContent = (value: any, searchText: string) => {
    if (value instanceof Set || Array.isArray(value)) {
      const items = value instanceof Set ? Array.from(value) : value;
      return (
        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "wrap",
            maxHeight: "32px",
            overflow: "hidden",
          }}
        >
          {items.map((item, index) => (
            <span
              key={index}
              className={styles.tag}
              style={{
                backgroundColor: theme.tag.background,
                color: theme.tag.text,
                borderColor: theme.border,
                maxHeight: "24px",
                lineHeight: "20px",
                overflow: "hidden",
              }}
            >
              {highlightSearchMatch(formatValue(item), searchText)}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      if (Object.keys(value).length === 0) {
        return <span style={{ color: theme.mutedText }}>{"{ }"}</span>;
      }

      return (
        <pre
          className={styles.codeBlock}
          style={{
            margin: 0,
            whiteSpace: "nowrap",
            fontSize: "0.8em",
            maxHeight: "32px",
            overflowY: "hidden",
            backgroundColor: theme.code.background,
            color: theme.code.text,
            padding: "4px",
            borderRadius: "4px",
            maxWidth: "300px",
            border: `1px solid ${theme.border}`,
            lineHeight: "24px",
          }}
        >
          {highlightSearchMatch(formatValue(value), searchText)}
        </pre>
      );
    }

    return (
      <div
        style={{ maxHeight: "32px", overflow: "hidden", lineHeight: "32px" }}
      >
        {highlightSearchMatch(formatValue(value), searchText)}
      </div>
    );
  };

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

  const handleClose = () => {
    setContextMenu(null);
  };

  const { setEditingEntity, setJsonEditEntity } = useAppContext();

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

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          flexShrink: 0, // Add this to prevent search box from shrinking
        }}
      >
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter entries..."
          className={styles.searchInput}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "8px",
            marginBottom: "10px",
            width: "100%",
            border: `1px solid ${theme.border}`,
            borderRadius: "4px",
            backgroundColor: theme.background,
            color: theme.text,
            position: "relative",
            zIndex: 1,
          }}
        />
      </Box>
      <div
        style={{
          marginBottom: "10px",
          color: theme.text,
          flexShrink: 0, // Add this to prevent counter from shrinking
        }}
      >
        Showing {sortedAndFilteredEntities.length} of {container.size()}{" "}
        entities
      </div>
      <TableContainer
        component={Paper}
        sx={{
          height: "400px",
          backgroundColor: theme.tableBackground,
          border: `1px solid ${theme.border}`,
          "& .MuiTable-root": {
            tableLayout: "fixed",
          },
          "& .MuiTableRow-root": {
            height: "48px",
          },
          "& .MuiTableCell-root": {
            height: "48px",
            padding: "8px 16px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
        }}
      >
        <Table stickyHeader className={styles.table}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  sx={{
                    padding: "8px 16px !important",
                    backgroundColor: theme.headerBackground,
                    "& > div": {
                      // display: 'flex',
                      // flexDirection: 'column',
                      gap: 1,
                    },
                  }}
                >
                  <div>
                    <TableSortLabel
                      active={sortConfig.key === column}
                      direction={
                        sortConfig.key === column ? sortConfig.direction : "asc"
                      }
                      onClick={() => handleSort(column)}
                      style={{
                        color: theme.text,
                        whiteSpace: "nowrap",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        fontSize: "1rem",
                      }}
                    >
                      {column}
                    </TableSortLabel>
                  </div>
                  <div style={{ width: "100%" }}>
                    <input
                      type="text"
                      value={columnFilters[column] || ""}
                      onChange={(e) =>
                        handleColumnFilterChange(column, e.target.value)
                      }
                      placeholder={`Filter ${column}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "95%",
                        padding: "4px 8px",
                        fontSize: "1rem",
                        border: `1px solid ${theme.border}`,
                        borderRadius: "4px",
                        backgroundColor: theme.input.background,
                        color: theme.input.text,
                      }}
                    />
                  </div>
                </TableCell>
              ))}
              {renderActions && (
                <TableCell
                  sx={{
                    width: 100,
                    padding: "8px 16px !important",
                    backgroundColor: theme.headerBackground,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndFilteredEntities.length === 0 ? (
              <TableRow sx={{ height: "48px" }}>
                <TableCell
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  align="center"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredEntities.map((entity) => (
                <TableRow
                  key={entity.getId()}
                  hover
                  sx={{
                    cursor: onEntityClick ? "pointer" : "default",
                    backgroundColor: theme.rowBackground,
                    "&:hover": {
                      backgroundColor: theme.rowHover,
                    },
                    height: "48px",
                    "& > td": {
                      height: "48px",
                      padding: "8px 16px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "1rem",
                    },
                  }}
                  onClick={() => onEntityClick?.(entity)}
                  onContextMenu={(event) => handleContextMenu(event, entity)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      className={styles.tableCell}
                      style={{
                        color: theme.text,
                        borderBottom: `1px solid ${theme.border}`,
                      }}
                    >
                      {renderCellContent(
                        entity.getData()[column],
                        columnFilters[column] || filterText
                      )}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell className={styles.tableCell}>
                      {renderActions(entity)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.mouseX}
          y={contextMenu.mouseY}
          items={contextMenuItems}
          onClose={handleClose}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default EntityTable;
