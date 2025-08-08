import { FileText } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface PdfJsViewerProps {
  url?: string;
  documentId?: string; // New prop to load PDF from Supabase
  title?: string;
  initialPage?: number;
  initialScale?: number;
  onTextSelection?: (selectedText: string, pageNumber: number) => void;
  onPageChange?: (pageNumber: number) => void;
}

const PdfJsViewer: React.FC<PdfJsViewerProps> = ({
  url,
  documentId,
  title: _title, // Prefix with underscore to indicate intentionally unused
  // initialPage = 1,
  // initialScale = 1.0,
  // onTextSelection,
  // onPageChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingFromSupabase, setIsLoadingFromSupabase] = useState(false);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const downloadedUrls = useRef<Set<string>>(new Set());
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  // Track instance creation
  useEffect(() => {
    if (!(window as any).__pdfViewerInstanceCount) {
      (window as any).__pdfViewerInstanceCount = 0;
    }
    (window as any).__pdfViewerInstanceCount++;
    console.log(
      `[PdfViewer-${instanceId.current}] Instance created. Total instances: ${(window as any).__pdfViewerInstanceCount}`
    );

    return () => {
      (window as any).__pdfViewerInstanceCount--;
      console.log(
        `[PdfViewer-${instanceId.current}] Instance destroyed. Remaining instances: ${(window as any).__pdfViewerInstanceCount}`
      );
    };
  }, []);

  // Helper function to check if a URL is external
  const isExternalUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  // Download PDF from external URL and create blob URL
  const downloadPdf = useCallback(async (pdfUrl: string): Promise<string> => {
    // Prevent infinite loops - check if we've already tried this URL
    if (downloadedUrls.current.has(pdfUrl)) {
      throw new Error("URL already being processed to prevent infinite loop");
    }

    downloadedUrls.current.add(pdfUrl);
    setIsDownloading(true);

    try {
      let response: Response;

      // Try direct fetch first (for URLs that allow CORS)
      try {
        response = await fetch(pdfUrl, {
          mode: "cors",
          credentials: "omit",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (corsError) {
        console.log("Direct fetch failed, trying proxy:", corsError);

        // Fall back to proxy for CORS-blocked URLs
        const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;
        response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`Proxy fetch failed! status: ${response.status}`);
        }
      }

      // Verify content type
      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.includes("application/pdf")) {
        throw new Error("URL does not point to a PDF file");
      }

      // Create blob from response
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    } finally {
      setIsDownloading(false);
      // Remove from set after a delay to allow for retries but prevent immediate loops
      setTimeout(() => {
        downloadedUrls.current.delete(pdfUrl);
      }, 5000);
    }
  }, []);

  // Load PDF from Supabase using documentId
  const loadPdfFromSupabase = useCallback(
    async (docId: string): Promise<string> => {
      setIsLoadingFromSupabase(true);

      try {
        console.log("Loading PDF from Supabase with document ID:", docId);

        // Import the API functions
        const { getPdfDocumentData, getDocument } = await import(
          "../../api/documentsApi"
        );

        // Get document metadata first to set the title
        const document = await getDocument(docId);
        console.log("Retrieved document metadata:", document);

        // Set the document title
        setDocumentTitle(document.title);

        // Get PDF data from Supabase
        const { blob } = await getPdfDocumentData(docId);

        // Create blob URL
        const blobUrl = URL.createObjectURL(blob);
        console.log("PDF loaded from Supabase, created blob URL");

        return blobUrl;
      } catch (error) {
        console.error("Error loading PDF from Supabase:", error);
        throw error;
      } finally {
        setIsLoadingFromSupabase(false);
      }
    },
    []
  );

  // Construct the PDF.js viewer URL with parameters
  const getViewerUrl = useCallback(() => {
    const baseUrl = "/pdfjs/web/viewer.html";
    const params = new URLSearchParams();

    // Use blob URL if available, otherwise use the original URL
    const fileUrl = blobUrl || url;
    if (fileUrl) {
      params.append("file", fileUrl);
      return `${baseUrl}?${params.toString()}`;
    }

    // Return null if no file URL is available - prevents loading default PDF
    return null;
  }, [blobUrl, url]);

  // Handle PDF URL changes and downloading, or load from Supabase
  useEffect(() => {
    let mounted = true;

    const handlePdfLoad = async () => {
      setLoading(true);
      setError(null);
      setBlobUrl(null);

      try {
        // Priority: documentId > url
        if (documentId) {
          console.log(
            "Loading PDF from Supabase with document ID:",
            documentId
          );
          const supabaseBlobUrl = await loadPdfFromSupabase(documentId);

          if (mounted) {
            setBlobUrl(supabaseBlobUrl);
            console.log("PDF loaded from Supabase and blob URL created");
          } else {
            // Component unmounted, clean up blob URL
            URL.revokeObjectURL(supabaseBlobUrl);
          }
        } else if (url) {
          // If it's an external URL, download it first
          if (isExternalUrl(url)) {
            console.log("External URL detected, downloading PDF:", url);
            const downloadedBlobUrl = await downloadPdf(url);

            if (mounted) {
              setBlobUrl(downloadedBlobUrl);
              console.log("PDF downloaded and blob URL created");
            } else {
              // Component unmounted, clean up blob URL
              URL.revokeObjectURL(downloadedBlobUrl);
            }
          } else {
            console.log("Local URL detected:", url);
            // For local URLs, use them directly
            setBlobUrl(null);
          }
        } else {
          // No URL or documentId provided, use default
          console.log("No URL or documentId provided, using default PDF");
          // You can set a default PDF URL here if needed
          setBlobUrl(null);
        }
      } catch (error) {
        console.error("Error handling PDF:", error);
        if (mounted) {
          setError(
            error instanceof Error ? error.message : "Failed to load PDF"
          );
        }
      }
    };

    handlePdfLoad();

    return () => {
      mounted = false;
    };
  }, [url, documentId, downloadPdf, loadPdfFromSupabase]);

  // Update tab title when document title is loaded
  useEffect(() => {
    if (documentTitle) {
      console.log("PDF document title loaded:", documentTitle);
      // Note: The app-shell should handle tab title updates based on props
      // The documentTitle state will be used for display purposes
    }
  }, [documentTitle]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setLoading(false);
    console.log("PDF.js viewer iframe loaded");
    console.log("Viewer URL:", getViewerUrl());

    // Pass document context to iframe
    if (iframeRef.current?.contentWindow) {
      // Wait a bit for iframe to load completely
      setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              action: "setDocumentContext",
              documentId: documentId || null,
              title: documentTitle || _title || "PDF Document",
            },
            "*"
          );
        }
      }, 1000);
    }

    // Set up message handler for PDF save requests
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.action === "savePdfToSupabase") {
        console.log(
          `[PdfViewer-${instanceId.current}] Processing save request (requestId: ${event.data.requestId})`
        );

        // Check if this message is already being handled by another instance
        if ((window as any).__pdfSaveInProgress) {
          console.log(
            `[PdfViewer-${instanceId.current}] Save already in progress globally (current: ${(window as any).__pdfSaveInProgress}), ignoring requestId: ${event.data.requestId}`
          );
          return;
        }

        // Prevent duplicate saves
        if (isSaving) {
          console.log(
            `[PdfViewer-${instanceId.current}] Save already in progress locally, ignoring`
          );
          return;
        }

        // Set global flag to prevent other instances from processing
        (window as any).__pdfSaveInProgress = event.data.requestId;
        console.log(
          `[PdfViewer-${instanceId.current}] Set global flag to requestId: ${event.data.requestId}`
        );

        setIsSaving(true);

        try {
          console.log(
            `[PdfViewer-${instanceId.current}] Received PDF save request from iframe (requestId: ${event.data.requestId}):`,
            event.data
          );
          console.log(
            `[PdfViewer-${instanceId.current}] Document ID from message:`,
            event.data.documentId
          );
          console.log(
            `[PdfViewer-${instanceId.current}] Document ID from component:`,
            documentId
          );

          // Import the API functions
          const { savePdfDocument, updateDocument } = await import(
            "../../api/documentsApi"
          );

          // Convert base64 back to blob
          const binaryString = atob(event.data.pdfData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const pdfBlob = new Blob([bytes], { type: "application/pdf" });

          let savedDocument;

          // Use document ID from the message (preferred) or component prop as fallback
          const targetDocumentId = event.data.documentId || documentId;

          // If we have a documentId, update the existing document
          if (targetDocumentId) {
            console.log(
              "TAKING UPDATE PATH - Updating existing PDF document with ID:",
              targetDocumentId
            );

            // Convert blob to base64 for storage
            const reader = new FileReader();
            const base64Data = await new Promise<string>((resolve, reject) => {
              reader.onload = () => {
                const result = reader.result as string;
                // Remove the data URL prefix to get just the base64 data
                const base64 = result.split(",")[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(pdfBlob);
            });

            // Structure the data the same way as savePdfDocument
            const pdfData = {
              base64: base64Data,
              size: pdfBlob.size,
              type: pdfBlob.type || "application/pdf",
              originalUrl: event.data.originalUrl,
              savedAt: new Date().toISOString(),
            };

            console.log("Calling updateDocument with ID:", targetDocumentId);
            savedDocument = await updateDocument({
              id: targetDocumentId,
              title: event.data.title,
              data: pdfData,
              metadata: {
                fileSize: pdfBlob.size,
                mimeType: pdfBlob.type || "application/pdf",
                originalUrl: event.data.originalUrl,
              },
            });
            console.log("updateDocument completed successfully");
          } else {
            // Create new document if no documentId
            console.log(
              "TAKING CREATE PATH - Creating new PDF document, no documentId available"
            );
            console.log("event.data.documentId:", event.data.documentId);
            console.log("component documentId:", documentId);
            savedDocument = await savePdfDocument({
              title: event.data.title,
              pdfBlob,
              url: event.data.originalUrl,
              // TODO: Get actual project ID from context if needed
              projectId: undefined,
            });
          }

          console.log(
            `[PdfViewer-${instanceId.current}] PDF saved successfully (requestId: ${event.data.requestId}):`,
            savedDocument
          );

          // Send success response back to iframe
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                action: "savePdfToSupabaseResponse",
                success: true,
                document: savedDocument,
              },
              "*"
            );
          }
        } catch (error) {
          console.error("Error saving PDF:", error);

          // Send error response back to iframe
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                action: "savePdfToSupabaseResponse",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              },
              "*"
            );
          }
        } finally {
          // Always reset saving state
          setIsSaving(false);
          // Clear global flag
          const completedRequestId = (window as any).__pdfSaveInProgress;
          (window as any).__pdfSaveInProgress = false;
          console.log(
            `[PdfViewer-${instanceId.current}] Save operation completed, clearing global flag for requestId: ${completedRequestId}`
          );
        }
      }
    };

    // Remove any existing message handler
    if (messageHandlerRef.current) {
      console.log(
        `[PdfViewer-${instanceId.current}] Removing existing message handler`
      );
      window.removeEventListener("message", messageHandlerRef.current);
    }

    // Add new message listener
    console.log(`[PdfViewer-${instanceId.current}] Adding new message handler`);
    window.addEventListener("message", handleMessage);

    // Store the handler reference for cleanup
    messageHandlerRef.current = handleMessage;
    (iframeRef.current as any)._messageHandler = handleMessage;
  };

  // Handle iframe error
  const handleIframeError = () => {
    setError("Failed to load PDF viewer");
    setLoading(false);
  };

  // Cleanup blob URLs and message handlers on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      // Cleanup message handler
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, [blobUrl]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <FileText className="mx-auto h-12 w-12 mb-4 text-red-400" />
          <p className="font-semibold">Error loading PDF</p>
          <p className="text-sm mt-1 max-w-md mx-auto">{error}</p>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setBlobUrl(null);
                downloadedUrls.current.clear();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            {url && isExternalUrl(url) && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Open Original
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full relative"
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      {/* PDF.js Viewer iframe */}
      <div className="w-full h-full" style={{ width: "100%", height: "100%" }}>
        {(loading ||
          isDownloading ||
          isLoadingFromSupabase ||
          !getViewerUrl()) && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="text-center max-w-md mx-auto px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-xl text-gray-800">Loading...</h3>
            </div>
          </div>
        )}

        {getViewerUrl() && (
          <iframe
            ref={iframeRef}
            src={getViewerUrl()!}
            className="w-full h-full border-0"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              border: "none",
            }}
            title="PDF Viewer"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
          />
        )}
      </div>
    </div>
  );
};

export default PdfJsViewer;
