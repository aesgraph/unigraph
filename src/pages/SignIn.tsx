import React, { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { supabase } from "../utils/supabaseClient";

const providers = [
  { name: "Google", id: "google", icon: <FaGoogle /> },
  { name: "GitHub", id: "github", icon: <FaGithub /> },
];

export default function SignIn() {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "github",
      options: {
        redirectTo: window.location.origin + "/",
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: 36,
          minWidth: 320,
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: 8, fontWeight: 700, fontSize: 28 }}>
          Unigraph
        </h1>
        <h2
          style={{
            margin: "0 0 24px",
            fontWeight: 500,
            fontSize: 20,
            color: "#444",
          }}
        >
          Sign in
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {providers.map((p) => (
            <button
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "12px 0",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: hovered === p.id ? "#f0f4ff" : "#fff",
                color: p.id === "google" ? "#4285f4" : "#24292e",
                fontWeight: 500,
                fontSize: 16,
                cursor: "pointer",
                transition: "background 0.15s, box-shadow 0.15s, border 0.15s",
                boxShadow:
                  hovered === p.id
                    ? "0 2px 8px rgba(66,133,244,0.08)"
                    : "0 1px 2px rgba(0,0,0,0.03)",
                borderColor:
                  hovered === p.id
                    ? p.id === "google"
                      ? "#4285f4"
                      : "#24292e"
                    : "#e5e7eb",
              }}
              onClick={() => handleSignIn(p.id)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                style={{ fontSize: 20, display: "flex", alignItems: "center" }}
              >
                {p.icon}
              </span>
              <span>Continue with {p.name}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 32, fontSize: 13, color: "#888" }}>
          By signing in, you agree to our{" "}
          <a href="/terms" style={{ color: "#4285f4" }}>
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" style={{ color: "#4285f4" }}>
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
