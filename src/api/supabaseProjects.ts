import { SceneGraph } from "../core/model/SceneGraph";
import {
  deserializeSceneGraphFromJson,
  serializeSceneGraphToJson,
} from "../core/serializers/toFromJson";
import { supabase } from "../utils/supabaseClient";

export interface SupabaseProject {
  id?: string;
  name: string;
  description?: string;
  data: any;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export async function saveProjectToSupabase(sceneGraph: SceneGraph) {
  const metadata = sceneGraph.getMetadata() || {};
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw new Error("User not logged in");

  const project: SupabaseProject = {
    name: metadata.name || "Untitled",
    description: metadata.description || "",
    data: sceneGraph ? serializeSceneGraphToJson(sceneGraph) : sceneGraph,
    user_id: userData.user.id,
  };
  // Insert the project directly since name is unique and conflicts are avoided
  const { data, error } = await supabase
    .from("projects")
    .insert([project])
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function listProjects(): Promise<Omit<SupabaseProject, "data">[]> {
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw new Error("User not logged in");

  // Select all columns except 'data'
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, user_id, created_at, updated_at")
    .eq("user_id", userData.user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a project from Supabase by id or name.
 * @param params Object with either id or name
 */
export async function getProject(params: {
  id?: string;
  name?: string;
}): Promise<SupabaseProject | null> {
  if (!params.id && !params.name) throw new Error("Must provide id or name");

  const query = supabase.from("projects").select("*");

  let result;
  if (params.id) {
    result = query.eq("id", params.id);
  } else if (params.name) {
    result = query.eq("name", params.name);
  }

  if (!result) throw new Error("Query result is undefined");
  const { data, error } = await result.single();
  console.log("getProject result:", data, error);
  if (error) throw error;
  return (data as SupabaseProject) || null;
}

export const toSceneGraph = (project: SupabaseProject): SceneGraph => {
  if (!project.data) throw new Error("Project data is empty");
  // Always pass a string to fromJSON
  const dataStr =
    typeof project === "string" ? project : JSON.stringify(project);
  console.log("Deserialized sceneGraph:", dataStr);
  const sceneGraph = deserializeSceneGraphFromJson(dataStr);

  sceneGraph.setMetadata({
    name: project.name,
    description: project.description,
  });
  return sceneGraph;
};
