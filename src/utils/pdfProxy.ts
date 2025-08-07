/**
 * Utility functions for handling PDF loading with CORS bypass
 */

/**
 * Fetches a PDF from an external URL and returns it as a blob URL
 * This bypasses CORS restrictions by fetching through the browser
 */
export async function fetchPdfAsBlob(url: string): Promise<string> {
  try {
    console.log("Attempting to fetch PDF via proxy:", url);

    // Try multiple proxy services as fallbacks
    const proxyServices = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    let lastError: Error | null = null;

    for (const proxyUrl of proxyServices) {
      try {
        console.log("Trying proxy:", proxyUrl);

        const response = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Accept: "application/pdf",
            "User-Agent": "Mozilla/5.0 (compatible; PDF Viewer)",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        console.log("Response content-type:", contentType);

        const blob = await response.blob();

        // Ensure the blob is treated as a PDF
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(pdfBlob);

        console.log("Successfully created blob URL:", blobUrl);
        return blobUrl;
      } catch (error) {
        console.warn(`Proxy failed: ${proxyUrl}`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // If all proxies fail, try direct fetch (might work in some cases)
    try {
      console.log("Trying direct fetch as fallback...");
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      return URL.createObjectURL(pdfBlob);
    } catch (directError) {
      console.warn("Direct fetch also failed:", directError);
    }

    throw lastError || new Error("All proxy attempts failed");
  } catch (error) {
    console.error("Error fetching PDF via proxy:", error);
    throw error;
  }
}

/**
 * Determines if a URL is external (cross-origin)
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const currentOrigin = window.location.origin;
    return urlObj.origin !== currentOrigin;
  } catch {
    // If URL parsing fails, assume it's a relative URL (not external)
    return false;
  }
}

/**
 * Processes a PDF URL, converting external URLs to blob URLs if needed
 */
export async function processPdfUrl(url: string): Promise<string> {
  if (isExternalUrl(url)) {
    console.log("External PDF URL detected, using proxy:", url);
    return await fetchPdfAsBlob(url);
  }
  console.log("Local PDF URL, using directly:", url);
  return url;
}

/**
 * Cleans up blob URLs to prevent memory leaks
 */
export function cleanupBlobUrl(blobUrl: string): void {
  if (blobUrl.startsWith("blob:")) {
    URL.revokeObjectURL(blobUrl);
    console.log("Cleaned up blob URL:", blobUrl);
  }
}
