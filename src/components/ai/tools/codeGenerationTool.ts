export const codeGenerationToolDefinition = {
  name: "write_code",
  description:
    "Write code directly to the Monaco Editor. Can generate code in various programming languages and either replace the current content or append to it.",
  parameters: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description:
          "The code to write to the editor. Should be properly formatted and complete.",
      },
      language: {
        type: "string",
        description:
          "The programming language for the code. Examples: 'typescript', 'javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'html', 'css', 'json', 'markdown', 'sql', 'yaml', 'xml'. If not specified, the current language will be used.",
        enum: [
          "typescript",
          "javascript",
          "python",
          "java",
          "cpp",
          "csharp",
          "go",
          "rust",
          "html",
          "css",
          "json",
          "markdown",
          "sql",
          "yaml",
          "xml",
        ],
      },
      description: {
        type: "string",
        description:
          "A brief description of what the code does or what it's for. This is used for logging and debugging.",
      },
      replace: {
        type: "boolean",
        description:
          "If true, replace the entire content of the editor. If false (default), append the code to the existing content with proper spacing.",
        default: false,
      },
    },
    required: ["code"],
  },
  examples: [
    {
      description: "Generate a TypeScript function and append it to the editor",
      parameters: {
        code: `function calculateFibonacci(n: number): number {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

console.log(calculateFibonacci(10));`,
        language: "typescript",
        description: "Generate a recursive Fibonacci function",
        replace: false,
      },
    },
    {
      description:
        "Replace the entire editor content with a new React component",
      parameters: {
        code: `import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ text, onClick, variant = 'primary' }) => {
  return (
    <button 
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {text}
    </button>
  );
};

export default Button;`,
        language: "typescript",
        description: "Create a reusable React Button component",
        replace: true,
      },
    },
    {
      description: "Generate Python code for data analysis",
      parameters: {
        code: `import pandas as pd
import matplotlib.pyplot as plt

# Load sample data
data = pd.read_csv('sample_data.csv')

# Create a simple visualization
plt.figure(figsize=(10, 6))
data['value'].hist(bins=20)
plt.title('Distribution of Values')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.show()`,
        language: "python",
        description: "Create a data analysis script with pandas and matplotlib",
        replace: false,
      },
    },
    {
      description: "Generate HTML structure with CSS styling",
      parameters: {
        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Welcome to the Dashboard</h1>
            <p>This is a modern, responsive dashboard with glassmorphism design.</p>
        </div>
    </div>
</body>
</html>`,
        language: "html",
        description: "Create a modern dashboard with glassmorphism design",
        replace: true,
      },
    },
  ],
};

export default codeGenerationToolDefinition;
