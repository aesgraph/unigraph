import React, { useState } from "react";
import { useComponentLogger } from "../../hooks/useLogger";
import LogViewer from "./LogViewer";

const LoggerDemo: React.FC = () => {
  const log = useComponentLogger("LoggerDemo");
  const [showLogViewer, setShowLogViewer] = useState(false);

  const handleTestLogs = () => {
    log.info("This is an info message");
    log.debug("This is a debug message", { someData: "example" });
    log.warn("This is a warning message");
    log.error("This is an error message", {
      error: new Error("Example error"),
    });
    log.trace("This is a trace message");
  };

  const handlePerformanceTest = () => {
    log.time("performance-test");
    // Simulate some work
    setTimeout(() => {
      log.timeEnd("performance-test");
      log.info("Performance test completed");
    }, 1000);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Logger Demo</h3>
      <p>This component demonstrates the logging system.</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={handleTestLogs}>Test All Log Levels</button>
        <button onClick={handlePerformanceTest}>
          Test Performance Logging
        </button>
        <button onClick={() => setShowLogViewer(true)}>Open Log Viewer</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Usage Examples:</h4>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {`// In a component:
const log = useComponentLogger("MyComponent");

// Different log levels:
log.info("User clicked button");
log.debug("Component state updated", { state: newState });
log.warn("API call failed", { status: 500 });
log.error("Critical error occurred", error);

// Performance logging:
log.time("api-call");
// ... do work ...
log.timeEnd("api-call");`}
        </pre>
      </div>

      <LogViewer
        isOpen={showLogViewer}
        onClose={() => setShowLogViewer(false)}
      />
    </div>
  );
};

export default LoggerDemo;
