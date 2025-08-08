import { getColor, useTheme } from "@aesgraph/app-shell";
import Editor from "@monaco-editor/react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism.css";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SceneGraph } from "../../core/model/SceneGraph";
import { replaceUnigraphUrlsWithLocalhost } from "../../utils/urlUtils";
import "../applets/StoryCards/StoryCardApp.css";
import { DefinitionPopup, DefinitionPopupData } from "./DefinitionPopup";
import "./MarkdownViewer.css";
import { saveAnnotationToSceneGraph } from "./saveAnnotationToSceneGraph";
import TextBasedContextMenu, {
  TextContextMenuItem,
} from "./TextBasedContextMenu";

interface MarkdownViewerProps {
  filename: string;
  excerpt?: boolean;
  excerptLength?: number;
  overrideMarkdown?: string; // Add this prop
  imageStyle?: React.CSSProperties; // Add imageStyle prop
  sceneGraph?: SceneGraph; // Add sceneGraph prop for annotations
  onAnnotate?: (selectedText: string) => void; // Add annotation callback
  showRawToggle?: boolean; // Add prop to control raw markdown toggle visibility
}

function MarkdownViewer({
  filename,
  excerpt = false,
  excerptLength = 150,
  overrideMarkdown,
  imageStyle,
  sceneGraph,
  onAnnotate = (text) => console.log("Annotate text:", text), // Default implementation
  showRawToggle = false, // Default to false - disabled by default
}: MarkdownViewerProps) {
  const { theme } = useTheme();
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

  // Add state for context menu
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);
  const [rawMarkdown, setRawMarkdown] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [searchHighlight, setSearchHighlight] = useState<string | null>(null);

  // Detect dark mode preference
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen for theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle highlighting
  useEffect(() => {
    const lineMatch = filename.match(/#L(\d+)$/);
    const searchMatch = filename.match(/#search=([^#]+)$/);
    const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : null;
    const searchText = searchMatch ? decodeURIComponent(searchMatch[1]) : null;

    setHighlightedLine(lineNumber);
    setSearchHighlight(searchText);
  }, [filename]);

  // Apply highlighting after content is rendered
  useEffect(() => {
    console.log("Highlighting effect triggered:", {
      highlightedLine,
      searchHighlight,
      loading,
      hasContent: !!contentRef.current,
    });

    if (contentRef.current && !loading) {
      // Clear previous highlighting
      contentRef.current
        .querySelectorAll(".markdown-highlighted-line")
        .forEach((el) => {
          el.classList.remove("markdown-highlighted-line");
        });

      if (searchHighlight) {
        console.log("Searching for text:", searchHighlight);

        // Find and highlight text by searching for the search term
        const walker = document.createTreeWalker(
          contentRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );

        const textNodes: Text[] = [];
        let node;
        while ((node = walker.nextNode())) {
          textNodes.push(node as Text);
        }

        console.log("Found text nodes:", textNodes.length);

        let foundMatch = false;
        textNodes.forEach((textNode) => {
          const text = textNode.textContent || "";
          const searchLower = searchHighlight.toLowerCase();
          const textLower = text.toLowerCase();

          console.log(
            "Checking text node:",
            text.substring(0, 100),
            "against:",
            searchLower
          );

          // Find all instances of the search term in this text node
          if (textLower.includes(searchLower)) {
            console.log("Found exact match in text:", text.substring(0, 100));

            // Create a new text node with highlighted search terms
            const highlightedText = text.replace(
              new RegExp(
                `(${searchHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                "gi"
              ),
              '<mark class="markdown-highlighted-term">$1</mark>'
            );

            // Replace the text node content with highlighted version
            if (highlightedText !== text) {
              const span = document.createElement("span");
              span.innerHTML = highlightedText;
              textNode.parentNode?.replaceChild(span, textNode);
              foundMatch = true;
            }
          }
        });

        // Scroll to the first highlighted term
        if (foundMatch) {
          const firstHighlight = contentRef.current?.querySelector(
            ".markdown-highlighted-term"
          );
          if (firstHighlight) {
            setTimeout(() => {
              firstHighlight.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 100);
          }
        }

        if (!foundMatch) {
          console.log("No matching text found for:", searchHighlight);
        }
      } else if (highlightedLine) {
        // Fallback to line-based highlighting
        const elements = contentRef.current.querySelectorAll(
          "p, h1, h2, h3, h4, h5, h6, pre, li"
        );
        console.log("Found elements to highlight:", elements.length);

        elements.forEach((element, index) => {
          const lineNumber = index + 1;
          element.setAttribute("data-line", lineNumber.toString());

          if (lineNumber === highlightedLine) {
            console.log(
              "Highlighting element:",
              element,
              "for line:",
              lineNumber
            );
            element.classList.add("markdown-highlighted-line");

            setTimeout(() => {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
          }
        });
      }
    }
  }, [html, highlightedLine, searchHighlight, loading]);

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    console.log("Context menu triggered, selected text:", text); // Debug log
    if (text && text.length > 0) {
      e.preventDefault(); // Prevent default browser context menu
      e.stopPropagation(); // Stop propagation to avoid triggering other handlers
      setSelectedText(text);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      console.log("Context menu position set:", { x: e.clientX, y: e.clientY }); // Debug log
    }
  };

  // Enhanced annotation handler that saves to scene graph
  const handleAnnotate = (text: string) => {
    console.log("handleAnnotate called with text:", text); // Debug log
    if (!text.trim()) return;

    // Get the surrounding HTML context if possible
    let surroundingHtml = "";
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Get the surrounding context - either the parent element or a few words before/after
      const container = range.commonAncestorContainer;
      if (container.nodeType === Node.ELEMENT_NODE) {
        // If the container is an element, use its HTML
        surroundingHtml = (container as Element).outerHTML;
      } else if (container.parentElement) {
        // If it's a text node, use the parent element's HTML
        surroundingHtml = container.parentElement.outerHTML;
      }
    }

    console.log("SceneGraph available:", !!sceneGraph); // Debug log

    // Save to scene graph if available, otherwise use the default onAnnotate
    if (sceneGraph) {
      try {
        const node = saveAnnotationToSceneGraph(
          text,
          surroundingHtml,
          { type: "markdown", resource_id: filename },
          sceneGraph
        );
        console.log("Created annotation node:", node);
      } catch (error) {
        console.error("Failed to save annotation to scene graph:", error);
        // Fall back to the default onAnnotate
        onAnnotate(text);
      }
    } else {
      // Use the provided onAnnotate callback
      onAnnotate(text);
    }
  };

  // Define context menu items
  const getContextMenuItems = (): TextContextMenuItem[] => [
    {
      id: "annotate",
      label: "Annotate",
      onClick: () => {
        // Keep the selection intact until the action is completed
        const currentSelection = selectedText;
        handleAnnotate(currentSelection);
        // Don't clear selection here - let user manage that
      },
    },
    {
      id: "copy",
      label: "Copy",
      onClick: () => {
        navigator.clipboard.writeText(selectedText);
      },
    },
    {
      id: "search",
      label: "Search",
      onClick: () => {
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`,
          "_blank"
        );
      },
    },
  ];

  // Close context menu when clicking outside
  useEffect(() => {
    if (!contextMenuPosition) return;

    const handleClickOutside = () => {
      setContextMenuPosition(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    // Also close on Escape key
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenuPosition(null);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [contextMenuPosition]);

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

    // Configure marked with proper LaTeX support and syntax highlighting
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

        // Handle syntax highlighting for various languages
        if (lang) {
          try {
            // Map language aliases to Prism languages
            const languageMap: Record<string, string> = {
              ts: "typescript",
              tsx: "tsx",
              js: "javascript",
              jsx: "jsx",
              json: "json",
              css: "css",
              scss: "scss",
              md: "markdown",
              bash: "bash",
              shell: "bash", // Use bash for shell scripts
              sh: "bash",
            };

            const prismLang = languageMap[lang] || lang;

            // Ensure newlines are preserved and let Prism handle syntax highlighting
            const processedText = text;

            const highlighted = Prism.highlight(
              processedText,
              Prism.languages[prismLang] || Prism.languages.plaintext,
              prismLang
            );

            // Ensure the code is treated as text, not as React components
            return `<pre><code class="language-${lang}" data-code="true">${highlighted}</code></pre>`;
          } catch (error) {
            console.error("Syntax highlighting error:", error);
            // Fallback to plain text if highlighting fails
            return `<pre><code class="language-${lang}">${text}</code></pre>`;
          }
        }

        // Default case for no language specified
        return `<pre><code>${text}</code></pre>`;
      },
    };

    // Use default marked configuration for basic markdown parsing
    marked.setOptions({
      gfm: true,
      breaks: true,
    });

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

    const cleanFilename = filename.replace(/#(L\d+|search=[^#]+)$/, "");

    // Fix the path construction to handle docs/, markdowns/, and storyCardFiles/ paths
    const normalizedFilename = cleanFilename.startsWith("/")
      ? cleanFilename.substring(1)
      : cleanFilename;

    let filePath;

    // Check if the path explicitly starts with docs/
    if (normalizedFilename.startsWith("docs/")) {
      // Use the path as is for docs folder
      filePath = `/${normalizedFilename}`;
    }
    // Check if the path explicitly starts with markdowns/
    else if (normalizedFilename.startsWith("markdowns/")) {
      // Use the path as is for markdowns folder
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

        // Store the raw markdown content
        setRawMarkdown(content);

        // Extract title from metadata
        setTitle(metadata.title || "");

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
          console.log(
            "Parsing markdown content:",
            finalContent.substring(0, 200) + "..."
          );
          parsed = marked.parse(finalContent);
          console.log(
            "Parsed HTML:",
            typeof parsed === "string"
              ? parsed.substring(0, 200) + "..."
              : "Promise"
          );
          if (parsed instanceof Promise) {
            parsed.then((htmlStr) => {
              // Apply image styles and replace Unigraph URLs
              const styledHtml = imageStyle
                ? applyImageStyles(htmlStr)
                : htmlStr;
              const finalHtml = replaceUnigraphUrlsWithLocalhost(styledHtml);
              // Fix relative image paths for docs
              const fixedHtml = finalHtml.replace(
                /src=["']\.\.\/assets\/images\/([^"']*)["']/gi,
                'src="/docs/assets/images/$1"'
              );
              setHtml(fixedHtml);
              setLoading(false);
            });
          } else {
            // Apply image styles and replace Unigraph URLs
            const styledHtml = imageStyle ? applyImageStyles(parsed) : parsed;
            const finalHtml = replaceUnigraphUrlsWithLocalhost(styledHtml);
            // Fix relative image paths for docs
            const fixedHtml = finalHtml.replace(
              /src=["']\.\.\/assets\/images\/([^"']*)["']/gi,
              'src="/docs/assets/images/$1"'
            );

            // Post-process to ensure JSX in code blocks is not interpreted as React components
            const processedHtml = fixedHtml.replace(
              /<pre><code[^>]*class="[^"]*language-(tsx|jsx)[^"]*"[^>]*>/g,
              (match) => {
                // This ensures that JSX code blocks are treated as text, not as React components
                return match;
              }
            );

            // For now, let's keep it simple and just show the JSX as code
            // The complex JSX parsing approach is too error-prone
            // We can revisit this with a proper JSX parser library later

            setHtml(processedHtml);
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
    <div
      className="markdown-container"
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      {/* Title display */}
      {title && !showRawMarkdown && (
        <div
          className="markdown-title"
          style={{
            borderBottomColor: getColor(theme.colors, "border"),
          }}
        >
          <h1 style={{ color: getColor(theme.colors, "text") }}>{title}</h1>
        </div>
      )}

      {/* Toggle button for raw markdown - only show when enabled */}
      {showRawToggle && (
        <button
          onClick={() => setShowRawMarkdown(!showRawMarkdown)}
          className={`markdown-toggle-button ${showRawMarkdown ? "active" : ""}`}
          title={showRawMarkdown ? "Show rendered view" : "Show raw markdown"}
          disabled={loading}
          style={{
            color: getColor(theme.colors, "textSecondary"),
          }}
        >
          {showRawMarkdown ? "View markdown" : "View md text"}
        </button>
      )}
      {showRawMarkdown ? (
        <div ref={contentRef} className="markdown-content markdown-raw-view">
          <Editor
            language="markdown"
            theme={isDarkMode ? "vs-dark" : "vs-light"}
            value={rawMarkdown || "Loading raw markdown..."}
            onChange={() => {}} // Read-only
            loading="Loading editor..."
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              readOnly: true,
              fontSize: 14,
              fontFamily: "Monaco, 'Courier New', monospace",
              lineNumbers: "on",
              folding: true,
              renderWhitespace: "selection",
              tabSize: 2,
            }}
          />
        </div>
      ) : (
        <div
          ref={contentRef}
          className={`markdown-content ${excerpt ? "markdown-excerpt-no-fade" : ""}`}
          style={
            {
              ...(excerpt ? { maxHeight: "400px", overflow: "hidden" } : {}),
              "--border-color": getColor(theme.colors, "border"),
              "--surface-color": getColor(theme.colors, "surface"),
              "--background-color": getColor(theme.colors, "background"),
              "--text-color": getColor(theme.colors, "text"),
            } as React.CSSProperties
          }
          dangerouslySetInnerHTML={{ __html: html }}
          onContextMenu={handleContextMenu}
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
      )}

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

      {/* Render the context menu when position is available */}
      {contextMenuPosition &&
        createPortal(
          <TextBasedContextMenu
            position={contextMenuPosition}
            selectedText={selectedText}
            items={getContextMenuItems()}
            onClose={() => setContextMenuPosition(null)}
          />,
          document.body
        )}
    </div>
  );
}

export default MarkdownViewer;
