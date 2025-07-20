#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Security patterns to check for
const SECURITY_PATTERNS = [
  // OpenAI API keys
  { pattern: /sk-[a-zA-Z0-9]{48}/g, name: "OpenAI API Key" },
  // Generic API keys (32+ characters)
  { pattern: /[a-zA-Z0-9]{32,}/g, name: "Generic API Key" },
  // Common secret patterns
  { pattern: /password\s*[:=]\s*['"][^'"]+['"]/g, name: "Hardcoded Password" },
  { pattern: /api_key\s*[:=]\s*['"][^'"]+['"]/g, name: "Hardcoded API Key" },
  { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/g, name: "Hardcoded Secret" },
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = [];

  SECURITY_PATTERNS.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: name,
        matches: matches.length,
        file: filePath,
      });
    }
  });

  return issues;
}

function main() {
  console.log("🔍 Scanning for security vulnerabilities...\n");

  // Scan dist directory
  const distFiles = glob.sync("dist/**/*.{js,css,html}");
  let totalIssues = 0;

  distFiles.forEach((file) => {
    const issues = scanFile(file);
    if (issues.length > 0) {
      console.log(`🚨 ${file}:`);
      issues.forEach((issue) => {
        console.log(`   - ${issue.type}: ${issue.matches} matches`);
        totalIssues += issue.matches;
      });
      console.log("");
    }
  });

  if (totalIssues === 0) {
    console.log("✅ No security vulnerabilities found in built files!");
    process.exit(0);
  } else {
    console.log(`🚨 Found ${totalIssues} potential security issues!`);
    console.log("⚠️  Please review and remove any hardcoded secrets.");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
