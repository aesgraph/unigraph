import { getColor, useTheme } from "@aesgraph/app-shell";
import { StreamLanguage } from "@codemirror/language";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Copy, Send, Settings, Zap } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Parser as SparqlParser } from "sparqljs";
import { useApiProvider } from "../../context/ApiProviderContext";
import { useComponentLogger } from "../../hooks/useLogger";
import { createThemedAgGridContainer } from "../../utils/aggridThemeUtils";
import { sendAIMessage } from "../ai/aiQueryLogic";
import { SEMANTIC_QUERY_TOOL, parseToolCallArguments } from "../ai/aiTools";
import { useSemanticWebQuerySession } from "./SemanticWebQueryContext";
import styles from "./SemanticWebQueryPanel.module.css";

// Predefined SPARQL endpoints
const ENDPOINTS = [
  { label: "DBpedia", value: "https://dbpedia.org/sparql" },
  { label: "Wikidata", value: "https://query.wikidata.org/sparql" },
  { label: "Europeana", value: "https://sparql.europeana.eu/" },
  { label: "Custom...", value: "custom" },
];

// Example queries for the dropdown
const EXAMPLE_QUERIES = [
  {
    label: "Wikidata: Star Wars Characters (Detailed)",
    query: `# Star Wars characters with many attributes (Wikidata)
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>

SELECT ?character ?characterLabel ?genderLabel ?birthDate ?homeworldLabel ?speciesLabel ?occupationLabel ?image WHERE {
  ?character wdt:P31 wd:Q95074. # instance of Star Wars character
  OPTIONAL { ?character wdt:P21 ?gender. }
  OPTIONAL { ?character wdt:P569 ?birthDate. }
  OPTIONAL { ?character wdt:P19 ?homeworld. }
  OPTIONAL { ?character wdt:P31 ?species. }
  OPTIONAL { ?character wdt:P106 ?occupation. }
  OPTIONAL { ?character wdt:P18 ?image. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 300`,
    endpoint: "https://query.wikidata.org/sparql",
  },
  {
    label: "DBpedia: Nobel Prize Winners (Detailed)",
    query: `# Nobel Prize winners with many attributes (DBpedia)
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?person ?name ?birthDate ?deathDate ?birthPlace ?nationality ?occupation ?abstract WHERE {
  ?person dbo:award <http://dbpedia.org/resource/Nobel_Prize> .
  OPTIONAL { ?person foaf:name ?name. }
  OPTIONAL { ?person dbo:birthDate ?birthDate. }
  OPTIONAL { ?person dbo:deathDate ?deathDate. }
  OPTIONAL { ?person dbo:birthPlace ?birthPlace. }
  OPTIONAL { ?person dbo:nationality ?nationality. }
  OPTIONAL { ?person dbo:occupation ?occupation. }
  OPTIONAL { ?person dbo:abstract ?abstract. FILTER (lang(?abstract) = 'en') }
}
LIMIT 300`,
    endpoint: "https://dbpedia.org/sparql",
  },
  {
    label: "Simple SELECT",
    query: `SELECT ?subject ?predicate ?object WHERE {
  ?subject ?predicate ?object
} LIMIT 10`,
    endpoint: "https://dbpedia.org/sparql",
  },
];

interface SemanticWebQueryPanelProps {
  onResultsToSceneGraph?: (bindings: any[]) => void;
  defaultEndpoint?: string;
  defaultQuery?: string;
  isDarkMode?: boolean;
  theme?: string; // Theme from AppShell workspace
  sessionId?: string; // Session ID for context
}

const DEFAULT_QUERY = `SELECT ?subject ?predicate ?object WHERE {
  ?subject ?predicate ?object
} LIMIT 10`;

const parser = new SparqlParser();

// Register AG Grid modules (only needs to be done once)
ModuleRegistry.registerModules([AllCommunityModule]);

const SemanticWebQueryPanel: React.FC<SemanticWebQueryPanelProps> = ({
  onResultsToSceneGraph,
  defaultEndpoint,
  defaultQuery,
  isDarkMode = false,
  theme: legacyTheme, // Renamed to avoid conflict
  sessionId = "default-semantic-panel",
}) => {
  const log = useComponentLogger("SemanticWebQueryPanel");
  // Use app-shell theme if available, fallback to legacy theme detection
  const appShellTheme = useTheme();
  const hasAppShellTheme = appShellTheme && appShellTheme.theme;

  // Use semantic web query context
  const { query, setQuery, history, addToHistory } =
    useSemanticWebQuerySession(sessionId);

  // Initialize example queries in history if history is empty
  useEffect(() => {
    if (history.length === 0 && !examplesInitializedRef.current) {
      // Add example queries to history with earlier timestamps so they appear at bottom
      EXAMPLE_QUERIES.forEach((example, index) => {
        // Create timestamps that are progressively earlier so examples appear at bottom
        const exampleTimestamp = new Date(
          Date.now() - (EXAMPLE_QUERIES.length - index) * 60000
        ); // 1 minute apart
        addToHistory(example.query, example.endpoint, exampleTimestamp);
      });
      examplesInitializedRef.current = true;
    }
  }, [addToHistory, history.length]);

  // Debug history
  useEffect(() => {
    log.debug("History updated", { length: history.length, history });
  }, [history, log]);

  // Use API provider context
  const { apiProvider, openaiApiKey, liveChatUrl, isCustomEndpoint } =
    useApiProvider();

  // Determine if dark mode based on app-shell theme or legacy props
  const isThemeDark = hasAppShellTheme
    ? appShellTheme.theme.colors.background.includes("0,") ||
      appShellTheme.theme.colors.background.includes("#0") ||
      appShellTheme.theme.colors.background.includes("#1") ||
      appShellTheme.theme.colors.background.includes("#2")
    : legacyTheme === "dark" || isDarkMode;
  const [endpoint, setEndpoint] = useState(
    ENDPOINTS.find((e) => e.value === defaultEndpoint) || ENDPOINTS[0]
  );
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lintError, setLintError] = useState<string | null>(null);

  const [copySuccess, setCopySuccess] = useState(false);
  const [_showAskAI, setShowAskAI] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [autoRunAIQueries, setAutoRunAIQueries] = useState(false);
  const [editorHeight, setEditorHeight] = useState(200); // Default height
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(200);
  const currentQueryRef = useRef(query);
  const examplesInitializedRef = useRef(false);

  // Update ref when query changes
  useEffect(() => {
    currentQueryRef.current = query;
  }, [query]);

  // Initialize query from defaultQuery prop if context query is empty
  useEffect(() => {
    if (!query && defaultQuery) {
      setQuery(defaultQuery);
    } else if (!query) {
      setQuery(DEFAULT_QUERY);
    }
  }, [query, defaultQuery, setQuery]);

  const effectiveEndpoint =
    endpoint.value === "custom" ? customEndpoint : endpoint.value;

  // Lint the query on every change
  useEffect(() => {
    try {
      parser.parse(query);
      setLintError(null);
    } catch (e: any) {
      setLintError(e.message || String(e));
    }
  }, [query]);

  // Helper function to run query with current value
  const runQueryWithCurrentValue = async (queryToRun: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setColumns([]);

    // Log query execution start
    log.info(`Executing SPARQL query`, {
      sessionId,
      endpoint: effectiveEndpoint,
      query:
        queryToRun.substring(0, 200) + (queryToRun.length > 200 ? "..." : ""),
    });

    try {
      const url = `${effectiveEndpoint}?query=${encodeURIComponent(queryToRun)}&format=json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.results || !data.head)
        throw new Error("Malformed SPARQL result");
      setColumns(data.head.vars);
      setResults(data.results.bindings);

      // Log successful query execution
      log.info(`SPARQL query executed successfully`, {
        sessionId,
        query: queryToRun,
        endpoint: effectiveEndpoint,
        columns: data.head.vars,
        resultCount: data.results.bindings.length,
      });
    } catch (e: any) {
      const errorMessage = e.message || String(e);
      setError(errorMessage);

      // Log query error
      log.error(`SPARQL query failed`, {
        sessionId,
        query: queryToRun,
        endpoint: effectiveEndpoint,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!query.trim() || !effectiveEndpoint) return;

    try {
      await runQueryWithCurrentValue(query);
      // Add to history when query is successfully run (no errors thrown)
      log.debug("Adding to history", { query, endpoint: effectiveEndpoint });
      addToHistory(query, effectiveEndpoint);
    } catch (err) {
      // Error is already handled by runQueryWithCurrentValue
      log.error("Query execution failed", { error: err });
    }
  };

  const _handleEndpointChange = (opt: any) => {
    setEndpoint(opt);
    if (opt.value !== "custom") setCustomEndpoint("");
  };

  // Copy query to clipboard
  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500); // Reset after 1.5 seconds
      log.debug("Query copied to clipboard");
    } catch (err) {
      log.error("Failed to copy query", { error: err });
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = query;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500); // Reset after 1.5 seconds
    }
  };

  const _handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startYRef.current = e.clientY;
    startHeightRef.current = editorHeight;
    setIsResizing(true);

    // Add event listeners with passive: false to ensure they work
    document.addEventListener("mousemove", handleResizeMove, {
      passive: false,
    });
    document.addEventListener("mouseup", handleResizeEnd, { passive: false });
  };

  const handleResizeMove = (e: MouseEvent) => {
    e.preventDefault();
    if (!isResizing) return;

    const deltaY = e.clientY - startYRef.current;
    const newHeight = startHeightRef.current + deltaY;

    // Set minimum and maximum heights
    const minHeight = 100;
    const maxHeight = 600;

    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setEditorHeight(newHeight);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  // Simple resize handler using onMouseDown directly
  const handleSimpleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startHeight = editorHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = startHeight + deltaY;

      const minHeight = 100;
      const maxHeight = 600;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setEditorHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Ask AI to generate SPARQL query
  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    try {
      // Create a chat message for the AI
      const chatMessages = [
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          role: "user" as const,
          content: `Generate a SPARQL query for: ${aiQuery}. Use endpoint: ${effectiveEndpoint}. 

IMPORTANT: Include all necessary PREFIX declarations at the beginning of the query. Common prefixes to consider:
- PREFIX dbo: <http://dbpedia.org/ontology/>
- PREFIX dbr: <http://dbpedia.org/resource/>
- PREFIX foaf: <http://xmlns.com/foaf/0.1/>
- PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
- PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
- PREFIX wd: <http://www.wikidata.org/entity/>
- PREFIX wdt: <http://www.wikidata.org/prop/direct/>
- PREFIX wikibase: <http://wikiba.se/ontology#>

CRITICAL: Ensure the query follows proper SPARQL syntax:
- Use valid subject-predicate-object triples
- Use correct property names (e.g., dbo:manufacturer, not dbo:product)
- For companies, use dbo:manufacturer to find products they make
- For people, use dbo:birthPlace, dbo:occupation, etc.
- Always end triples with a period (.)

Example correct query structure:
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
SELECT ?product ?label WHERE {
  ?product dbo:manufacturer dbr:Apple_Inc. .
  ?product rdfs:label ?label .
  FILTER (lang(?label) = 'en') .
}

Return only the complete SPARQL query with prefixes, no explanations.`,
        },
      ];

      // Use the sendAIMessage function to generate a SPARQL query
      const response = await sendAIMessage({
        chatMessages,
        apiProvider,
        openaiApiKey,
        liveChatUrl,
        isCustomEndpoint,
        isSignedIn: false, // Not needed for SPARQL generation
        user: null,
        temperature: 0.7,
        tools: [SEMANTIC_QUERY_TOOL],
      });

      // Process tool calls if present
      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          if (toolCall.function.name === "semantic_query") {
            try {
              const args = parseToolCallArguments(toolCall);
              if (args.query) {
                // Extract and format the SPARQL query
                const sparqlQuery = cleanSparqlQuery(args.query);
                setQuery(sparqlQuery);
                setShowAskAI(false);
                setAiQuery("");

                // Auto-run the query if toggle is enabled
                if (autoRunAIQueries) {
                  // Use the actual query value instead of waiting for state update
                  await runQueryWithCurrentValue(sparqlQuery);
                }

                return; // Success, exit early
              }
            } catch (error) {
              log.error("Failed to parse semantic_query tool call arguments", {
                error,
              });
            }
          }
        }
      }

      // Fallback: if no tool calls or parsing failed, try to extract from content
      if (response.content) {
        // Try to extract SPARQL query from the response content
        const content = response.content.trim();

        // Look for SPARQL query patterns in the content
        const sparqlPattern =
          /(SELECT|ASK|CONSTRUCT|DESCRIBE)\s+.*?(?=\n\n|\n$|$)/gis;
        const match = content.match(sparqlPattern);

        if (match && match[0]) {
          const sparqlQuery = cleanSparqlQuery(match[0]);
          setQuery(sparqlQuery);
          setShowAskAI(false);
          setAiQuery("");

          // Auto-run the query if toggle is enabled
          if (autoRunAIQueries) {
            await runQueryWithCurrentValue(sparqlQuery);
          }

          return;
        }

        // If no clear SPARQL pattern, use the entire content
        const cleanedContent = cleanSparqlQuery(content);
        setQuery(cleanedContent);
        setShowAskAI(false);
        setAiQuery("");

        // Auto-run the query if toggle is enabled
        if (autoRunAIQueries) {
          await runQueryWithCurrentValue(cleanedContent);
        }
      } else {
        throw new Error("No response received from AI");
      }
    } catch (error) {
      log.error("Failed to generate SPARQL query", { error });
      // Fallback: use a simple prompt to generate a basic query
      const fallbackQuery = `# Generated query for: ${aiQuery}
SELECT ?subject ?predicate ?object WHERE {
  ?subject ?predicate ?object .
  FILTER(CONTAINS(STR(?subject), "${aiQuery.split(" ")[0]}") ||
         CONTAINS(STR(?object), "${aiQuery.split(" ")[0]}"))
} LIMIT 100`;
      setQuery(fallbackQuery);
      setShowAskAI(false);
      setAiQuery("");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper function to clean up SPARQL queries
  const cleanSparqlQuery = (query: string): string => {
    const cleaned = query
      // Remove markdown code blocks (```sparql ... ``` or ``` ... ```)
      .replace(/```(?:sparql)?\s*\n?/gi, "")
      .replace(/```\s*$/gi, "")
      // Remove leading/trailing whitespace
      .trim()
      // Remove any remaining markdown formatting
      .replace(/^#\s*/gm, "") // Remove markdown headers
      .replace(/^\*\s*/gm, "") // Remove markdown list items
      .replace(/^-\s*/gm, "") // Remove markdown list items
      // Clean up multiple newlines
      .replace(/\n\s*\n/g, "\n")
      // Fix SPARQL-specific issues
      .replace(/\.\./g, ".") // Fix double periods
      .replace(/\s+\.\s*/g, " . ") // Ensure proper spacing around periods
      .replace(/\s*\{\s*/g, " {\n  ") // Format opening braces
      .replace(/\s*\}\s*/g, "\n}") // Format closing braces
      // Ensure proper line breaks for SPARQL keywords
      .replace(
        /\b(SELECT|WHERE|OPTIONAL|FILTER|LIMIT|ORDER BY|GROUP BY|HAVING|UNION|PREFIX|ASK|CONSTRUCT|DESCRIBE)\b/gi,
        "\n$1"
      )
      // Final trim and cleanup
      .trim()
      .replace(/\n\s*\n/g, "\n") // Remove extra blank lines
      .replace(/^\n+/, "") // Remove leading newlines
      .replace(/\n+$/, ""); // Remove trailing newlines

    // Basic SPARQL syntax validation and fixes
    const lines = cleaned.split("\n");
    const fixedLines = lines.map((line) => {
      // Fix common SPARQL syntax issues
      let fixedLine = line.trim();

      // Ensure triples end with a period
      if (
        fixedLine.includes("?") &&
        !fixedLine.endsWith(".") &&
        !fixedLine.endsWith("{") &&
        !fixedLine.endsWith("}") &&
        !fixedLine.startsWith("PREFIX") &&
        !fixedLine.startsWith("SELECT") &&
        !fixedLine.startsWith("WHERE") &&
        !fixedLine.startsWith("FILTER")
      ) {
        fixedLine += " .";
      }

      // Fix common property name mistakes
      fixedLine = fixedLine.replace(/\bdbo:product\b/g, "dbo:manufacturer"); // dbo:product doesn't exist, use dbo:manufacturer

      return fixedLine;
    });

    return fixedLines.join("\n");
  };

  // Build AgGrid columnDefs from columns
  const agGridColumnDefs = useMemo(
    () =>
      columns.map((col) => ({
        headerName: col,
        field: col,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 120,
        maxWidth: 400,
        cellClass: styles.gridCell,
        valueGetter: (params: any) => params.data[col]?.value || "",
      })),
    [columns]
  );

  // Build AgGrid rowData from results
  const agGridRowData = useMemo(
    () =>
      results?.map((row) => {
        // Each row is an object: { col1: { value, ... }, col2: { value, ... }, ... }
        // We'll keep as-is, and use valueGetter above
        return row;
      }) || [],
    [results]
  );

  // Generate dynamic styles from app-shell theme
  const themeStyles = useMemo(
    () =>
      hasAppShellTheme
        ? ({
            backgroundColor: getColor(appShellTheme.theme.colors, "background"),
            color: getColor(appShellTheme.theme.colors, "text"),
            "--panel-bg": getColor(appShellTheme.theme.colors, "surface"),
            "--panel-border": getColor(appShellTheme.theme.colors, "border"),
            "--text-color": getColor(appShellTheme.theme.colors, "text"),
            "--text-secondary": getColor(
              appShellTheme.theme.colors,
              "textSecondary"
            ),
            "--primary-color": getColor(appShellTheme.theme.colors, "primary"),
            "--error-color": getColor(appShellTheme.theme.colors, "error"),
            "--success-color": getColor(appShellTheme.theme.colors, "success"),
          } as React.CSSProperties)
        : {},
    [hasAppShellTheme, appShellTheme.theme.colors]
  );

  // Memoize AgGrid container styles
  const agGridContainerStyle = useMemo(
    () =>
      hasAppShellTheme ? createThemedAgGridContainer(appShellTheme.theme) : {},
    [hasAppShellTheme, appShellTheme.theme]
  );

  // Memoize overlay templates
  const overlayNoRowsTemplate = useMemo(
    () =>
      hasAppShellTheme
        ? `<span style='color:${getColor(appShellTheme.theme.colors, "textMuted")};'>No results</span>`
        : `<span style='color:#888;'>No results</span>`,
    [hasAppShellTheme, appShellTheme.theme.colors]
  );

  const overlayLoadingTemplate = useMemo(
    () =>
      hasAppShellTheme
        ? `<span style='color:${getColor(appShellTheme.theme.colors, "primary")};'>Loading...</span>`
        : `<span style='color:#1976d2;'>Loading...</span>`,
    [hasAppShellTheme, appShellTheme.theme.colors]
  );

  return (
    <div
      className={styles.container}
      data-theme={isThemeDark ? "dark" : "light"}
      style={themeStyles}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>SPARQL Querier</h2>
        </div>
        <div className={styles.headerRight}>
          <p>Fetch data from the Semantic Web</p>
        </div>
      </div>

      <div className={styles.querySection}>
        <div className={styles.queryEditor}>
          <div className={styles.queryEditorHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.aiInputContainer}>
                <input
                  type="text"
                  className={styles.aiInput}
                  placeholder="Ask AI to write a SPARQL query..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskAI();
                    } else if (e.key === "Escape") {
                      setAiQuery("");
                    }
                  }}
                  style={{
                    backgroundColor: getColor(
                      appShellTheme.theme.colors,
                      "surface"
                    ),
                    color: getColor(appShellTheme.theme.colors, "text"),
                    border: `1px solid ${getColor(appShellTheme.theme.colors, "border")}`,
                    borderRadius: `${appShellTheme.theme.sizes.borderRadius}px`,
                    padding: `${appShellTheme.theme.sizes.spacing.sm}px`,
                    fontSize: `${appShellTheme.theme.sizes.fontSize.sm}px`,
                  }}
                />
                <button
                  className={styles.sendAIButton}
                  onClick={handleAskAI}
                  disabled={aiLoading || !aiQuery.trim()}
                  style={{
                    backgroundColor: getColor(
                      appShellTheme.theme.colors,
                      "primary"
                    ),
                    color: getColor(appShellTheme.theme.colors, "textInverse"),
                    border: `1px solid ${getColor(appShellTheme.theme.colors, "primary")}`,
                    borderRadius: `${appShellTheme.theme.sizes.borderRadius}px`,
                    padding: `${appShellTheme.theme.sizes.spacing.sm}px`,
                    fontSize: `${appShellTheme.theme.sizes.fontSize.sm}px`,
                  }}
                >
                  <Send size={16} />
                </button>
                <button
                  className={styles.autoRunToggle}
                  onClick={() => setAutoRunAIQueries(!autoRunAIQueries)}
                  title={
                    autoRunAIQueries
                      ? "Auto mode: Queries will run automatically when AI generates them"
                      : "Manual mode: Queries will not run automatically - click 'Run Query' to execute"
                  }
                  style={{
                    backgroundColor: autoRunAIQueries
                      ? getColor(appShellTheme.theme.colors, "success")
                      : getColor(appShellTheme.theme.colors, "surface"),
                    color: autoRunAIQueries
                      ? getColor(appShellTheme.theme.colors, "text")
                      : getColor(appShellTheme.theme.colors, "text"),
                    border: `1px solid ${
                      autoRunAIQueries
                        ? getColor(appShellTheme.theme.colors, "success")
                        : getColor(appShellTheme.theme.colors, "border")
                    }`,
                    borderRadius: `${appShellTheme.theme.sizes.borderRadius}px`,
                    padding: `${appShellTheme.theme.sizes.spacing.sm}px`,
                    fontSize: `${appShellTheme.theme.sizes.fontSize.sm}px`,
                  }}
                >
                  {autoRunAIQueries ? (
                    <Zap size={16} />
                  ) : (
                    <Settings size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.copyButton}
                onClick={handleCopyQuery}
                title={copySuccess ? "Copied!" : "Copy query to clipboard"}
                style={{
                  backgroundColor: copySuccess
                    ? `${getColor(appShellTheme.theme.colors, "success")}20`
                    : "transparent",
                  color: copySuccess
                    ? getColor(appShellTheme.theme.colors, "success")
                    : getColor(appShellTheme.theme.colors, "textSecondary"),
                  border: copySuccess
                    ? `1px solid ${getColor(appShellTheme.theme.colors, "success")}`
                    : "none",
                  borderRadius: `${appShellTheme.theme.sizes.borderRadius}px`,
                  padding: `${appShellTheme.theme.sizes.spacing.sm}px`,
                  fontSize: `${appShellTheme.theme.sizes.fontSize.sm}px`,
                  opacity: 0.7,
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${getColor(appShellTheme.theme.colors, "textSecondary")}15`;
                  e.currentTarget.style.color = getColor(
                    appShellTheme.theme.colors,
                    "primary"
                  );
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = copySuccess
                    ? `${getColor(appShellTheme.theme.colors, "success")}20`
                    : "transparent";
                  e.currentTarget.style.color = copySuccess
                    ? getColor(appShellTheme.theme.colors, "success")
                    : getColor(appShellTheme.theme.colors, "textSecondary");
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${getColor(appShellTheme.theme.colors, "primary")}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          <div
            className={styles.codeMirrorContainer}
            style={{ height: `${editorHeight}px` }}
          >
            <CodeMirror
              value={query}
              onChange={setQuery}
              extensions={[StreamLanguage.define(sparql)]}
              theme={isThemeDark ? oneDark : undefined}
              className={styles.codeMirror}
              style={
                hasAppShellTheme
                  ? {
                      backgroundColor: getColor(
                        appShellTheme.theme.colors,
                        "surface"
                      ),
                      color: getColor(appShellTheme.theme.colors, "text"),
                      borderColor: getColor(
                        appShellTheme.theme.colors,
                        "border"
                      ),
                    }
                  : {}
              }
            />
          </div>
          <div
            ref={resizeRef}
            className={styles.resizeHandle}
            onMouseDown={handleSimpleResize}
            style={{
              cursor: "row-resize",
            }}
          />
        </div>
        {lintError && (
          <div
            className={styles.lintError}
            style={
              hasAppShellTheme
                ? {
                    color: getColor(appShellTheme.theme.colors, "warning"),
                    backgroundColor: `${getColor(appShellTheme.theme.colors, "warning")}15`, // 15% opacity
                    borderColor: getColor(
                      appShellTheme.theme.colors,
                      "warning"
                    ),
                  }
                : {}
            }
          >
            Syntax Error: {lintError}
          </div>
        )}
        <div className={styles.actionRow}>
          {history.length > 0 && (
            <div className={styles.historySection}>
              <span className={styles.historyLabel}>History:</span>
              <select
                className={styles.historyDropdown}
                onChange={(e) => {
                  const selectedEntry = history.find(
                    (h) => h.id === e.target.value
                  );
                  if (selectedEntry) {
                    setQuery(selectedEntry.query);
                    // Also update the endpoint if it's different
                    if (selectedEntry.endpoint !== endpoint.value) {
                      const endpointOption = ENDPOINTS.find(
                        (ep) => ep.value === selectedEntry.endpoint
                      );
                      if (endpointOption) {
                        setEndpoint(endpointOption);
                      }
                    }
                  }
                }}
                value=""
                style={
                  hasAppShellTheme
                    ? {
                        backgroundColor: getColor(
                          appShellTheme.theme.colors,
                          "surface"
                        ),
                        color: getColor(appShellTheme.theme.colors, "text"),
                        borderColor: getColor(
                          appShellTheme.theme.colors,
                          "border"
                        ),
                        borderRadius: `${appShellTheme.theme.sizes.borderRadius}px`,
                        padding: `${appShellTheme.theme.sizes.spacing.sm}px`,
                        fontSize: `${appShellTheme.theme.sizes.fontSize.sm}px`,
                      }
                    : {}
                }
              >
                <option value="">Select previous query</option>
                {[...history]
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((entry) => {
                    // Check if this is an example query by matching with EXAMPLE_QUERIES
                    const exampleQuery = EXAMPLE_QUERIES.find(
                      (ex) =>
                        ex.query === entry.query &&
                        ex.endpoint === entry.endpoint
                    );

                    if (exampleQuery) {
                      return (
                        <option key={entry.id} value={entry.id}>
                          📚 {exampleQuery.label}
                        </option>
                      );
                    }

                    return (
                      <option key={entry.id} value={entry.id}>
                        {entry.timestamp.toLocaleString()} -{" "}
                        {entry.query.substring(0, 50)}...
                      </option>
                    );
                  })}
              </select>
            </div>
          )}
          <div className={styles.endpointSection}>
            <span className={styles.endpointLabel}>Endpoint:</span>
            <select
              className={styles.historyDropdown}
              value={endpoint.value}
              onChange={(e) => {
                const selectedEndpoint = ENDPOINTS.find(
                  (ep) => ep.value === e.target.value
                );
                if (selectedEndpoint) {
                  setEndpoint(selectedEndpoint);
                }
              }}
              style={
                hasAppShellTheme
                  ? {
                      backgroundColor: getColor(
                        appShellTheme.theme.colors,
                        "surface"
                      ),
                      color: getColor(appShellTheme.theme.colors, "text"),
                      borderColor: getColor(
                        appShellTheme.theme.colors,
                        "border"
                      ),
                      borderRadius: `${appShellTheme.theme.sizes.borderRadius}px`,
                      padding: `${appShellTheme.theme.sizes.spacing.sm}px`,
                      fontSize: `${appShellTheme.theme.sizes.fontSize.sm}px`,
                    }
                  : {}
              }
            >
              {ENDPOINTS.map((ep) => (
                <option key={ep.value} value={ep.value}>
                  {ep.label}
                </option>
              ))}
            </select>
          </div>
          {endpoint.value === "custom" && (
            <input
              type="text"
              placeholder="Enter custom endpoint URL"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              className={styles.customEndpointInput}
              style={
                hasAppShellTheme
                  ? {
                      backgroundColor: getColor(
                        appShellTheme.theme.colors,
                        "surface"
                      ),
                      color: getColor(appShellTheme.theme.colors, "text"),
                      borderColor: getColor(
                        appShellTheme.theme.colors,
                        "border"
                      ),
                    }
                  : {}
              }
            />
          )}
          <button
            onClick={handleRunQuery}
            disabled={loading || !effectiveEndpoint}
            className={styles.runButton}
            style={
              hasAppShellTheme
                ? {
                    backgroundColor: getColor(
                      appShellTheme.theme.colors,
                      "primary"
                    ),
                    color: getColor(appShellTheme.theme.colors, "textInverse"),
                    borderColor: getColor(
                      appShellTheme.theme.colors,
                      "primary"
                    ),
                  }
                : {}
            }
          >
            {loading ? "Running..." : "Run Query"}
          </button>
          {onResultsToSceneGraph && results && results.length > 0 && (
            <button
              onClick={() => onResultsToSceneGraph(results)}
              className={styles.addToSceneGraphButton}
              style={
                hasAppShellTheme
                  ? {
                      backgroundColor: getColor(
                        appShellTheme.theme.colors,
                        "success"
                      ),
                      color: getColor(
                        appShellTheme.theme.colors,
                        "textInverse"
                      ),
                      borderColor: getColor(
                        appShellTheme.theme.colors,
                        "success"
                      ),
                    }
                  : {}
              }
            >
              Add Results to SceneGraph
            </button>
          )}
        </div>
      </div>
      <div className={styles.resultsSection}>
        {error && (
          <div
            className={styles.error}
            style={
              hasAppShellTheme
                ? {
                    color: getColor(appShellTheme.theme.colors, "error"),
                    backgroundColor: `${getColor(appShellTheme.theme.colors, "error")}20`, // 20% opacity
                    borderColor: getColor(appShellTheme.theme.colors, "error"),
                  }
                : {}
            }
          >
            Error: {error}
          </div>
        )}
        {results && results.length > 0 && (
          <div
            className={`ag-theme-alpine ${styles.gridContainer}`}
            style={agGridContainerStyle}
          >
            <AgGridReact
              rowData={agGridRowData}
              columnDefs={agGridColumnDefs}
              rowHeight={24}
              defaultColDef={{
                sortable: true,
                resizable: true,
                filter: true,
                minWidth: 120,
                maxWidth: undefined, // Remove max width constraint
                floatingFilter: true,
                flex: 1, // Make columns flexible
              }}
              domLayout="normal"
              suppressMenuHide={false}
              animateRows={true}
              overlayNoRowsTemplate={overlayNoRowsTemplate}
              overlayLoadingTemplate={overlayLoadingTemplate}
              // Pagination configuration
              pagination={true}
              paginationPageSize={500}
              paginationPageSizeSelector={[50, 100, 200, 500]}
              suppressPaginationPanel={false}
            />
          </div>
        )}
        {results && results.length === 0 && (
          <div
            className={styles.noResults}
            style={
              hasAppShellTheme
                ? {
                    color: getColor(appShellTheme.theme.colors, "textMuted"),
                  }
                : {}
            }
          >
            No results.
          </div>
        )}
        {/* Footer with number of results */}
        {results && (
          <div
            className={styles.footer}
            style={
              hasAppShellTheme
                ? {
                    color: getColor(
                      appShellTheme.theme.colors,
                      "textSecondary"
                    ),
                    borderColor: getColor(appShellTheme.theme.colors, "border"),
                  }
                : {}
            }
          >
            {results.length} result{results.length === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SemanticWebQueryPanel;
