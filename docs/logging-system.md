# Logging System

The application includes a comprehensive logging system that replaces `console.log` with structured, configurable logging.

## Features

- **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Context-Aware Logging**: Each component can have its own logger context
- **Performance Logging**: Built-in timing functions
- **Log Viewer**: UI component for viewing and filtering logs
- **Export Capability**: Export logs as JSON
- **Configurable**: Control log levels, formatting, and output

## Basic Usage

### In React Components

```typescript
import { useComponentLogger } from '../hooks/useLogger';

const MyComponent: React.FC = () => {
  const log = useComponentLogger("MyComponent");

  const handleClick = () => {
    log.info("Button clicked");
    log.debug("Component state", { state: currentState });
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

### Direct Logger Usage

```typescript
import { logger } from "../utils/logger";

// Global logger
logger.info("Application started");
logger.error("Critical error", { error: new Error("Something went wrong") });
```

### Context-Specific Logger

```typescript
import { createLogger } from "../utils/logger";

const apiLogger = createLogger("API");
apiLogger.info("API call started", { endpoint: "/users" });
```

## Log Levels

### ERROR (0)

For critical errors that need immediate attention.

```typescript
log.error("Failed to load user data", { userId: 123 }, error);
```

### WARN (1)

For warnings that don't break functionality but should be investigated.

```typescript
log.warn("API response was slower than expected", { responseTime: 2000 });
```

### INFO (2)

For general information about application flow.

```typescript
log.info("User logged in", { userId: 123, timestamp: new Date() });
```

### DEBUG (3)

For detailed debugging information.

```typescript
log.debug("Component re-rendered", {
  props: currentProps,
  state: currentState,
});
```

### TRACE (4)

For very detailed tracing information.

```typescript
log.trace("Function called", { parameters: args });
```

## Performance Logging

Use the timing functions to measure performance:

```typescript
const log = useComponentLogger("DataLoader");

const loadData = async () => {
  log.time("data-load");

  try {
    const data = await fetchData();
    log.info("Data loaded successfully", { recordCount: data.length });
  } catch (error) {
    log.error("Failed to load data", { error });
  } finally {
    log.timeEnd("data-load");
  }
};
```

## Configuration

### Setting Log Level

```typescript
import { logger, LogLevel } from "../utils/logger";

// Set global log level
logger.setLevel(LogLevel.DEBUG);

// Configure logger settings
logger.setConfig({
  enableTimestamp: true,
  enableContext: true,
  enableColors: true,
  maxEntries: 1000,
});
```

### Environment-Based Configuration

The logger automatically adjusts based on the environment:

- **Development**: DEBUG level by default
- **Production**: INFO level by default

## Log Viewer Component

The `LogViewer` component provides a UI for viewing and managing logs:

```typescript
import LogViewer from '../components/common/LogViewer';

const [showLogViewer, setShowLogViewer] = useState(false);

return (
  <div>
    <button onClick={() => setShowLogViewer(true)}>
      View Logs
    </button>

    <LogViewer
      isOpen={showLogViewer}
      onClose={() => setShowLogViewer(false)}
    />
  </div>
);
```

### Log Viewer Features

- **Level Filtering**: Show/hide specific log levels
- **Search**: Search through log messages and contexts
- **Export**: Export filtered logs as JSON
- **Clear**: Clear all logs
- **Real-time Updates**: Automatically updates as new logs are added

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good
log.error("Database connection failed", { error });
log.warn("API response slow", { responseTime: 5000 });
log.info("User action completed", { action: "save", userId: 123 });
log.debug("Component state changed", { prevState, newState });

// ❌ Avoid
console.log("Something happened");
console.error("Everything is broken");
```

### 2. Include Context

```typescript
// ✅ Good
log.info("File uploaded", {
  fileName: "document.pdf",
  fileSize: 1024000,
  userId: 123,
});

// ❌ Avoid
log.info("File uploaded");
```

### 3. Use Structured Data

```typescript
// ✅ Good
log.debug("API response", {
  endpoint: "/api/users",
  status: 200,
  responseTime: 150,
  data: { users: [...] }
});

// ❌ Avoid
log.debug("API response: " + JSON.stringify(data));
```

### 4. Handle Errors Properly

```typescript
// ✅ Good
try {
  const result = await riskyOperation();
  log.info("Operation completed", { result });
} catch (error) {
  log.error("Operation failed", {
    operation: "riskyOperation",
    error: error.message,
    stack: error.stack,
  });
}
```

### 5. Use Performance Logging

```typescript
// ✅ Good
const processData = async (data: any[]) => {
  log.time("data-processing");

  try {
    const result = await heavyProcessing(data);
    log.info("Data processing completed", {
      inputSize: data.length,
      outputSize: result.length,
    });
  } finally {
    log.timeEnd("data-processing");
  }
};
```

## Migration from console.log

Replace existing `console.log` statements:

```typescript
// Before
console.log("Component mounted");
console.warn("API call failed:", error);
console.error("Critical error:", error);

// After
const log = useComponentLogger("MyComponent");
log.info("Component mounted");
log.warn("API call failed", { error });
log.error("Critical error", { error });
```

## Advanced Usage

### Custom Logger Configuration

```typescript
import { Logger, LogLevel } from "../utils/logger";

const customLogger = new Logger({
  level: LogLevel.TRACE,
  enableTimestamp: false,
  enableContext: true,
  enableColors: false,
  maxEntries: 500,
});
```

### Log Subscription

```typescript
import { logger } from "../utils/logger";

const unsubscribe = logger.subscribe((logEntry) => {
  // Custom log handling
  if (logEntry.level === LogLevel.ERROR) {
    // Send to error reporting service
    sendToErrorService(logEntry);
  }
});

// Don't forget to unsubscribe
unsubscribe();
```

### Export Logs Programmatically

```typescript
import { logger } from "../utils/logger";

const exportLogs = () => {
  const logText = logger.exportLogs();
  const blob = new Blob([logText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "application-logs.txt";
  a.click();

  URL.revokeObjectURL(url);
};
```
