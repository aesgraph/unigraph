// Centralized logging utility for the application

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableContext: boolean;
  enableColors: boolean;
  maxEntries?: number;
  persistLogs?: boolean;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private subscribers: ((entry: LogEntry) => void)[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableTimestamp: true,
      enableContext: true,
      enableColors: true,
      maxEntries: 1000,
      persistLogs: false,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private formatMessage(entry: LogEntry): string {
    const parts: string[] = [];

    // Add timestamp
    if (this.config.enableTimestamp) {
      const timeStr = entry.timestamp.toISOString();
      parts.push(`[${timeStr}]`);
    }

    // Add level
    const levelStr = LogLevel[entry.level];
    const coloredLevel = this.config.enableColors
      ? this.getColoredLevel(levelStr)
      : levelStr;
    parts.push(`[${coloredLevel}]`);

    // Add context
    if (this.config.enableContext && entry.context) {
      parts.push(`[${entry.context}]`);
    }

    // Add message
    parts.push(entry.message);

    return parts.join(" ");
  }

  private getColoredLevel(level: string): string {
    const colors = {
      ERROR: "\x1b[31m", // Red
      WARN: "\x1b[33m", // Yellow
      INFO: "\x1b[36m", // Cyan
      DEBUG: "\x1b[35m", // Magenta
      TRACE: "\x1b[90m", // Gray
    };
    const reset = "\x1b[0m";
    return `${colors[level as keyof typeof colors] || ""}${level}${reset}`;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
      error,
    };
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error
  ) {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, message, context, data, error);

    // Add to logs array
    this.logs.push(entry);

    // Limit log entries
    if (this.config.maxEntries && this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    // Format and output
    const formattedMessage = this.formatMessage(entry);

    // Use appropriate console method
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        if (error) console.error(error);
        if (data) console.error("Data:", data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        if (data) console.warn("Data:", data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        if (data) console.info("Data:", data);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        if (data) console.debug("Data:", data);
        break;
      case LogLevel.TRACE:
        console.trace(formattedMessage);
        if (data) console.trace("Data:", data);
        break;
    }

    // Notify subscribers
    this.subscribers.forEach((subscriber) => subscriber(entry));
  }

  // Public logging methods
  error(message: string, context?: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  warn(message: string, context?: string, data?: any) {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  trace(message: string, context?: string, data?: any) {
    this.log(LogLevel.TRACE, message, context, data);
  }

  // Configuration methods
  setLevel(level: LogLevel) {
    this.config.level = level;
  }

  setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Log retrieval
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Subscription methods
  subscribe(callback: (entry: LogEntry) => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Export logs
  exportLogs(): string {
    return this.logs.map((entry) => this.formatMessage(entry)).join("\n");
  }

  // Performance logging
  time(label: string, context?: string) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(`${context ? `[${context}] ` : ""}${label}`);
    }
  }

  timeEnd(label: string, context?: string) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(`${context ? `[${context}] ` : ""}${label}`);
    }
  }
}

// Create default logger instance
export const logger = new Logger({
  level:
    process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
});

// Create context-specific loggers
export const createLogger = (context: string) => ({
  error: (message: string, data?: any, error?: Error) =>
    logger.error(message, context, data, error),
  warn: (message: string, data?: any) => logger.warn(message, context, data),
  info: (message: string, data?: any) => logger.info(message, context, data),
  debug: (message: string, data?: any) => logger.debug(message, context, data),
  trace: (message: string, data?: any) => logger.trace(message, context, data),
  time: (label: string) => logger.time(label, context),
  timeEnd: (label: string) => logger.timeEnd(label, context),
});
