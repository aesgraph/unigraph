const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Webpack plugin to generate a JSON file with the docs directory structure
 * only when the docs have changed
 */
class DocsDirectoryPlugin {
  constructor(options = {}) {
    this.docsPath = options.docsPath || path.resolve(process.cwd(), "docs");
    this.outputPath =
      options.outputPath ||
      path.resolve(process.cwd(), "public/docs-structure.json");
    this.includeContent = options.includeContent || false;
    this.cacheFilePath =
      options.cacheFilePath ||
      path.resolve(process.cwd(), ".docs-structure-hash");
    this.forceRebuild = options.forceRebuild || false;
    this.watchForChanges = options.watchForChanges !== false;
    this.lastBuildTime = 0;
    this.throttleTime = options.throttleTime || 10000; // 10 seconds minimum between rebuilds
  }

  apply(compiler) {
    // Only generate on initial build or when watching starts
    compiler.hooks.beforeRun.tapAsync(
      "DocsDirectoryPlugin",
      (compiler, callback) => {
        this.generateIfNeeded(false, callback);
      }
    );

    compiler.hooks.watchRun.tapAsync(
      "DocsDirectoryPlugin",
      (compiler, callback) => {
        // Don't regenerate too frequently
        const now = Date.now();
        if (now - this.lastBuildTime < this.throttleTime) {
          return callback();
        }

        // Check if the files have changed before regenerating
        this.generateIfNeeded(this.watchForChanges, callback);
      }
    );
  }

  // Check if we need to regenerate the structure
  generateIfNeeded(isWatching, callback) {
    try {
      // Calculate hash of the docs directory to detect changes
      const currentHash = this.getDirectoryHash(this.docsPath);
      let previousHash = "";

      // Try to read previous hash
      if (fs.existsSync(this.cacheFilePath)) {
        previousHash = fs.readFileSync(this.cacheFilePath, "utf8");
      }

      // Only regenerate if hash changed or forced rebuild
      if (this.forceRebuild || currentHash !== previousHash) {
        console.log("Generating docs directory structure...");

        // Generate the structure
        const directoryStructure = this.scanDirectory(this.docsPath);

        // Write to output file
        fs.writeFileSync(
          this.outputPath,
          JSON.stringify(directoryStructure, null, 2),
          "utf8"
        );

        // Save new hash
        fs.writeFileSync(this.cacheFilePath, currentHash, "utf8");

        this.lastBuildTime = Date.now();
        console.log(`Docs directory structure generated at ${this.outputPath}`);
      } else if (isWatching) {
        console.log("Docs structure unchanged, skipping generation");
      }

      callback();
    } catch (error) {
      console.error("Error in DocsDirectoryPlugin:", error);
      callback();
    }
  }

  // Calculate a hash of all file contents and names in the directory
  getDirectoryHash(dirPath) {
    const hash = crypto.createHash("md5");

    const processDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip hidden files and node_modules
        if (
          entry.name.startsWith(".") ||
          entry.name === "node_modules" ||
          entry.name === "_site"
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          processDirectory(fullPath);
        } else if (entry.isFile()) {
          // Add file path and last modified time to hash
          const stats = fs.statSync(fullPath);
          hash.update(fullPath + stats.mtime.getTime());
        }
      }
    };

    processDirectory(dirPath);
    return hash.digest("hex");
  }

  // Extract metadata from markdown file content
  extractMetadata(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Parse YAML front matter
      const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
      if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1];
        const metadata = {};

        // Extract title - try both quoted and unquoted formats
        let titleMatch = frontMatter.match(/title:\s*["']([^"']+)["']/);
        if (titleMatch) {
          metadata.title = titleMatch[1];
        } else {
          // Try to extract title without quotes - match until end of line
          titleMatch = frontMatter.match(/title:\s*([^\r\n]+)/);
          if (titleMatch) {
            metadata.title = titleMatch[1].trim();
          }
        }

        // Extract order
        const orderMatch = frontMatter.match(/order:\s*(\d+)/);
        if (orderMatch) {
          const order = parseInt(orderMatch[1], 10);
          if (!isNaN(order)) {
            metadata.order = order;
          }
        }

        return metadata;
      }
    } catch (error) {
      console.warn(`Failed to extract metadata from ${filePath}:`, error);
    }

    return {};
  }

  scanDirectory(dirPath, relativePath = "") {
    const result = {
      path: relativePath || "/",
      type: "directory",
      children: [],
    };

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files, _site directory, and node_modules
        if (
          entry.name.startsWith(".") ||
          entry.name === "_site" ||
          entry.name === "node_modules"
        ) {
          continue;
        }

        const entryPath = path.join(dirPath, entry.name);
        const entryRelativePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subdirStructure = this.scanDirectory(
            entryPath,
            entryRelativePath
          );
          result.children.push(subdirStructure);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          // Extract metadata from markdown file
          const metadata = this.extractMetadata(entryPath);

          // Add markdown files with metadata
          const fileInfo = {
            path: entryRelativePath,
            type: "file",
            name: entry.name,
            ...metadata, // Include title and order if present
          };

          // Optionally include file content
          if (this.includeContent) {
            fileInfo.content = fs.readFileSync(entryPath, "utf-8");
          }

          result.children.push(fileInfo);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return result;
  }
}

module.exports = DocsDirectoryPlugin;
