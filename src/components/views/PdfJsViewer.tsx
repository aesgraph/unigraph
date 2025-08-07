import { FileText } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface PdfJsViewerProps {
  url?: string;
  title?: string;
  initialPage?: number;
  initialScale?: number;
  onTextSelection?: (selectedText: string, pageNumber: number) => void;
  onPageChange?: (pageNumber: number) => void;
}

const PdfJsViewer: React.FC<PdfJsViewerProps> = ({
  // url = "/test2.pdf",
  //url = "https://arxiv.org/pdf/1307.5461", // Quantum hyperbolic geometry in loop quantum gravity
  url = "https://arxiv.org/pdf/2501.00089",
  // title = "Quantum hyperbolic geometry in loop quantum gravity with cosmological constant",
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
  const downloadedUrls = useRef<Set<string>>(new Set());

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

    return baseUrl;
  }, [blobUrl, url]);

  // Handle PDF URL changes and downloading
  useEffect(() => {
    let mounted = true;

    const handleUrlChange = async () => {
      if (!url) return;

      setLoading(true);
      setError(null);
      setBlobUrl(null);

      try {
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
      } catch (error) {
        console.error("Error handling PDF URL:", error);
        if (mounted) {
          setError(
            error instanceof Error ? error.message : "Failed to load PDF"
          );
        }
      }
    };

    handleUrlChange();

    return () => {
      mounted = false;
    };
  }, [url, downloadPdf]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setLoading(false);
    console.log("PDF.js viewer iframe loaded");
    console.log("Viewer URL:", getViewerUrl());
  };

  // Handle iframe error
  const handleIframeError = () => {
    setError("Failed to load PDF viewer");
    setLoading(false);
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
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
    <div className="h-full w-full" style={{ height: "100%", width: "100%" }}>
      {/* PDF.js Viewer iframe */}
      <div
        className="w-full h-full relative"
        style={{ width: "100%", height: "100%" }}
      >
        {(loading || isDownloading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                {isDownloading ? "Downloading PDF..." : "Loading PDF viewer..."}
              </p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={getViewerUrl()}
          className="w-full h-full border-0"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
          title="PDF Viewer"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  );
};

export default PdfJsViewer;
