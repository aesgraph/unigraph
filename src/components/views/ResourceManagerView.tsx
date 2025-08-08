import { addViewAsTab, useTheme } from "@aesgraph/app-shell";
import { RefreshCw } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Annotation, listAnnotations } from "../../api/annotationsApi";
import {
  createDocument,
  Document,
  listDocuments,
  savePdfDocument,
} from "../../api/documentsApi";
import {
  checkWebpagesContent,
  listWebpages,
  Webpage,
} from "../../api/webpagesApi";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { useAuth } from "../../hooks/useAuth";
import useAppConfigStore from "../../store/appConfigStore";
import { useDocumentEventsStore } from "../../store/documentEventsStore";
import { useTagStore } from "../../store/tagStore";
import EntityTableV2 from "../common/EntityTableV2";

type ResourceManagerViewProps = Record<string, never>;

interface TabData {
  id: string;
  label: string;
  icon: string;
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
  entityType?: string;
}

const ResourceManagerView: React.FC<ResourceManagerViewProps> = () => {
  const { currentSceneGraph } = useAppConfigStore();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { setTagMetadata, getTagColor, getTagMetadata } = useTagStore();
  const [activeTab, setActiveTab] = useState<string>("nodes");
  const [webpages, setWebpages] = useState<Webpage[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [webpageContentAvailability, setWebpageContentAvailability] = useState<{
    [id: string]: { hasHtml: boolean; hasScreenshot: boolean };
  }>({});
  const [tagCache, setTagCache] = useState<Set<string>>(new Set());
  const docEventsVersion = useDocumentEventsStore((s) => s.version);

  // PDF creation dialog state
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [pdfTitleInput, setPdfTitleInput] = useState("");
  const [pdfDialogError, setPdfDialogError] = useState<string | null>(null);
  const [pdfCreating, setPdfCreating] = useState(false);

  // Ref to access the EntityTableV2 grid API for silent refresh
  const entityTableRef = useRef<any>(null);

  // Cache for storing fetched data
  const [dataCache, setDataCache] = useState<{
    webpages: Webpage[] | null;
    annotations: Annotation[] | null;
    documents: Document[] | null;
    webpageContentAvailability: {
      [id: string]: { hasHtml: boolean; hasScreenshot: boolean };
    } | null;
    lastFetched: number | null;
  }>({
    webpages: null,
    annotations: null,
    documents: null,
    webpageContentAvailability: null,
    lastFetched: null,
  });

  // Callback to update webpage data when saved
  const updateWebpageData = useCallback((id: string, newTitle: string) => {
    setWebpages((prevWebpages) =>
      prevWebpages.map((webpage) =>
        webpage.id === id ? { ...webpage, title: newTitle } : webpage
      )
    );
  }, []);

  // Fetch data from Supabase
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) return;

      const now = Date.now();
      const cacheAge = dataCache.lastFetched
        ? now - dataCache.lastFetched
        : Infinity;
      const cacheValid = cacheAge < 30000; // 30 seconds cache validity

      // Use cached data if available and not expired
      if (
        !forceRefresh &&
        dataCache.webpages &&
        dataCache.annotations &&
        dataCache.documents &&
        dataCache.webpageContentAvailability &&
        cacheValid
      ) {
        console.log("Using cached data, age:", cacheAge, "ms");
        setWebpages(dataCache.webpages);
        setAnnotations(dataCache.annotations);
        setDocuments(dataCache.documents);
        setWebpageContentAvailability(dataCache.webpageContentAvailability);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching fresh data from server");

        // Fetch webpages (lightweight version without html_content and screenshot_url)
        const webpagesData = await listWebpages({
          userId: user.id,
          includeContent: false,
        });

        // Check content availability for all webpages
        const webpageIds = webpagesData?.map((w: Webpage) => w.id) || [];
        const contentAvailability = await checkWebpagesContent(webpageIds);

        // Fetch annotations (lightweight version without image_url)
        const annotationsData = await listAnnotations({
          userId: user.id,
          includeContent: false,
        });

        // Fetch documents (metadata only)
        const documentsData = await listDocuments({
          userId: user.id,
        });

        // Collect tags during loading
        const newTagCache = new Set<string>();

        // Collect tags from webpages
        (webpagesData || []).forEach((webpage: Webpage) => {
          let tags: string[] = [];
          let metadataObj = webpage.metadata;
          if (typeof metadataObj === "string") {
            try {
              metadataObj = JSON.parse(metadataObj);
            } catch (e) {
              /* Ignore parse errors */
            }
          }
          if (metadataObj && typeof metadataObj === "object") {
            const tagsFromTags = (metadataObj as any).tags;
            const tagsFromTag = (metadataObj as any).tag;
            const tagsFromKeywords = (metadataObj as any).keywords;
            tags = tagsFromTags || tagsFromTag || tagsFromKeywords || [];
          }
          if (Array.isArray(tags)) {
            tags.forEach((tag) => newTagCache.add(tag));
          }
        });

        // Collect tags from annotations
        (annotationsData || []).forEach((annotation: Annotation) => {
          let annotationData = annotation.data;
          if (typeof annotationData === "string") {
            try {
              annotationData = JSON.parse(annotationData);
            } catch (e) {
              /* Ignore parse errors */
            }
          }
          const tags = (annotationData as any).tags || [];
          if (Array.isArray(tags)) {
            tags.forEach((tag) => newTagCache.add(tag));
          }
        });

        // Update state
        setWebpages(webpagesData || []);
        setAnnotations(annotationsData || []);
        setDocuments(documentsData || []);
        setWebpageContentAvailability(contentAvailability);
        setTagCache(newTagCache);

        // Update cache
        setDataCache({
          webpages: webpagesData || [],
          annotations: annotationsData || [],
          documents: documentsData || [],
          webpageContentAvailability: contentAvailability,
          lastFetched: now,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, dataCache]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for document events and refresh documents tab
  useEffect(() => {
    if (activeTab === "documents") {
      // only refresh when documents tab is active to avoid unnecessary loads
      silentRefreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docEventsVersion]);

  // Store tag metadata after tags container is created
  useEffect(() => {
    if (tagCache.size > 0 && !loading) {
      tagCache.forEach((tag) => {
        // Calculate usage statistics
        const webResourceCount = webpages.filter((w) => {
          let tags: string[] = [];
          let metadataObj = w.metadata;
          if (typeof metadataObj === "string") {
            try {
              metadataObj = JSON.parse(metadataObj);
            } catch (e) {
              /* Ignore parse errors */
            }
          }
          if (metadataObj && typeof metadataObj === "object") {
            const tagsFromTags = (metadataObj as any).tags;
            const tagsFromTag = (metadataObj as any).tag;
            const tagsFromKeywords = (metadataObj as any).keywords;
            tags = tagsFromTags || tagsFromTag || tagsFromKeywords || [];
          }
          return Array.isArray(tags) && tags.includes(tag);
        }).length;

        const annotationCount = annotations.filter((a) => {
          let annotationData = a.data;
          if (typeof annotationData === "string") {
            try {
              annotationData = JSON.parse(annotationData);
            } catch (e) {
              /* Ignore parse errors */
            }
          }
          const tags = (annotationData as any).tags || [];
          return Array.isArray(tags) && tags.includes(tag);
        }).length;

        const totalUsage = webResourceCount + annotationCount;

        // Store tag metadata in the store, but preserve user-set descriptions
        const existingMetadata = getTagMetadata(tag);

        // Only update if this is a new tag OR if we're only updating usage count
        if (!existingMetadata) {
          // New tag - set initial metadata with empty description
          setTagMetadata(tag, {
            color: getTagColor(tag),
            description: "", // Start with empty description for user to set
            usageCount: totalUsage,
            isDescriptionUserSet: false,
          });
        } else {
          // Existing tag - only update usage count and color, preserve user-set description
          setTagMetadata(tag, {
            color: existingMetadata.color || getTagColor(tag),
            description: existingMetadata.description, // Always keep existing description
            usageCount: totalUsage, // Update usage count
            isDescriptionUserSet:
              existingMetadata.isDescriptionUserSet || false,
          });
        }
      });
    }
  }, [
    tagCache,
    loading,
    webpages,
    annotations,
    setTagMetadata,
    getTagColor,
    getTagMetadata,
  ]);

  // Function to force refresh data
  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Function to silently refresh data without triggering loading states
  const silentRefreshData = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log("Silently refreshing data from server");

      // Fetch data without setting loading state
      const webpagesData = await listWebpages({
        userId: user.id,
        includeContent: false,
      });

      const webpageIds = webpagesData?.map((w: Webpage) => w.id) || [];
      const contentAvailability = await checkWebpagesContent(webpageIds);

      const annotationsData = await listAnnotations({
        userId: user.id,
        includeContent: false,
      });

      const documentsData = await listDocuments({
        userId: user.id,
      });

      // Collect tags during silent refresh
      const newTagCache = new Set<string>();

      // Collect tags from webpages
      (webpagesData || []).forEach((webpage: Webpage) => {
        let tags: string[] = [];
        let metadataObj = webpage.metadata;
        if (typeof metadataObj === "string") {
          try {
            metadataObj = JSON.parse(metadataObj);
          } catch (e) {
            /* Ignore parse errors */
          }
        }
        if (metadataObj && typeof metadataObj === "object") {
          const tagsFromTags = (metadataObj as any).tags;
          const tagsFromTag = (metadataObj as any).tag;
          const tagsFromKeywords = (metadataObj as any).keywords;
          tags = tagsFromTags || tagsFromTag || tagsFromKeywords || [];
        }
        if (Array.isArray(tags)) {
          tags.forEach((tag) => newTagCache.add(tag));
        }
      });

      // Collect tags from annotations
      (annotationsData || []).forEach((annotation: Annotation) => {
        let annotationData = annotation.data;
        if (typeof annotationData === "string") {
          try {
            annotationData = JSON.parse(annotationData);
          } catch (e) {
            /* Ignore parse errors */
          }
        }
        const tags = (annotationData as any).tags || [];
        if (Array.isArray(tags)) {
          tags.forEach((tag) => newTagCache.add(tag));
        }
      });

      // Update state silently (no loading state)
      setWebpages(webpagesData || []);
      setAnnotations(annotationsData || []);
      setDocuments(documentsData || []);
      setWebpageContentAvailability(contentAvailability);
      setTagCache(newTagCache);

      // Update cache
      setDataCache({
        webpages: webpagesData || [],
        annotations: annotationsData || [],
        documents: documentsData || [],
        webpageContentAvailability: contentAvailability,
        lastFetched: Date.now(),
      });

      // Note: Grid will automatically refresh when container data changes
      console.log("Data updated, grid should refresh automatically");

      console.log("Silent refresh completed");
    } catch (error) {
      console.error("Error during silent refresh:", error);
    }
  }, [user?.id]);

  if (!currentSceneGraph) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.text,
        }}
      >
        <p>No scene graph available. Please load a graph first.</p>
      </div>
    );
  }

  const graph: Graph = currentSceneGraph.getGraph();

  // Create containers for different entity types
  const nodesContainer = graph.getNodes();
  const edgesContainer = graph.getEdges();

  // Create containers for Supabase data
  const webResourcesContainer = new EntitiesContainer(
    webpages.map((webpage) => {
      // Create a mock entity for webpages that implements the required interface
      const contentAvailable = webpageContentAvailability[webpage.id];

      // Extract tags from metadata
      let tags: string[] = [];
      console.log("Webpage metadata:", webpage.metadata);
      console.log("Webpage metadata type:", typeof webpage.metadata);

      let metadataObj = webpage.metadata;

      // If metadata is a string, try to parse it as JSON
      if (typeof metadataObj === "string") {
        console.log("Metadata is a string, attempting to parse JSON");
        try {
          metadataObj = JSON.parse(metadataObj);
          console.log("Successfully parsed metadata from JSON:", metadataObj);
        } catch (e) {
          console.warn("Failed to parse metadata as JSON:", metadataObj);
          console.warn("Parse error:", e);
        }
      } else {
        console.log("Metadata is not a string, type:", typeof metadataObj);
      }

      if (metadataObj && typeof metadataObj === "object") {
        console.log("Metadata object keys:", Object.keys(metadataObj));
        console.log("Full metadata object:", metadataObj);

        // Try to extract tags from metadata.tags or metadata.tag or metadata.keywords
        const tagsFromTags = (metadataObj as any).tags;
        const tagsFromTag = (metadataObj as any).tag;
        const tagsFromKeywords = (metadataObj as any).keywords;

        console.log("tags from .tags:", tagsFromTags);
        console.log("tags from .tag:", tagsFromTag);
        console.log("tags from .keywords:", tagsFromKeywords);

        tags = tagsFromTags || tagsFromTag || tagsFromKeywords || [];

        console.log("Final extracted tags:", tags);
        console.log("Tags type:", typeof tags);
        console.log("Is tags array:", Array.isArray(tags));

        // Ensure tags is an array
        if (!Array.isArray(tags)) {
          console.log("Tags is not an array, converting to empty array");
          tags = [];
        }
      }

      return {
        getId: () => webpage.id,
        getType: () => "webpage",
        getLabel: () => webpage.title || webpage.url,
        getTags: () => new Set(tags),
        getData: () => {
          const data = {
            id: webpage.id,
            label: webpage.title || webpage.url,
            type: "webpage",
            tags: tags,
            url: webpage.url,
            title: webpage.title,
            html_content: contentAvailable?.hasHtml
              ? "Available"
              : "Not available",
            screenshot_url: contentAvailable?.hasScreenshot
              ? "Available"
              : "Not available",
            metadata: webpage.metadata,
            created_at: webpage.created_at,
            last_updated_at: webpage.last_updated_at,
            userData: webpage,
          };
          return data;
        },
        getEntityType: () => "node",
        getFullyQualifiedId: () => webpage.id,
        setId: () => {},
        setData: () => {},
        setType: () => {},
        setLabel: (newLabel: string) => {
          // Update the webpage data in the parent state
          updateWebpageData(webpage.id, newLabel);
        },
        setTags: () => {},
        addTag: () => {},
        removeTag: () => {},
        hasTag: () => false,
        toJSON: () => "",
        fromJSON: () => {},
      } as any;
    })
  );

  const annotationsContainer = new EntitiesContainer(
    annotations.map((annotation) => {
      // Create a mock entity for annotations that implements the required interface
      console.log("Raw annotation from database:", annotation);
      let annotationData = annotation.data;

      // If data is a string, try to parse it as JSON
      if (typeof annotationData === "string") {
        try {
          annotationData = JSON.parse(annotationData);
          console.log("Parsed annotation data from JSON:", annotationData);
        } catch (e) {
          console.warn(
            "Failed to parse annotation data as JSON:",
            annotationData
          );
        }
      }

      // Extract fields directly from the data object since they're stored at the top level
      const selectedText = (annotationData as any).selected_text || "";
      const imageUrl = (annotationData as any).image_url || "";
      const pageUrl = (annotationData as any).page_url || "";
      const comment = (annotationData as any).comment || "";
      const secondaryComment = (annotationData as any).secondary_comment || "";
      const tags = (annotationData as any).tags || [];

      // Check if heavy content is available (without fetching it)
      const hasImage = !!(annotationData as any).image_url;
      const hasHtml = !!(annotationData as any).html_content;
      const hasScreenshot = !!(annotationData as any).screenshot_url;

      // Determine type based on what fields are present
      let annotationType = "annotation";
      if (selectedText) {
        annotationType = "annotation:text";
      } else if (imageUrl) {
        annotationType = "annotation:image";
      }

      // Debug logging to see what's in the data
      console.log("Extracted annotation data:", {
        id: annotation.id,
        type: annotationType,
        selected_text: selectedText,
        image_url: imageUrl,
        page_url: pageUrl,
        comment: comment,
        secondary_comment: secondaryComment,
        tags: tags,
      });

      return {
        getId: () => annotation.id,
        getType: () => annotationType,
        getLabel: () => annotation.title,
        getTags: () => new Set(tags),
        getData: () => ({
          id: annotation.id,
          label: annotation.title,
          type: annotationType,
          tags: new Set(tags),
          comment: comment,
          secondary_comment: secondaryComment,
          selected_text: selectedText,
          image_url: hasImage ? "Available" : "",
          page_url: pageUrl,
          html_content: hasHtml ? "Available" : null,
          screenshot_url: hasScreenshot ? "Available" : null,
          parent_resource_type: annotation.parent_resource_type,
          parent_resource_id: annotation.parent_resource_id,
          created_at: annotation.created_at,
          last_updated_at: annotation.last_updated_at,
          userData: annotation,
        }),
        getEntityType: () => "node",
        getFullyQualifiedId: () => annotation.id,
        setId: () => {},
        setData: () => {},
        setType: () => {},
        setLabel: () => {},
        setTags: () => {},
        addTag: () => {},
        removeTag: () => {},
        hasTag: () => false,
        toJSON: () => "",
        fromJSON: () => {},
      } as any;
    })
  );

  const documentsContainer = new EntitiesContainer(
    documents.map((document) => {
      // Create a mock entity for documents that implements the required interface
      return {
        getId: () => document.id,
        getType: () => "document",
        getLabel: () => document.title,
        getTags: () => new Set(),
        getData: () => ({
          id: document.id,
          label: document.title,
          type: "document",
          extension: document.extension || "md",
          metadata: document.metadata,
          project_id: document.project_id || "",
          parent_id: document.parent_id,
          created_at: document.created_at,
          last_updated_at: document.last_updated_at,
          userData: document,
        }),
        getEntityType: () => "node",
        getFullyQualifiedId: () => document.id,
        setId: () => {},
        setData: () => {},
        setType: () => {},
        setLabel: () => {},
        setTags: () => {},
        addTag: () => {},
        removeTag: () => {},
        hasTag: () => false,
        toJSON: () => "",
        fromJSON: () => {},
      } as any;
    })
  );

  // Create tags container with color and description columns using cached tags
  const tagsContainer = new EntitiesContainer(
    Array.from(tagCache).map((tag) => {
      // Calculate usage statistics
      const webResourceCount = webpages.filter((w) => {
        let tags: string[] = [];
        let metadataObj = w.metadata;
        if (typeof metadataObj === "string") {
          try {
            metadataObj = JSON.parse(metadataObj);
          } catch (e) {
            /* Ignore parse errors */
          }
        }
        if (metadataObj && typeof metadataObj === "object") {
          const tagsFromTags = (metadataObj as any).tags;
          const tagsFromTag = (metadataObj as any).tag;
          const tagsFromKeywords = (metadataObj as any).keywords;
          tags = tagsFromTags || tagsFromTag || tagsFromKeywords || [];
        }
        return Array.isArray(tags) && tags.includes(tag);
      }).length;

      const annotationCount = annotations.filter((a) => {
        let annotationData = a.data;
        if (typeof annotationData === "string") {
          try {
            annotationData = JSON.parse(annotationData);
          } catch (e) {
            /* Ignore parse errors */
          }
        }
        const tags = (annotationData as any).tags || [];
        return Array.isArray(tags) && tags.includes(tag);
      }).length;

      const totalUsage = webResourceCount + annotationCount;

      return {
        getId: () => `tag-${tag}`,
        getType: () => "tag",
        getLabel: () => tag,
        getTags: () => new Set(),
        getData: () => {
          // Always get the latest description from tag store
          const currentTagMetadata = getTagMetadata(tag);
          return {
            id: `tag-${tag}`,
            label: tag,
            type: "tag",
            color: getTagColor(tag), // Always get current color
            description: currentTagMetadata?.description || "", // Start with empty description
            usage_count: totalUsage,
          };
        },
        getEntityType: () => "node",
        getFullyQualifiedId: () => `tag-${tag}`,
        setId: () => {
          /* No-op for read-only entities */
        },
        setData: () => {
          /* No-op for read-only entities */
        },
        setType: () => {
          /* No-op for read-only entities */
        },
        setLabel: () => {
          /* No-op for read-only entities */
        },
        setTags: () => {
          /* No-op for read-only entities */
        },
        addTag: () => {
          /* No-op for read-only entities */
        },
        removeTag: () => {
          /* No-op for read-only entities */
        },
        hasTag: () => false,
        toJSON: () => "",
        fromJSON: () => {},
      } as any;
    })
  );

  const tabs: TabData[] = [
    {
      id: "nodes",
      label: "Nodes",
      icon: "🔵",
      container: nodesContainer,
      sceneGraph: currentSceneGraph,
    },
    {
      id: "edges",
      label: "Edges",
      icon: "🔗",
      container: edgesContainer,
      sceneGraph: currentSceneGraph,
    },
    {
      id: "tags",
      label: "Tags",
      icon: "🏷️",
      container: tagsContainer,
      sceneGraph: currentSceneGraph,
      entityType: "tags",
    },
    {
      id: "web-resources",
      label: "Web Resources",
      icon: "🌐",
      container: webResourcesContainer,
      sceneGraph: currentSceneGraph,
    },
    {
      id: "annotations",
      label: "Annotations",
      icon: "📝",
      container: annotationsContainer,
      sceneGraph: currentSceneGraph,
    },
    {
      id: "documents",
      label: "Documents",
      icon: "📄",
      container: documentsContainer,
      sceneGraph: currentSceneGraph,
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.text,
        }}
      >
        <p>{user ? "Loading resources..." : "Sign in to load resources"}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.background,
      }}
    >
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor:
                  activeTab === tab.id ? theme.colors.primary : "transparent",
                color:
                  activeTab === tab.id
                    ? theme.colors.textInverse
                    : theme.colors.text,
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                borderBottom:
                  activeTab === tab.id
                    ? `2px solid ${theme.colors.primary}`
                    : "2px solid transparent",
                minWidth: "80px",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  backgroundColor:
                    activeTab === tab.id
                      ? theme.colors.textInverse
                      : theme.colors.textSecondary,
                  color:
                    activeTab === tab.id
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderRadius: "10px",
                  padding: "1px 6px",
                  fontSize: "11px",
                  fontWeight: "500",
                  minWidth: "16px",
                  textAlign: "center",
                }}
              >
                {tab.container.size()}
              </span>
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={silentRefreshData}
          style={{
            padding: "6px",
            border: "none",
            backgroundColor: "transparent",
            color: theme.colors.textSecondary,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            e.currentTarget.style.color = theme.colors.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = theme.colors.textSecondary;
          }}
          title="Silently refresh data from server"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tab Toolbar (below refresh, above table) */}
      {activeTab === "documents" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            backgroundColor: theme.colors.surface,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              style={{
                border: "none",
                background: theme.colors.primary,
                color: theme.colors.textInverse,
                padding: "6px 10px",
                borderRadius: 4,
                cursor: "pointer",
              }}
              title="Create new document"
              onClick={() => {
                const menu = document.getElementById("doc-create-menu");
                if (menu) {
                  const isOpen = menu.getAttribute("data-open") === "true";
                  menu.setAttribute("data-open", (!isOpen).toString());
                  menu.style.display = !isOpen ? "block" : "none";
                }
              }}
            >
              Create new ▾
            </button>
            <div
              id="doc-create-menu"
              data-open="false"
              style={{
                display: "none",
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                minWidth: 160,
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 6,
                boxShadow: theme.sizes.shadow.md,
                zIndex: 2147483647,
              }}
              onMouseLeave={() => {
                const menu = document.getElementById("doc-create-menu");
                if (menu) {
                  menu.setAttribute("data-open", "false");
                  menu.style.display = "none";
                }
              }}
            >
              {[
                { key: "txt", label: "Text (.txt)" },
                { key: "md", label: "Markdown (.md)" },
                { key: "pdf", label: "PDF from URL" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    color: theme.colors.text,
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    const menu = document.getElementById("doc-create-menu");
                    if (menu) {
                      menu.setAttribute("data-open", "false");
                      menu.style.display = "none";
                    }
                    if (opt.key === "pdf") {
                      // Open custom dialog
                      setPdfDialogError(null);
                      setPdfUrlInput("");
                      setPdfTitleInput("");
                      setPdfDialogOpen(true);
                      return;
                    }
                    // txt or md
                    try {
                      const ext = opt.key;
                      const title = ext === "txt" ? "Untitled" : "Untitled"; // same base
                      const newDoc = await createDocument({
                        title,
                        content: "",
                        extension: ext,
                        metadata: {},
                        data: {},
                        project_id: undefined,
                        parent_id: undefined,
                      });
                      const tabId = `document-editor-${newDoc.id}`;
                      const tabTitle = `${newDoc.title}.${newDoc.extension || ext}`;
                      addViewAsTab({
                        viewId: "document-editor",
                        pane: "center",
                        tabId,
                        title: tabTitle,
                        props: {
                          documentId: newDoc.id,
                          filename: tabTitle,
                          userId: user?.id,
                          projectId: newDoc.project_id || "",
                        },
                        activate: true,
                      });
                      await silentRefreshData();
                    } catch (err) {
                      console.error("Failed to create document", err);
                      alert("Failed to create document");
                    }
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PDF Create Dialog */}
      {pdfDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2147483646,
          }}
          onClick={() => {
            if (!pdfCreating) setPdfDialogOpen(false);
          }}
        >
          <div
            style={{
              width: 420,
              maxWidth: "90vw",
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 8,
              boxShadow: theme.sizes.shadow.lg || theme.sizes.shadow.md,
              padding: 16,
              color: theme.colors.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, marginBottom: 12 }}>Create PDF from URL</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 13 }}>PDF URL</label>
              <input
                type="url"
                placeholder="https://example.com/file.pdf"
                value={pdfUrlInput}
                onChange={(e) => setPdfUrlInput(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.background,
                  color: theme.colors.text,
                }}
              />
              <label style={{ fontSize: 13 }}>Title</label>
              <input
                type="text"
                placeholder="PDF title"
                value={pdfTitleInput}
                onChange={(e) => setPdfTitleInput(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.background,
                  color: theme.colors.text,
                }}
              />
              {pdfDialogError && (
                <div style={{ color: theme.colors.error, fontSize: 12 }}>
                  {pdfDialogError}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button
                onClick={() => !pdfCreating && setPdfDialogOpen(false)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surface,
                  color: theme.colors.text,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setPdfDialogError(null);
                    if (!pdfUrlInput.trim()) {
                      setPdfDialogError("Please enter a PDF URL");
                      return;
                    }
                    let title = pdfTitleInput.trim();
                    if (!title) {
                      const urlFile = (pdfUrlInput.split("/").pop() || "")
                        .split("?")[0]
                        .split("#")[0];
                      const baseFromUrl = urlFile.toLowerCase().endsWith(".pdf")
                        ? urlFile.slice(0, -4)
                        : urlFile;
                      const timestamp = new Date()
                        .toISOString()
                        .replace(/[:.]/g, "-");
                      title = baseFromUrl || `PDF-${timestamp}`;
                    }
                    setPdfCreating(true);
                    const resp = await fetch(pdfUrlInput);
                    if (!resp.ok) throw new Error("Failed to fetch PDF");
                    const blob = await resp.blob();
                    const doc = await savePdfDocument({
                      title,
                      pdfBlob: blob,
                      url: pdfUrlInput,
                      projectId: undefined,
                    });
                    const tabId = `pdf-viewer-${doc.id}-${Date.now()}`;
                    addViewAsTab({
                      viewId: "pdf-viewer",
                      pane: "center",
                      tabId,
                      title: doc.title || "PDF Document",
                      props: {
                        documentId: doc.id,
                        title: doc.title || "PDF Document",
                      },
                      activate: true,
                    });
                    await silentRefreshData();
                    setPdfCreating(false);
                    setPdfDialogOpen(false);
                  } catch (err) {
                    console.error("Failed to create PDF from URL", err);
                    setPdfDialogError(
                      "Failed to load PDF from the provided link"
                    );
                    setPdfCreating(false);
                  }
                }}
                disabled={pdfCreating}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: theme.colors.primary,
                  color: theme.colors.textInverse,
                  cursor: pdfCreating ? "default" : "pointer",
                  opacity: pdfCreating ? 0.7 : 1,
                }}
              >
                {pdfCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {activeTabData ? (
          <EntityTableV2
            container={activeTabData.container}
            sceneGraph={activeTabData.sceneGraph}
            maxHeight="100%"
            entityType={activeTabData.entityType || activeTabData.id}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.colors.textMuted,
            }}
          >
            <p>No data available for this tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagerView;
