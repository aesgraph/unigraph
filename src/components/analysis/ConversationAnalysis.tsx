import { Save, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { NodeId } from "../../core/model/Node";
import useAppConfigStore from "../../store/appConfigStore";
import { ChatMessage } from "../../store/chatHistoryStore";
import { updateDocument, useDocumentStore } from "../../store/documentStore";
import { addNotification } from "../../store/notificationStore";
import { WebLLMClient } from "../applets/ChatGptImporter/services/WebLLMClient";
import "./ConversationAnalysis.css";

// Define the models available for conversation analysis
const AVAILABLE_MODELS = [
  "Llama-3.1-8B-Instruct-q4f32_1-MLC",
  "TinyLlama-1.1B-Chat-v1.0-q4f32_1",
  "Llama-2-7b-chat-hf-q4f32_1",
];

type AvailableModel = (typeof AVAILABLE_MODELS)[number];

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  followupQuestions?: string[];
}

interface ConversationAnalysisProps {
  conversationId: NodeId;
  onClose: () => void;
  isDarkMode?: boolean;
}

const ConversationAnalysis: React.FC<ConversationAnalysisProps> = ({
  conversationId,
  onClose,
  isDarkMode = false,
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AvailableModel>(
    "TinyLlama-1.1B-Chat-v1.0-q4f32_1"
  );
  const { currentSceneGraph } = useAppConfigStore();
  const { getDocumentByNodeId } = useDocumentStore();
  const llmClientRef = useRef<WebLLMClient | null>(null);

  const document = getDocumentByNodeId(conversationId);
  const node = currentSceneGraph.getGraph().getNode(conversationId);
  const conversationTitle = node?.getLabel() || "Conversation";

  useEffect(() => {
    // Check if we already have an analysis document
    const analysisDocId = `${conversationId}-analysis` as NodeId;
    const existingAnalysis = getDocumentByNodeId(analysisDocId);

    if (existingAnalysis?.content) {
      try {
        const parsed = JSON.parse(existingAnalysis.content);
        setAnalysisResult(parsed);
      } catch (e) {
        console.error("Error parsing existing analysis:", e);
      }
    }
  }, [conversationId, getDocumentByNodeId]);

  // Create or get LLM client when model changes
  useEffect(() => {
    if (!llmClientRef.current) {
      llmClientRef.current = new WebLLMClient({
        model: selectedModel,
        initProgressCallback: (report) => {
          console.log(`Loading model: ${report.progress.toFixed(1)}%`);
        },
      });
    }
  }, [selectedModel]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Get the conversation content
      if (!document || !document.content) {
        throw new Error("Conversation not found or empty");
      }

      // Create LLM client instance if not already created
      if (!llmClientRef.current) {
        llmClientRef.current = new WebLLMClient({
          model: selectedModel,
          initProgressCallback: (report) => {
            console.log(`Loading model: ${report.progress.toFixed(1)}%`);
          },
        });
      }

      // Load the model if not loaded or if model has changed
      if (
        !llmClientRef.current.isLoaded() ||
        llmClientRef.current.getModel() !== selectedModel
      ) {
        addNotification({
          message: `Loading ${selectedModel} model... This may take a while on first use.`,
          type: "info",
          duration: 10000,
        });

        await llmClientRef.current.load();

        addNotification({
          message: `${selectedModel} model loaded successfully!`,
          type: "success",
          duration: 3000,
        });
      }

      // Create analysis prompt
      const analysisPrompt = `
Below is a conversation that needs analysis. Please provide:
1. A concise summary (2-3 sentences)
2. 3-5 key points from the conversation
3. Overall sentiment (positive, neutral, or negative)
4. Main topics discussed (as a list of 2-4 topics)
5. 2-3 potential follow-up questions

Format your response as JSON:
{
  "summary": "your summary here",
  "keyPoints": ["point 1", "point 2", "..."],
  "sentiment": "positive|neutral|negative",
  "topics": ["topic1", "topic2", "..."],
  "followupQuestions": ["question1?", "question2?", "..."]
}

Conversation to analyze:
${document.content}
`;

      // Define messages for the chat completion
      const messages: ChatMessage[] = [
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          role: "system",
          content:
            "You are an AI assistant analyzing conversations. Provide concise, insightful analysis.",
        },
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          role: "user",
          content: analysisPrompt,
        },
      ];

      // Use the client's chatCompletion method
      const response = await llmClientRef.current.chatCompletion(messages, {
        temperature: 0.7,
        prompt: "",
      });

      // Parse the response to extract the JSON
      const jsonMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error("Could not extract JSON from response:", response);
        setAnalysisResult({
          summary: "Could not generate proper analysis",
          keyPoints: ["Analysis failed - see raw output"],
          sentiment: "neutral",
          topics: ["Unknown"],
          followupQuestions: [],
        });
        return;
      }

      // Parse the JSON content
      try {
        const jsonContent = jsonMatch[1] || jsonMatch[0];
        const analysisResult = JSON.parse(jsonContent) as AnalysisResult;
        setAnalysisResult(analysisResult);
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        setAnalysisResult({
          summary: "Failed to parse analysis result",
          keyPoints: ["Error in analysis"],
          sentiment: "neutral",
          topics: ["Error"],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      addNotification({
        message: `Analysis failed: ${e instanceof Error ? e.message : String(e)}`,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysis = () => {
    if (!analysisResult) return;

    // Create an analysis node linked to the conversation
    const analysisDocId = `${conversationId}-analysis` as NodeId;

    // Save the analysis as a document
    if (getDocumentByNodeId(analysisDocId)) {
      updateDocument(analysisDocId, {
        id: analysisDocId,
        nodeId: analysisDocId,
        content: JSON.stringify(analysisResult, null, 2),
        lexicalState: "",
        lastModified: Date.now(),
        tags: ["analysis", "llm"],
      });
    } else {
      updateDocument(analysisDocId, {
        id: analysisDocId,
        nodeId: analysisDocId,
        content: JSON.stringify(analysisResult, null, 2),
        lexicalState: "",
        lastModified: Date.now(),
        tags: ["analysis", "llm"],
      });

      // Create a node for the analysis and link it to the conversation
      const analysisNode = currentSceneGraph.getGraph().createNode({
        id: analysisDocId,
        label: `Analysis of ${conversationTitle}`,
        type: "ConversationAnalysis",
        description: analysisResult.summary,
      });

      // Add tags
      analysisNode.addTag("analysis");
      analysisNode.addTag("llm");

      // Create edge from conversation to analysis
      currentSceneGraph.getGraph().createEdge(conversationId, analysisDocId, {
        type: "hasAnalysis",
        label: "has analysis",
      });

      currentSceneGraph.notifyGraphChanged();
    }
  };

  return (
    <div className={`conversation-analysis ${isDarkMode ? "dark" : ""}`}>
      <div className="analysis-header">
        <h2>Analysis: {conversationTitle}</h2>
        <div className="analysis-actions">
          {analysisResult && (
            <button
              className="save-button"
              onClick={saveAnalysis}
              title="Save Analysis"
            >
              <Save size={18} />
            </button>
          )}
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="analysis-options">
        <div className="model-selector">
          <label>Model:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as AvailableModel)}
            disabled={isAnalyzing}
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <button
          className="analyze-button"
          onClick={runAnalysis}
          disabled={isAnalyzing || !document?.content}
        >
          {isAnalyzing ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      {error && (
        <div className="analysis-error">
          <p>{error}</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="analysis-loading">
          <p>Analyzing conversation...</p>
          <div className="spinner"></div>
        </div>
      )}

      {analysisResult && !isAnalyzing && (
        <div className="analysis-results">
          <div className="analysis-section">
            <h3>Summary</h3>
            <p>{analysisResult.summary}</p>
          </div>

          <div className="analysis-section">
            <h3>Key Points</h3>
            <ul>
              {analysisResult.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h3>Sentiment</h3>
            <div className={`sentiment-indicator ${analysisResult.sentiment}`}>
              {analysisResult.sentiment}
            </div>
          </div>

          <div className="analysis-section">
            <h3>Topics</h3>
            <div className="topic-tags">
              {analysisResult.topics.map((topic, i) => (
                <span key={i} className="topic-tag">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {analysisResult.followupQuestions &&
            analysisResult.followupQuestions.length > 0 && (
              <div className="analysis-section">
                <h3>Follow-up Questions</h3>
                <ul className="followup-questions">
                  {analysisResult.followupQuestions.map((question, i) => (
                    <li key={i}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {!analysisResult && !isAnalyzing && !error && (
        <div className="analysis-placeholder">
          <p>
            Select a model and click Run Analysis to analyze this conversation.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversationAnalysis;
