import React, { useState } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material";
import { SandpackEditor, SandpackEditorFull } from "./SandpackEditor";

const reactTemplate = {
  "/App.js": `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>React Counter App</h1>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  );
}`,
  "/styles.css": `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

div {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

button:hover {
  background-color: #0056b3 !important;
}`,
};

const vanillaTemplate = {
  "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanilla JS Demo</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Vanilla JavaScript Demo</h1>
    <div class="counter">
      <span id="count">0</span>
      <button id="increment">Increment</button>
      <button id="decrement">Decrement</button>
    </div>
    <div class="color-picker">
      <label for="color">Background Color:</label>
      <input type="color" id="color" value="#667eea">
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
  "/script.js": `document.addEventListener('DOMContentLoaded', () => {
  const countElement = document.getElementById('count');
  const incrementBtn = document.getElementById('increment');
  const decrementBtn = document.getElementById('decrement');
  const colorPicker = document.getElementById('color');
  
  let count = 0;
  
  incrementBtn.addEventListener('click', () => {
    count++;
    countElement.textContent = count;
  });
  
  decrementBtn.addEventListener('click', () => {
    count--;
    countElement.textContent = count;
  });
  
  colorPicker.addEventListener('change', (e) => {
    document.body.style.background = \`linear-gradient(135deg, \${e.target.value} 0%, #764ba2 100%)\`;
  });
});`,
  "/styles.css": `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  text-align: center;
}

.counter {
  margin: 20px 0;
}

#count {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  margin: 0 5px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#increment {
  background-color: #28a745;
  color: white;
}

#decrement {
  background-color: #dc3545;
  color: white;
}

#increment:hover {
  background-color: #218838;
}

#decrement:hover {
  background-color: #c82333;
}

.color-picker {
  margin-top: 20px;
}

.color-picker label {
  display: block;
  margin-bottom: 10px;
  color: #666;
}

.color-picker input {
  width: 50px;
  height: 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}`,
};

const vueTemplate = {
  "/App.vue": `<template>
  <div class="app">
    <h1>Vue.js Counter App</h1>
    <div class="counter">
      <p>Count: {{ count }}</p>
      <button @click="increment" class="btn btn-primary">Increment</button>
      <button @click="decrement" class="btn btn-secondary">Decrement</button>
    </div>
    <div class="color-picker">
      <label>Background Color:</label>
      <input type="color" v-model="backgroundColor" @input="updateBackground">
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      backgroundColor: '#667eea'
    }
  },
  methods: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    updateBackground() {
      document.body.style.background = \`linear-gradient(135deg, \${this.backgroundColor} 0%, #764ba2 100%)\`;
    }
  },
  mounted() {
    this.updateBackground();
  }
}
</script>

<style>
.app {
  text-align: center;
  padding: 20px;
}

.counter {
  margin: 20px 0;
}

.btn {
  padding: 10px 20px;
  margin: 0 5px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.color-picker {
  margin-top: 20px;
}

.color-picker label {
  display: block;
  margin-bottom: 10px;
  color: #666;
}

.color-picker input {
  width: 50px;
  height: 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>`,
};

const templates = {
  react: reactTemplate,
  vanilla: vanillaTemplate,
  vue: vueTemplate,
};

export const SandpackDemo: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    "react" | "vanilla" | "vue"
  >("react");
  const [editorMode, setEditorMode] = useState<"tabbed" | "full">("tabbed");

  const handleTemplateChange = (
    event: React.MouseEvent<HTMLElement>,
    newTemplate: "react" | "vanilla" | "vue" | null
  ) => {
    if (newTemplate !== null) {
      setSelectedTemplate(newTemplate);
    }
  };

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "tabbed" | "full" | null
  ) => {
    if (newMode !== null) {
      setEditorMode(newMode);
    }
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      <Typography variant="h4" gutterBottom>
        Sandpack Editor Demo
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Configuration
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Template:
          </Typography>
          <ToggleButtonGroup
            value={selectedTemplate}
            exclusive
            onChange={handleTemplateChange}
            size="small"
          >
            <ToggleButton value="react">React</ToggleButton>
            <ToggleButton value="vanilla">Vanilla JS</ToggleButton>
            <ToggleButton value="vue">Vue.js</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="body2" gutterBottom>
            Editor Mode:
          </Typography>
          <ToggleButtonGroup
            value={editorMode}
            exclusive
            onChange={handleModeChange}
            size="small"
          >
            <ToggleButton value="tabbed">Tabbed</ToggleButton>
            <ToggleButton value="full">Full Layout</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {editorMode === "tabbed" ? (
          <SandpackEditor
            template={selectedTemplate === "vanilla" ? "vanilla" : "react"}
            files={templates[selectedTemplate]}
            height="100%"
            title={`${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template`}
          />
        ) : (
          <SandpackEditorFull
            template={selectedTemplate === "vanilla" ? "vanilla" : "react"}
            files={templates[selectedTemplate]}
            height="100%"
            title={`${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template - Full Layout`}
          />
        )}
      </Box>
    </Box>
  );
};

export default SandpackDemo;
