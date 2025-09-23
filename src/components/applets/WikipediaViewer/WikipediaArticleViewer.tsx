import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SceneGraph } from "../../../core/model/SceneGraph";
import {
  fixWikipediaLinks,
  replaceUnigraphUrlsWithLocalhost,
} from "../../../utils/urlUtils";
import {
  DefinitionPopup,
  DefinitionPopupData,
} from "../../common/DefinitionPopup";
import StaticHtmlComponent from "../../common/StaticHtmlComponent";
import TextBasedContextMenu from "../../common/TextBasedContextMenu";
import { saveAnnotationToSceneGraph } from "../../common/saveAnnotationToSceneGraph";

// Add a utility function to extract article title from Wikipedia URLs
const extractWikipediaTitle = (url: string): string | null => {
  // Handle both relative and absolute URLs
  const wikiPathRegex = /\/wiki\/([^#?]*)/;
  const match = url.match(wikiPathRegex);
  return match ? decodeURIComponent(match[1].replace(/_/g, " ")) : null;
};

// Helper function to highlight keywords in HTML content
const highlightKeywordsFunc = (
  html: string,
  keywords: string[] = []
): string => {
  if (!keywords || keywords.length === 0) return html;

  let result = html;
  keywords.forEach((keyword) => {
    if (!keyword || keyword.trim() === "") return;

    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // This regex looks for the keyword between HTML tags
    const regex = new RegExp(`(>)([^<>]*?)(${safeKeyword})([^<>]*?)(<)`, "gi");
    result = result.replace(
      regex,
      (_, before, pre, match, post, after) =>
        `${before}${pre}<span style="background-color: yellow; color: black; border-radius: 2px; padding: 0 2px;">${match}</span>${post}${after}`
    );
  });

  return result;
};

// Helper to highlight terms in HTML (wrap with span and add styling directly)
const highlightCustomTerms = (
  html: string,
  terms: Record<string, string>
): string => {
  console.log("terms are ", terms);
  if (!terms || Object.keys(terms).length === 0) return html;
  const sortedTerms = Object.keys(terms).sort((a, b) => b.length - a.length);
  let result = html;
  sortedTerms.forEach((term) => {
    if (!term) return;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(?<!<span[^>]*?>)\\b(${safeTerm})\\b(?![^<]*?</span>)`,
      "g"
    );
    // Include the styling directly in the HTML output to ensure it's always applied
    result = result.replace(
      regex,
      `<span class="wikipedia-defined-term" data-term="$1" style="cursor: pointer; border-bottom: 2px dotted #0645ad;" title="Click to see definition">$1</span>`
    );
  });
  return result;
};

type WikipediaArticleViewerProps = {
  style?: React.CSSProperties;
  highlightKeywords?: string[];
  initialArticle?: string;
  customTerms?: Record<string, string>;
  onAnnotate?: (selectedText: string) => void; // Add annotation callback
  sceneGraph?: SceneGraph; // Add sceneGraph prop
};

export const WikipediaArticleViewer: React.FC<WikipediaArticleViewerProps> = ({
  style = {},
  highlightKeywords = [],
  initialArticle = "Wikipedia",
  customTerms = {},
  onAnnotate = (text) => console.log("Annotate text:", text), // Default implementation
  sceneGraph,
}) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<string>(initialArticle);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [articleHistory, setArticleHistory] = useState<string[]>([
    initialArticle,
  ]);
  const cssInjected = useRef(false);
  const language = "en";
  const popupRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [activeDefinition, setActiveDefinition] =
    useState<DefinitionPopupData | null>(null);

  // Add state for context menu
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");

  // Wikipedia CSS links for <link rel="stylesheet" ... />
  const cssLinks = [
    `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=site.styles&only=styles&skin=vector`,
    `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=mediawiki.legacy.commonPrint,shared|mediawiki.skinning.content.parsoid|mediawiki.skinning.interface|mediawiki.skinning.content&only=styles&skin=vector`,
    `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=ext.cite.styles|ext.pygments&only=styles&skin=vector`,
  ];

  // Only inject CSS once per mount, and never remove it (prevents flicker)
  useEffect(() => {
    if (cssInjected.current) return;
    cssInjected.current = true;
    cssLinks.forEach((href) => {
      if (!document.querySelector(`link[data-wiki-css][href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = href;
        link.setAttribute("data-wiki-css", "true");
        document.head.appendChild(link);
      }
    });
    // Do not remove CSS on unmount to avoid flicker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch and display a Wikipedia article
  const fetchWikipediaArticle = React.useCallback(
    async (articleTitle: string) => {
      setIsLoading(true);
      setError(null);
      let cancelled = false;

      try {
        const encodedTitle = encodeURIComponent(
          articleTitle.replace(/ /g, "_")
        );
        const url = `https://${language}.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&format=json&origin=*&prop=text`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (cancelled) return;

        if (data.parse && data.parse.text) {
          let htmlContent = data.parse.text["*"];

          // Fix Wikipedia relative URLs to make links work
          htmlContent = fixWikipediaLinks(htmlContent, language);

          // Reduce debug logging to avoid console noise
          if (process.env.NODE_ENV !== "production") {
            console.log("Applying custom terms highlighting:", customTerms);
          }

          // Highlight custom terms in the HTML
          htmlContent = highlightCustomTerms(htmlContent, customTerms);

          // Apply keyword highlighting
          if (highlightKeywords && highlightKeywords.length > 0) {
            htmlContent = highlightKeywordsFunc(htmlContent, highlightKeywords);
          }

          setHtml(replaceUnigraphUrlsWithLocalhost(htmlContent));
        } else {
          setError("Article not found or could not be loaded.");
        }
      } catch (e) {
        if (!cancelled) setError(`Failed to fetch Wikipedia article: ${e}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }

      return () => {
        cancelled = true;
      };
    },
    [language, highlightKeywords, customTerms]
  );

  // Memoize the fetch article function to prevent unnecessary re-creation
  const memoizedFetchArticle = React.useMemo(
    () => fetchWikipediaArticle,
    [fetchWikipediaArticle]
  );

  // Load the initial article
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    let isMounted = true;

    memoizedFetchArticle(currentArticle).then((fn) => {
      if (isMounted) {
        cleanupFn = fn;
      }
    });

    return () => {
      isMounted = false;
      if (cleanupFn) cleanupFn();
    };
  }, [currentArticle, memoizedFetchArticle]);

  // Navigate to a specific article with history tracking
  const navigateToArticle = (title: string) => {
    // If navigating to a new article that's not the current one
    if (title !== currentArticle) {
      setCurrentArticle(title);

      // Update history - if we're navigating to an article already in our history,
      // truncate the history up to that point
      const existingIndex = articleHistory.indexOf(title);
      if (existingIndex >= 0) {
        // Article exists in history, truncate to that point
        setArticleHistory(articleHistory.slice(0, existingIndex + 1));
      } else {
        // New article, add to history
        setArticleHistory((prevHistory) => [...prevHistory, title]);
      }

      // Scroll back to top
      window.scrollTo(0, 0);
    }
  };

  // Event handler for link clicks
  const handleLinkClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");

    if (anchor && anchor.href) {
      const title = extractWikipediaTitle(anchor.href);
      if (title) {
        e.preventDefault();
        navigateToArticle(title);
      }
    }
  };

  // Enhanced handleMouseDown for popup dragging
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

  // Setup event handlers for term definition popups
  useEffect(() => {
    if (!contentRef.current || !html) return;

    const termElements = contentRef.current.querySelectorAll(
      ".wikipedia-defined-term"
    );

    if (termElements.length === 0) return;

    // Only log in development mode
    if (process.env.NODE_ENV !== "production") {
      console.log(`Found ${termElements.length} term elements`);
      console.log("Available terms:", customTerms);
    }

    const handleTermClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const element = e.currentTarget as HTMLElement;
      const termText = element.getAttribute("data-term");

      // Debug the clicked term only in development
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Term clicked:",
          termText,
          "Available:",
          customTerms[termText || ""]
        );
      }

      if (!termText || !customTerms[termText]) return;

      const rect = element.getBoundingClientRect();
      const positionX = rect.left + rect.width / 2 + window.scrollX;
      const positionY = rect.top + window.scrollY - 24;

      if (activeDefinition && activeDefinition.term === termText) {
        setActiveDefinition(null);
      } else {
        setActiveDefinition({
          term: termText,
          definition: customTerms[termText],
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

    // Setup new listeners - style is already applied in the HTML generation
    termElements.forEach((element) => {
      element.addEventListener("click", handleTermClick as EventListener);
      (element as HTMLElement).onclick = (e: any) => {
        handleTermClick(e);
      };
    });

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
      termElements.forEach((element) => {
        element.removeEventListener("click", handleTermClick as EventListener);
        (element as HTMLElement).onclick = null;
      });
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [html, customTerms, activeDefinition]);

  // Handle context menu for text selection
  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      e.preventDefault(); // Prevent default browser context menu
      e.stopPropagation(); // Stop propagation to avoid triggering other handlers
      setSelectedText(text);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Enhanced annotation handler that saves to scene graph
  const handleAnnotate = (text: string) => {
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

    // Save to scene graph if available, otherwise use the default onAnnotate
    if (sceneGraph) {
      try {
        const node = saveAnnotationToSceneGraph(
          text,
          surroundingHtml,
          { type: "wikipedia", resource_id: currentArticle },
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

  // Define context menu items - more compact without icons
  const getContextMenuItems = () => [
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
      label: "Search Google",
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

  // Handle clicks on article content
  const handleContentClick = (e: React.MouseEvent) => {
    // Improved click handler for term definitions
    const target = e.target as HTMLElement;
    if (target.classList.contains("wikipedia-defined-term")) {
      const termText = target.getAttribute("data-term");
      // Use customTerms directly
      if (termText && customTerms[termText]) {
        e.preventDefault();
        e.stopPropagation();

        console.log("Clicked term:", termText);

        const rect = target.getBoundingClientRect();
        const positionX = rect.left + rect.width / 2 + window.scrollX;
        const positionY = rect.top + window.scrollY - 24;

        if (activeDefinition && activeDefinition.term === termText) {
          setActiveDefinition(null);
        } else {
          setActiveDefinition({
            term: termText,
            definition: customTerms[termText],
            position: {
              x: positionX,
              y: positionY,
            },
            isDragging: false,
          });
        }
      }
    }

    // Also close the context menu when clicking
    if (contextMenuPosition) {
      setContextMenuPosition(null);
    }
  };

  if (error) return <div style={style}>Error: {error}</div>;
  if (isLoading) return <div style={style}>Loading...</div>;

  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        maxWidth: "1100px", // Increased from 900px to 1100px for wider content
        margin: "0 auto",
        overflow: "auto",
        height: "calc(100vh - 64px)",
        maxHeight: "unset",
        display: "flex",
        flexDirection: "column",
        // Add scrollbar styling
        scrollbarWidth: "thin", // For Firefox
        scrollbarColor: "#bbb #f1f1f1", // For Firefox: thumb and track colors
        ...style,
      }}
      className="mw-parser-output wikipedia-article-viewer"
    >
      {/* Add a navigation header with breadcrumbs */}
      <div
        style={{
          marginBottom: 20,
          borderBottom: "1px solid #ddd",
          paddingBottom: 10,
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        <h2>{currentArticle}</h2>

        {/* Breadcrumb trail */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 10,
            fontSize: "0.9em",
          }}
        >
          <span style={{ marginRight: 8, color: "#666" }}>Path:</span>
          {articleHistory.map((article, index) => (
            <React.Fragment key={`${article}-${index}`}>
              {index > 0 && (
                <span style={{ margin: "0 8px", color: "#999" }}>&gt;</span>
              )}
              <button
                onClick={() => navigateToArticle(article)}
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  color: article === currentArticle ? "#333" : "#0645ad",
                  fontWeight: article === currentArticle ? "bold" : "normal",
                  textDecoration:
                    article === currentArticle ? "none" : "underline",
                }}
              >
                {article}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Render article content */}
      <StaticHtmlComponent
        contentRef={contentRef as React.RefObject<HTMLDivElement>}
        html={html}
        className="wikipedia-article-content"
        style={{
          flexGrow: 1,
          overflowY: "auto",
          paddingBottom: "80px",
          // Add scrollbar styling for this element too
          scrollbarWidth: "thin", // For Firefox
          scrollbarColor: "#bbb #f1f1f1", // For Firefox
        }}
        onContextMenu={handleContextMenu}
        onClick={handleContentClick}
      />

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

      {/* Setup link handlers after render */}
      <div
        style={{ display: "none" }}
        ref={(el) => {
          if (!el || !contentRef.current || !html) return;

          // Attach click handlers to Wikipedia links
          setTimeout(() => {
            const container = contentRef.current;
            if (!container) return;

            container.querySelectorAll("a").forEach((link) => {
              // Remove existing listeners first to avoid duplicates
              link.removeEventListener(
                "click",
                handleLinkClick as EventListener
              );

              if (link.getAttribute("href")) {
                // If it's a Wikipedia article link, intercept it
                if (extractWikipediaTitle(link.href)) {
                  link.addEventListener(
                    "click",
                    handleLinkClick as EventListener
                  );
                } else {
                  // For external links, open in new tab
                  link.setAttribute("target", "_blank");
                }
              }
            });
          }, 300);
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
};

// Modify the scrollbar styles code to only run once
if (!document.getElementById("wikipedia-scrollbar-styles")) {
  const scrollbarStyles = document.createElement("style");
  scrollbarStyles.id = "wikipedia-scrollbar-styles";
  scrollbarStyles.textContent = `
    .wikipedia-article-viewer::-webkit-scrollbar,
    .wikipedia-article-content::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .wikipedia-article-viewer::-webkit-scrollbar-track,
    .wikipedia-article-content::-webkit-scrollbar-track {
      background: #f1f1f1; 
    }
    .wikipedia-article-viewer::-webkit-scrollbar-thumb,
    .wikipedia-article-content::-webkit-scrollbar-thumb {
      background: #bbb; 
      border-radius: 4px;
    }
    .wikipedia-article-viewer::-webkit-scrollbar-thumb:hover,
    .wikipedia-article-content::-webkit-scrollbar-thumb:hover {
      background: #999; 
    }
  `;
  document.head.appendChild(scrollbarStyles);
}

export default React.memo(WikipediaArticleViewer);
