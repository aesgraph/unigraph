import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaGithub, FaGoogle } from "react-icons/fa";
import { supabase } from "../utils/supabaseClient";

// Immediate check for authentication - runs before React renders
if (typeof window !== "undefined" && window.opener) {
  // This is a popup window, check auth immediately
  supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
    const { session } = data;
    if (session?.user) {
      console.log(
        "SignIn: User already authenticated, closing popup immediately"
      );
      window.opener.postMessage(
        { type: "SIGNED_IN", user: session.user },
        window.location.origin
      );
      window.close();
    }
  });
}

const providers = [
  { name: "Google", id: "google", icon: <FaGoogle /> },
  { name: "GitHub", id: "github", icon: <FaGithub /> },
];

export default function SignIn() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [isAlreadySignedIn, setIsAlreadySignedIn] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [initialSession, setInitialSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if this is a popup window
  useEffect(() => {
    const isPopupWindow = window.opener !== null;
    setIsPopup(isPopupWindow);
    console.log("SignIn: isPopup =", isPopupWindow);

    // If this is a popup, focus it
    if (isPopupWindow) {
      window.focus();
    }
  }, []);

  // Check if user is already signed in and store initial session
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAlreadySignedIn(!!user);
      setInitialSession(session);
      console.log("SignIn: Initial session =", session?.user?.id);

      // If this is a popup and user is already signed in, close it immediately
      if (user && isPopup && window.opener) {
        console.log(
          "SignIn: User already signed in, closing popup immediately"
        );
        window.opener.postMessage(
          { type: "SIGNED_IN", user: user },
          window.location.origin
        );
        window.close();
        return; // Don't set loading to false, let the popup close
      }

      setIsLoading(false);
    };
    checkAuth();
  }, [isPopup]);

  const handleSignIn = async (provider: string) => {
    console.log("SignIn: Starting OAuth with", provider);

    // For popup, redirect back to the same page after OAuth
    // For regular page, redirect to main app
    const redirectTo = isPopup
      ? window.location.origin + "/signin" // Stay in popup for OAuth
      : window.location.origin + "/"; // Redirect to main app if not popup

    await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "github",
      options: {
        redirectTo,
        queryParams:
          provider === "google"
            ? {
                prompt: "select_account",
                access_type: "offline",
              }
            : undefined,
      },
    });
  };

  const handleBackToApp = () => {
    if (isPopup && window.opener) {
      // Send message to parent and close popup
      window.opener.postMessage(
        { type: "SIGNIN_CANCELLED" },
        window.location.origin
      );
      window.close();
    } else {
      window.location.href = "/";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setError(error.message);
        } else if (data.user) {
          // Success - auth state change will handle the rest
          console.log("Sign up successful");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setError(error.message);
        } else if (data.user) {
          // Success - auth state change will handle the rest
          console.log("Sign in successful");
        }
      }
    } catch (err) {
      console.log("SignIn: Error during email auth", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Listen for auth state changes to close popup only after OAuth completion
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
        console.log(
          "SignIn: Auth state change:",
          event,
          "session user:",
          session?.user?.id,
          "initial session:",
          initialSession?.user?.id
        );

        if (event === "SIGNED_IN" && isPopup && window.opener) {
          // Always close popup on successful sign-in, regardless of whether it's a new sign-in
          console.log("SignIn: Sign-in successful, closing popup");
          window.opener.postMessage(
            { type: "SIGNED_IN", user: session?.user },
            window.location.origin
          );
          window.close();
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [isPopup, initialSession]);

  // Handle window close event
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isPopup && window.opener) {
        // Notify parent that popup was closed
        window.opener.postMessage(
          { type: "SIGNIN_CANCELLED" },
          window.location.origin
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isPopup]);

  // Don't render anything while loading (prevents flash)
  if (isLoading) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: 36,
          minWidth: 320,
          maxWidth: 400,
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
          {isAlreadySignedIn
            ? "Switch Account"
            : isSignUp
              ? "Create Account"
              : "Sign in"}
        </h2>

        {isAlreadySignedIn && (
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={handleBackToApp}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#666",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s, border 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              ← Back to App
            </button>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 16,
                  outline: "none",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4285f4";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  paddingRight: "48px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 16,
                  outline: "none",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4285f4";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {isSignUp && (
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    paddingRight: "48px",
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    fontSize: 16,
                    outline: "none",
                    transition: "border-color 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4285f4";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                />
              </div>
            )}

            {error && (
              <div
                style={{
                  color: "#dc2626",
                  fontSize: 14,
                  textAlign: "left",
                  padding: "8px 12px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  wordBreak: "break-word",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 6,
                border: "none",
                background: isSubmitting ? "#9ca3af" : "#4285f4",
                color: "#fff",
                fontWeight: 500,
                fontSize: 16,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = "#3367d6";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = "#4285f4";
                }
              }}
            >
              {isSubmitting
                ? "Please wait..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "24px 0",
            color: "#666",
            fontSize: 14,
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ padding: "0 16px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        {/* OAuth Providers */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {providers.map((p) => (
            <button
              key={p.id}
              type="button"
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

        {/* Toggle between sign in and sign up */}
        <div style={{ fontSize: 14, color: "#666" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setFormData({ email: "", password: "", confirmPassword: "" });
            }}
            style={{
              background: "none",
              border: "none",
              color: "#4285f4",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
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
