const DocsDirectoryPlugin = require("./DocsDirectoryPlugin");
const path = require("path");

// Set up the plugin with force rebuild option
const docsPlugin = new DocsDirectoryPlugin({
  docsPath: path.resolve(__dirname, "../docs"),
  outputPath: path.resolve(__dirname, "../public/docs-structure.json"), // Output to public directory
  forceRebuild: true, // Always rebuild when called directly
});

// Manual generation function
async function generateDocs() {
  return new Promise((resolve) => {
    docsPlugin.generateIfNeeded(false, resolve);
  });
}

// Run the generation if called directly
if (require.main === module) {
  generateDocs()
    .then(() => {
      console.log("Docs structure generation complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error generating docs structure:", err);
      process.exit(1);
    });
}

module.exports = generateDocs;
