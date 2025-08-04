import { getColor, useTheme } from "@aesgraph/app-shell";
import { Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { searchDocuments } from "../../api/documentsApi";
import { useAuth } from "../../hooks/useAuth";

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  extension?: string;
  project_id?: string;
  created_at?: string;
  last_updated_at?: string;
  snippet?: string;
  matchCount?: number;
}

interface DocumentSearchProps {
  onFileSelect?: (documentId: string, document: SearchResult) => void;
  selectedFile?: string;
  projectId?: string;
  placeholder?: string;
}

// Helper function to extract search snippet
const extractSearchSnippet = (
  content: string,
  searchTerm: string,
  maxLength: number = 200
): string => {
  if (!content || !searchTerm) return "";

  const lowerContent = content.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerSearchTerm);

  if (index === -1)
    return (
      content.substring(0, maxLength) +
      (content.length > maxLength ? "..." : "")
    );

  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + searchTerm.length + 150);

  let snippet = content.substring(start, end);

  // Add ellipses if we truncated
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";

  // Highlight the search term
  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return snippet.replace(
    regex,
    '<mark style="background-color: #fbbf24; padding: 1px 2px; border-radius: 2px;">$1</mark>'
  );
};

// Helper function to count matches
const countMatches = (text: string, searchTerm: string): number => {
  if (!text || !searchTerm) return 0;
  const regex = new RegExp(
    searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );
  return (text.match(regex) || []).length;
};

const DocumentSearch: React.FC<DocumentSearchProps> = ({
  onFileSelect,
  selectedFile,
  projectId,
  placeholder = "Search documents...",
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Perform search
  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim() || !user?.id) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const documents = await searchDocuments({
          searchTerm: term,
          userId: user.id,
          projectId,
        });

        // Transform the documents to SearchResult format
        const results: SearchResult[] = documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          content: doc.content || "",
          extension: doc.extension,
          project_id: doc.project_id || undefined,
          created_at: doc.created_at,
          last_updated_at: doc.last_updated_at || undefined,
          // Create a snippet from the content
          snippet: doc.content
            ? extractSearchSnippet(doc.content, term)
            : undefined,
          matchCount: countMatches(doc.title + " " + (doc.content || ""), term),
        }));
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching documents:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [user?.id, projectId]
  );

  // Handle search input with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, performSearch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (onFileSelect) {
      onFileSelect(result.id, result);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
      }}
    >
      {/* Search input */}
      <div
        style={{
          padding: "16px",
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
        }}
      >
        <div style={{ position: "relative" }}>
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
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: "6px",
              fontSize: "13px",
              backgroundColor: getColor(theme.colors, "background"),
              color: getColor(theme.colors, "text"),
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = getColor(theme.colors, "primary");
            }}
            onBlur={(e) => {
              e.target.style.borderColor = getColor(theme.colors, "border");
            }}
          />
        </div>
      </div>

      {/* Search results */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
        }}
      >
        {isSearching && (
          <div
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
          <>
            <div
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                color: getColor(theme.colors, "textSecondary"),
                borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
                marginBottom: "8px",
              }}
            >
              Found {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  style={{
                    backgroundColor:
                      selectedFile === result.id
                        ? getColor(theme.colors, "primary")
                        : getColor(theme.colors, "backgroundSecondary"),
                    border: `1px solid ${
                      selectedFile === result.id
                        ? getColor(theme.colors, "primary")
                        : getColor(theme.colors, "border")
                    }`,
                    borderRadius: "6px",
                    padding: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFile !== result.id) {
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
                    if (selectedFile !== result.id) {
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
                  {/* Document title */}
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color:
                        selectedFile === result.id
                          ? getColor(theme.colors, "background")
                          : getColor(theme.colors, "text"),
                      marginBottom: "4px",
                      wordBreak: "break-word",
                    }}
                  >
                    {result.title}
                  </div>

                  {/* Match count and date */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    {result.matchCount && result.matchCount > 0 && (
                      <span
                        style={{
                          fontSize: "11px",
                          color:
                            selectedFile === result.id
                              ? getColor(theme.colors, "background")
                              : getColor(theme.colors, "textSecondary"),
                          backgroundColor:
                            selectedFile === result.id
                              ? "rgba(255,255,255,0.2)"
                              : getColor(theme.colors, "surface"),
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        {result.matchCount} match
                        {result.matchCount !== 1 ? "es" : ""}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "11px",
                        color:
                          selectedFile === result.id
                            ? getColor(theme.colors, "background")
                            : getColor(theme.colors, "textSecondary"),
                      }}
                    >
                      {formatDate(result.last_updated_at)}
                    </span>
                  </div>

                  {/* Snippet */}
                  {result.snippet && (
                    <div
                      style={{
                        fontSize: "12px",
                        color:
                          selectedFile === result.id
                            ? getColor(theme.colors, "background")
                            : getColor(theme.colors, "textSecondary"),
                        lineHeight: "1.4",
                        wordBreak: "break-word",
                      }}
                      dangerouslySetInnerHTML={{ __html: result.snippet }}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentSearch;
