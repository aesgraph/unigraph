import { getColor, useTheme } from "@aesgraph/app-shell";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import YouTube from "react-youtube";
import { Annotation, listAnnotations } from "../../api/annotationsApi";
import { createDocument, updateDocument } from "../../api/documentsApi";
import { logYouTubeActivity } from "../../api/userActivitiesApi";
import { useAuth } from "../../hooks/useAuth";
import LexicalEditorV3 from "../applets/Lexical/LexicalEditorV3";

// Separate component for timestamp display to avoid re-renders
const TimestampDisplay: React.FC<{
  playerRef: React.RefObject<any>;
  playerReady: boolean;
  formatTimestamp: (seconds: number) => string;
  textSecondaryColor: string;
}> = ({ playerRef, playerReady, formatTimestamp, textSecondaryColor }) => {
  const [displayTime, setDisplayTime] = useState<number>(0);

  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setDisplayTime(Math.floor(time));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playerReady, playerRef]);

  if (!playerReady) return null;

  return (
    <span
      style={{
        fontSize: "12px",
        color: textSecondaryColor,
        fontFamily: "monospace",
      }}
    >
      {formatTimestamp(displayTime)}
    </span>
  );
};

export interface YouTubePlayerViewProps {
  videoId: string;
  title?: string;
}

const YouTubePlayerView: React.FC<YouTubePlayerViewProps> = ({
  videoId,
  title,
}) => {
  // console.log("YouTubePlayerView render:", { videoId, title });

  const { theme } = useTheme();
  const { user } = useAuth();

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [_existingAnnotationId, setExistingAnnotationId] = useState<
    string | null
  >(null);
  const storageKey = useMemo(() => `youtube-note-doc-${videoId}`, [videoId]);
  const initializationRef = useRef<boolean>(false);

  // YouTube player state tracking
  const currentTimeRef = useRef<number>(0);
  const [_duration, _setDuration] = useState<number>(0);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const playerRef = useRef<any>(null);
  const insertTimestampRef = useRef<((timestamp: string) => void) | null>(null);

  // Memoize the onTimestampInsert callback to prevent LexicalEditorV3 re-initialization
  const handleTimestampInsert = useCallback(
    (insertFn: (timestamp: string) => void) => {
      // console.log("handleTimestampInsert called");
      insertTimestampRef.current = insertFn;
    },
    []
  );

  // Memoize the onChange callback to prevent LexicalEditorV3 re-initialization
  const handleEditorChange = useCallback(
    async (text: string, serializedState?: string) => {
      // console.log("handleEditorChange called");
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

        // Notify Resource Manager to refresh annotations
        window.dispatchEvent(new CustomEvent("annotationsUpdated"));
      } catch (e) {
        console.warn("Failed to save YouTube note annotation:", e);
      }
    },
    [user?.id, videoId]
  );

  // Debug: Log when callbacks are recreated
  // useEffect(() => {
  //   console.log("YouTubePlayerView: Callbacks recreated", {
  //     userId: user?.id,
  //     videoId,
  //     documentId,
  //   });
  // }, [
  //   handleTimestampInsert,
  //   handleEditorChange,
  //   user?.id,
  //   videoId,
  //   documentId,
  // ]);

  // Activity logging state
  const [hasLoggedAccess, setHasLoggedAccess] = useState<boolean>(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const watchTimeRef = useRef<number>(0);
  const timeTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // Function to log YouTube video access activity
  const logVideoAccess = async () => {
    console.log("logVideoAccess called:", {
      hasLoggedAccess,
      userId: user?.id,
      videoId,
      currentTime: currentTimeRef.current,
      watchTime: watchTimeRef.current,
    });

    if (!hasLoggedAccess && user?.id) {
      try {
        console.log("Attempting to log YouTube video access...");
        const result = await logYouTubeActivity(
          "youtube_video_accessed",
          videoId,
          currentTimeRef.current,
          {
            video_title: title,
          }
        );
        setHasLoggedAccess(true);
        console.log("Successfully logged YouTube video access:", result);
      } catch (error) {
        console.error("Failed to log YouTube video access:", error);
        console.error("Error details:", error);
      }
    } else {
      console.log("Skipping log - conditions not met:", {
        hasLoggedAccess,
        userId: user?.id,
      });
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
  };

  // YouTube player event handlers
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    setPlayerReady(true);
  };

  const onPlayerStateChange = (event: any) => {
    console.log("YouTube player state change:", event.data);

    // Clear any existing interval first
    if (timeTrackingIntervalRef.current) {
      clearInterval(timeTrackingIntervalRef.current);
      timeTrackingIntervalRef.current = null;
    }

    if (event.data === 1) {
      // Playing state
      isPlayingRef.current = true;

      // Start tracking watch time if not already started
      if (watchStartTime === null) {
        const startTime = Date.now();
        setWatchStartTime(startTime);
        watchTimeRef.current = 0; // Reset watch time
        console.log("Started tracking watch time:", startTime);
      }

      // Create new interval for tracking
      timeTrackingIntervalRef.current = setInterval(() => {
        if (
          playerRef.current &&
          playerRef.current.getCurrentTime &&
          isPlayingRef.current
        ) {
          const currentTime = playerRef.current.getCurrentTime();
          currentTimeRef.current = currentTime;

          // Increment watch time (1 second per interval)
          watchTimeRef.current += 1;

          console.log("Watch time tracking:", {
            watchTimeSeconds: watchTimeRef.current,
            currentVideoTime: currentTime,
            hasLoggedAccess,
            userId: user?.id,
          });

          // Log activity after 10 seconds of actual watching (only once)
          if (watchTimeRef.current >= 10 && !hasLoggedAccess && user?.id) {
            console.log(
              "10 seconds of watch time reached, calling logVideoAccess"
            );
            logVideoAccess();
            // Clear the interval since we no longer need to track for logging purposes
            if (timeTrackingIntervalRef.current) {
              clearInterval(timeTrackingIntervalRef.current);
              timeTrackingIntervalRef.current = null;
              console.log("Cleared watch time tracking interval after logging");
            }
          }
        }
      }, 1000);
    } else {
      // Paused, stopped, or other state
      isPlayingRef.current = false;
      console.log("Video paused/stopped - paused watch time tracking");
    }
  };

  // Helper function to parse timestamp string to seconds
  const parseTimestampToSeconds = (timestamp: string): number => {
    // Remove brackets if present
    const cleanTimestamp = timestamp.replace(/[[\]]/g, "");

    // Split by colon
    const parts = cleanTimestamp.split(":");

    if (parts.length === 2) {
      // mm:ss format
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      // Validate that both values are valid numbers
      if (isNaN(minutes) || isNaN(seconds)) {
        return 0;
      }
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // hh:mm:ss format
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      // Validate that all values are valid numbers
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return 0;
      }
      return hours * 3600 + minutes * 60 + seconds;
    }

    return 0;
  };

  // Handle timestamp click events for video navigation
  useEffect(() => {
    const handleTimestampClick = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { timestamp } = customEvent.detail;
      const seconds = parseTimestampToSeconds(timestamp);

      if (playerRef.current && playerRef.current.seekTo) {
        console.log(`Jumping to timestamp: ${timestamp} (${seconds}s)`);
        playerRef.current.seekTo(seconds, true);
        currentTimeRef.current = seconds;

        // Log timestamp navigation activity
        if (user?.id) {
          try {
            await logYouTubeActivity(
              "youtube_timestamp_navigation",
              videoId,
              seconds,
              {
                video_title: title,
                timestamp_clicked: timestamp,
                timestamp_seconds: seconds,
                navigation_time: new Date().toISOString(),
              }
            );
            console.log(
              `Logged timestamp navigation: ${timestamp} in video ${videoId}`
            );
          } catch (error) {
            console.error("Failed to log timestamp navigation:", error);
          }
        }
      }
    };

    // Listen for timestamp click events
    document.addEventListener("timestampClick", handleTimestampClick);

    return () => {
      document.removeEventListener("timestampClick", handleTimestampClick);
    };
  }, [title, user?.id, videoId]);

  // Reset activity logging state when video changes
  useEffect(() => {
    setHasLoggedAccess(false);
    setWatchStartTime(null);
    watchTimeRef.current = 0;
    isPlayingRef.current = false;
    initializationRef.current = false;

    // Clear any existing interval
    if (timeTrackingIntervalRef.current) {
      clearInterval(timeTrackingIntervalRef.current);
      timeTrackingIntervalRef.current = null;
    }
  }, [videoId]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current);
        timeTrackingIntervalRef.current = null;
      }
    };
  }, []);

  // Test function to manually trigger activity logging (for debugging)
  const testActivityLogging = React.useCallback(async () => {
    console.log("Testing activity logging manually...");
    if (user?.id) {
      try {
        const result = await logYouTubeActivity(
          "test_youtube_activity",
          videoId,
          0,
          {
            test: true,
            timestamp: new Date().toISOString(),
          }
        );
        console.log("Test activity logged successfully:", result);
      } catch (error) {
        console.error("Test activity logging failed:", error);
      }
    } else {
      console.log("No user ID available for testing");
    }
  }, [user?.id, videoId]);

  // Add test function to window for debugging
  useEffect(() => {
    (window as any).testActivityLogging = testActivityLogging;
    return () => {
      delete (window as any).testActivityLogging;
    };
  }, [testActivityLogging]);

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
    console.log("YouTubePlayerView useEffect triggered with:", {
      storageKey,
      title,
      videoId,
      userId: user?.id,
      isInitialized: initializationRef.current,
    });

    let isMounted = true;
    (async () => {
      try {
        // Only proceed if we have a videoId
        if (!videoId) {
          console.log("No videoId, skipping document initialization");
          return;
        }

        // Skip if already initialized for this video
        if (initializationRef.current) {
          console.log("Already initialized, skipping document initialization");
          return;
        }

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
          console.log("Creating new document for video:", videoId);
          const newDoc = await createDocument({
            title: `${title || videoId} Notes`,
            content: annotationContent || "",
            extension: "txt",
            metadata: {
              type: "youtube_note",
              references: [
                {
                  referenceEntityType: "youtube_video",
                  referenceId: videoId,
                  referenceTags: [],
                  referenceRelationType: "parent",
                },
              ],
            },
            data: {},
          });
          existingDocId = newDoc.id;
          localStorage.setItem(storageKey, existingDocId);
          console.log("Created new document with ID:", existingDocId);
        } else if (annotationContent) {
          // Sync annotation content into existing doc if present
          console.log("Updating existing document with annotation content");
          await updateDocument({
            id: existingDocId,
            content: annotationContent,
          });
        }

        if (isMounted) {
          console.log("Setting documentId:", existingDocId);
          setDocumentId(existingDocId);
          initializationRef.current = true;
        }
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
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Notes</span>
          {playerReady && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TimestampDisplay
                playerRef={playerRef}
                playerReady={playerReady}
                formatTimestamp={formatTimestamp}
                textSecondaryColor={getColor(theme.colors, "textSecondary")}
              />
              <button
                onClick={() => {
                  const timestamp = formatTimestamp(currentTimeRef.current);
                  if (insertTimestampRef.current) {
                    insertTimestampRef.current(timestamp);
                  }
                }}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  backgroundColor: getColor(theme.colors, "primary"),
                  color: getColor(theme.colors, "text"),
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                title="Insert current timestamp (click timestamps to jump to video time, delete with Delete/Backspace keys)"
              >
                Insert Timestamp
              </button>
            </div>
          )}
        </div>
        <div
          style={{
            padding: "4px 12px",
            fontSize: "11px",
            color: getColor(theme.colors, "textSecondary"),
            backgroundColor: getColor(theme.colors, "surface"),
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          💡 Tip: Click timestamps to jump to that time in the video. Delete
          with Delete/Backspace keys.
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {documentId ? (
            (() => {
              // console.log(
              //   "Rendering LexicalEditorV3 with documentId:",
              //   documentId
              // );
              return (
                <LexicalEditorV3
                  key={documentId} // Use documentId as key to force re-mount when document changes
                  documentId={documentId}
                  onTimestampInsert={handleTimestampInsert}
                  onChange={handleEditorChange}
                />
              );
            })()
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
