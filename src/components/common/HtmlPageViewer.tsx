import { useTheme } from "@aesgraph/app-shell";
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Tag,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Annotation,
  listAnnotations,
  saveAnnotation,
  TextSelectionAnnotationData,
} from "../../api/annotationsApi";
import { getWebpage } from "../../api/webpagesApi";
import useAppConfigStore from "../../store/appConfigStore";
import { useHtmlPageViewerStore } from "../../store/htmlPageViewerStore";
import { addNotification } from "../../store/notificationStore";
import { useTagStore } from "../../store/tagStore";
import { useUserStore } from "../../store/userStore";
import EditableAnnotationCard from "../annotations/EditableAnnotationCard";
import AnnotationDialog from "./AnnotationDialog";
import { processHtmlWithHighlights } from "./annotationHighlightingScript";

interface HtmlPageViewerProps {
  resourceId?: string;
  url?: string;
  title?: string;
  tabId?: string;
  onClose?: () => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
  text: string;
}

const HtmlPageViewer: React.FC<HtmlPageViewerProps> = ({
  resourceId,
  url,
  title,
  tabId,
  onClose,
}) => {
  console.log("HtmlPageViewer render:", { resourceId, url, title, tabId });
  const { theme } = useTheme();
  const [html, setHtml] = useState<string>("");

  // Create a wrapped setHtml function for debugging
  const setHtmlWithDebug = useCallback(
    (newHtml: string) => {
      console.log("setHtml called:", {
        newHtmlLength: newHtml.length,
        currentHtmlLength: html.length,
        hasHighlightedContent: hasHighlightedContent.current,
      });
      setHtml(newHtml);
    },
    [html]
  );

  const [loading, setLoading] = useState<boolean>(false); // Start with false to prevent flicker
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(url || "");
  const [currentTitle, setCurrentTitle] = useState<string>(title || "");
  const [loadedResourceId, setLoadedResourceId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
    null
  );
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotationCard, setShowAnnotationCard] =
    useState<Annotation | null>(null);
  const [cardPosition, setCardPosition] = useState({ x: 100, y: 100 });
  const [cardSize, setCardSize] = useState({ width: 450, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentHtmlContent, setCurrentHtmlContent] = useState<string>("");
  const [contentHash, setContentHash] = useState<string>("");
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

  // Debug HTML state changes
  useEffect(() => {
    console.log("HTML state changed:", {
      htmlLength: html.length,
      hasHighlightedContent: hasHighlightedContent.current,
      currentHtmlContentLength: currentHtmlContent.length,
      annotationsCount: annotations.length,
    });
  }, [html, currentHtmlContent, annotations.length]);

  // Refs
  const processedResourceIds = useRef<Set<string>>(new Set());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasHighlightedContent = useRef<boolean>(false);

  // Store hooks
  const { user } = useUserStore();
  const { currentSceneGraph } = useAppConfigStore();
  const { getTagColor } = useTagStore();

  // Get store functions
  const {
    getContent,
    setContent,
    setLoading: setStoreLoading,
    setError: setStoreError,
    hasValidContent,
  } = useHtmlPageViewerStore();

  // Load annotations for the current webpage
  const loadAnnotations = useCallback(async () => {
    console.log("loadAnnotations called with:", { user: user?.id, currentUrl });

    if (!user?.id || !currentUrl) {
      console.log("loadAnnotations: missing user or currentUrl", {
        user: user?.id,
        currentUrl,
      });
      return;
    }

    // Reset highlighting when loading annotations for a new URL
    hasHighlightedContent.current = false;

    console.log("loadAnnotations: proceeding with valid user and URL");

    console.log("Loading annotations for:", {
      userId: user.id,
      currentUrl: currentUrl,
      user: user,
    });

    try {
      // Then try the specific webpage query
      const webpageAnnotations = await listAnnotations({
        userId: user.id,
        parentResourceType: "webpage",
        parentResourceId: currentUrl,
      });

      console.log("Loaded annotations for webpage:", webpageAnnotations);
      console.log("Annotation query params:", {
        userId: user.id,
        parentResourceType: "webpage",
        parentResourceId: currentUrl,
      });
      setAnnotations(webpageAnnotations);
      console.log(
        "Loaded annotations for webpage:",
        webpageAnnotations.length,
        "annotations"
      );

      if (webpageAnnotations.length > 0) {
        console.log("Annotations loaded, will trigger HTML processing effect");
        console.log("Current HTML length:", html?.length || 0);
        console.log(
          "Current annotations state before setting:",
          annotations.length
        );
      }

      // Note: highlighting will be triggered by the useEffect that watches annotations
    } catch (error) {
      console.error("Failed to load annotations:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentUrl]); // Only need user.id, not the full user object

  // Define fetchWebpageContent function with useCallback
  const fetchWebpageContent = useCallback(
    async (webpageId: string) => {
      console.log("fetchWebpageContent called with webpageId:", webpageId);
      setLoading(true);
      setStoreLoading(webpageId, true);
      setError(null);
      setStoreError(webpageId, null);

      try {
        const webpage = await getWebpage(webpageId);
        console.log("getWebpage result:", webpage);

        if (webpage && webpage.html_content) {
          console.log(
            "Setting content for resourceId:",
            webpageId,
            "Content length:",
            webpage.html_content.length,
            "URL:",
            webpage.url
          );

          // Cache the raw content in the store (we'll process it when annotations are available)
          setContent(webpageId, {
            html: webpage.html_content,
            url: webpage.url,
            title: webpage.title || webpage.url,
            resourceId: webpageId,
          });

          setHtmlWithDebug(webpage.html_content);
          setCurrentUrl(webpage.url);
          setCurrentTitle(webpage.title || webpage.url);
          // Don't change document.title for iframe-based viewer
          setLoadedResourceId(webpageId);
          setContentHash(`${webpageId}-0-false`);

          // Don't set content immediately - let the processing effect handle it
          // This ensures we wait for annotations to be available before setting content
        } else {
          console.log(
            "No webpage or html_content found for webpageId:",
            webpageId
          );
          const errorMsg = "No HTML content available for this webpage";
          setError(errorMsg);
          setStoreError(webpageId, errorMsg);
        }
      } catch (err) {
        console.error("Error in fetchWebpageContent:", err);
        const errorMsg = `Error loading webpage: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMsg);
        setStoreError(webpageId, errorMsg);
      } finally {
        setLoading(false);
        setStoreLoading(webpageId, false);
      }
    },
    [setStoreLoading, setStoreError, setContent, setHtmlWithDebug]
  );

  // Handle text selection and context menu
  const handleIframeLoad = useCallback(() => {
    console.log("Iframe loaded");
    console.log("Current HTML content length:", currentHtmlContent.length);
    console.log("Current annotations count:", annotations.length);
    console.log("Content hash:", contentHash);
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) {
        console.log("No iframe document available");
        return;
      }

      console.log("Adding event listeners to iframe document");
      // Add event listeners to the iframe document
      iframeDoc.addEventListener("mouseup", handleTextSelection);
      iframeDoc.addEventListener("contextmenu", handleContextMenu);

      // Close context menu when clicking outside
      iframeDoc.addEventListener("click", () => {
        setContextMenu(null);
      });

      // Close context menu on escape key
      iframeDoc.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          setContextMenu(null);
        }
      });
    } catch (error) {
      console.warn(
        "Could not access iframe content due to CORS restrictions:",
        error
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHtmlContent, annotations, contentHash]); // handleTextSelection and handleContextMenu are defined below and are stable

  // Process HTML content when HTML or annotations change
  useEffect(() => {
    console.log("HTML processing effect triggered", {
      hasHtml: !!html,
      htmlLength: html?.length || 0,
      annotationsCount: annotations.length,
      hasHighlightedContent: hasHighlightedContent.current,
      currentHtmlContentLength: currentHtmlContent.length,
      contentHash,
      loadedResourceId,
    });

    // Only set content if we have HTML
    if (html && html.length > 0) {
      // Process with annotations if available and toggle is on, otherwise use raw HTML
      let processedHtml = html;
      let hasHighlights = false;

      if (annotations.length > 0 && showAnnotations) {
        console.log(
          "HTML and annotations available, processing content with highlights"
        );

        // Convert annotations to the expected type with position data
        const annotationHighlights = annotations
          .filter((annotation) => (annotation.data as any)?.selected_text)
          .map((annotation) => {
            const data = annotation.data as any;
            return {
              id: annotation.id,
              data: {
                selected_text: data.selected_text!,
                start_position: data.start_position,
                end_position: data.end_position,
                comment: data.comment,
                secondary_comment: data.secondary_comment,
                tags: data.tags,
              },
            };
          });

        const result = processHtmlWithHighlights(html, annotationHighlights, getTagColor);
        processedHtml = result.html;
        hasHighlights = result.highlightsAdded > 0;

        console.log(
          "Processed HTML length:",
          result.html.length,
          "highlights added:",
          result.highlightsAdded
        );

        console.log("Content being set in iframe:", {
          htmlLength: result.html.length,
          highlightsAdded: result.highlightsAdded,
          containsHighlightClass: result.html.includes(
            'class="annotation-highlight"'
          ),
          firstHighlightIndex: result.html.indexOf(
            'class="annotation-highlight"'
          ),
          annotationsProcessed: annotationHighlights.length,
        });
      } else {
        console.log("Using raw HTML (annotations disabled or not available)");
      }

      // Update the ref to track if we have highlighted content
      hasHighlightedContent.current = hasHighlights;
      console.log(
        "Set hasHighlightedContent to:",
        hasHighlightedContent.current
      );

      // Update content smoothly without forcing iframe remount
      setCurrentHtmlContent(processedHtml);

      // Update content hash for tracking
      const newHash = `${loadedResourceId}-${annotations.length}-${hasHighlights}`;
      setContentHash(newHash);
      console.log("Updated content hash:", newHash);

      // Update iframe content smoothly using srcdoc
      if (iframeRef.current) {
        iframeRef.current.srcdoc = processedHtml;
      }

      console.log(
        "Setting currentHtmlContent, first 500 chars:",
        processedHtml.substring(0, 500)
      );
    } else {
      console.log("No HTML content available for processing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, annotations, loadedResourceId, showAnnotations]); // contentHash and currentHtmlContent.length are derived values

  // Force iframe update when content hash changes
  useEffect(() => {
    console.log("Content hash changed, ensuring iframe updates:", contentHash);
    // The iframe key includes contentHash, so it will re-mount when this changes
  }, [contentHash]);

  // Debug annotation card state
  useEffect(() => {
    if (showAnnotationCard) {
      console.log("Annotation card state changed to:", showAnnotationCard.id);
    } else {
      console.log("Annotation card state cleared");
    }
  }, [showAnnotationCard]);

  // Add event listeners to the main document as fallback
  useEffect(() => {
    const handleMainDocumentMouseUp = (event: MouseEvent) => {
      // Only handle if we're clicking inside the iframe area
      if (iframeRef.current) {
        const iframeRect = iframeRef.current.getBoundingClientRect();

        if (
          event.clientX >= iframeRect.left &&
          event.clientX <= iframeRect.right &&
          event.clientY >= iframeRect.top &&
          event.clientY <= iframeRect.bottom
        ) {
          // Check if we clicked on an annotation highlight by checking the target
          const target = event.target as HTMLElement;
          if (
            target &&
            target.classList &&
            target.classList.contains("annotation-highlight")
          ) {
            return; // Let the iframe handle annotation clicks
          }

          handleTextSelection(event);
        }
      }
    };

    const handleMainDocumentContextMenu = (event: MouseEvent) => {
      // Only handle if we're right-clicking inside the iframe area
      if (iframeRef.current) {
        const iframeRect = iframeRef.current.getBoundingClientRect();

        if (
          event.clientX >= iframeRect.left &&
          event.clientX <= iframeRect.right &&
          event.clientY >= iframeRect.top &&
          event.clientY <= iframeRect.bottom
        ) {
          handleContextMenu(event);
        }
      }
    };

    const handleMainDocumentClick = () => {
      setContextMenu(null);
    };

    const handleMainDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        setShowAnnotationCard(null);
      }
    };

    // Handle messages from iframe
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message:", event.data);

      if (event.data && event.data.type === "iframe-selection") {
        setSelectedText(event.data.selection);
        setContextMenu({
          x: event.data.x,
          y: event.data.y,
          text: event.data.selection,
        });

        // Store position data for annotation creation
        if (
          event.data.startPosition !== undefined &&
          event.data.endPosition !== undefined
        ) {
          console.log("Position data received:", {
            start: event.data.startPosition,
            end: event.data.endPosition,
          });
          // Store position data in sessionStorage for annotation creation
          sessionStorage.setItem(
            "annotationPositionData",
            JSON.stringify({
              startPosition: event.data.startPosition,
              endPosition: event.data.endPosition,
            })
          );
        }
      } else if (event.data && event.data.type === "show-annotation") {
        console.log(
          "Show annotation message received for ID:",
          event.data.annotationId
        );
        console.log("Current annotations:", annotations);

        const annotation = annotations.find(
          (a) => a.id === event.data.annotationId
        );

        console.log("Found annotation:", annotation);

        if (annotation) {
          console.log("Setting showAnnotationCard to:", annotation);
          setShowAnnotationCard(annotation);
          console.log("Annotation card should be shown");
        } else {
          console.warn(
            "Annotation not found in local state, ID:",
            event.data.annotationId
          );
          console.warn(
            "Available annotation IDs:",
            annotations.map((a) => a.id)
          );
        }
      }
    };

    // Add listeners to main document
    document.addEventListener("mouseup", handleMainDocumentMouseUp);
    document.addEventListener("contextmenu", handleMainDocumentContextMenu);
    document.addEventListener("click", handleMainDocumentClick);
    document.addEventListener("keydown", handleMainDocumentKeyDown);
    window.addEventListener("message", handleMessage);

    return () => {
      document.removeEventListener("mouseup", handleMainDocumentMouseUp);
      document.removeEventListener(
        "contextmenu",
        handleMainDocumentContextMenu
      );
      document.removeEventListener("click", handleMainDocumentClick);
      document.removeEventListener("keydown", handleMainDocumentKeyDown);
      window.removeEventListener("message", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]); // handleTextSelection and handleContextMenu are defined below and are stable

  const handleTextSelection = useCallback((event: MouseEvent) => {
    console.log("handleTextSelection called", event);

    // Try to get selection from iframe document first
    let selection: Selection | null = null;
    let selectedText = "";

    try {
      if (iframeRef.current) {
        const iframeDoc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          selection = iframeDoc.getSelection();
          console.log("Iframe selection:", selection?.toString());
        }
      }
    } catch (error) {
      console.log("Could not access iframe selection:", error);
    }

    // Fallback to main window selection
    if (!selection || !selection.toString().trim()) {
      selection = window.getSelection();
      console.log("Main window selection:", selection?.toString());
    }

    if (!selection || selection.toString().trim() === "") {
      setContextMenu(null);
      return;
    }

    selectedText = selection.toString().trim();
    if (selectedText) {
      console.log("Setting context menu with text:", selectedText);
      setSelectedText(selectedText);
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        text: selectedText,
      });
    }
  }, []);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    console.log("handleContextMenu called", event);
    event.preventDefault();

    // Try to get selection from iframe document first
    let selection: Selection | null = null;
    let selectedText = "";

    try {
      if (iframeRef.current) {
        const iframeDoc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          selection = iframeDoc.getSelection();
          console.log("Iframe context menu selection:", selection?.toString());
        }
      }
    } catch (error) {
      console.log("Could not access iframe selection for context menu:", error);
    }

    // Fallback to main window selection
    if (!selection || !selection.toString().trim()) {
      selection = window.getSelection();
      console.log("Main window context menu selection:", selection?.toString());
    }

    if (!selection || selection.toString().trim() === "") {
      setContextMenu(null);
      return;
    }

    selectedText = selection.toString().trim();
    if (selectedText) {
      console.log(
        "Setting context menu from right-click with text:",
        selectedText
      );
      setSelectedText(selectedText);
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        text: selectedText,
      });
    }
  }, []);

  const handleCreateAnnotation = useCallback(() => {
    setShowAnnotationDialog(true);
    setContextMenu(null);
  }, []);

  const handleAnnotationSubmit = useCallback(
    async (annotationData: TextSelectionAnnotationData) => {
      if (!user?.id) return;

      try {
        // Get position data if available
        let positionData: { startPosition?: number; endPosition?: number } = {};
        try {
          const storedPositionData = sessionStorage.getItem(
            "annotationPositionData"
          );
          if (storedPositionData) {
            positionData = JSON.parse(storedPositionData);
            sessionStorage.removeItem("annotationPositionData"); // Clean up
          }
        } catch (error) {
          console.warn("Failed to parse position data:", error);
        }

        // Create annotation object
        const annotation = {
          id: crypto.randomUUID(),
          title: annotationData.comment,
          data: {
            ...annotationData,
            start_position: positionData.startPosition,
            end_position: positionData.endPosition,
          },
          user_id: user.id,
          parent_resource_type: "webpage",
          parent_resource_id: currentUrl,
        };

        // Save to database
        await saveAnnotation(annotation);

        // Immediately add to local annotations state for optimistic update
        setAnnotations((prevAnnotations) => [...prevAnnotations, annotation]);

        // Also save to scene graph if available
        if (currentSceneGraph) {
          const graph = currentSceneGraph.getGraph();
          const annotationNode = graph.createNode({
            id: annotation.id,
            type: "annotation",
            label: annotation.title,
            position: { x: 0, y: 0, z: 0 },
            userData: {
              annotationData: annotationData,
              annotation: annotation,
            },
          });

          // Create webpage node if it doesn't exist
          const webpageNode = graph.createNodeIfMissing(currentUrl, {
            id: currentUrl,
            type: "webpage",
            label: currentTitle,
            position: { x: 0, y: 0, z: 0 },
          });

          // Create edge between annotation and webpage
          graph.createEdge(annotationNode.getId(), webpageNode.getId(), {
            type: "annotation-parent",
          });

          // Notify graph change
          currentSceneGraph.notifyGraphChanged();
        }

        // Show success notification
        addNotification({
          message: `Annotation created successfully from "${currentTitle}"`,
          type: "success",
          duration: 3000,
        });

        // Reload annotations to get the latest from server (optional, but ensures consistency)
        setTimeout(() => {
          loadAnnotations();
        }, 100);
      } catch (error) {
        console.error("Failed to create annotation:", error);
        addNotification({
          message: `Failed to create annotation: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "error",
          duration: 5000,
        });
      }
    },
    [currentUrl, currentTitle, user?.id, currentSceneGraph, loadAnnotations]
  );

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(selectedText);
    setContextMenu(null);
  }, [selectedText]);

  const handleSearchGoogle = useCallback(() => {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`,
      "_blank"
    );
    setContextMenu(null);
  }, [selectedText]);

  // Initialize component from props or URL parameters
  useEffect(() => {
    // Get resourceId from props or URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resourceIdFromParams = urlParams.get("resourceId");
    const urlFromParams = urlParams.get("url");
    const titleFromParams = urlParams.get("title");

    const finalResourceId = resourceId || resourceIdFromParams;
    const finalUrl =
      url || urlFromParams ? decodeURIComponent(urlFromParams!) : "";
    const finalTitle =
      title || titleFromParams ? decodeURIComponent(titleFromParams!) : "";

    // Set initial state
    setCurrentUrl(finalUrl);
    setCurrentTitle(finalTitle);

    // Don't change document.title for iframe-based viewer

    console.log("HtmlPageViewer - Debug:", {
      finalResourceId,
      hasCached: finalResourceId ? hasValidContent(finalResourceId) : false,
      loadedResourceId,
      html: html ? html.length : 0,
      tabId,
    });

    // Check if we have cached content first
    if (finalResourceId) {
      // Skip if we've already processed this resourceId in this render cycle
      if (processedResourceIds.current.has(finalResourceId)) {
        return;
      }

      const cachedContent = getContent(finalResourceId);
      if (cachedContent && hasValidContent(finalResourceId)) {
        console.log("Using cached content for resourceId:", finalResourceId);
        console.log("Setting HTML content, length:", cachedContent.html.length);
        console.log(
          "Current processed HTML length:",
          currentHtmlContent.length
        );
        console.log("Has highlighted content:", hasHighlightedContent.current);

        // Always load raw content from store, process when annotations are available
        console.log(
          "Loading raw content from store, will process when annotations load"
        );
        setHtmlWithDebug(cachedContent.html);
        setCurrentUrl(cachedContent.url);
        setCurrentTitle(cachedContent.title);
        setLoadedResourceId(finalResourceId);
        setContentHash(`${finalResourceId}-0-false`);
        setLoading(false);
        setError(null);
        processedResourceIds.current.add(finalResourceId);

        // Don't set content immediately - let the processing effect handle it
        // This ensures we wait for annotations to be available before setting content
        return; // Exit early to prevent any flickering
      } else if (loadedResourceId !== finalResourceId) {
        console.log("Fetching from server for resourceId:", finalResourceId);
        setLoading(true); // Only set loading to true if we need to fetch
        fetchWebpageContent(finalResourceId);
        processedResourceIds.current.add(finalResourceId);
      } else if (loadedResourceId === finalResourceId && html) {
        // Content is already loaded for this resourceId, just ensure loading is false
        setLoading(false);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resourceId,
    url,
    title,
    loadedResourceId,
    hasValidContent,
    html,
    tabId,
    getContent,
    fetchWebpageContent,
  ]); // currentHtmlContent.length and setHtmlWithDebug are derived/stable - intentionally omitted

  // Component lifecycle debugging
  useEffect(() => {
    console.log("HtmlPageViewer mounted");
    // Capture the ref value at mount time
    const currentProcessedIds = processedResourceIds.current;

    // Set favicon for HTML page viewer tabs
    const setFavicon = () => {
      const link = document.querySelector(
        "link[rel*='icon']"
      ) as HTMLLinkElement;
      if (link) {
        link.href = "/favicon-simple.svg";
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.type = "image/svg+xml";
        newLink.href = "/favicon-simple.svg";
        document.head.appendChild(newLink);
      }
    };

    setFavicon();

    return () => {
      console.log("HtmlPageViewer unmounted");
      // Reset favicon to default when component unmounts
      const link = document.querySelector(
        "link[rel*='icon']"
      ) as HTMLLinkElement;
      if (link) {
        link.href = "/favicon-simple.svg";
      }
      // Clear processed resourceIds using the captured value
      currentProcessedIds.clear();
    };
  }, []);

  // Load annotations when currentUrl changes
  useEffect(() => {
    if (currentUrl && user?.id) {
      loadAnnotations();
    }
  }, [currentUrl, user?.id, loadAnnotations]);

  const handleRefresh = () => {
    if (loadedResourceId) {
      // Clear the cache for this resource and refetch
      const { clearContent } = useHtmlPageViewerStore.getState();
      clearContent(loadedResourceId);
      fetchWebpageContent(loadedResourceId);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(currentUrl, "_blank");
  };

  const handleGoBack = () => {
    onClose?.();
  };

  // Drag and resize handlers
  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize") => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "drag") {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - cardPosition.x,
        y: e.clientY - cardPosition.y,
      });
    } else {
      setIsResizing(true);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Constrain position to keep card within viewport
        const constrainedX = Math.max(
          0,
          Math.min(newX, viewportWidth - cardSize.width)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, viewportHeight - cardSize.height)
        );

        setCardPosition({
          x: constrainedX,
          y: constrainedY,
        });
      } else if (isResizing) {
        // Calculate new size
        const newWidth = Math.max(350, e.clientX - cardPosition.x);
        const newHeight = Math.max(250, e.clientY - cardPosition.y);

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Constrain size to fit within viewport
        const constrainedWidth = Math.min(
          newWidth,
          viewportWidth - cardPosition.x
        );
        const constrainedHeight = Math.min(
          newHeight,
          viewportHeight - cardPosition.y
        );

        setCardSize({
          width: constrainedWidth,
          height: constrainedHeight,
        });
      }
    },
    [isDragging, isResizing, dragOffset, cardPosition, cardSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners for drag/resize
  useEffect(() => {
    if (isDragging || isResizing) {
      // Prevent iframe events from interfering
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.style.pointerEvents = "none";
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // Re-enable iframe events
        if (iframe) {
          iframe.style.pointerEvents = "auto";
        }
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Only show loading if we're actually loading and don't have content yet
  if (loading && !html) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <RefreshCw
            size={24}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p style={{ marginTop: "8px" }}>Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: theme.colors.error, marginBottom: "16px" }}>
            {error}
          </p>
          <button
            onClick={handleRefresh}
            style={{
              padding: "8px 16px",
              backgroundColor: theme.colors.primary,
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "6px 16px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleGoBack}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {currentTitle || title || currentUrl}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Annotation Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              style={{
                fontSize: "12px",
                color: showAnnotations ? "#0078d4" : "#666",
                cursor: "pointer",
                userSelect: "none",
                fontWeight: "500",
                padding: "4px 8px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease",
                lineHeight: "1",
              }}
            >
              <input
                type="checkbox"
                checked={showAnnotations}
                onChange={(e) => setShowAnnotations(e.target.checked)}
                style={{
                  cursor: "pointer",
                  width: "12px",
                  height: "12px",
                  accentColor: "#0078d4",
                  margin: "0 4px 0 0",
                  padding: "0",
                  transform: "translateY(1px)",
                }}
              />
              Annotations
            </label>
          </div>

          <button
            onClick={handleRefresh}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleOpenInNewTab}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Content - Isolated iframe */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "0",
          backgroundColor: "white",
        }}
      >
        {currentHtmlContent && (
          <iframe
            ref={iframeRef}
            srcDoc={currentHtmlContent}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "white",
            }}
            title={currentTitle || title || "HTML Content"}
            sandbox="allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
            data-debug={`hash:${contentHash}`}
          />
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 10000,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            padding: "4px",
            minWidth: "160px",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              fontSize: "12px",
              color: theme.colors.textMuted,
              borderBottom: `1px solid ${theme.colors.border}`,
              marginBottom: "4px",
            }}
          >
            &ldquo;
            {contextMenu.text.length > 50
              ? contextMenu.text.substring(0, 50) + "..."
              : contextMenu.text}
            &rdquo;
          </div>

          <button
            onClick={handleCreateAnnotation}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: theme.colors.text,
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <MessageSquare size={16} />
            Create Annotation
          </button>

          <button
            onClick={handleCopyText}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: theme.colors.text,
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Tag size={16} />
            Copy Text
          </button>

          <button
            onClick={handleSearchGoogle}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: theme.colors.text,
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ExternalLink size={16} />
            Search Google
          </button>
        </div>
      )}

      {/* Annotation Dialog */}
      <AnnotationDialog
        isOpen={showAnnotationDialog}
        onClose={() => setShowAnnotationDialog(false)}
        onSubmit={handleAnnotationSubmit}
        selectedText={selectedText}
        pageUrl={currentUrl}
        pageTitle={currentTitle}
      />

      {/* Annotation Card */}
      {showAnnotationCard && (
        <div
          style={{
            position: "fixed",
            top: cardPosition.y,
            left: cardPosition.x,
            width: cardSize.width,
            height: cardSize.height,
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #0078d4",
            boxShadow:
              "0 4px 12px rgba(0, 120, 212, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
            zIndex: 10004,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          {/* Title Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 8px",
              borderBottom: "1px solid #0078d4",
              backgroundColor: "#0078d4",
              cursor: "move",
              height: "24px",
            }}
            onMouseDown={(e) => handleMouseDown(e, "drag")}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#ffffff",
                fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              Annotation Details
            </div>
            <button
              onClick={() => setShowAnnotationCard(null)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                width: "16px",
                height: "16px",
                color: "#ffffff",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#ff0000";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              ×
            </button>
          </div>

          {/* Content Area */}
          <div
            style={{
              flex: 1,
              padding: "8px",
              overflow: "auto",
              backgroundColor: "#ffffff",
            }}
          >
            <EditableAnnotationCard
              annotation={showAnnotationCard}
              compact={true}
              onUpdate={(updatedAnnotation: Annotation) => {
                // Update the annotation in the local state
                setAnnotations((prevAnnotations) =>
                  prevAnnotations.map((ann) =>
                    ann.id === updatedAnnotation.id ? updatedAnnotation : ann
                  )
                );
                // Update the displayed annotation card
                setShowAnnotationCard(updatedAnnotation);
              }}
              style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Resize handle */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              width: "24px",
              height: "24px",
              cursor: "nw-resize",
              backgroundColor: "transparent",
              zIndex: 10003,
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                width: "12px",
                height: "12px",
                backgroundColor: "#0078d4",
                borderTop: "1px solid #ffffff",
                borderLeft: "1px solid #ffffff",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlPageViewer;
