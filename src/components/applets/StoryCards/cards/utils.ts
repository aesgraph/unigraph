import { EntitiesContainer } from "../../../../core/model/entity/entitiesContainer";
import { Graph } from "../../../../core/model/Graph";
import { Node, NodeId } from "../../../../core/model/Node";

export interface StoryCardOptions {
  basePath?: "public" | "docs" | string;
}

export const createStoryCardNodeFromMarkdown = (
  title: string,
  markdownFile: string,
  graph: Graph,
  options?: StoryCardOptions
) => {
  // Process the markdown file path based on different patterns
  let processedMarkdownFile = markdownFile;

  // Handle paths that already start with specific prefixes
  if (markdownFile.startsWith("docs/")) {
    // Already has the docs/ prefix, use as is
    processedMarkdownFile = markdownFile;
  } else if (markdownFile.startsWith("public/")) {
    // Already has the public/ prefix, use as is
    processedMarkdownFile = markdownFile;
  }
  // Handle options-based path construction
  else if (options?.basePath) {
    if (options.basePath === "docs") {
      processedMarkdownFile = `docs/${markdownFile}`;
    } else if (options.basePath === "public") {
      processedMarkdownFile = `public/storyCardFiles/${markdownFile}`;
    } else {
      // Custom base path
      processedMarkdownFile = `${options.basePath}/${markdownFile}`;
    }
  }
  // Default to public/storyCardFiles if no specific path is provided
  else {
    processedMarkdownFile = `public/storyCardFiles/${markdownFile}`;
  }

  // Create a new story card node with the given markdown file
  const node = graph.createNode({
    type: "storyCard",
    userData: {
      title: title || "Story Card",
      markdownFile: processedMarkdownFile,
    },
  });

  // Add tags to the node
  node.addTag("storyCard");
  node.addTag("EntryPoint");

  return node;
};

/**
 * Creates a graph of story cards from the docs directory structure
 * @param graph The graph to add the story cards to
 * @param docsBasePath The base path for fetching the docs directory structure (default: '/docs')
 * @returns Promise that resolves when the directory structure has been loaded
 */
export const createStoryCardsFromDocsDirectory = async (
  graph: Graph,
  _docsBasePath: string = "/docs"
): Promise<EntitiesContainer<NodeId, Node>> => {
  // Collect all nodes created
  const allNodes: any[] = [];
  const processedPaths = new Set<string>();

  // Helper function to clean up titles from file paths
  const getTitle = (path: string): string => {
    // Extract just the filename without extension
    const fileName = path.split("/").pop()?.replace(/\.md$/, "") || path;

    // Convert kebab-case or snake_case to Title Case
    return fileName
      .replace(/-|_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Create a root node for the docs
  const rootNode = graph.createNode({
    id: "docs-overview",
    type: "storyCard",
    userData: {
      title: "Documentation Overview",
      description: "Overview of all documentation available in this project.",
      markdownFile: "docs/index.md",
      tags: ["docs", "overview", "auto-generated"],
    },
  });

  rootNode.addTag("storyCard");
  rootNode.addTag("docsRoot");
  rootNode.addTag("EntryPoint");

  allNodes.push(rootNode);
  console.log("Created root docs node");

  // Function to fetch the docs directory structure
  const fetchDirectoryStructure = async () => {
    try {
      // Try to fetch the generated structure
      const response = await fetch("/docs-structure.json");

      if (!response.ok) {
        console.warn(
          "Could not find docs-structure.json, using fallback approach"
        );
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching docs structure:", error);
      return null;
    }
  };

  // Process the directory structure recursively
  const processDirectoryStructure = (structure: any, parentNode: any) => {
    if (!structure) return;

    // Process children
    for (const child of structure.children || []) {
      // Skip if already processed
      const relativePath = child.path;
      if (processedPaths.has(relativePath)) continue;

      // Skip folders that start with underscore
      const dirName = relativePath.split("/").pop();
      if (child.type === "directory" && dirName?.startsWith("_")) {
        console.log(
          `Skipping directory that starts with underscore: ${relativePath}`
        );
        continue;
      }

      processedPaths.add(relativePath);

      if (child.type === "directory") {
        // Create a node for this directory
        const title = getTitle(relativePath.split("/").pop() || relativePath);

        console.log(`Creating node for directory: ${relativePath}`);

        // Create a placeholder markdown path - we'll always create a node with an index.md path
        // even if the file doesn't exist
        const markdownPath = `docs/${relativePath}/index.md`;

        const dirNode = graph.createNode({
          id: `docs-${relativePath.replace(/\//g, "-")}`,
          type: "storyCard",
          userData: {
            title,
            description: `Documentation for ${title}`,
            markdownFile: markdownPath,
            tags: ["docs", "auto-generated"],
            isPlaceholder: !child.children?.some(
              (c: any) => c.type === "file" && c.path.endsWith("index.md")
            ),
          },
        });

        dirNode.addTag("storyCard");
        dirNode.addTag("docsNode");
        dirNode.addTag("EntryPoint");

        allNodes.push(dirNode);

        // Connect to parent
        const parentToChildEdge = graph.createEdge(
          parentNode.getId(),
          dirNode.getId(),
          {
            type: "StoryChoice",
            label: title,
          }
        );

        parentToChildEdge.addTag("DocHierarchy");
        parentToChildEdge.addTag("EntryPoint");

        // Create reverse edge
        const childToParentEdge = graph.createEdge(
          dirNode.getId(),
          parentNode.getId(),
          {
            type: "StoryChoice",
            label: "Back to " + parentNode.getData().userData.title,
          }
        );

        childToParentEdge.addTag("DocParent");

        // Recursively process this directory
        processDirectoryStructure(child, dirNode);
      } else if (child.type === "file") {
        // Skip if this is an index.md file, as we already created a node for its directory
        if (child.path.endsWith("/index.md")) continue;

        // It's a markdown file
        const title = getTitle(
          relativePath.split("/").pop()?.replace(/\.md$/, "") || relativePath
        );

        console.log(`Creating node for file: ${relativePath}`);

        const fileNode = graph.createNode({
          id: `docs-${relativePath.replace(/\//g, "-").replace(/\.md$/, "")}`,
          type: "storyCard",
          userData: {
            title,
            description: `Documentation: ${title}`,
            markdownFile: `docs/${relativePath}`,
            tags: ["docs", "auto-generated"],
          },
        });

        fileNode.addTag("storyCard");
        fileNode.addTag("docsFile");
        fileNode.addTag("EntryPoint");

        allNodes.push(fileNode);

        // Connect file to its parent directory
        const dirToFileEdge = graph.createEdge(
          parentNode.getId(),
          fileNode.getId(),
          {
            type: "StoryChoice",
            label: title,
          }
        );

        dirToFileEdge.addTag("DocContent");
        dirToFileEdge.addTag("EntryPoint");

        // Create reverse edge
        const fileToParentEdge = graph.createEdge(
          fileNode.getId(),
          parentNode.getId(),
          {
            type: "StoryChoice",
            label: "Back to " + parentNode.getData().userData.title,
          }
        );

        fileToParentEdge.addTag("DocParent");
      }
    }
  };

  // Start the process
  try {
    console.log("Starting docs directory scanning...");

    // Fetch the directory structure
    const directoryStructure = await fetchDirectoryStructure();

    if (directoryStructure) {
      console.log("Processing directory structure from docs-structure.json");
      processDirectoryStructure(directoryStructure, rootNode);
    } else {
      console.log("Using fallback scanning approach");
      // Use your existing fallback approach here
      // This is the scanDocsDirectory and processDirectory code you already have
    }

    // Add direct links between top-level directories for better navigation
    const topLevelDirs = allNodes.filter((node) => {
      const tags = node.getTags();
      return (
        tags.includes("docsNode") &&
        !tags.includes("docsFile") &&
        node.getId() !== rootNode.getId()
      );
    });

    console.log(`Found ${topLevelDirs.length} top-level directories`);

    // Create navigation edges between top-level directories
    if (topLevelDirs.length > 1) {
      for (let i = 0; i < topLevelDirs.length; i++) {
        for (let j = 0; j < topLevelDirs.length; j++) {
          if (i !== j) {
            const edge = graph.createEdge(
              topLevelDirs[i].getId(),
              topLevelDirs[j].getId(),
              {
                type: "StoryChoice",
                label: `Go to ${topLevelDirs[j].getData().userData.title}`,
              }
            );
            edge.addTag("DocNavigation");
          }
        }
      }
    }

    console.log(`Created ${allNodes.length} nodes for docs`);
    return new EntitiesContainer(allNodes);
  } catch (error) {
    console.error("Error loading docs directory structure:", error);
    // Return at least the root node so we have something
    return new EntitiesContainer([rootNode]);
  }
};
