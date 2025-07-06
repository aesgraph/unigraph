/**
 * Utility function to replace Unigraph Vercel URLs with localhost when running locally
 * @param html HTML content that may contain unigraph.vercel.app links
 * @returns Updated HTML with appropriate URLs
 */
export function replaceUnigraphUrlsWithLocalhost(html: string): string {
  // Check if we're running locally by examining the current hostname
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isLocalhost) {
    // No need to replace if we're not running locally
    return html;
  }

  // Replace all occurrences of unigraph.vercel.app with localhost:3000
  return html.replace(
    /(href|src)=["'](https?:\/\/unigraph\.vercel\.app)([^"']*)["']/gi,
    '$1="http://localhost:3000$3"'
  );
}

/**
 * Returns the appropriate base URL for Unigraph based on the current environment
 * @returns Base URL for Unigraph (either localhost:3000 or unigraph.vercel.app)
 */
export function getUnigraphBaseUrl(): string {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  return isLocalhost ? "http://localhost:3000" : "https://unigraph.vercel.app";
}

/**
 * Fixes relative Wikipedia links in HTML content to make them work in iframes/embeds
 * @param html HTML content from Wikipedia API
 * @param language Wikipedia language code (e.g., 'en')
 * @returns HTML with fixed Wikipedia links
 */
export function fixWikipediaLinks(
  html: string,
  language: string = "en"
): string {
  const baseUrl = `https://${language}.wikipedia.org`;

  // Fix relative URLs in href and src attributes
  return (
    html
      // Fix links to Wikipedia articles (convert /wiki/Article to full URL)
      .replace(/href=["']\/wiki\/([^"']*)["']/gi, `href="${baseUrl}/wiki/$1"`)

      // Fix links to special pages
      .replace(/href=["']\/(w\/[^"']*)["']/gi, `href="${baseUrl}/$1"`)

      // Fix image sources
      .replace(
        /src=["']\/\/(upload\.wikimedia\.org[^"']*)["']/gi,
        `src="https://$1"`
      )

      // Fix other relative sources
      .replace(/src=["']\/([^"']*)["']/gi, `src="${baseUrl}/$1"`)

      // Add target="_blank" to all external links to open in new tab
      .replace(/<a([^>]*href=["'][^"']*["'][^>]*)>/gi, '<a$1 target="_blank">')
  );
}
