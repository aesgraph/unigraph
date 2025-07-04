/**
 * Utility to load and parse markdown files from the public directory
 */

/**
 * Loads a markdown file from the public/storyCardFiles directory
 * @param path Path to the markdown file (relative to public/storyCardFiles)
 * @returns Promise with the markdown content as a string
 */
export async function loadMarkdownFile(path: string): Promise<string> {
  try {
    // Normalize the path to prevent duplicate slashes and handle different path formats
    const normalizedPath = path.startsWith("/") ? path.substring(1) : path;

    // Handle both with and without .md extension
    const filePath = normalizedPath.endsWith(".md")
      ? `/storyCardFiles/${normalizedPath}`
      : `/storyCardFiles/${normalizedPath}.md`;

    console.log(`Attempting to load markdown file: ${filePath}`);

    const response = await fetch(filePath);

    if (!response.ok) {
      console.error(
        `Failed to load markdown file: ${filePath}, status: ${response.status}`
      );
      throw new Error(`Failed to load markdown file: ${filePath}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Error loading markdown file:", error);
    return `Error loading markdown file. Please check the browser console for details.`;
  }
}
