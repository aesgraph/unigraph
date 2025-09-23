import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { Graph } from "../../../core/model/Graph";
import { Node, NodeId } from "../../../core/model/Node";
import { SceneGraph } from "../../../core/model/SceneGraph";

/**
 * Fetches a Wikipedia article and creates a node with links to related articles
 * Performs a breadth-first search to a specified depth
 * @param graph The graph to add nodes to
 * @param articleTitle The title of the Wikipedia article to fetch
 * @param options Optional configuration for the fetch operation
 * @returns Promise with the root article node
 */
export const loadWikipediaArticle = async (
  graph: Graph,
  articleTitle: string = "Factor_graph",
  options: {
    maxLinksPerArticle?: number;
    bfsDepth?: number;
    maxNodes?: number;
    language?: string;
    debug?: boolean;
  } = {}
): Promise<Node> => {
  const {
    maxLinksPerArticle = 200,
    bfsDepth = 3,
    maxNodes = 2000,
    language = "en",
    debug = false,
  } = options;

  const visited = new Set<string>();
  let nodeCount = 0;
  const queue: Array<{ title: string; depth: number; parentNode?: Node }> = [
    { title: articleTitle, depth: 0 },
  ];
  let rootNode: Node | undefined;
  const baseApiUrl = `https://${language}.wikipedia.org/w/api.php`;

  while (queue.length > 0 && nodeCount < maxNodes) {
    const { title, depth, parentNode } = queue.shift()!;
    const articleNodeId = `Wiki: ${title}`;
    let articleNode = graph.maybeGetNode(articleNodeId as NodeId);

    if (!articleNode) {
      articleNode = graph.createNode({
        id: articleNodeId,
        type: "wikiArticle",
        userData: {
          title,
          url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(
            title.replace(/ /g, "_")
          )}`,
          tags: ["wikipedia", "article", `depth-${depth}`],
          depth,
        },
      });
      nodeCount++;
      if (debug)
        console.log(`Created node: ${articleNodeId} (nodeCount=${nodeCount})`);
      if (nodeCount % 10 === 0 || nodeCount === maxNodes) {
        console.log(`Processed ${nodeCount} nodes so far...`);
      }
    }

    if (parentNode) {
      if (
        !graph
          .getEdges()
          .toArray()
          .some(
            (e) =>
              e.getSource() === parentNode.getId() &&
              e.getTarget() === articleNode.getId()
          )
      ) {
        graph.createEdge(parentNode.getId(), articleNode.getId(), {
          type: "WikiLink",
          label: title,
          userData: { depth },
        });
      }
    }

    if (visited.has(title) || depth > bfsDepth) continue;
    visited.add(title);

    if (depth === 0) rootNode = articleNode;

    // Fetch article content and links
    try {
      const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
      const articleUrl = `${baseApiUrl}?action=query&format=json&prop=extracts|links&titles=${encodedTitle}&exintro=1&explaintext=1&pllimit=${maxLinksPerArticle * 2}&origin=*`;
      const response = await fetch(articleUrl);
      const data = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId === "-1") continue;
      const page = pages[pageId];
      const extract = page.extract || "No extract available";
      const links = page.links || [];
      const fullUrl = `https://${language}.wikipedia.org/wiki/${encodedTitle}`;

      articleNode.setUserData(
        "description",
        extract.substring(0, 300) + (extract.length > 300 ? "..." : "")
      );
      articleNode.setUserData("fullContent", extract);
      articleNode.setUserData("lastModified", page.touched);
      articleNode.setUserData("url", fullUrl);

      if (depth < bfsDepth && nodeCount < maxNodes && links.length > 0) {
        // Get valid links from the HTML content
        const contentUrl = `${baseApiUrl}?action=parse&format=json&page=${encodedTitle}&prop=text&origin=*`;
        const contentResponse = await fetch(contentUrl);
        const contentData = await contentResponse.json();
        const contentLinks = new Set<string>();
        if (contentData.parse && contentData.parse.text) {
          const htmlContent = contentData.parse.text["*"];
          const linkRegex = /<a href="\/wiki\/([^"#:]+)"[^>]*>([^<]+)<\/a>/g;
          let match;
          while ((match = linkRegex.exec(htmlContent)) !== null) {
            const linkTarget = decodeURIComponent(match[1]);
            const normalized = linkTarget
              .replace(/_/g, " ")
              .trim()
              .replace(/\s+/g, " ")
              .toLowerCase();
            contentLinks.add(normalized);
          }
        }

        let linksAdded = 0;
        for (const link of links) {
          if (nodeCount >= maxNodes) break;
          if (link.ns !== 0) continue;
          const linkTitle = link.title;
          const normalizedLinkTitle = linkTitle
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
          if (!contentLinks.has(normalizedLinkTitle)) continue;
          const linkNodeId = `Wiki: ${linkTitle}`;
          let linkNode = graph.maybeGetNode(linkNodeId as NodeId);
          if (!linkNode) {
            linkNode = graph.createNode({
              id: linkNodeId,
              type: "wikiArticle",
              userData: {
                title: linkTitle,
                url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(
                  linkTitle.replace(/ /g, "_")
                )}`,
                tags: ["wikipedia", "linked-article", `depth-${depth + 1}`],
                depth: depth + 1,
              },
            });
            nodeCount++;
            if (debug)
              console.log(
                `Created node: ${linkNodeId} (nodeCount=${nodeCount})`
              );
            if (nodeCount % 10 === 0 || nodeCount === maxNodes) {
              console.log(`Processed ${nodeCount} nodes so far...`);
            }
          }
          if (
            !graph
              .getEdges()
              .toArray()
              .some(
                (e) =>
                  e.getSource() === articleNode.getId() &&
                  e.getTarget() === linkNode.getId()
              )
          ) {
            graph.createEdge(articleNode.getId(), linkNode.getId(), {
              type: "WikiLink",
              label: linkTitle,
              userData: { depth: depth + 1 },
            });
          }
          if (
            !visited.has(linkTitle) &&
            !queue.some((q) => q.title === linkTitle) &&
            linksAdded < maxLinksPerArticle &&
            nodeCount < maxNodes
          ) {
            queue.push({
              title: linkTitle,
              depth: depth + 1,
              parentNode: articleNode,
            });
            linksAdded++;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing article "${title}":`, error);
    }
  }

  if (!rootNode) {
    return graph.createNode({
      id: `Wiki Error: ${articleTitle}`,
      type: "wikiArticle",
      userData: {
        title: `Failed to load: ${articleTitle}`,
        description: `Error fetching Wikipedia article`,
        tags: ["wikipedia", "error"],
      },
    });
  }

  return rootNode;
};

export const demo_Wikipedia_Articles = async () => {
  const graph = new Graph();

  // Create a root node for Wikipedia articles
  const wikiRootNode = graph.createNode({
    id: "Wikipedia Articles",
    type: "wikiRoot",
    userData: {
      title: "Wikipedia Articles Explorer",
      description:
        "Explore Wikipedia articles as an interactive graph. Click on nodes to expand the graph with more articles.",
      tags: ["wikipedia", "knowledge graph"],
    },
  });

  console.log("Starting Wikipedia article graph generation...");

  // Load articles with different topics and depths
  const factorGraphArticle = await loadWikipediaArticle(graph, "Factor graph", {
    // maxLinksPerArticle: 100, // Reduce to make sure we're processing correctly
    // bfsDepth: 4, // Start with a reasonable depth
    debug: true, // Enable debugging
  });

  // Connect the article to the root node
  graph.createEdge(wikiRootNode.getId(), factorGraphArticle.getId(), {
    type: "WikiStart",
    label: "Factor Graph",
  });

  console.log("Wikipedia graph generation complete!");
  console.log(`Total nodes in graph: ${graph.getNodes().size()}`);
  console.log(`Total edges in graph: ${graph.getEdges().size()}`);

  return new SceneGraph({
    graph,
    metadata: {
      name: "Wikipedia Knowledge Network",
      description:
        "Explore Wikipedia articles and their connections as a knowledge graph with multiple levels of depth.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: "dot",
      activeView: "ReactFlow",
    },
  });
};
