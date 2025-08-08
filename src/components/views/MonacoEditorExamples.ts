export const monacoEditorExamples: Record<string, string> = {
  typescript: `// TypeScript with Semantic Highlighting
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUsersCount(): number {
    return this.users.length;
  }

  // ESLint will warn about unused parameters
  updateUser(id: number, updates: Partial<User>): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      return true;
    }
    return false;
  }
}

const service = new UserService();
service.addUser({ 
  id: 1, 
  name: "John Doe", 
  email: "john@example.com",
  createdAt: new Date()
});

console.log(service.getUserById(1));
console.log(\`Total users: \${service.getUsersCount()}\`);`,

  javascript: `// JavaScript with Semantic Highlighting
class Calculator {
  constructor() {
    this.history = [];
  }

  add(a, b) {
    const result = a + b;
    this.history.push(\`\${a} + \${b} = \${result}\`);
    return result;
  }

  multiply(a, b) {
    const result = a * b;
    this.history.push(\`\${a} * \${b} = \${result}\`);
    return result;
  }

  getHistory() {
    return this.history;
  }

  // ESLint will catch unused variables
  clearHistory() {
    this.history = [];
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3));
console.log(calc.multiply(4, 7));
console.log(calc.getHistory());`,

  python: `# Python Example
class DataProcessor:
    def __init__(self):
        self.data = []
    
    def add_data(self, item):
        self.data.append(item)
    
    def process_data(self):
        if not self.data:
            return {}
        
        # Calculate statistics
        total = sum(self.data)
        average = total / len(self.data)
        maximum = max(self.data)
        minimum = min(self.data)
        
        return {
            'total': total,
            'average': average,
            'maximum': maximum,
            'minimum': minimum,
            'count': len(self.data)
        }

# Usage
processor = DataProcessor()
processor.add_data(10)
processor.add_data(20)
processor.add_data(30)
result = processor.process_data()
print(f"Statistics: {result}")`,

  java: `// Java Example
import java.util.*;

public class Calculator {
    private List<Double> history;
    
    public Calculator() {
        this.history = new ArrayList<>();
    }
    
    public double add(double a, double b) {
        double result = a + b;
        history.add(result);
        return result;
    }
    
    public double multiply(double a, double b) {
        double result = a * b;
        history.add(result);
        return result;
    }
    
    public List<Double> getHistory() {
        return new ArrayList<>(history);
    }
    
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println("5 + 3 = " + calc.add(5, 3));
        System.out.println("4 * 7 = " + calc.multiply(4, 7));
        System.out.println("History: " + calc.getHistory());
    }
}`,

  cpp: `// C++ Example
#include <iostream>
#include <vector>
#include <string>

class Calculator {
private:
    std::vector<double> history;
    
public:
    double add(double a, double b) {
        double result = a + b;
        history.push_back(result);
        return result;
    }
    
    double multiply(double a, double b) {
        double result = a * b;
        history.push_back(result);
        return result;
    }
    
    void printHistory() const {
        std::cout << "Calculation history:" << std::endl;
        for (size_t i = 0; i < history.size(); ++i) {
            std::cout << i + 1 << ": " << history[i] << std::endl;
        }
    }
};

int main() {
    Calculator calc;
    std::cout << "5 + 3 = " << calc.add(5, 3) << std::endl;
    std::cout << "4 * 7 = " << calc.multiply(4, 7) << std::endl;
    calc.printHistory();
    return 0;
}`,

  json: `{
  "name": "Monaco Editor with Semantic Highlighting",
  "version": "1.0.0",
  "description": "A powerful code editor with syntax highlighting and linting",
  "features": [
    "Syntax highlighting",
    "IntelliSense",
    "Error detection",
    "ESLint integration",
    "Code formatting",
    "Multiple themes"
  ],
  "supportedLanguages": [
    "TypeScript",
    "JavaScript", 
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust"
  ],
  "linting": {
    "enabled": true,
    "rules": {
      "no-unused-vars": "error",
      "no-console": "warn",
      "prefer-const": "error"
    }
  },
  "settings": {
    "theme": "vs-dark",
    "fontSize": 14,
    "wordWrap": "on",
    "minimap": {
      "enabled": true
    }
  }
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monaco Editor with Semantic Highlighting</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .feature-list li:before {
            content: "✓";
            color: #4CAF50;
            font-weight: bold;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Monaco Editor with Semantic Highlighting</h1>
            <p>A powerful code editor with syntax highlighting and linting</p>
        </div>
        
        <h2>Features</h2>
        <ul class="feature-list">
            <li>Syntax highlighting for 15+ languages</li>
            <li>IntelliSense and auto-completion</li>
            <li>Real-time error detection</li>
            <li>ESLint integration</li>
            <li>Multiple themes</li>
            <li>Code formatting</li>
        </ul>
        
        <h2>Supported Languages</h2>
        <p>TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust, HTML, CSS, JSON, Markdown, SQL, YAML, XML</p>
    </div>
</body>
</html>`,

  css: `/* CSS with Semantic Highlighting */
:root {
  --primary-color: #4f46e5;
  --secondary-color: #06b6d4;
  --accent-color: #f59e0b;
  --background-color: #0f172a;
  --surface-color: #1e293b;
  --text-color: #f8fafc;
  --border-color: #475569;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --success-color: #10b981;
}

/* Main container styles */
.monaco-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background-color);
  color: var(--text-color);
}

/* Toolbar styles */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--surface-color);
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.toolbar-select {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  color: var(--text-color);
  font-size: 14px;
}

.toolbar-stats {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
}

/* Editor area */
.editor-area {
  flex: 1;
  overflow: hidden;
}

/* Status indicators */
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-error {
  background-color: var(--error-color);
}

.status-warning {
  background-color: var(--warning-color);
}

.status-success {
  background-color: var(--success-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .toolbar-stats {
    margin-left: 0;
    text-align: center;
  }
}`,

  markdown: `# Monaco Editor with Semantic Highlighting

## Features

- **Syntax Highlighting**: Support for 15+ programming languages
- **IntelliSense**: Smart code completion and suggestions
- **Error Detection**: Real-time error checking and validation
- **ESLint Integration**: Advanced linting for JavaScript/TypeScript
- **Multiple Themes**: Light, dark, and custom themes
- **Code Formatting**: Automatic code formatting and indentation

## Supported Languages

| Language | Extension | Linting | Features |
|----------|-----------|---------|----------|
| TypeScript | .ts | ✅ | Full IntelliSense + ESLint |
| JavaScript | .js | ✅ | ES6+ support + ESLint |
| Python | .py | ❌ | Syntax highlighting |
| Java | .java | ❌ | Error detection |
| C++ | .cpp | ❌ | Code formatting |
| HTML | .html | ✅ | Validation |
| CSS | .css | ✅ | Validation |
| JSON | .json | ✅ | Schema validation |

## Code Example

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email
  };
}

// ESLint will catch issues like:
// - Unused variables
// - Missing return types
// - Unused parameters
// - Console statements (warnings)
\`\`\`

## Linting Features

- **Unused Variables**: Detects variables that are declared but never used
- **Unused Parameters**: Identifies function parameters that aren't used
- **Type Checking**: Validates TypeScript types and interfaces
- **Code Style**: Enforces consistent code formatting
- **Best Practices**: Suggests improvements and catches common mistakes

> Monaco Editor with Semantic Highlighting provides a professional development experience similar to VS Code!`,

  sql: `-- SQL Example with Semantic Highlighting
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com');

INSERT INTO posts (user_id, title, content, published) VALUES 
    (1, 'First Post', 'This is my first blog post!', TRUE),
    (2, 'Hello World', 'Welcome to my blog!', TRUE),
    (1, 'Draft Post', 'This is a draft...', FALSE);

-- Query with JOIN
SELECT 
    u.name,
    p.title,
    p.created_at
FROM users u
JOIN posts p ON u.id = p.user_id
WHERE p.published = TRUE
ORDER BY p.created_at DESC;`,

  yaml: `# YAML Example with Semantic Highlighting
name: Monaco Editor with Semantic Highlighting
version: 1.0.0
description: A powerful code editor with syntax highlighting and linting

# Features configuration
features:
  syntax_highlighting: true
  intellisense: true
  error_detection: true
  eslint_integration: true
  code_formatting: true
  multiple_themes: true

# Supported languages
supported_languages:
  typescript:
    extension: .ts
    linting: true
    features:
      - Full IntelliSense
      - ESLint integration
      - Type checking
  
  javascript:
    extension: .js
    linting: true
    features:
      - ES6+ support
      - ESLint integration
  
  python:
    extension: .py
    linting: false
    features:
      - Syntax highlighting
  
  java:
    extension: .java
    linting: false
    features:
      - Error detection

# Editor settings
settings:
  theme: vs-dark
  fontSize: 14
  wordWrap: on
  minimap:
    enabled: true
  fontFamily: "Fira Code, 'Cascadia Code', monospace"
  fontLigatures: true

# Linting configuration
linting:
  enabled: true
  rules:
    no-unused-vars: error
    no-console: warn
    prefer-const: error
    no-implicit-returns: error`,

  xml: `<?xml version="1.0" encoding="UTF-8"?>
<!-- XML Example with Semantic Highlighting -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>monaco-editor-demo</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <name>Monaco Editor Demo</name>
    <description>A demonstration of Monaco Editor with semantic highlighting</description>
    
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>2.7.0</version>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
            <version>2.7.0</version>
        </dependency>
        
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <version>2.1.214</version>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <version>2.7.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>2.7.0</version>
            </plugin>
        </plugins>
    </build>
    
</project>`,

  csharp: `// C# Example with Semantic Highlighting
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonacoEditorDemo
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserService
    {
        private readonly List<User> _users;

        public UserService()
        {
            _users = new List<User>();
        }

        public void AddUser(User user)
        {
            _users.Add(user);
        }

        public User? GetUserById(int id)
        {
            return _users.FirstOrDefault(u => u.Id == id);
        }

        public int GetUsersCount()
        {
            return _users.Count;
        }

        public bool UpdateUser(int id, User updates)
        {
            var userIndex = _users.FindIndex(u => u.Id == id);
            if (userIndex != -1)
            {
                _users[userIndex] = updates;
                return true;
            }
            return false;
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            var service = new UserService();
            
            service.AddUser(new User
            {
                Id = 1,
                Name = "John Doe",
                Email = "john@example.com",
                CreatedAt = DateTime.Now
            });

            var user = service.GetUserById(1);
            Console.WriteLine($"User: {user?.Name}");
            Console.WriteLine($"Total users: {service.GetUsersCount()}");
        }
    }
}`,

  go: `// Go Example with Semantic Highlighting
package main

import (
	"fmt"
	"time"
)

// User represents a user in the system
type User struct {
	ID        int       \`json:"id"\`
	Name      string    \`json:"name"\`
	Email     string    \`json:"email"\`
	CreatedAt time.Time \`json:"created_at"\`
}

// UserService manages user operations
type UserService struct {
	users []User
}

// NewUserService creates a new UserService instance
func NewUserService() *UserService {
	return &UserService{
		users: make([]User, 0),
	}
}

// AddUser adds a new user to the service
func (s *UserService) AddUser(user User) {
	s.users = append(s.users, user)
}

// GetUserById retrieves a user by their ID
func (s *UserService) GetUserById(id int) *User {
	for _, user := range s.users {
		if user.ID == id {
			return &user
		}
	}
	return nil
}

// GetUsersCount returns the total number of users
func (s *UserService) GetUsersCount() int {
	return len(s.users)
}

// UpdateUser updates an existing user
func (s *UserService) UpdateUser(id int, updates User) bool {
	for i, user := range s.users {
		if user.ID == id {
			s.users[i] = updates
			return true
		}
	}
	return false
}

func main() {
	service := NewUserService()
	
	user := User{
		ID:        1,
		Name:      "John Doe",
		Email:     "john@example.com",
		CreatedAt: time.Now(),
	}
	
	service.AddUser(user)
	
	foundUser := service.GetUserById(1)
	if foundUser != nil {
		fmt.Printf("User: %s\\n", foundUser.Name)
	}
	
	fmt.Printf("Total users: %d\\n", service.GetUsersCount())
}`,

  rust: `// Rust Example with Semantic Highlighting
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
struct User {
    id: u32,
    name: String,
    email: String,
    created_at: DateTime<Utc>,
}

impl User {
    fn new(id: u32, name: String, email: String) -> Self {
        User {
            id,
            name,
            email,
            created_at: Utc::now(),
        }
    }
}

struct UserService {
    users: HashMap<u32, User>,
}

impl UserService {
    fn new() -> Self {
        UserService {
            users: HashMap::new(),
        }
    }

    fn add_user(&mut self, user: User) {
        self.users.insert(user.id, user);
    }

    fn get_user_by_id(&self, id: u32) -> Option<&User> {
        self.users.get(&id)
    }

    fn get_users_count(&self) -> usize {
        self.users.len()
    }

    fn update_user(&mut self, id: u32, updates: User) -> bool {
        if self.users.contains_key(&id) {
            self.users.insert(id, updates);
            true
        } else {
            false
        }
    }
}

fn main() {
    let mut service = UserService::new();
    
    let user = User::new(
        1,
        "John Doe".to_string(),
        "john@example.com".to_string(),
    );
    
    service.add_user(user);
    
    if let Some(found_user) = service.get_user_by_id(1) {
        println!("User: {}", found_user.name);
    }
    
    println!("Total users: {}", service.get_users_count());
}`,
};
