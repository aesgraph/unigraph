import { useTheme } from "@aesgraph/app-shell";
import Editor, { Monaco } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import { useCommandProcessor } from "../commandPalette/CommandProcessor";
import {
  createMonacoEditorCodeTool,
  MonacoEditorCodeToolState,
} from "./MonacoEditorCodeTool";
import { monacoEditorExamples } from "./MonacoEditorExamples";

interface MonacoEditorViewProps {
  theme?: any;
}

const MonacoEditorView: React.FC<MonacoEditorViewProps> = (_props) => {
  const [code, setCode] = useState(monacoEditorExamples.typescript);
  const [language, setLanguage] = useState("typescript");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showLinting, setShowLinting] = useState(true);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const codeToolRef = useRef<any>(null);

  const { theme } = useTheme();
  const { registerTool } = useCommandProcessor();

  // Create and register the code generation tool
  useEffect(() => {
    const toolState: MonacoEditorCodeToolState = {
      setCode,
      setLanguage,
      getCurrentLanguage: () => language,
      getCurrentCode: () => code,
    };

    const codeTool = createMonacoEditorCodeTool(toolState);
    codeToolRef.current = codeTool;
    registerTool(codeTool);

    // Cleanup function to unregister tool if needed
    return () => {
      // Note: The command processor doesn't have an unregister method yet
      // This is fine for now as tools are typically long-lived
    };
  }, [registerTool, language, code]);

  // Update the tool's state when code or language changes
  useEffect(() => {
    if (codeToolRef.current) {
      const toolState: MonacoEditorCodeToolState = {
        setCode,
        setLanguage,
        getCurrentLanguage: () => language,
        getCurrentCode: () => code,
      };
      codeToolRef.current.updateState(toolState);
    }
  }, [language, code]);

  // Add a small status indicator for the code generation tool
  const [toolRegistered, setToolRegistered] = useState(false);
  useEffect(() => {
    setToolRegistered(true);
  }, []);

  // Define custom theme with semantic highlighting
  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco;

    // Define custom theme based on app-shell theme
    const customTheme = {
      base: (theme?.id === "dark" ? "vs-dark" : "vs") as
        | "vs"
        | "vs-dark"
        | "hc-black",
      inherit: true,
      rules: [
        // Type identifiers (interfaces, types, classes)
        {
          token: "type.identifier",
          foreground: theme?.colors?.primary || "#4ec9b0",
          fontStyle: "italic",
        },
        {
          token: "class.identifier",
          foreground: theme?.colors?.primary || "#4ec9b0",
          fontStyle: "italic",
        },
        {
          token: "interface.identifier",
          foreground: theme?.colors?.primary || "#4ec9b0",
          fontStyle: "italic",
        },

        // Keywords
        { token: "keyword", foreground: theme?.colors?.primary || "#569cd6" },
        {
          token: "keyword.control",
          foreground: theme?.colors?.primary || "#569cd6",
        },
        {
          token: "keyword.operator",
          foreground: theme?.colors?.text || "#d4d4d4",
        },

        // Strings
        { token: "string", foreground: theme?.colors?.accent || "#d69d85" },
        {
          token: "string.quoted",
          foreground: theme?.colors?.accent || "#d69d85",
        },
        {
          token: "string.quoted.single",
          foreground: theme?.colors?.accent || "#d69d85",
        },
        {
          token: "string.quoted.double",
          foreground: theme?.colors?.accent || "#d69d85",
        },

        // Numbers
        { token: "number", foreground: theme?.colors?.secondary || "#b5cea8" },
        {
          token: "number.hex",
          foreground: theme?.colors?.secondary || "#b5cea8",
        },
        {
          token: "number.float",
          foreground: theme?.colors?.secondary || "#b5cea8",
        },

        // Comments
        {
          token: "comment",
          foreground: theme?.colors?.textMuted || "#6a9955",
          fontStyle: "italic",
        },
        {
          token: "comment.doc",
          foreground: theme?.colors?.textMuted || "#6a9955",
          fontStyle: "italic",
        },

        // Functions and methods
        { token: "function", foreground: theme?.colors?.accent || "#dcdcaa" },
        {
          token: "function.identifier",
          foreground: theme?.colors?.accent || "#dcdcaa",
        },
        { token: "method", foreground: theme?.colors?.accent || "#dcdcaa" },
        {
          token: "method.identifier",
          foreground: theme?.colors?.accent || "#dcdcaa",
        },

        // Variables
        { token: "variable", foreground: theme?.colors?.text || "#9cdcfe" },
        {
          token: "variable.identifier",
          foreground: theme?.colors?.text || "#9cdcfe",
        },
        {
          token: "variable.parameter",
          foreground: theme?.colors?.text || "#9cdcfe",
        },
        {
          token: "variable.language",
          foreground: theme?.colors?.secondary || "#569cd6",
        },

        // Constants
        {
          token: "constant",
          foreground: theme?.colors?.secondary || "#4fc1ff",
        },
        {
          token: "constant.language",
          foreground: theme?.colors?.secondary || "#4fc1ff",
        },

        // Operators and punctuation
        { token: "operator", foreground: theme?.colors?.text || "#d4d4d4" },
        { token: "delimiter", foreground: theme?.colors?.text || "#d4d4d4" },
        { token: "punctuation", foreground: theme?.colors?.text || "#d4d4d4" },

        // Support (built-in functions, classes)
        { token: "support", foreground: theme?.colors?.secondary || "#4fc1ff" },
        {
          token: "support.function",
          foreground: theme?.colors?.secondary || "#4fc1ff",
        },
        {
          token: "support.class",
          foreground: theme?.colors?.secondary || "#4fc1ff",
        },
        {
          token: "support.type",
          foreground: theme?.colors?.secondary || "#4fc1ff",
        },

        // Entity names
        {
          token: "entity.name",
          foreground: theme?.colors?.primary || "#4ec9b0",
        },
        {
          token: "entity.name.function",
          foreground: theme?.colors?.accent || "#dcdcaa",
        },
        {
          token: "entity.name.class",
          foreground: theme?.colors?.primary || "#4ec9b0",
        },
        {
          token: "entity.name.type",
          foreground: theme?.colors?.primary || "#4ec9b0",
        },

        // Storage (var, let, const, function, class)
        { token: "storage", foreground: theme?.colors?.primary || "#569cd6" },
        {
          token: "storage.type",
          foreground: theme?.colors?.primary || "#569cd6",
        },
        {
          token: "storage.modifier",
          foreground: theme?.colors?.primary || "#569cd6",
        },
      ],
      colors: {
        "editor.background": theme?.colors?.background || "#1e1e1e",
        "editor.foreground": theme?.colors?.text || "#d4d4d4",
        "editor.lineHighlightBackground":
          theme?.colors?.backgroundSecondary || "#2a2d2e",
        "editor.selectionBackground":
          (theme?.colors?.primary || "#007acc") + "40",
        "editor.inactiveSelectionBackground":
          (theme?.colors?.primary || "#007acc") + "20",
        "editorCursor.foreground": theme?.colors?.primary || "#007acc",
        "editorWhitespace.foreground": theme?.colors?.textMuted || "#3e3e42",
        "editorIndentGuide.background": theme?.colors?.border || "#404040",
        "editor.selectionHighlightBorder": theme?.colors?.primary || "#007acc",
        "editorError.foreground": theme?.colors?.error || "#f44747",
        "editorWarning.foreground": theme?.colors?.warning || "#cca700",
        "editorInfo.foreground": theme?.colors?.info || "#007acc",
        "editorHint.foreground": theme?.colors?.accent || "#6a9955",
        "editorLineNumber.foreground": theme?.colors?.textMuted || "#858585",
        "editorLineNumber.activeForeground":
          theme?.colors?.primary || "#007acc",
        "editorGutter.background":
          theme?.colors?.backgroundSecondary || "#252526",
        "editorBracketMatch.background":
          (theme?.colors?.primary || "#007acc") + "20",
        "editorBracketMatch.border": theme?.colors?.primary || "#007acc",
      },
    };

    monaco.editor.defineTheme("app-shell-theme", customTheme);
    setEditorTheme("app-shell-theme");

    // Configure TypeScript/JavaScript validation
    const validationRules = {
      typescript: {
        noUnusedLocals: showLinting,
        noUnusedParameters: showLinting,
        noImplicitReturns: showLinting,
        noFallthroughCasesInSwitch: showLinting,
        noUncheckedIndexedAccess: showLinting,
        noImplicitOverride: showLinting,
        noPropertyAccessFromIndexSignature: showLinting,
      },
      javascript: {
        noUnusedLocals: showLinting,
        noUnusedParameters: showLinting,
        noImplicitReturns: showLinting,
        noFallthroughCasesInSwitch: showLinting,
      },
    };

    const currentRules =
      validationRules[language as keyof typeof validationRules] || {};

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: !showLinting,
      noSyntaxValidation: false,
      ...currentRules,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: !showLinting,
      noSyntaxValidation: false,
      ...currentRules,
    });

    // Configure JSON validation
    if (language === "json") {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        allowComments: false,
        enableSchemaRequest: true,
        schemas: [],
        validate: showLinting,
      });
    }
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monaco.editor.setTheme(editorTheme);
  };

  const supportedLanguages = [
    { value: "typescript", label: "TypeScript", linting: true },
    { value: "javascript", label: "JavaScript", linting: true },
    { value: "python", label: "Python", linting: false },
    { value: "java", label: "Java", linting: false },
    { value: "cpp", label: "C++", linting: false },
    { value: "csharp", label: "C#", linting: false },
    { value: "go", label: "Go", linting: false },
    { value: "rust", label: "Rust", linting: false },
    { value: "html", label: "HTML", linting: true },
    { value: "css", label: "CSS", linting: true },
    { value: "json", label: "JSON", linting: true },
    { value: "markdown", label: "Markdown", linting: false },
    { value: "sql", label: "SQL", linting: false },
    { value: "yaml", label: "YAML", linting: false },
    { value: "xml", label: "XML", linting: false },
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Update code example based on language
    if (
      monacoEditorExamples[newLanguage as keyof typeof monacoEditorExamples]
    ) {
      setCode(
        monacoEditorExamples[newLanguage as keyof typeof monacoEditorExamples]
      );
    }
  };

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.value === language
  );
  const hasLinting = currentLanguage?.linting || false;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${theme?.colors?.border || "#e0e0e0"}`,
          backgroundColor: theme?.colors?.surface || "#f5f5f5",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              color: theme?.colors?.text || "#333",
              fontWeight: "500",
            }}
          >
            Language:
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: `1px solid ${theme?.colors?.border || "#d0d0d0"}`,
              backgroundColor: theme?.colors?.background || "#fff",
              color: theme?.colors?.text || "#333",
              fontSize: "14px",
            }}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label} {lang.linting ? "✓" : ""}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              color: theme?.colors?.text || "#333",
              fontWeight: "500",
            }}
          >
            Theme:
          </label>
          <select
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: `1px solid ${theme?.colors?.border || "#d0d0d0"}`,
              backgroundColor: theme?.colors?.background || "#fff",
              color: theme?.colors?.text || "#333",
              fontSize: "14px",
            }}
          >
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast</option>
            {theme && <option value="app-shell-theme">App Shell Theme</option>}
          </select>
        </div>

        {hasLinting && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                color: theme?.colors?.text || "#333",
                fontWeight: "500",
              }}
            >
              Linting:
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showLinting}
                onChange={(e) => setShowLinting(e.target.checked)}
                style={{
                  margin: 0,
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  color: theme?.colors?.text || "#333",
                }}
              >
                Enable
              </span>
            </label>
          </div>
        )}

        <div
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {hasLinting && showLinting && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: theme?.colors?.success || "#10b981",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme?.colors?.success || "#10b981",
                  marginRight: "4px",
                }}
              />
              ESLint Active
            </span>
          )}
          <span
            style={{
              color: theme?.colors?.textMuted || "#666",
            }}
          >
            Lines: {code.split("\n").length} | Characters: {code.length}
          </span>
          {toolRegistered && (
            <span
              title="AI Code Generation Tool Available"
              style={{
                color: theme?.colors?.success || "#10b981",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "14px" }}>🤖</span>
              AI Ready
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          height="100%"
          language={language}
          theme={editorTheme}
          value={code}
          onChange={(value) => setCode(value || "")}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            fontFamily:
              "Fira Code, 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            fontLigatures: true,
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: true },
            wordWrap: "on",
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            selectOnLineNumbers: true,
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "always",
            detectIndentation: true,
            tabSize: 2,
            insertSpaces: true,
            autoIndent: "full",
            matchBrackets: "always",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoClosingOvertype: "always",
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            wordBasedSuggestions: "currentDocument",
            parameterHints: {
              enabled: true,
            },
            hover: {
              enabled: true,
            },
            contextmenu: true,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            suggest: {
              insertMode: "replace",
            },
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditorView;
