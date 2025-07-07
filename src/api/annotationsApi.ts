import { SceneGraph } from "../core/model/SceneGraph";
import { supabase } from "../utils/supabaseClient";

export interface Annotation {
  id: string;
  title: string;
  data: any;
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
  const annotations = await listAnnotations({
    userId,
  });
  annotations.forEach((annotation) => {
    const annotationNode = sceneGraph
      .getGraph()
      .createNodeIfMissing(annotation.id, {
        id: annotation.id,
        type: "annotation",
        label: annotation.title,
        userData: annotation.data,
      });
    const parentResourceNode = sceneGraph
      .getGraph()
      .createNodeIfMissing(annotation.parent_resource_id, {
        id: annotation.parent_resource_id,
        type: annotation.parent_resource_type || "resource",
        label: annotation.parent_resource_id,
        userData: {},
      });
    sceneGraph
      .getGraph()
      .createEdgeIfMissing(annotationNode.getId(), parentResourceNode.getId(), {
        type: "annotation-parent",
      });
  });

  sceneGraph.refreshDisplayConfig();
  sceneGraph.notifyGraphChanged();
};
