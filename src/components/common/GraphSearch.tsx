import debounce from "lodash/debounce";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RenderingManager } from "../../controllers/RenderingManager";
import { SceneGraph } from "../../core/model/SceneGraph";
import "./GraphSearch.css";
import SearchResultItem from "./SearchResultItem";

export type GraphEntityType = "Node" | "Edge";

interface GraphSearchProps {
  sceneGraph: SceneGraph;
  onSearchResult?: (nodeIds: string[]) => void;
  onSelectResult?: (nodeId: string) => void;
  isDarkMode?: boolean;
  onHighlight?: (nodeId: string) => void;
  searchTypes?: GraphEntityType[]; // New prop for filtering entity types
  placeholder?: string;
  showSelection?: boolean; // Add this prop
  value?: string; // Add this prop
}

interface SearchResult {
  id: string;
  label: string;
  type: string;
  tags: string[];
  entityType: GraphEntityType;
}

const GraphSearch: React.FC<GraphSearchProps> = ({
  sceneGraph,
  onSearchResult,
  onSelectResult,
  isDarkMode = false,
  onHighlight,
  searchTypes = ["Node", "Edge"], // Default to only Node search
  placeholder = "Search...",
  showSelection = false, // Add default value
  value = undefined, // Add default value
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(value ?? "");
  const [isSearching, setIsSearching] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [renderingManager, setRenderingManager] = useState<RenderingManager>(
    sceneGraph.getRenderingManager()
  );
  const [, setSelectedValue] = useState<string | undefined>();

  useEffect(() => {
    setSearchTerm(value ?? "");
    setSelectedValue(value);
  }, []);

  useEffect(() => {
    setRenderingManager(sceneGraph.getRenderingManager());
  }, [sceneGraph]);

  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        onSearchResult?.([]);
        setShowNoResults(false);
        return;
      }

      setShowNoResults(false);
      setIsSearching(true);
      const searchLower = term.toLowerCase();

      try {
        const results: SearchResult[] = [];

        // Only search nodes if included in searchTypes
        if (searchTypes.includes("Node")) {
          const nodes = sceneGraph.getGraph().getNodes();
          const matchingNodes = nodes
            .filter((node) => {
              const idMatch = node.getId().toLowerCase().includes(searchLower);
              const typeMatch = node
                .getType()
                .toLowerCase()
                .includes(searchLower);
              const tagsMatch = Array.from(node.getTags()).some((tag) =>
                tag.toLowerCase().includes(searchLower)
              );
              return idMatch || typeMatch || tagsMatch;
            })
            .map((node) => ({
              id: node.getId(),
              label: node.getId(),
              type: node.getType(),
              tags: Array.from(node.getTags()),
              entityType: "Node" as GraphEntityType,
            }));
          results.push(...matchingNodes);
        }

        // Only search edges if included in searchTypes
        if (searchTypes.includes("Edge")) {
          const edges = sceneGraph.getGraph().getEdges();
          const matchingEdges = edges
            .filter((edge) => {
              const sourceMatch = edge
                .getSource()
                .toLowerCase()
                .includes(searchLower);
              const targetMatch = edge
                .getTarget()
                .toLowerCase()
                .includes(searchLower);
              const typeMatch = edge
                .getType()
                .toLowerCase()
                .includes(searchLower);
              const tagsMatch = Array.from(edge.getTags()).some((tag) =>
                tag.toLowerCase().includes(searchLower)
              );
              return sourceMatch || targetMatch || typeMatch || tagsMatch;
            })
            .map((edge) => ({
              id: edge.getId(),
              label: `${edge.getSource()} → ${edge.getTarget()}`,
              type: edge.getType(),
              tags: Array.from(edge.getTags()),
              entityType: "Edge" as GraphEntityType,
            }));
          results.push(...matchingEdges);
        }

        setSearchResults(results);
        onSearchResult?.(results.map((r) => r.id));
        setShowNoResults(results.length === 0);
      } finally {
        setIsSearching(false);
      }
    },
    [sceneGraph, onSearchResult, searchTypes]
  );

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [sceneGraph]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    console.log("effect");
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        if (showSelection === false) {
          setSearchTerm("");
        }
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseLeave = () => {
    // Only hide if there are no results
    if (searchResults.length === 0) {
      setIsVisible(false);
    }
  };

  const handleFocus = () => {
    setIsVisible(true);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Clear results when search is empty
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setShowNoResults(false);
    }
  }, [searchTerm]);

  const handleSelect = useCallback(
    (nodeId: string) => {
      if (showSelection) {
        setSearchTerm(nodeId);
      } else {
        setSearchTerm("");
      }
      setSelectedValue(nodeId);
      setSearchResults([]);
      onSelectResult?.(nodeId);
    },
    [onSelectResult, showSelection]
  );

  return (
    <div
      ref={containerRef}
      className={`graph-search ${isDarkMode ? "dark" : ""} ${
        isVisible ? "visible" : ""
      }`}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsVisible(true);
          }}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`search-input ${
            showNoResults &&
            !isSearching &&
            searchTerm &&
            searchResults.length === 0
              ? "no-results"
              : ""
          }`}
        />
        {!(showSelection && searchTerm) && searchResults.length > 0 && (
          <span className={`result-count ${isDarkMode ? "dark" : ""}`}>
            {searchResults.length} results
          </span>
        )}
        {showNoResults &&
          !isSearching &&
          searchTerm &&
          searchResults.length === 0 && (
            <div className="no-results-message">No results</div>
          )}
      </div>
      {isVisible && (
        <>
          {isSearching && <div className="search-status">Searching...</div>}
          {searchResults.length > 0 && (
            <div className="search-results" ref={resultsRef}>
              {/* Only render node section if we're searching for nodes */}
              {searchTypes.includes("Node") && (
                <>
                  {searchResults
                    .filter((result) => result.entityType === "Node")
                    .map((result) => (
                      <SearchResultItem
                        key={result.id}
                        {...result}
                        isDarkMode={isDarkMode}
                        searchTerm={searchTerm}
                        onClick={() => {
                          handleSelect(result.id);
                          onHighlight?.(result.id);
                          setIsVisible(false);
                        }}
                        renderingManager={renderingManager}
                      />
                    ))}
                </>
              )}

              {/* Only render edge section if we're searching for edges */}
              {searchTypes.includes("Edge") &&
                searchResults.some((r) => r.entityType === "Edge") && (
                  <>
                    <div className="search-divider">Edges</div>
                    {searchResults
                      .filter((result) => result.entityType === "Edge")
                      .map((result) => (
                        <SearchResultItem
                          key={result.id}
                          {...result}
                          isDarkMode={isDarkMode}
                          searchTerm={searchTerm}
                          onClick={() => {
                            handleSelect(result.id);
                            onHighlight?.(result.id);
                            setIsVisible(false);
                          }}
                          renderingManager={renderingManager}
                        />
                      ))}
                  </>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GraphSearch;
