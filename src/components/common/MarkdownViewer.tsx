import katex from "katex";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { replaceUnigraphUrlsWithLocalhost } from "../../utils/urlUtils";
import { DefinitionPopup, DefinitionPopupData } from "./DefinitionPopup";
import "./MarkdownViewer.css";

interface MarkdownViewerProps {
  filename: string;
  excerpt?: boolean;
  excerptLength?: number;
  overrideMarkdown?: string; // Add this prop
  imageStyle?: React.CSSProperties; // Add imageStyle prop
}

function MarkdownViewer({
  filename,
  excerpt = false,
  excerptLength = 150,
  overrideMarkdown,
  imageStyle,
}: MarkdownViewerProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<Record<string, string>>({});
  const [activeDefinition, setActiveDefinition] =
    useState<DefinitionPopupData | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const eventHandlersSetupRef = useRef(false);

  // Add post-processing function to apply styles to images
  const applyImageStyles = React.useCallback(
    (htmlContent: string): string => {
      if (!imageStyle) return htmlContent;

      // Convert React style object to inline CSS string
      const styleString = Object.entries(imageStyle)
        .map(([key, value]) => {
          // Convert camelCase to kebab-case (e.g., maxWidth to max-width)
          const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join("; ");

      // Add the style attribute to all img tags
      return htmlContent.replace(
        /<img([^>]*)>/g,
        `<img$1 style="${styleString}">`
      );
    },
    [imageStyle]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Configure marked with proper LaTeX support
    const renderer = {
      code(this: any, codeObj: { text: string; lang?: string }) {
        const { text, lang } = codeObj;
        if (lang === "latex" || lang === "math" || lang === "tex") {
          try {
            const renderedLatex = katex.renderToString(text, {
              displayMode: true,
              throwOnError: false,
            });
            return `<div class="latex-block">${renderedLatex}</div>`;
          } catch (error) {
            console.error("LaTeX rendering error:", error);
            return `<div class="latex-error">LaTeX rendering error: ${error instanceof Error ? error.message : String(error)}</div>`;
          }
        }
        return `<pre><code class="language-${lang}">${text}</code></pre>`;
      },

      // Add custom text renderer to handle term linking
      text(this: any, token: any) {
        // token: Text | Escape
        // This will be populated once we have the terms
        return token.text;
      },
    };

    marked.use({ renderer });

    // Function to parse YAML frontmatter
    const parseFrontmatter = (
      markdown: string
    ): {
      content: string;
      metadata: Record<string, any>;
    } => {
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
      const match = markdown.match(frontmatterRegex);

      if (!match) {
        return { content: markdown, metadata: {} };
      }

      try {
        // Basic YAML parsing (for simple key-value pairs)
        const yamlContent = match[1];
        const metadata: Record<string, any> = {};

        // Parse simple key-value pairs
        yamlContent.split("\n").forEach((line) => {
          const [key, ...valueParts] = line
            .split(":")
            .map((part) => part.trim());
          if (key && valueParts.length) {
            const value = valueParts.join(":").trim();
            metadata[key] = value;
          }
        });

        // Parse terms if they exist
        if (metadata.terms && typeof metadata.terms === "string") {
          try {
            // Format expected: term1: definition1, term2: definition2
            const termsObj: Record<string, string> = {};
            metadata.terms.split(",").forEach((termPair: string) => {
              const [term, definition] = termPair
                .split(":")
                .map((s) => s.trim());
              if (term && definition) {
                termsObj[term] = definition;
              }
            });
            metadata.terms = termsObj;
          } catch (e) {
            console.error("Error parsing terms:", e);
            metadata.terms = {};
          }
        }

        return {
          content: match[2],
          metadata,
        };
      } catch (error) {
        console.error("Error parsing frontmatter:", error);
        return { content: markdown, metadata: {} };
      }
    };

    // Process text to handle inline LaTeX and terms
    const processText = (
      text: string,
      definedTerms: Record<string, string>
    ) => {
      // Handle display equations: $$...$$
      let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
        try {
          return katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
          });
        } catch (error) {
          console.error("Display LaTeX error:", error);
          return `$$${latex}$$`;
        }
      });

      // Handle inline equations: $...$
      processed = processed.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
        try {
          return katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
          });
        } catch (error) {
          console.error("Inline LaTeX error:", error);
          return `$${latex}$`;
        }
      });

      // Process terms for highlighting
      if (Object.keys(definedTerms).length > 0) {
        // Create regex that matches whole words that are defined terms
        const termRegex = new RegExp(
          "\\b(" +
            Object.keys(definedTerms)
              .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
              .join("|") +
            ")\\b",
          "gi"
        );

        processed = processed.replace(termRegex, (match) => {
          const term = match;
          // Create a span with data attributes for the term
          return `<span class="defined-term" data-term="${term}">${term}</span>`;
        });
      }

      return processed;
    };

    // Fix the path construction to handle both docs/ and storyCardFiles/ paths
    const normalizedFilename = filename.startsWith("/")
      ? filename.substring(1)
      : filename;

    let filePath;

    // Check if the path explicitly starts with docs/
    if (normalizedFilename.startsWith("docs/")) {
      // Use the path as is for docs folder
      filePath = `/${normalizedFilename}`;
    }
    // Check if the path explicitly starts with public/
    else if (normalizedFilename.startsWith("public/")) {
      // Strip "public/" prefix for fetching
      filePath = `/${normalizedFilename.substring(7)}`;
    }
    // Default case: use storyCardFiles/ folder
    else {
      filePath = normalizedFilename.endsWith(".md")
        ? `/storyCardFiles/${normalizedFilename}`
        : `/storyCardFiles/${normalizedFilename}.md`;
    }

    console.log(`Attempting to fetch markdown from: ${filePath}`);

    // Track attempted alternate paths to avoid duplicates
    const attemptedPaths = new Set<string>();
    attemptedPaths.add(filePath);

    // Try loading the file or use overrideMarkdown if provided
    (overrideMarkdown
      ? Promise.resolve(overrideMarkdown)
      : (async () => {
          const res = await fetch(filePath);
          if (!res.ok) {
            // Try a limited set of alternates without excessive retries
            let lastError: Error | null = new Error(
              `Initial path ${filePath} failed`
            );

            // Only try these alternates if we haven't already
            const alternates = [];

            // Try docs/ prefix if not already trying
            if (!normalizedFilename.startsWith("docs/")) {
              const docsPath = `/docs/${normalizedFilename}${
                !normalizedFilename.endsWith(".md") ? ".md" : ""
              }`;
              if (!attemptedPaths.has(docsPath)) {
                attemptedPaths.add(docsPath);
                alternates.push(docsPath);
              }
            }

            // Try storyCards/ folder if not the initial path
            const storyCardsPath = `/storyCards/${normalizedFilename}${
              !normalizedFilename.endsWith(".md") ? ".md" : ""
            }`;
            if (!attemptedPaths.has(storyCardsPath)) {
              attemptedPaths.add(storyCardsPath);
              alternates.push(storyCardsPath);
            }

            for (const alternatePath of alternates) {
              console.log(`Trying alternate path: ${alternatePath}`);
              try {
                const altRes = await fetch(alternatePath);
                if (!altRes.ok) {
                  throw new Error(`Failed to load from ${alternatePath}`);
                }
                return await altRes.text();
              } catch (e) {
                lastError = e instanceof Error ? e : new Error(String(e));
                console.error(
                  `Error loading alternate path ${lastError}:`,
                  lastError
                );
              }
            }

            // Final fallback - return a friendly error message as markdown
            console.error(
              `Failed to load markdown from any path for ${filename}`
            );
            return `# File Not Found\n\nThe requested file \`${filename}\` could not be loaded.\n\n**Paths attempted:**\n${Array.from(
              attemptedPaths
            )
              .map((p) => `- \`${p}\``)
              .join("\n")}`;
          }
          return res.text();
        })()
    )
      .then((markdown) => {
        // Parse frontmatter to extract metadata including terms
        const { content, metadata } = parseFrontmatter(markdown);

        // Extract terms from metadata
        const definedTerms: Record<string, string> = metadata.terms || {};
        setTerms(definedTerms);

        // Pre-process markdown for LaTeX and terms
        const processedMarkdown = processText(content, definedTerms);

        // If excerpt is requested, truncate the content
        const finalContent = excerpt
          ? processedMarkdown.split("</td>")[0] + "</td></tr></table>" // Only keep first table row with image
          : processedMarkdown;

        // Parse markdown to HTML using marked
        let parsed: string | Promise<string>;
        try {
          parsed = marked.parse(finalContent);
          if (parsed instanceof Promise) {
            parsed.then((htmlStr) => {
              // Apply image styles and replace Unigraph URLs
              const styledHtml = imageStyle
                ? applyImageStyles(htmlStr)
                : htmlStr;
              const finalHtml = replaceUnigraphUrlsWithLocalhost(styledHtml);
              setHtml(finalHtml);
              setLoading(false);
            });
          } else {
            // Apply image styles and replace Unigraph URLs
            const styledHtml = imageStyle ? applyImageStyles(parsed) : parsed;
            const finalHtml = replaceUnigraphUrlsWithLocalhost(styledHtml);
            setHtml(finalHtml);
            setLoading(false);
          }
        } catch (parseError) {
          console.error("Error parsing markdown:", parseError);
          setError(`Error parsing markdown: ${parseError}`);
          setLoading(false);
        }
      })
      .catch((err) => {
        // Improve error display
        console.error("Error loading markdown:", err);
        setError(
          `Unable to load content for "${filename}". ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setLoading(false);
      });
  }, [
    filename,
    excerpt,
    excerptLength,
    overrideMarkdown,
    imageStyle,
    applyImageStyles,
  ]); // Add imageStyle to dependencies

  // Handle dragging the definition popup
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeDefinition) return;

    // Only initiate drag on the header, not on the close button
    if ((e.target as HTMLElement).tagName === "BUTTON") return;

    setDragStart({
      x: e.clientX - activeDefinition.position.x,
      y: e.clientY - activeDefinition.position.y,
    });

    setActiveDefinition({
      ...activeDefinition,
      isDragging: true,
    });

    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragStart || !activeDefinition?.isDragging) return;

      setActiveDefinition((prev) =>
        prev
          ? {
              ...prev,
              position: {
                x: e.clientX - (dragStart?.x ?? 0),
                y: e.clientY - (dragStart?.y ?? 0),
              },
            }
          : prev
      );
    },
    [dragStart, activeDefinition?.isDragging]
  );

  const handleMouseUp = React.useCallback(() => {
    if (!activeDefinition?.isDragging) return;

    setActiveDefinition((prev) =>
      prev
        ? {
            ...prev,
            isDragging: false,
          }
        : prev
    );

    setDragStart(null);
  }, [activeDefinition]);

  // Add global mouse move and up event listeners for dragging
  useEffect(() => {
    if (activeDefinition?.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeDefinition, dragStart, handleMouseMove, handleMouseUp]);

  // Add event handlers after content is rendered
  useEffect(() => {
    if (!contentRef.current || loading) return;

    // Find all defined terms immediately without setTimeout
    const termElements = contentRef.current.querySelectorAll(".defined-term");
    console.log(`Found ${termElements.length || 0} term elements`);

    if (termElements.length === 0) return;

    // Add click handlers to each term
    const handleTermClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const element = e.currentTarget as HTMLElement;
      const termText = element.getAttribute("data-term");
      if (!termText || !terms[termText]) return;

      const rect = element.getBoundingClientRect();
      const positionX = rect.left + rect.width / 2 + window.scrollX;
      const positionY = rect.top + window.scrollY - 12;

      // If the popup is already open for this term, close it
      if (activeDefinition && activeDefinition.term === termText) {
        setActiveDefinition(null);
      } else {
        setActiveDefinition({
          term: termText,
          definition: terms[termText],
          position: {
            x: positionX,
            y: positionY,
          },
          isDragging: false,
        });
      }
    };

    // Clean up previous listeners to prevent duplicates
    termElements.forEach((element) => {
      element.removeEventListener("click", handleTermClick as EventListener);
    });

    // Setup new listeners
    termElements.forEach((element) => {
      element.addEventListener("click", handleTermClick as EventListener);
      // Add a direct onclick handler to ensure the event fires
      (element as HTMLElement).onclick = (e: any) => {
        handleTermClick(e);
      };
    });

    // Mark that we've set up the event handlers
    eventHandlersSetupRef.current = true;

    // Close popup when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDefinition && popupRef.current) {
        if (
          !popupRef.current.contains(e.target as Node) &&
          !Array.from(termElements).some((el) => el.contains(e.target as Node))
        ) {
          setActiveDefinition(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up all event listeners
      termElements.forEach((element) => {
        element.removeEventListener("click", handleTermClick as EventListener);
        (element as HTMLElement).onclick = null;
      });
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [html, loading, terms, activeDefinition]);

  if (loading) {
    return <div className="markdown-loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="markdown-error">
        <h3>Error Loading Content</h3>
        <p>{error}</p>
        <p>Please check that the file exists and the path is correct.</p>
      </div>
    );
  }

  return (
    <div className="markdown-container" style={{ position: "relative" }}>
      <div
        ref={contentRef}
        className={`markdown-content ${excerpt ? "markdown-excerpt-no-fade" : ""}`}
        style={excerpt ? { maxHeight: "400px", overflow: "hidden" } : {}}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains("defined-term")) {
            const termText = target.getAttribute("data-term");
            if (termText && terms[termText]) {
              const rect = target.getBoundingClientRect();
              const positionX = rect.left + rect.width / 2 + window.scrollX;
              // Raise the popup 24px above the top of the term
              const positionY = rect.top + window.scrollY - 24;

              // If the popup is already open for this term, close it
              if (activeDefinition && activeDefinition.term === termText) {
                setActiveDefinition(null);
              } else {
                setActiveDefinition({
                  term: termText,
                  definition: terms[termText],
                  position: {
                    x: positionX,
                    y: positionY,
                  },
                  isDragging: false,
                });
              }
            }
          }
        }}
      />

      {activeDefinition &&
        createPortal(
          <DefinitionPopup
            popup={activeDefinition}
            onClose={() => setActiveDefinition(null)}
            onMouseDown={handleMouseDown}
            popupRef={popupRef as React.RefObject<HTMLDivElement>}
          />,
          document.body
        )}
    </div>
  );
}

export default MarkdownViewer;
