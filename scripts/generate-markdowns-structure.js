const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Generate a file tree structure for the public/markdowns folder
 */
class MarkdownsStructureGenerator {
  constructor(options = {}) {
    this.markdownsPath =
      options.markdownsPath || path.resolve(process.cwd(), "public/markdowns");
    this.outputPath =
      options.outputPath ||
      path.resolve(process.cwd(), "public/markdowns-structure.json");
    this.cacheFilePath =
      options.cacheFilePath ||
      path.resolve(process.cwd(), ".markdowns-structure-hash");
    this.forceRebuild = options.forceRebuild || false;
  }

  // Calculate a hash of all file contents and names in the directory
  getDirectoryHash(dirPath) {
    const hash = crypto.createHash("md5");

    const processDirectory = (dir) => {
      if (!fs.existsSync(dir)) {
        return;
      }

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

  // Scan directory and build tree structure
  scanDirectory(dirPath, relativePath = "") {
    const result = {
      path: relativePath || "/",
      type: "directory",
      children: [],
    };

    try {
      if (!fs.existsSync(dirPath)) {
        return result;
      }

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

          result.children.push(fileInfo);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return result;
  }

  // Generate the structure if needed
  generateIfNeeded() {
    try {
      // Calculate hash of the markdowns directory to detect changes
      const currentHash = this.getDirectoryHash(this.markdownsPath);
      let previousHash = "";

      // Try to read previous hash
      if (fs.existsSync(this.cacheFilePath)) {
        previousHash = fs.readFileSync(this.cacheFilePath, "utf8");
      }

      // Only regenerate if hash changed or forced rebuild
      if (this.forceRebuild || currentHash !== previousHash) {
        console.log("Generating markdowns directory structure...");

        // Generate the structure
        const directoryStructure = this.scanDirectory(this.markdownsPath);

        // Write to output file
        fs.writeFileSync(
          this.outputPath,
          JSON.stringify(directoryStructure, null, 2),
          "utf8"
        );

        // Save new hash
        fs.writeFileSync(this.cacheFilePath, currentHash, "utf8");

        console.log(
          `Markdowns directory structure generated at ${this.outputPath}`
        );
        return true;
      } else {
        console.log("Markdowns structure unchanged, skipping generation");
        return false;
      }
    } catch (error) {
      console.error("Error in MarkdownsStructureGenerator:", error);
      return false;
    }
  }
}

// Manual generation function
async function generateMarkdownsStructure() {
  const generator = new MarkdownsStructureGenerator({
    markdownsPath: path.resolve(__dirname, "../public/markdowns"),
    outputPath: path.resolve(__dirname, "../public/markdowns-structure.json"),
    forceRebuild: true, // Always rebuild when called directly
  });

  return generator.generateIfNeeded();
}

// Run the generation if called directly
if (require.main === module) {
  generateMarkdownsStructure()
    .then((generated) => {
      if (generated) {
        console.log("Markdowns structure generation complete");
      } else {
        console.log("No changes detected, structure not regenerated");
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error generating markdowns structure:", err);
      process.exit(1);
    });
}

module.exports = { MarkdownsStructureGenerator, generateMarkdownsStructure };
