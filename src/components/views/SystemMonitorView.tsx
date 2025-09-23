import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Info,
  List,
  LogOut,
  RefreshCw,
  Search,
  Settings,
  Table,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { LogEntry, logger, LogLevel } from "../../utils/logger";
import "./SystemMonitorView.css";

interface Notification {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface LongRunningTask {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress?: number;
  startTime: Date;
  endTime?: Date;
  message?: string;
  metadata?: Record<string, any>;
}

type ItemType = "log" | "notification" | "task";
type NotificationType = Notification["type"];
type TaskStatus = LongRunningTask["status"];
type ViewMode = "list" | "table";
type SortField = "type" | "timestamp" | "source" | "message" | "progress";
type SortDirection = "asc" | "desc";

interface SystemItem {
  id: string;
  type: ItemType;
  timestamp: Date;
  message: string;
  source?: string;
  level?: LogLevel;
  notificationType?: NotificationType;
  taskStatus?: TaskStatus;
  taskProgress?: number;
  taskName?: string;
  persistent?: boolean;
  metadata?: Record<string, any>;
  data?: any;
  category?: string;
}

const SystemMonitorView: React.FC = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState<SystemItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SystemItem[]>([]);
  const [sortedItems, setSortedItems] = useState<SystemItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<ItemType | "all">("all");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [autoScroll, setAutoScroll] = useState(true);
  const itemsEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to logger events
  useEffect(() => {
    const unsubscribe = logger.subscribe((logEntry: LogEntry) => {
      const systemItem: SystemItem = {
        id: `${logEntry.timestamp.getTime()}-${Math.random()}`,
        type: "log",
        timestamp: logEntry.timestamp,
        message: logEntry.message,
        source: logEntry.context,
        level: logEntry.level,
        metadata: logEntry.data,
        data: logEntry.data,
        category: logEntry.context,
      };

      setItems((prevItems) => {
        const newItems = [...prevItems, systemItem];
        // Keep only the last 500 items to prevent memory issues
        return newItems.slice(-500);
      });
    });

    // Load existing logs
    const existingLogs = logger.getLogs();
    const existingItems: SystemItem[] = existingLogs.map((logEntry) => ({
      id: `${logEntry.timestamp.getTime()}-${Math.random()}`,
      type: "log",
      timestamp: logEntry.timestamp,
      message: logEntry.message,
      source: logEntry.context,
      level: logEntry.level,
      metadata: logEntry.data,
      data: logEntry.data,
      category: logEntry.context,
    }));

    setItems(existingItems);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when new items arrive
  useEffect(() => {
    if (autoScroll && itemsEndRef.current) {
      itemsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [items, autoScroll]);

  // Filter items based on search and type filters
  useEffect(() => {
    let filtered = items;

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Filter by level (for logs)
    if (levelFilter !== "all") {
      filtered = filtered.filter((item) => item.level === levelFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.message.toLowerCase().includes(term) ||
          item.source?.toLowerCase().includes(term) ||
          item.taskName?.toLowerCase().includes(term)
      );
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, typeFilter, levelFilter]);

  // Sort filtered items
  useEffect(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "type":
          aValue = getItemTypeLabel(a);
          bValue = getItemTypeLabel(b);
          break;
        case "timestamp":
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case "source":
          aValue = (a.source || a.taskName || "").toLowerCase();
          bValue = (b.source || b.taskName || "").toLowerCase();
          break;
        case "message":
          aValue = a.message.toLowerCase();
          bValue = b.message.toLowerCase();
          break;
        case "progress":
          aValue = a.taskProgress ?? -1;
          bValue = b.taskProgress ?? -1;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setSortedItems(sorted);
  }, [filteredItems, sortField, sortDirection]);

  const clearItems = () => {
    logger.clearLogs();
    setItems([]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cancelTask = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === "task"
          ? { ...item, taskStatus: "cancelled" as TaskStatus }
          : item
      )
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === "asc" ? (
      <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} />
    );
  };

  const getItemIcon = (item: SystemItem) => {
    switch (item.type) {
      case "log":
        switch (item.level) {
          case LogLevel.INFO:
            return <Info size={12} />;
          case LogLevel.WARN:
            return <AlertTriangle size={12} />;
          case LogLevel.ERROR:
            return <X size={12} />;
          case LogLevel.DEBUG:
            return <Settings size={12} />;
          case LogLevel.TRACE:
            return <Settings size={12} />;
        }
        break;
      case "notification":
        switch (item.notificationType) {
          case "info":
            return <Info size={12} />;
          case "success":
            return <CheckCircle size={12} />;
          case "warning":
            return <AlertTriangle size={12} />;
          case "error":
            return <X size={12} />;
        }
        break;
      case "task":
        switch (item.taskStatus) {
          case "pending":
            return <Clock size={12} />;
          case "running":
            return <RefreshCw size={12} className="spinning" />;
          case "completed":
            return <CheckCircle size={12} />;
          case "failed":
            return <X size={12} />;
          case "cancelled":
            return <LogOut size={12} />;
        }
        break;
    }
  };

  const getItemTypeLabel = (item: SystemItem) => {
    switch (item.type) {
      case "log":
        return item.level !== undefined ? LogLevel[item.level] : "LOG";
      case "notification":
        return item.notificationType?.toUpperCase() || "NOTIF";
      case "task":
        return item.taskStatus?.toUpperCase() || "TASK";
    }
  };

  const getItemTypeColor = (item: SystemItem) => {
    switch (item.type) {
      case "log":
        switch (item.level) {
          case LogLevel.INFO:
            return "var(--workspace-primary)";
          case LogLevel.WARN:
            return "var(--workspace-warning)";
          case LogLevel.ERROR:
            return "var(--workspace-error)";
          case LogLevel.DEBUG:
            return "var(--workspace-text-muted)";
          case LogLevel.TRACE:
            return "var(--workspace-text-secondary)";
        }
        break;
      case "notification":
        switch (item.notificationType) {
          case "info":
            return "var(--workspace-primary)";
          case "success":
            return "var(--workspace-success)";
          case "warning":
            return "var(--workspace-warning)";
          case "error":
            return "var(--workspace-error)";
        }
        break;
      case "task":
        switch (item.taskStatus) {
          case "pending":
            return "var(--workspace-text-muted)";
          case "running":
            return "var(--workspace-primary)";
          case "completed":
            return "var(--workspace-success)";
          case "failed":
            return "var(--workspace-error)";
          case "cancelled":
            return "var(--workspace-text-secondary)";
        }
        break;
    }
    return "var(--workspace-text-secondary)";
  };

  const getTypeCount = (type: ItemType) => {
    return items.filter((item) => item.type === type).length;
  };

  const getLevelCount = (level: LogLevel) => {
    return items.filter((item) => item.type === "log" && item.level === level)
      .length;
  };

  const renderListView = () => (
    <div className="system-monitor-items">
      {filteredItems.map((item) => (
        <div key={item.id} className={`system-item system-item-${item.type}`}>
          <div className="item-icon" style={{ color: getItemTypeColor(item) }}>
            {getItemIcon(item)}
          </div>

          <div className="item-content">
            <div className="item-header">
              <div className="item-meta">
                <span
                  className="item-type"
                  style={{ color: getItemTypeColor(item) }}
                >
                  {getItemTypeLabel(item)}
                </span>
                <span className="item-timestamp">
                  {item.timestamp.toLocaleTimeString()}
                </span>
                {item.source && (
                  <span className="item-source">{item.source}</span>
                )}
                {item.taskName && (
                  <span className="item-task-name">{item.taskName}</span>
                )}
              </div>

              <div className="item-actions">
                {item.type === "task" && item.taskStatus === "running" && (
                  <button
                    className="item-action-button"
                    onClick={() => cancelTask(item.id)}
                    title="Cancel task"
                  >
                    <X size={10} />
                  </button>
                )}
                {item.type === "notification" && !item.persistent && (
                  <button
                    className="item-action-button"
                    onClick={() => removeItem(item.id)}
                    title="Remove notification"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            <div className="item-message">{item.message}</div>

            {item.taskProgress !== undefined && (
              <div className="item-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.taskProgress}%` }}
                  />
                </div>
                <span className="progress-text">{item.taskProgress}%</span>
              </div>
            )}

            {item.metadata && (
              <div className="item-metadata">
                <pre>{JSON.stringify(item.metadata, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={itemsEndRef} />
    </div>
  );

  const renderTableView = () => (
    <div className="system-monitor-table">
      <table className="items-table">
        <thead>
          <tr>
            <th className="sortable-header" onClick={() => handleSort("type")}>
              <div className="header-content">
                Type
                {getSortIcon("type")}
              </div>
            </th>
            <th
              className="sortable-header"
              onClick={() => handleSort("timestamp")}
            >
              <div className="header-content">
                Time
                {getSortIcon("timestamp")}
              </div>
            </th>
            <th
              className="sortable-header"
              onClick={() => handleSort("source")}
            >
              <div className="header-content">
                Source/Name
                {getSortIcon("source")}
              </div>
            </th>
            <th
              className="sortable-header"
              onClick={() => handleSort("message")}
            >
              <div className="header-content">
                Message
                {getSortIcon("message")}
              </div>
            </th>
            <th
              className="sortable-header"
              onClick={() => handleSort("progress")}
            >
              <div className="header-content">
                Progress
                {getSortIcon("progress")}
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <tr key={item.id} className={`table-row table-row-${item.type}`}>
              <td className="table-cell-type">
                <div
                  className="type-badge"
                  style={{ color: getItemTypeColor(item) }}
                >
                  {getItemIcon(item)}
                  <span>{getItemTypeLabel(item)}</span>
                </div>
              </td>
              <td className="table-cell-time">
                {item.timestamp.toLocaleTimeString()}
              </td>
              <td className="table-cell-source">
                {item.source || item.taskName || "-"}
              </td>
              <td className="table-cell-message">
                <div className="message-content">
                  {item.message}
                  {item.metadata && (
                    <details className="metadata-details">
                      <summary>Details</summary>
                      <pre>{JSON.stringify(item.metadata, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </td>
              <td className="table-cell-progress">
                {item.taskProgress !== undefined ? (
                  <div className="table-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.taskProgress}%` }}
                      />
                    </div>
                    <span>{item.taskProgress}%</span>
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="table-cell-actions">
                {item.type === "task" && item.taskStatus === "running" && (
                  <button
                    className="table-action-button"
                    onClick={() => cancelTask(item.id)}
                    title="Cancel task"
                  >
                    <X size={10} />
                  </button>
                )}
                {item.type === "notification" && !item.persistent && (
                  <button
                    className="table-action-button"
                    onClick={() => removeItem(item.id)}
                    title="Remove notification"
                  >
                    <X size={10} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={itemsEndRef} />
    </div>
  );

  return (
    <div
      className="system-monitor-view"
      style={
        {
          "--workspace-background": getColor(
            theme.colors,
            "workspaceBackground"
          ),
          "--workspace-panel": getColor(theme.colors, "workspacePanel"),
          "--workspace-text": getColor(theme.colors, "text"),
          "--workspace-text-secondary": getColor(theme.colors, "textSecondary"),
          "--workspace-text-muted": getColor(theme.colors, "textMuted"),
          "--workspace-border": getColor(theme.colors, "border"),
          "--workspace-surface": getColor(theme.colors, "surface"),
          "--workspace-primary": getColor(theme.colors, "primary"),
          "--workspace-error": getColor(theme.colors, "error"),
          "--workspace-success": getColor(theme.colors, "success"),
          "--workspace-warning": getColor(theme.colors, "warning"),
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="system-monitor-header">
        <div className="header-title">
          <Activity size={18} />
          <h2>System Monitor</h2>
          <span className="item-count">({filteredItems.length})</span>
        </div>
        <div className="header-actions">
          <button
            className={`view-mode-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List size={14} />
          </button>
          <button
            className={`view-mode-button ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table view"
          >
            <Table size={14} />
          </button>
          <button
            className="action-button"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
          >
            <RefreshCw size={16} className={autoScroll ? "active" : ""} />
          </button>
          <button className="clear-button" onClick={clearItems}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="system-monitor-filters">
        <div className="search-filter">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search messages, sources, or task names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={14} />
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as ItemType | "all")
              }
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="log">Logs ({getTypeCount("log")})</option>
              <option value="notification">
                Notifications ({getTypeCount("notification")})
              </option>
              <option value="task">Tasks ({getTypeCount("task")})</option>
            </select>
          </div>

          {typeFilter === "log" || typeFilter === "all" ? (
            <div className="filter-group">
              <select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(e.target.value as LogLevel | "all")
                }
                className="filter-select"
              >
                <option value="all">All Levels</option>
                <option value="debug">
                  Debug ({getLevelCount(LogLevel.DEBUG)})
                </option>
                <option value="info">
                  Info ({getLevelCount(LogLevel.INFO)})
                </option>
                <option value="warn">
                  Warning ({getLevelCount(LogLevel.WARN)})
                </option>
                <option value="error">
                  Error ({getLevelCount(LogLevel.ERROR)})
                </option>
              </select>
            </div>
          ) : null}
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? renderListView() : renderTableView()}
    </div>
  );
};

export default SystemMonitorView;
