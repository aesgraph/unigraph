import { useTheme } from "@aesgraph/app-shell";
import React, { useEffect, useState } from "react";
import { getWebpageContent, Webpage } from "../../api/webpagesApi";

interface WebResourcePreviewCardProps {
  webpage: Webpage;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const WebResourcePreviewCard: React.FC<WebResourcePreviewCardProps> = ({
  webpage,
  isVisible,
  position,
  onClose,
}) => {
  const { theme } = useTheme();
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible || !webpage.id) return;

    const loadScreenshot = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Loading screenshot for webpage:", webpage.id);
        console.log("Initial screenshot_url:", webpage.screenshot_url);
        console.log("Screenshot URL type:", typeof webpage.screenshot_url);
        console.log("Screenshot URL length:", webpage.screenshot_url?.length);

        // Always fetch the full content from Supabase for previews
        // since the table data might have includeContent: false
        console.log("Fetching webpage content for ID:", webpage.id);
        const content = await getWebpageContent(webpage.id);
        console.log("Fetched content screenshot_url:", content?.screenshot_url);
        console.log(
          "Content screenshot URL type:",
          typeof content?.screenshot_url
        );
        console.log(
          "Content screenshot URL length:",
          content?.screenshot_url?.length
        );

        if (content?.screenshot_url && content.screenshot_url !== "Available") {
          console.log(
            "Setting screenshot URL from content (first 100 chars):",
            content.screenshot_url.substring(0, 100)
          );
          setScreenshotUrl(content.screenshot_url);
        } else {
          console.log("No valid screenshot URL found in content");
          setError("No screenshot available");
        }
      } catch (err) {
        console.error("Error loading screenshot:", err);
        setError("Failed to load screenshot");
      } finally {
        setIsLoading(false);
      }
    };

    loadScreenshot();
  }, [isVisible, webpage.id, webpage.screenshot_url]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 10000,
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.sizes.borderRadius.md,
        boxShadow: theme.sizes.shadow.lg,
        padding: "16px",
        maxWidth: "400px",
        minWidth: "300px",
        pointerEvents: "auto",
      }}
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: theme.colors.text,
            lineHeight: 1.3,
          }}
        >
          {webpage.title || webpage.url}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.textSecondary,
            cursor: "pointer",
            fontSize: "18px",
            padding: "0",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>

      {/* Screenshot */}
      <div
        style={{
          marginBottom: "12px",
          borderRadius: theme.sizes.borderRadius.sm,
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading ? (
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            Loading screenshot...
          </div>
        ) : error ? (
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: "14px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            {error}
          </div>
        ) : screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt="Webpage screenshot"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "300px",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              console.error("Image failed to load:", screenshotUrl);
              console.error("Image error event:", e);
              setError("Failed to load image");
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", screenshotUrl);
            }}
          />
        ) : (
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: "14px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            No screenshot available
          </div>
        )}
      </div>

      {/* URL */}
      {webpage.url && (
        <div
          style={{
            marginBottom: "8px",
          }}
        >
          <a
            href={webpage.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.colors.primary,
              fontSize: "12px",
              textDecoration: "underline",
              wordBreak: "break-all",
              display: "block",
            }}
          >
            {webpage.url}
          </a>
        </div>
      )}

      {/* Metadata */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: theme.colors.textSecondary,
        }}
      >
        {webpage.created_at && (
          <span>
            Created: {new Date(webpage.created_at).toLocaleDateString()}
          </span>
        )}
        {webpage.last_updated_at && (
          <span>
            Updated: {new Date(webpage.last_updated_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default WebResourcePreviewCard;
