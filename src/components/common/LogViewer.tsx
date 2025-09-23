import { Download, Filter, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { LogLevel, logger } from "../../utils/logger";
import "./LogViewer.css";

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  maxHeight?: string;
  mode?: "modal" | "panel";
}

const LogViewer: React.FC<LogViewerProps> = ({
  isOpen,
  onClose,
  maxHeight = "400px",
  mode = "modal",
}) => {
  const [selectedLevels, setSelectedLevels] = useState<Set<LogLevel>>(
    new Set([LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG])
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<ReturnType<typeof logger.getLogs>>([]);

  // Subscribe to new logs
  useEffect(() => {
    const unsubscribe = logger.subscribe(() => {
      setLogs(logger.getLogs());
    });
    return unsubscribe;
  }, []);

  // Filter logs based on selected levels and search term
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = selectedLevels.has(log.level);
      const matchesSearch =
        !searchTerm ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.context &&
          log.context.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesLevel && matchesSearch;
    });
  }, [logs, selectedLevels, searchTerm]);

  const handleLevelToggle = (level: LogLevel) => {
    const newSelectedLevels = new Set(selectedLevels);
    if (newSelectedLevels.has(level)) {
      newSelectedLevels.delete(level);
    } else {
      newSelectedLevels.add(level);
    }
    setSelectedLevels(newSelectedLevels);
  };

  const handleExport = () => {
    const exportData = filteredLogs.map((log) => ({
      timestamp: log.timestamp.toISOString(),
      level: LogLevel[log.level],
      context: log.context || "",
      message: log.message,
      data: log.data,
      error: log.error?.message || "",
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return "#ef4444";
      case LogLevel.WARN:
        return "#f59e0b";
      case LogLevel.INFO:
        return "#06b6d4";
      case LogLevel.DEBUG:
        return "#8b5cf6";
      case LogLevel.TRACE:
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getLevelLabel = (level: LogLevel) => {
    return LogLevel[level];
  };

  if (!isOpen) return null;

  const containerClass =
    mode === "modal" ? "log-viewer-overlay" : "log-viewer-panel";

  return (
    <div className={containerClass}>
      <div className="log-viewer">
        <div className="log-viewer-header">
          <h3>Application Logs</h3>
          <div className="log-viewer-actions">
            <button
              onClick={handleExport}
              className="log-viewer-button"
              title="Export logs"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleClearLogs}
              className="log-viewer-button"
              title="Clear logs"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="log-viewer-button"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="log-viewer-controls">
          <div className="log-level-filters">
            {Object.values(LogLevel)
              .filter((level) => typeof level === "number")
              .map((level) => (
                <label key={level} className="log-level-filter">
                  <input
                    type="checkbox"
                    checked={selectedLevels.has(level as LogLevel)}
                    onChange={() => handleLevelToggle(level as LogLevel)}
                  />
                  <span
                    className="log-level-badge"
                    style={{
                      backgroundColor: getLevelColor(level as LogLevel),
                    }}
                  >
                    {getLevelLabel(level as LogLevel)}
                  </span>
                </label>
              ))}
          </div>

          <div className="log-search">
            <Filter size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="log-search-input"
            />
          </div>
        </div>

        <div className="log-viewer-content" style={{ maxHeight }}>
          {filteredLogs.length === 0 ? (
            <div className="log-viewer-empty">No logs to display</div>
          ) : (
            <div className="log-entries">
              {filteredLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  <div className="log-entry-header">
                    <span
                      className="log-level"
                      style={{ backgroundColor: getLevelColor(log.level) }}
                    >
                      {getLevelLabel(log.level)}
                    </span>
                    <span className="log-timestamp">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    {log.context && (
                      <span className="log-context">{log.context}</span>
                    )}
                  </div>
                  <div className="log-message">{log.message}</div>
                  {log.data && (
                    <div className="log-data">
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </div>
                  )}
                  {log.error && (
                    <div className="log-error">
                      <strong>Error:</strong> {log.error.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
