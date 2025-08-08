import React from "react";
import UnigraphIframe from "../common/UnigraphIframe";

/**
 * Example component demonstrating the usage of UnigraphIframe
 * for embedding interactive diagrams and documentation structures
 */
const UnigraphIframeExample: React.FC = () => {
  const handleIframeLoad = () => {
    console.log("Iframe loaded successfully");
  };

  const handleIframeError = (error: Event) => {
    console.error("Iframe failed to load:", error);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>UnigraphIframe Examples</h1>

      <section style={{ marginBottom: "40px" }}>
        <h2>Interactive Documentation Structure</h2>
        <p>
          This example shows how to embed an interactive diagram of
          Unigraph&apos;s documentation structure.
        </p>
        <UnigraphIframe
          src="/docs-structure.html"
          title="Unigraph Documentation Structure"
          width="100%"
          height={500}
          showControls={true}
          resizable={true}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          loadingMessage="Loading documentation structure..."
          allowFullscreen={true}
        />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>Interactive Diagram Example</h2>
        <p>
          This example shows how to embed an interactive diagram with custom
          styling.
        </p>
        <UnigraphIframe
          src="/interactive-diagram.html"
          title="Interactive Diagram"
          width={800}
          height={400}
          showControls={true}
          resizable={false}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{
            border: "2px solid #1976d2",
            borderRadius: "12px",
          }}
          iframeProps={{
            sandbox: "allow-scripts allow-same-origin",
          }}
        />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>Minimal Configuration</h2>
        <p>This example shows the iframe with minimal configuration.</p>
        <UnigraphIframe
          src="/simple-content.html"
          title="Simple Content"
          width="100%"
          height={300}
          showControls={false}
          showLoading={false}
        />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>Custom Styling Example</h2>
        <p>
          This example shows the iframe with custom styling and dark theme
          support.
        </p>
        <UnigraphIframe
          src="/custom-styled-content.html"
          title="Custom Styled Content"
          width="100%"
          height={400}
          showControls={true}
          className="custom-iframe"
          style={{
            border: "3px solid #ff6b6b",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
          }}
          loadingMessage="Loading custom styled content..."
        />
      </section>

      <section>
        <h2>Usage in Markdown</h2>
        <p>
          You can use the UnigraphIframe component in your markdown files like
          this:
        </p>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          {`// In your markdown file
import UnigraphIframe from '../components/common/UnigraphIframe';

<UnigraphIframe
  src="/docs-structure.html"
  title="Documentation Structure"
  width="100%"
  height={500}
  showControls={true}
  resizable={true}
/>`}
        </pre>
      </section>
    </div>
  );
};

export default UnigraphIframeExample;
