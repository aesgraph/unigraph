import React from "react";

const Terms: React.FC = () => {
  const handleBack = () => {
    window.location.href = "/signin";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "0 20px 10px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                marginBottom: "2px",
                fontWeight: 700,
                fontSize: "20px",
              }}
            >
              Terms of Service
            </h1>
            <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 20px 20px 20px",
            lineHeight: "1.4",
            color: "#333",
          }}
        >
          <h2
            style={{
              marginTop: "0",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            1. Acceptance
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            By using Unigraph, you agree to these terms. This is experimental
            software provided without warranties.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            2. Service Description
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Unigraph is a prototype application for graph visualization and data
            analysis. This is experimental software for research and development
            purposes.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            3. No Warranties
          </h2>
          <p
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              padding: "8px",
              marginBottom: "8px",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            <strong>IMPORTANT:</strong> This software is provided &quot;AS
            IS&quot; and &quot;AS AVAILABLE&quot; without any warranties,
            expressed or implied.
          </p>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            We explicitly disclaim all warranties including merchantability,
            fitness for purpose, accuracy, reliability, security, and
            uninterrupted operation.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            4. No Liability
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            We assume no responsibility for any damages, data loss, or other
            issues arising from use of this software. You use this service
            entirely at your own risk.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            5. Experimental Nature
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            This is prototype software that may contain bugs, errors, or
            incomplete features. Functionality may change without notice. Do not
            rely on this software for critical use.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            6. User Responsibilities
          </h2>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            You are responsible for:
          </p>
          <ul
            style={{
              marginLeft: "16px",
              marginTop: "4px",
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            <li>Backing up any important data before use</li>
            <li>Ensuring you have rights to any data you upload</li>
            <li>Not using the service for illegal purposes</li>
            <li>Understanding this is experimental software</li>
          </ul>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            7. Service Availability
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            The service may be unavailable at any time for maintenance, updates,
            or other reasons. We do not guarantee continuous availability.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            8. Changes to Terms
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            We may modify these terms at any time. Continued use constitutes
            acceptance of changes.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            9. Disclaimer
          </h2>
          <p
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              padding: "8px",
              marginBottom: "12px",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            <strong>PROTOTYPE SOFTWARE:</strong> This application is
            experimental and provided &quot;AS IS&quot; without warranties. We
            assume no responsibility for any damages, data loss, or security
            issues. Use at your own risk.
          </p>

          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <button
              onClick={handleBack}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #3b82f6",
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 400,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3b82f6";
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
