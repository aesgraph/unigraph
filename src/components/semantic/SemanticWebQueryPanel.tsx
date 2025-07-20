import { StreamLanguage } from "@codemirror/language";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeBalham,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import { Parser as SparqlParser } from "sparqljs";
import { useTheme, getColor } from "app-shell";
import SelectDropdown from "../common/SelectDropdown";
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
}) => {
  // Use app-shell theme if available, fallback to legacy theme detection
  const appShellTheme = useTheme();
  const hasAppShellTheme = appShellTheme && appShellTheme.theme;

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
  const [query, setQuery] = useState(defaultQuery || DEFAULT_QUERY);
  const [results, setResults] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lintError, setLintError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

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

  const handleRunQuery = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setColumns([]);
    try {
      const url = `${effectiveEndpoint}?query=${encodeURIComponent(query)}&format=json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.results || !data.head)
        throw new Error("Malformed SPARQL result");
      setColumns(data.head.vars);
      setResults(data.results.bindings);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEndpointChange = (opt: any) => {
    setEndpoint(opt);
    if (opt.value !== "custom") setCustomEndpoint("");
  };

  // Handler for example query selection
  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx)) {
      const example = EXAMPLE_QUERIES[idx];
      setQuery(example.query);
      // Optionally set endpoint if different
      const endpointOption = ENDPOINTS.find(
        (ep) => ep.value === example.endpoint
      );
      if (endpointOption) setEndpoint(endpointOption);
      setSelectedExample(idx);
    }
  };

  // Build AgGrid columnDefs from columns
  const agGridColumnDefs = columns.map((col) => ({
    headerName: col,
    field: col,
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 120,
    maxWidth: 400,
    cellClass: styles.gridCell,
    valueGetter: (params: any) => params.data[col]?.value || "",
  }));

  // Build AgGrid rowData from results
  const agGridRowData =
    results?.map((row) => {
      // Each row is an object: { col1: { value, ... }, col2: { value, ... }, ... }
      // We'll keep as-is, and use valueGetter above
      return row;
    }) || [];

  // Generate dynamic styles from app-shell theme
  const themeStyles = hasAppShellTheme
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
    : {};

  return (
    <div
      className={styles.container}
      data-theme={isThemeDark ? "dark" : "light"}
      style={themeStyles}
    >
      <div className={styles.endpointRow}>
        <span className={styles.endpointLabel}>Endpoint:</span>
        <div className={styles.endpointSelect}>
          <SelectDropdown
            options={ENDPOINTS}
            value={endpoint}
            onChange={handleEndpointChange}
            isDarkMode={isThemeDark}
          />
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
                    borderColor: getColor(appShellTheme.theme.colors, "border"),
                  }
                : {}
            }
          />
        )}
      </div>
      {/* Example queries dropdown */}
      <div className={styles.examplesRow}>
        <span className={styles.examplesLabel}>Examples:</span>
        <select
          value={selectedExample !== null ? selectedExample : ""}
          onChange={handleExampleChange}
          className={styles.examplesSelect}
          style={
            hasAppShellTheme
              ? {
                  backgroundColor: getColor(
                    appShellTheme.theme.colors,
                    "surface"
                  ),
                  color: getColor(appShellTheme.theme.colors, "text"),
                  borderColor: getColor(appShellTheme.theme.colors, "border"),
                }
              : {}
          }
        >
          <option value="" disabled>
            Select an example query...
          </option>
          {EXAMPLE_QUERIES.map((ex, i) => (
            <option key={i} value={i}>
              {ex.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.querySection}>
        <span className={styles.queryLabel}>SPARQL Query:</span>
        <div className={styles.queryEditor}>
          <CodeMirror
            value={query}
            height="180px"
            theme={isThemeDark ? oneDark : undefined}
            extensions={[StreamLanguage.define(sparql)]}
            onChange={(value) => setQuery(value)}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              foldGutter: true,
              autocompletion: true,
            }}
            style={{
              fontSize: 15,
              fontFamily: "monospace",
            }}
          />
        </div>
        {lintError && (
          <div
            className={styles.lintError}
            style={
              hasAppShellTheme
                ? {
                    color: getColor(appShellTheme.theme.colors, "error"),
                    backgroundColor: `${getColor(appShellTheme.theme.colors, "error")}15`, // 15% opacity
                    borderColor: getColor(appShellTheme.theme.colors, "error"),
                  }
                : {}
            }
          >
            SPARQL Syntax Error: {lintError}
          </div>
        )}
        <div className={styles.actionRow}>
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
            className={`${isThemeDark ? "ag-theme-balham-dark" : "ag-theme-balham"} ${styles.gridContainer}`}
          >
            <AgGridReact
              theme={themeBalham}
              rowData={agGridRowData}
              columnDefs={agGridColumnDefs}
              rowHeight={24}
              defaultColDef={{
                sortable: true,
                resizable: true,
                filter: true,
                minWidth: 120,
                maxWidth: 400,
                floatingFilter: true,
              }}
              domLayout="normal"
              suppressMenuHide={false}
              animateRows={true}
              overlayNoRowsTemplate={`<span style='color:#888;'>No results</span>`}
              overlayLoadingTemplate={`<span style='color:#1976d2;'>Loading...</span>`}
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
