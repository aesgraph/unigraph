import React from "react";

const Privacy: React.FC = () => {
  const handleBack = () => {
    window.location.href = "/signin";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: 0,
        margin: 0,
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
              Privacy Policy
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
            1. Overview
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            This Privacy Policy describes how Unigraph handles user information.
            This is experimental software provided without warranties or
            guarantees. Unigraph has no intent to invade user privacy and
            collects only the information necessary for the application to
            function.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            2. Information Collection
          </h2>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            Unigraph may collect:
          </p>
          <ul
            style={{
              marginLeft: "16px",
              marginTop: "4px",
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            <li>Account credentials and authentication data</li>
            <li>Usage data and application interactions</li>
            <li>Content created within the application</li>
            <li>Technical information (browser, OS, IP address)</li>
          </ul>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            3. Use of Information
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Information is used solely for application functionality,
            development, and security purposes. Unigraph does not sell or
            monetize user data and has no commercial interest in user
            information beyond service provisioning.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            4. Data Security
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
            <strong>IMPORTANT:</strong> This is prototype software. Unigraph
            implements reasonable security measures but cannot guarantee data
            protection. Use at your own risk.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            5. Data Sharing
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Unigraph does not share personal information with third parties
            except as required by law or with explicit user consent. No
            commercial data sharing occurs.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            6. User Rights
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Users may request access to, correction of, or deletion of their
            data. Contact Unigraph through appropriate channels for such
            requests.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            7. Changes to Policy
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Unigraph may update this policy. Continued use constitutes
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
            8. Disclaimer
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
            experimental and provided &quot;AS IS&quot; without warranties.
            Unigraph assumes no responsibility for data security, loss, or
            unauthorized access. Use at your own risk.
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

export default Privacy;
