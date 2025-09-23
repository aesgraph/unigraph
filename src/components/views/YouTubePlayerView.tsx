import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useEffect, useMemo, useState } from "react";
import YouTube from "react-youtube";
import { Annotation, listAnnotations } from "../../api/annotationsApi";
import { createDocument, updateDocument } from "../../api/documentsApi";
import { useAuth } from "../../hooks/useAuth";
import LexicalEditorV3 from "../applets/Lexical/LexicalEditorV3";

export interface YouTubePlayerViewProps {
  videoId: string;
  title?: string;
}

const YouTubePlayerView: React.FC<YouTubePlayerViewProps> = ({
  videoId,
  title,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [_existingAnnotationId, setExistingAnnotationId] = useState<
    string | null
  >(null);
  const storageKey = useMemo(() => `youtube-note-doc-${videoId}`, [videoId]);

  // Add styles for the YouTube iframe
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .youtube-iframe {
        width: 100% !important;
        height: 100% !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Load existing annotation for this video
        const annotations = (await listAnnotations({
          userId: user?.id,
          parentResourceType: "youtube_video",
          parentResourceId: videoId,
          includeContent: true,
        })) as Annotation[];

        let annotationContent = "";
        if (annotations && annotations.length > 0) {
          const a = annotations[0];
          setExistingAnnotationId(a.id);
          let data = a.data as any;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch {
              // ignore
            }
          }
          annotationContent = data?.comment || "";
        }

        // If there is an existing annotation, prefer its id for updates
        // so we don't create duplicates.
        if (annotations && annotations.length > 0) {
          const _existingAnnotation = annotations[0];
        }

        // Ensure a backing document exists for LexicalEditorV3
        let existingDocId = localStorage.getItem(storageKey);
        if (!existingDocId) {
          const newDoc = await createDocument({
            title: `${title || videoId} Notes`,
            content: annotationContent || "",
            extension: "txt",
            metadata: { type: "youtube_note", videoId },
            data: {},
          });
          existingDocId = newDoc.id;
          localStorage.setItem(storageKey, existingDocId);
        } else if (annotationContent) {
          // Sync annotation content into existing doc if present
          await updateDocument({
            id: existingDocId,
            content: annotationContent,
          });
        }

        if (isMounted) setDocumentId(existingDocId);
      } catch (err) {
        console.error("YouTube notes init failed:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [storageKey, title, videoId, user?.id]);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
    } as any,
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        {title && (
          <h3 style={{ margin: 0, color: getColor(theme.colors, "text") }}>
            {title}
          </h3>
        )}
      </div>

      <div
        style={{
          aspectRatio: "4/3",
          width: "100%",
          backgroundColor: getColor(theme.colors, "surface"),
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        <YouTube
          videoId={videoId}
          opts={opts}
          style={{ width: "100%", height: "100%" }}
          iframeClassName="youtube-iframe"
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          backgroundColor: getColor(theme.colors, "surface"),
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
            fontWeight: 600,
            color: getColor(theme.colors, "text"),
          }}
        >
          Notes
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {documentId ? (
            <LexicalEditorV3
              documentId={documentId}
              onChange={async (text, serializedState) => {
                try {
                  if (!user?.id) {
                    // Not signed in; skip saving to avoid invisible rows
                    return;
                  }

                  // Create annotation payload with proper structure (commented out for now)
                  const _annotationData = {
                    type: "text_selection" as const,
                    comment: serializedState || text, // Save full Lexical serialization, fallback to text
                    tags: [],
                    page_url: `https://www.youtube.com/watch?v=${videoId}`,
                  };

                  // const payload = {
                  //   ...(existingAnnotationId
                  //     ? { id: existingAnnotationId }
                  //     : {}), // Only include ID if updating
                  //   title: `${title || videoId} Notes`,
                  //   data: annotationData,
                  //   user_id: user.id,
                  //   parent_resource_type: "youtube_video",
                  //   parent_resource_id: videoId,
                  // } as Annotation;

                  // const saved = await saveAnnotation(payload);
                  // if (!existingAnnotationId && saved?.id) {
                  //   setExistingAnnotationId(saved.id);
                  // }

                  // Notify Resource Manager to refresh annotations
                  window.dispatchEvent(new CustomEvent("annotationsUpdated"));
                } catch (e) {
                  console.warn("Failed to save YouTube note annotation:", e);
                }
              }}
            />
          ) : (
            <div style={{ padding: 12, color: getColor(theme.colors, "text") }}>
              Loading notes...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerView;
