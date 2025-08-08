/**
 * Extracts the first image source from markdown content
 * @param markdown The markdown content to parse
 * @returns The URL of the first image found, or null if no image is found
 */
export function extractFirstImageSrc(markdown: string): string | null {
  // Match standard markdown image syntax: ![alt](url)
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
  // Match HTML img tags: <img src="url" />
  const htmlImageRegex = /<img.*?src=["'](.*?)["'].*?>/;

  const markdownMatch = markdown.match(markdownImageRegex);
  const htmlMatch = markdown.match(htmlImageRegex);

  // Return the first match found
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  } else if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }

  return null;
}

/**
 * Removes the first image from markdown content
 * @param markdown The markdown content to modify
 * @returns The markdown content without the first image
 */
export function removeFirstImage(markdown: string): string {
  // Match standard markdown image syntax: ![alt](url)
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
  // Match HTML img tags: <img src="url" />
  const htmlImageRegex = /<img.*?src=["'].*?["'].*?>/;

  // Check which pattern matches first in the content
  const markdownMatch = markdown.match(markdownImageRegex);
  const htmlMatch = markdown.match(htmlImageRegex);

  if (!markdownMatch && !htmlMatch) {
    return markdown; // No images found
  }

  if (markdownMatch && htmlMatch) {
    // Find which pattern appears first in the content
    const markdownIndex = markdown.indexOf(markdownMatch[0]);
    const htmlIndex = markdown.indexOf(htmlMatch[0]);

    if (markdownIndex < htmlIndex && markdownIndex !== -1) {
      return markdown.replace(markdownMatch[0], "").trim();
    } else {
      return markdown.replace(htmlMatch[0], "").trim();
    }
  } else if (markdownMatch) {
    return markdown.replace(markdownMatch[0], "").trim();
  } else if (htmlMatch) {
    return markdown.replace(htmlMatch[0], "").trim();
  }

  return markdown;
}
