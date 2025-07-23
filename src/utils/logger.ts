// Centralized logging utility for the application

export type LogLevel = "debug" | "info" | "warn" | "error" | "success";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
  data?: any;
  category?: string;
}

export interface LogSubscriber {
  id: string;
  callback: (entry: LogEntry) => void;
}

class Logger {
  private logs: LogEntry[] = [];
  private subscribers: LogSubscriber[] = [];
  private maxLogs: number = 1000; // Keep last 1000 logs

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addLog(
    level: LogLevel,
    message: string,
    source?: string,
    data?: any,
    category?: string
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      source,
      data,
      category,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify subscribers
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber.callback(entry);
      } catch (error) {
        console.error("Error in log subscriber:", error);
      }
    });

    // Also log to console for development
    if (process.env.NODE_ENV === "development") {
      const consoleMethod =
        level === "error"
          ? "error"
          : level === "warn"
            ? "warn"
            : level === "success"
              ? "log"
              : "info";
      console[consoleMethod](
        `[${level.toUpperCase()}] ${source ? `[${source}] ` : ""}${message}`,
        data || ""
      );
    }

    return entry;
  }

  // Public logging methods
  debug(
    message: string,
    source?: string,
    data?: any,
    category?: string
  ): LogEntry {
    return this.addLog("debug", message, source, data, category);
  }

  info(
    message: string,
    source?: string,
    data?: any,
    category?: string
  ): LogEntry {
    return this.addLog("info", message, source, data, category);
  }

  warn(
    message: string,
    source?: string,
    data?: any,
    category?: string
  ): LogEntry {
    return this.addLog("warn", message, source, data, category);
  }

  error(
    message: string,
    source?: string,
    data?: any,
    category?: string
  ): LogEntry {
    return this.addLog("error", message, source, data, category);
  }

  success(
    message: string,
    source?: string,
    data?: any,
    category?: string
  ): LogEntry {
    return this.addLog("success", message, source, data, category);
  }

  // Tool-specific logging methods
  toolCall(toolName: string, description: string, data?: any): LogEntry {
    return this.info(
      `Tool called: ${toolName}`,
      "ToolProcessor",
      data,
      "tools"
    );
  }

  toolSuccess(toolName: string, description: string, data?: any): LogEntry {
    return this.success(
      `Tool executed successfully: ${toolName}`,
      "ToolProcessor",
      data,
      "tools"
    );
  }

  toolError(toolName: string, error: string, data?: any): LogEntry {
    return this.error(
      `Tool execution failed: ${toolName}`,
      "ToolProcessor",
      { error, ...data },
      "tools"
    );
  }

  // Query-specific logging methods
  queryGenerated(query: string, endpoint?: string, data?: any): LogEntry {
    return this.info(
      `SPARQL query generated`,
      "SemanticQuery",
      { query, endpoint, ...data },
      "queries"
    );
  }

  queryExecuted(
    query: string,
    endpoint: string,
    resultCount?: number,
    data?: any
  ): LogEntry {
    return this.success(
      `SPARQL query executed`,
      "SemanticQuery",
      { query, endpoint, resultCount, ...data },
      "queries"
    );
  }

  queryError(
    query: string,
    endpoint: string,
    error: string,
    data?: any
  ): LogEntry {
    return this.error(
      `SPARQL query failed`,
      "SemanticQuery",
      { query, endpoint, error, ...data },
      "queries"
    );
  }

  // Subscription methods
  subscribe(callback: (entry: LogEntry) => void): string {
    const id = this.generateId();
    this.subscribers.push({ id, callback });
    return id;
  }

  unsubscribe(id: string): boolean {
    const index = this.subscribers.findIndex((sub) => sub.id === id);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      return true;
    }
    return false;
  }

  // Getter methods
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter((log) => log.source === source);
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Set max logs
  setMaxLogs(max: number): void {
    this.maxLogs = max;
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, source?: string, data?: any, category?: string) =>
    logger.debug(message, source, data, category),
  info: (message: string, source?: string, data?: any, category?: string) =>
    logger.info(message, source, data, category),
  warn: (message: string, source?: string, data?: any, category?: string) =>
    logger.warn(message, source, data, category),
  error: (message: string, source?: string, data?: any, category?: string) =>
    logger.error(message, source, data, category),
  success: (message: string, source?: string, data?: any, category?: string) =>
    logger.success(message, source, data, category),
  toolCall: (toolName: string, description: string, data?: any) =>
    logger.toolCall(toolName, description, data),
  toolSuccess: (toolName: string, description: string, data?: any) =>
    logger.toolSuccess(toolName, description, data),
  toolError: (toolName: string, error: string, data?: any) =>
    logger.toolError(toolName, error, data),
  queryGenerated: (query: string, endpoint?: string, data?: any) =>
    logger.queryGenerated(query, endpoint, data),
  queryExecuted: (
    query: string,
    endpoint: string,
    resultCount?: number,
    data?: any
  ) => logger.queryExecuted(query, endpoint, resultCount, data),
  queryError: (query: string, endpoint: string, error: string, data?: any) =>
    logger.queryError(query, endpoint, error, data),
};

export default logger;
