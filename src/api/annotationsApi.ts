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

export const loadAnnotations = async (
  userId: string,
  sceneGraph: SceneGraph
) => {
  const annotations = await listAnnotations({
    userId,
  });
  annotations.forEach((annotation) => {
    sceneGraph.getGraph().createNodeIfMissing(annotation.id, {
      id: annotation.id,
      type: "annotation",
      label: annotation.title,
      userData: annotation.data,
    });
  });
  sceneGraph.refreshDisplayConfig();
  sceneGraph.notifyGraphChanged();
};
