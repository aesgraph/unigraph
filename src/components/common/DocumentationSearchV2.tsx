import { getColor, useTheme } from "@aesgraph/app-shell";
import { Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import "./DocumentationSearchV2.css";

interface SearchMatch {
  line: number;
  highlightedText: string;
}

interface SearchResult {
  filePath: string;
  title: string;
  matches: SearchMatch[];
}

interface SearchIndex {
  [filePath: string]: {
    title: string;
    content: string;
    lines: string[];
  };
}

interface DocumentationSearchV2Props {
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
}

const DocumentationSearchV2: React.FC<DocumentationSearchV2Props> = ({
  onFileSelect,
  selectedFile,
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchIndex>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setSearching] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);

  // Helper function to index files recursively (same as V1)
  const indexFiles = useCallback(
    async (structure: any, basePath: string, index: SearchIndex) => {
      if (!structure.children) return;

      for (const child of structure.children) {
        console.log(`Processing child: ${child.path}, type: ${child.type}`);
        if (child.type === "file" && child.path.endsWith(".md")) {
          try {
            const fetchUrl = `${basePath}/${child.path}`;
            console.log(`Fetching file: ${fetchUrl}`);
            const response = await fetch(fetchUrl);
            if (response.ok) {
              const content = await response.text();
              const lines = content.split("\n");

              // Extract title from frontmatter or use filename
              let title = child.name.replace(".md", "");
              const frontMatterMatch = content.match(
                /^---\s*\n([\s\S]*?)\n---\s*\n/
              );
              if (frontMatterMatch) {
                const frontMatter = frontMatterMatch[1];
                const titleMatch = frontMatter.match(
                  /title:\s*["']([^"']+)["']/
                );
                if (titleMatch) {
                  title = titleMatch[1];
                } else {
                  const titleMatchNoQuotes =
                    frontMatter.match(/title:\s*([^\r\n]+)/);
                  if (titleMatchNoQuotes) {
                    title = titleMatchNoQuotes[1].trim();
                  }
                }
              }

              const indexKey = `${basePath}/${child.path}`;
              index[indexKey] = {
                title,
                content,
                lines,
              };
              console.log(`Indexed file: ${indexKey} with title: ${title}`);
            } else {
              console.log(`Failed to fetch ${fetchUrl}: ${response.status}`);
            }
          } catch (error) {
            console.debug(`Could not index ${child.path}:`, error);
          }
        } else if (child.children) {
          console.log(`Recursing into directory: ${child.path}`);
          await indexFiles(child, basePath, index);
        }
      }
    },
    []
  );

  // Build search index (same pattern as V1)
  const buildSearchIndex = useCallback(async () => {
    console.log("Building search index...");
    const index: SearchIndex = {};

    try {
      // Load markdowns structure
      const markdownsResponse = await fetch("/markdowns-structure.json");
      if (markdownsResponse.ok) {
        const markdownsData = await markdownsResponse.json();
        console.log("Markdowns structure:", markdownsData);
        await indexFiles(markdownsData, "/markdowns", index);
      }

      // Load docs structure
      const docsResponse = await fetch("/docs-structure.json");
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        console.log("Docs structure:", docsData);
        await indexFiles(docsData, "/docs", index);
      }

      console.log("Final search index:", index);
      setSearchIndex(index);
      setIsIndexed(true);
      console.log(
        "Search index built with",
        Object.keys(index).length,
        "files"
      );
    } catch (error) {
      console.error("Failed to build search index:", error);
      setIsIndexed(true); // Mark as indexed even if failed to avoid infinite loading
    }
  }, [indexFiles]);

  // Perform search
  const performSearch = useCallback(
    (term: string) => {
      if (!term.trim() || !isIndexed) {
        setSearchResults([]);
        return;
      }

      setSearching(true);

      const results: SearchResult[] = [];
      const lowerTerm = term.toLowerCase();

      Object.entries(searchIndex).forEach(([filePath, fileData]) => {
        const matches: SearchMatch[] = [];

        // Search in lines
        fileData.lines.forEach((line, lineIndex) => {
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes(lowerTerm)) {
            // Highlight the match
            const regex = new RegExp(`(${term})`, "gi");
            const highlightedText = line.replace(
              regex,
              '<mark style="background-color: yellow; color: black;">$1</mark>'
            );

            matches.push({
              line: lineIndex + 1,
              highlightedText,
            });
          }
        });

        // Search in title
        if (fileData.title.toLowerCase().includes(lowerTerm)) {
          const regex = new RegExp(`(${term})`, "gi");
          const highlightedTitle = fileData.title.replace(
            regex,
            '<mark style="background-color: yellow; color: black;">$1</mark>'
          );

          if (matches.length === 0) {
            matches.push({
              line: 0,
              highlightedText: `Title: ${highlightedTitle}`,
            });
          }
        }

        if (matches.length > 0) {
          results.push({
            filePath,
            title: fileData.title,
            matches,
          });
        }
      });

      // Sort by relevance (title matches first, then by number of matches)
      results.sort((a, b) => {
        const aHasTitleMatch = a.matches.some((m) => m.line === 0);
        const bHasTitleMatch = b.matches.some((m) => m.line === 0);

        if (aHasTitleMatch && !bHasTitleMatch) return -1;
        if (!aHasTitleMatch && bHasTitleMatch) return 1;

        return b.matches.length - a.matches.length;
      });

      setSearchResults(results);
      setSearching(false);
    },
    [searchIndex, isIndexed]
  );

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      performSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  // Handle result click
  const handleResultClick = (filePath: string, searchText?: string) => {
    if (onFileSelect) {
      // Pass file path with search text for highlighting
      const filePathWithSearch = searchText
        ? `${filePath}#search=${encodeURIComponent(searchText)}`
        : filePath;
      onFileSelect(filePathWithSearch);
    }
  };

  // Build index on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.warn("Indexing timeout reached, marking as indexed");
      setIsIndexed(true);
    }, 10000); // 10 second timeout

    buildSearchIndex().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [buildSearchIndex]);

  return (
    <div
      className="documentation-search-v2"
      style={{
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
        borderRight: `1px solid ${getColor(theme.colors, "border")}`,
      }}
    >
      <div
        className="search-header"
        style={{
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        <h3
          style={{
            color: getColor(theme.colors, "text"),
            margin: "0 0 12px 0",
            fontSize: "14px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Documentation
        </h3>
        <div className="file-tree-search">
          <div className="file-tree-search-input-wrapper">
            <Search
              size={16}
              style={{
                color: getColor(theme.colors, "textSecondary"),
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search for text..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="file-tree-search-input"
              style={{
                padding: "8px 12px 8px 36px",
                border: `1px solid ${getColor(theme.colors, "border")}`,
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: getColor(theme.colors, "background"),
                color: getColor(theme.colors, "text"),
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        {!isIndexed && (
          <span
            className="indexing-status"
            style={{
              fontSize: "12px",
              color: getColor(theme.colors, "textSecondary"),
              marginTop: "8px",
              display: "block",
            }}
          >
            Indexing...
          </span>
        )}
      </div>

      <div
        className="search-content"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 0",
          minHeight: 0,
        }}
      >
        {isSearching && (
          <div
            className="search-status"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              color: getColor(theme.colors, "textSecondary"),
              fontStyle: "italic",
            }}
          >
            <span>Searching...</span>
          </div>
        )}

        {!isSearching && searchTerm && searchResults.length === 0 && (
          <div
            className="no-results"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              color: getColor(theme.colors, "textSecondary"),
              fontStyle: "italic",
            }}
          >
            <span>No results found for &quot;{searchTerm}&quot;</span>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="results-container">
            <div
              className="results-header"
              style={{
                marginBottom: "16px",
                padding: "8px 20px",
                fontSize: "14px",
                color: getColor(theme.colors, "textSecondary"),
                borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
              }}
            >
              Found {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </div>
            <div
              className="results-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "0 20px",
              }}
            >
              {searchResults.map((result, index) => (
                <div
                  key={`${result.filePath}-${index}`}
                  className="result-item"
                  onClick={() => handleResultClick(result.filePath)}
                  style={{
                    backgroundColor:
                      selectedFile === result.filePath
                        ? getColor(theme.colors, "primary")
                        : getColor(theme.colors, "backgroundSecondary"),
                    border: `1px solid ${
                      selectedFile === result.filePath
                        ? getColor(theme.colors, "primary")
                        : getColor(theme.colors, "border")
                    }`,
                    borderRadius: "6px",
                    padding: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFile !== result.filePath) {
                      e.currentTarget.style.backgroundColor = getColor(
                        theme.colors,
                        "backgroundTertiary"
                      );
                      e.currentTarget.style.borderColor = getColor(
                        theme.colors,
                        "borderHover"
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFile !== result.filePath) {
                      e.currentTarget.style.backgroundColor = getColor(
                        theme.colors,
                        "backgroundSecondary"
                      );
                      e.currentTarget.style.borderColor = getColor(
                        theme.colors,
                        "border"
                      );
                    }
                  }}
                >
                  <div
                    className="result-header"
                    style={{ marginBottom: "8px" }}
                  >
                    <div
                      className="result-title"
                      style={{
                        fontWeight: "600",
                        fontSize: "14px",
                        color:
                          selectedFile === result.filePath
                            ? getColor(theme.colors, "background")
                            : getColor(theme.colors, "text"),
                        marginBottom: "4px",
                      }}
                      dangerouslySetInnerHTML={{ __html: result.title }}
                    />
                    <div
                      className="result-path"
                      style={{
                        fontSize: "12px",
                        color:
                          selectedFile === result.filePath
                            ? getColor(theme.colors, "background")
                            : getColor(theme.colors, "textSecondary"),
                        fontFamily: "monospace",
                      }}
                    >
                      {result.filePath}
                    </div>
                  </div>
                  <div
                    className="result-matches"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {result.matches.slice(0, 3).map((match, matchIndex) => (
                      <div
                        key={matchIndex}
                        className="match-item"
                        style={{
                          display: "flex",
                          gap: "8px",
                          fontSize: "12px",
                          lineHeight: "1.4",
                        }}
                      >
                        <span
                          className="match-line"
                          style={{
                            color:
                              selectedFile === result.filePath
                                ? getColor(theme.colors, "background")
                                : getColor(theme.colors, "textSecondary"),
                            minWidth: "60px",
                            fontFamily: "monospace",
                          }}
                        >
                          Line {match.line}:
                        </span>
                        <span
                          className="match-text"
                          style={{
                            color:
                              selectedFile === result.filePath
                                ? getColor(theme.colors, "background")
                                : getColor(theme.colors, "textSecondary"),
                            flex: 1,
                            wordBreak: "break-word",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Use the current search term to highlight the same text
                            console.log("Clicking on match:", {
                              searchTerm: searchTerm,
                              highlightedText: match.highlightedText,
                              line: match.line,
                            });
                            handleResultClick(result.filePath, searchTerm);
                          }}
                          dangerouslySetInnerHTML={{
                            __html: match.highlightedText,
                          }}
                        />
                      </div>
                    ))}
                    {result.matches.length > 3 && (
                      <div
                        className="more-matches"
                        style={{
                          fontSize: "11px",
                          color:
                            selectedFile === result.filePath
                              ? getColor(theme.colors, "background")
                              : getColor(theme.colors, "textSecondary"),
                          fontStyle: "italic",
                          marginTop: "4px",
                        }}
                      >
                        +{result.matches.length - 3} more matches
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationSearchV2;
