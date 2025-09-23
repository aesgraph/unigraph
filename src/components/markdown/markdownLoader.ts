import { FailedLoadTracker } from "../../utils/failedLoadTracker";

// Cache for successful loads to avoid refetching
const markdownCache: Map<string, string> = new Map();

/**
 * Utility to load and parse markdown files from different locations in the project
 */

/**
 * Loads a markdown file from the specified path
 * @param path Path to the markdown file. Can be:
 *             - Absolute path (e.g., "public/storyCardFiles/file.md", "docs/file.md")
 *             - Relative path (e.g., "file.md") - defaults to public/storyCardFiles
 * @returns Promise with the markdown content as a string
 */
export async function loadMarkdownFile(path: string): Promise<string> {
  try {
    // Normalize the path for consistent tracking
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    // Check cache first for instant returns
    if (markdownCache.has(normalizedPath)) {
      return markdownCache.get(normalizedPath)!;
    }

    // Check if this path has already failed to avoid unnecessary network requests
    if (FailedLoadTracker.hasFailed(normalizedPath)) {
      console.warn(`Skipping previously failed path: ${normalizedPath}`);
      return `# File Not Found\n\nThe markdown file at \`${normalizedPath}\` could not be loaded. Please check the path and try again.`;
    }

    // Check if this path is currently being loaded
    if (FailedLoadTracker.isLoading(normalizedPath)) {
      console.log(`Already loading ${normalizedPath}, waiting...`);
      // Return a temporary message while waiting
      return `# Loading...\n\nPlease wait while the content is being loaded.`;
    }

    // Mark this path as currently loading
    FailedLoadTracker.markAsLoading(normalizedPath);

    // Process the path to handle different formats
    let fetchPath = normalizedPath;

    // Handle paths starting with docs/ explicitly
    if (normalizedPath.startsWith("/docs/") || normalizedPath === "/docs") {
      fetchPath = normalizedPath;
    }
    // Handle paths starting with public/
    else if (normalizedPath.startsWith("/public/")) {
      fetchPath = normalizedPath.substring(7); // Remove "public" prefix
    }
    // Default case for relative paths
    else if (
      !normalizedPath.startsWith("/storyCardFiles/") &&
      !normalizedPath.startsWith("/storyCards/")
    ) {
      fetchPath = `/storyCardFiles${normalizedPath}`;
    }

    console.log(`Attempting to load markdown file: ${fetchPath}`);

    // Add .md extension if not present
    if (!fetchPath.endsWith(".md")) {
      fetchPath = `${fetchPath}.md`;
    }

    const response = await fetch(fetchPath);

    if (!response.ok) {
      console.error(
        `Failed to load markdown file: ${fetchPath}, status: ${response.status}`
      );
      // Mark as failed and remove from loading
      FailedLoadTracker.markAsFailed(normalizedPath);
      return `# File Not Found\n\nThe markdown file at \`${normalizedPath}\` could not be loaded. Please check the path and try again.`;
    }

    const content = await response.text();

    // Cache the successful result
    markdownCache.set(normalizedPath, content);

    // Mark as finished loading
    FailedLoadTracker.markAsFinished(normalizedPath);

    return content;
  } catch (error) {
    console.error("Error loading markdown file:", error);
    // Mark as failed in case of any error
    FailedLoadTracker.markAsFailed(path.startsWith("/") ? path : `/${path}`);
    return `# Error Loading File\n\nThere was an error loading the markdown file at \`${path}\`. The file might not exist or there may be a network error.\n\nPlease check the browser console for more details.`;
  }
}
