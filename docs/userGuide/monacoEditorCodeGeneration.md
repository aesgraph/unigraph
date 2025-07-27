# Monaco Editor AI Code Generation

The Monaco Editor in Unigraph now supports AI-powered code generation through integration with the AI Chat system. This allows you to have AI write code directly into the editor.

## Features

- **Direct Code Writing**: AI can write code directly to the Monaco Editor
- **Language Support**: Supports 15+ programming languages including TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust, HTML, CSS, JSON, Markdown, SQL, YAML, and XML
- **Flexible Modes**: Can either replace the entire editor content or append new code
- **Language Switching**: AI can automatically switch the editor language when generating code
- **Real-time Integration**: Works seamlessly with the existing AI Chat system

## How to Use

### 1. Open the Monaco Editor

- Navigate to the Monaco Editor view in your workspace
- You'll see an "🤖 AI Ready" indicator in the toolbar when the tool is available

### 2. Use AI Chat to Generate Code

- Open the AI Chat panel
- Ask the AI to write code for you, for example:
  - "Write a TypeScript function to calculate fibonacci numbers"
  - "Create a React component for a button"
  - "Generate a Python script for data analysis"
  - "Write HTML for a modern dashboard"

### 3. AI Will Automatically Write to the Editor

- The AI will use the `write_code` tool to generate code
- Code will appear directly in the Monaco Editor
- The editor language will automatically switch if needed
- You can continue editing the generated code

## Example Prompts

### TypeScript/JavaScript

```
"Write a TypeScript class for managing a todo list with add, remove, and toggle methods"
```

### Python

```
"Create a Python script that reads a CSV file and creates a bar chart using matplotlib"
```

### React Components

```
"Generate a React component for a modal dialog with TypeScript props"
```

### HTML/CSS

```
"Create a responsive HTML page with modern CSS styling for a portfolio website"
```

### Data Analysis

```
"Write a SQL query to find the top 10 customers by order value"
```

## Tool Parameters

The AI can control several aspects of code generation:

- **code**: The actual code to write (required)
- **language**: Programming language (optional, uses current if not specified)
- **description**: Brief description of what the code does
- **replace**: If true, replaces entire content; if false, appends (default: false)

## Supported Languages

| Language   | Extension | Features                   |
| ---------- | --------- | -------------------------- |
| TypeScript | .ts       | Full IntelliSense + ESLint |
| JavaScript | .js       | ES6+ support + ESLint      |
| Python     | .py       | Syntax highlighting        |
| Java       | .java     | Error detection            |
| C++        | .cpp      | Code formatting            |
| C#         | .cs       | IntelliSense               |
| Go         | .go       | Syntax highlighting        |
| Rust       | .rs       | Error detection            |
| HTML       | .html     | Validation                 |
| CSS        | .css      | Validation                 |
| JSON       | .json     | Schema validation          |
| Markdown   | .md       | Preview support            |
| SQL        | .sql      | Syntax highlighting        |
| YAML       | .yml      | Validation                 |
| XML        | .xml      | Syntax highlighting        |

## Integration with Other Tools

The code generation tool works alongside other AI tools:

- **Semantic Web Queries**: Generate code to work with SPARQL results
- **Workspace Layout**: Automatically arrange views for coding workflows
- **Graph Operations**: Generate code for graph manipulation

## Best Practices

1. **Be Specific**: Provide clear requirements for the code you want
2. **Specify Language**: Mention the programming language if you have a preference
3. **Iterative Development**: Ask for modifications and improvements to generated code
4. **Context Matters**: The AI can see your current code and build upon it

## Troubleshooting

- **Tool Not Available**: Make sure the Monaco Editor is open and the "🤖 AI Ready" indicator is visible
- **Language Not Switching**: The AI will only switch languages if explicitly requested
- **Code Not Appearing**: Check that the AI Chat is using the `write_code` tool in its response

## Future Enhancements

- Code completion and suggestions based on AI context
- Automatic code refactoring and optimization
- Integration with version control systems
- Multi-file code generation
- Code review and documentation generation
