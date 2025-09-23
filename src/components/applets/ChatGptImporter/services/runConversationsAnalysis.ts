import { saveAs } from "file-saver";
import { NodeId } from "../../../../core/model/Node";
import { SceneGraph } from "../../../../core/model/SceneGraph";
import { getCurrentSceneGraph } from "../../../../store/appConfigStore";
import { addNotification } from "../../../../store/notificationStore";
import { WebLLMClient } from "../services/WebLLMClient";
import { getSharedLLMClient } from "../services/llmService";

interface DocumentTags {
  [nodeId: string]: string[];
}

interface AnalysisProgress {
  processed: number;
  total: number;
  currentNodeId: NodeId | null;
}

/**
 * Analyzes a single document's content to extract relevant tags
 * @param content The document content to analyze
 * @param llmClient The WebLLM client instance
 * @returns Array of suggested tags
 */
async function analyzeDocumentForTags(
  content: string,
  llmClient: WebLLMClient
): Promise<string[]> {
  // Skip empty documents
  if (!content.trim()) {
    return [];
  }

  // Limit content length to avoid overloading the model
  const truncatedContent =
    content.length > 5000 ? content.substring(0, 5000) + "..." : content;

  // Create a prompt asking for tag extraction
  const prompt = `
    Review the following document content and extract the keywords.
    Extract 3-5 single-word or short phrase keywords that are most main focuses of the document.
    For tags, use lowercase and avoid duplicates.
    
    Return your response as a JSON array of strings like this: ["tag1", "tag2", "tag3"]
  `;

  try {
    // Use the LLM client to generate tags
    const response = await llmClient.chatCompletion(
      [
        {
          id: "system",
          role: "system",
          content: prompt,
          timestamp: new Date(),
        },
        {
          id: "user",
          role: "user",
          content: truncatedContent,
          timestamp: new Date(),
        },
      ],
      { temperature: 0.3, prompt, forceNewConvo: true }
    );

    // Extract JSON array from the response
    const match = response.match(/\[.*?\]/s);
    if (!match) {
      console.warn("Could not extract tags array from response:", response);
      return [];
    }

    try {
      const tags = JSON.parse(match[0]) as string[];
      return tags
        .filter((tag) => tag && typeof tag === "string")
        .map((tag) => tag.toLowerCase());
    } catch (e) {
      console.error("Failed to parse tags JSON:", e);
      return [];
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    return [];
  }
}

/**
 * Runs analysis on all documents in the SceneGraph
 * @param sceneGraph The SceneGraph containing documents to analyze
 * @param onProgress Optional callback for progress updates
 * @returns A dictionary mapping nodeIds to arrays of suggested tags
 */
export async function analyzeAllDocuments(
  sceneGraph: SceneGraph,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<DocumentTags> {
  try {
    // Get LLM client
    const llmClient = await getSharedLLMClient();

    // Get all documents from the scene graph
    const documents = sceneGraph.getDocuments();
    const documentEntries = Object.entries(documents);
    const totalDocuments = documentEntries.length;

    addNotification({
      message: `Starting analysis of ${totalDocuments} documents`,
      type: "info",
      duration: 5000,
    });

    // Initialize results dictionary
    const results: DocumentTags = {};

    // Process each document
    for (let i = 0; i < documentEntries.length; i++) {
      const [nodeId, document] = documentEntries[i];

      // Report progress
      if (onProgress) {
        onProgress({
          processed: i,
          total: totalDocuments,
          currentNodeId: nodeId as NodeId,
        });
      }

      // Skip documents without content
      if (!document.content) {
        continue;
      }

      // Analyze document content
      const suggestedTags = await analyzeDocumentForTags(
        document.content,
        llmClient
      );
      console.log(
        getCurrentSceneGraph()
          .getNode(document.id as NodeId)
          .getLabel(),
        "suggestedTags",
        suggestedTags
      );

      // Store results for this document
      if (suggestedTags.length > 0) {
        results[nodeId] = suggestedTags;
      }

      // Log progress
      if (i % 10 === 0 || i === documentEntries.length - 1) {
        console.log(`Processed ${i + 1} of ${totalDocuments} documents`);
      }
    }

    addNotification({
      message: `Analysis complete: Analyzed ${totalDocuments} documents`,
      type: "success",
      duration: 5000,
    });

    return results;
  } catch (error) {
    console.error("Error during document analysis:", error);
    addNotification({
      message: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      type: "error",
      duration: 5000,
    });
    throw error;
  }
}

/**
 * Applies the suggested tags to the documents in the SceneGraph
 * @param sceneGraph The SceneGraph containing the documents
 * @param documentTags The tags dictionary to apply
 * @returns Number of documents updated
 */
export async function applyTagsToDocuments(
  sceneGraph: SceneGraph,
  documentTags: DocumentTags
): Promise<number> {
  let updatedCount = 0;

  for (const [nodeId, tags] of Object.entries(documentTags)) {
    const node = sceneGraph.getGraph().getNode(nodeId as NodeId);
    if (node) {
      // Add tags to the node
      tags.forEach((tag) => node.addTag(tag));
      updatedCount++;
    }
  }

  // Notify graph changed
  if (updatedCount > 0) {
    sceneGraph.notifyGraphChanged();
  }

  return updatedCount;
}

/**
 * Exports the document tags dictionary to a JSON file
 * @param documentTags The tags dictionary to export
 * @param filename Optional filename (defaults to 'document-tags.json')
 */
export function exportTagsToJson(
  documentTags: DocumentTags,
  filename: string = "document-tags.json"
): void {
  const json = JSON.stringify(documentTags, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  saveAs(blob, filename);
}

/**
 * Main function to run the full analysis pipeline
 * @param sceneGraph The SceneGraph to analyze
 * @param applyTags Whether to apply tags directly to the SceneGraph (default: false)
 * @param exportFile Whether to export the results to a JSON file (default: true)
 * @param onProgress Optional callback for progress updates
 * @returns The document tags dictionary
 */
export async function runConversationsAnalysis(
  sceneGraph: SceneGraph,
  applyTags: boolean = false,
  exportFile: boolean = true,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<DocumentTags> {
  addNotification({
    message: "Starting document analysis...",
    type: "info",
    duration: 5000,
  });

  try {
    // Analyze all documents
    const documentTags = await analyzeAllDocuments(sceneGraph, onProgress);

    // Apply tags to documents if requested
    if (applyTags) {
      const updatedCount = await applyTagsToDocuments(sceneGraph, documentTags);
      addNotification({
        message: `Applied tags to ${updatedCount} documents`,
        type: "success",
        duration: 5000,
      });
    }

    // Export to JSON if requested
    if (exportFile) {
      exportTagsToJson(documentTags);
      addNotification({
        message: "Tags exported to document-tags.json",
        type: "success",
        duration: 5000,
      });
    }

    return documentTags;
  } catch (error) {
    addNotification({
      message: `Analysis process failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      type: "error",
      duration: 5000,
    });
    throw error;
  }
}
