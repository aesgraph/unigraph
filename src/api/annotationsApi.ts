import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutType";
import { SceneGraph } from "../core/model/SceneGraph";
import { extractPositionsFromNodes } from "../data/graphs/blobMesh";
import {
  getActiveView,
  getAutoFitView,
  setAutoFitView,
} from "../store/appConfigStore";
import {
  computeLayoutAndTriggerAppUpdate,
  handleReactFlowFitView,
} from "../store/sceneGraphHooks";
import { supabase } from "../utils/supabaseClient";

export interface TextSelectionAnnotationData {
  selected_text?: string;
  comment: string;
  secondary_comment?: string;
  tags?: string[];
  page_url?: string;
  type: "text_selection";
}

export interface ImageAnnotationData {
  image_url: string;
  comment: string;
  secondary_comment?: string;
  tags?: string[];
  page_url?: string;
  type: "image";
}

export interface Annotation {
  id: string;
  title: string;
  data: TextSelectionAnnotationData | ImageAnnotationData;
  created_at?: string;
  last_updated_at?: string | null;
  user_id: string;
  parent_resource_type?: string | null;
  parent_resource_id?: string | null;
}

// Save (upsert) an annotation
export async function saveAnnotation(annotation: Annotation) {
  const { data, error } = await supabase
    .from("annotations")
    .upsert([annotation], { onConflict: "id" })
    .select();
  if (error) throw error;
  return data?.[0];
}

// List annotations with optional filters
export async function listAnnotations({
  userId,
  parentResourceType,
  parentResourceId,
}: {
  userId?: string;
  parentResourceType?: string;
  parentResourceId?: string;
} = {}) {
  let query = supabase.from("annotations").select("*");
  if (userId) query = query.eq("user_id", userId);
  if (parentResourceType)
    query = query.eq("parent_resource_type", parentResourceType);
  if (parentResourceId)
    query = query.eq("parent_resource_id", parentResourceId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Get a single annotation by id
export async function getAnnotation(id: string) {
  const { data, error } = await supabase
    .from("annotations")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export const loadAnnotationsToSceneGraph = async (
  userId: string,
  sceneGraph: SceneGraph
) => {
  console.log("Loading annotations for user:", userId);

  // Disable auto-fitview and set processing flag to prevent ReactFlow updates
  const wasAutoFitViewEnabled = getAutoFitView();
  setAutoFitView(false);

  try {
    const annotations = await listAnnotations({
      userId,
    });
    console.log("annotations retrieved:", annotations);
    annotations.forEach((annotation) => {
      const annotationNode = sceneGraph
        .getGraph()
        .createNodeIfMissing(annotation.id, {
          id: annotation.id,
          type: "annotation",
          label: annotation.title,
          userData: annotation,
          position: { x: 0, y: 0 },
        });
      const parentResourceNode = sceneGraph
        .getGraph()
        .createNodeIfMissing(annotation.parent_resource_id, {
          id: annotation.parent_resource_id,
          type: annotation.parent_resource_type || "resource",
          label: annotation.parent_resource_id,
          userData: annotation,
        });
      sceneGraph
        .getGraph()
        .createEdgeIfMissing(
          annotationNode.getId(),
          parentResourceNode.getId(),
          {
            type: "annotation-parent",
          }
        );
    });
    sceneGraph.setForceGraphRenderConfig({
      ...sceneGraph.getForceGraphRenderConfig(),
      nodeTextLabels: true,
    });
    // if (getForceGraph3dInstance()) {
    //   ForceGraphManager.applyForceGraphRenderConfig(
    //     getForceGraph3dInstance()!,
    //     sceneGraph.getForceGraphRenderConfig(),
    //     sceneGraph
    //   );
    // }
    const positions = extractPositionsFromNodes(sceneGraph);
    console.log("Extracted positions from nodes:", positions);
    //
    sceneGraph.refreshDisplayConfig();
    // sceneGraph.setNodePositions(positions);
    console.log("sceneGraph after loading annotations", sceneGraph);
    if (getActiveView() === "ReactFlow") {
      await computeLayoutAndTriggerAppUpdate(
        sceneGraph,
        GraphvizLayoutType.Graphviz_dot,
        undefined // No specific node selection for now)
      );
    }

    sceneGraph.notifyGraphChanged();
  } finally {
    // Restore the original auto-fitview setting and clear processing flag
    setAutoFitView(wasAutoFitViewEnabled);
    handleReactFlowFitView(0.1);
  }
};
