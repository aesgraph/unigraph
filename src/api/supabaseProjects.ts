import uuid4 from "uuid4";
import { SceneGraph } from "../core/model/SceneGraph";
import {
  deserializeSceneGraphFromJson,
  serializeSceneGraphToJson,
} from "../core/serializers/toFromJson";
import { supabase } from "../utils/supabaseClient";

export interface SupabaseProject {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  last_updated_at?: string | null;
  user_id: string;
  data: any;
}

export interface UpdateProjectParams {
  name?: string;
  description?: string;
}

export async function saveProjectToSupabase(sceneGraph: SceneGraph) {
  const metadata = sceneGraph.getMetadata() || {};
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw new Error("User not logged in");

  // Serialize to JSON string first, then parse to get the plain object
  const serializedData = serializeSceneGraphToJson(sceneGraph);
  const dataObject = JSON.parse(serializedData);
  console.log("Serialized data is ", serializedData);

  const project: SupabaseProject = {
    id: uuid4(), // Always generate new ID for new projects
    name: metadata.name || "Untitled",
    description: metadata.description || null,
    created_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
    data: dataObject, // Store as plain object, not JSON string
    user_id: userData.user.id,
  };
  // Upsert the project by id
  const { data, error } = await supabase
    .from("projects")
    .upsert([project], { onConflict: "id" })
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function listProjects(): Promise<Omit<SupabaseProject, "data">[]> {
  console.log("listProjects called");
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log("User data:", userData);
  console.log("User error:", userError);
  if (userError || !userData?.user?.id) throw new Error("User not logged in");

  // Select all columns except 'data'
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, user_id, created_at, last_updated_at")
    .eq("user_id", userData.user.id)
    .order("last_updated_at", { ascending: false });

  console.log("Database query result - data:", data);
  console.log("Database query result - error:", error);
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
  if (error) throw error;
  return (data as SupabaseProject) || null;
}

/**
 * Delete a project from Supabase by id.
 * @param projectId The ID of the project to delete
 */
export async function deleteProject(projectId: string): Promise<void> {
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw new Error("User not logged in");

  // Delete the project, ensuring it belongs to the current user
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userData.user.id);

  if (error) throw error;
}

/**
 * Update a project's name and/or description in Supabase.
 * @param projectId The ID of the project to update
 * @param updates Object containing name and/or description to update
 */
export async function updateProject(
  projectId: string,
  updates: UpdateProjectParams
): Promise<SupabaseProject> {
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw new Error("User not logged in");

  // Prepare update data
  const updateData: Partial<SupabaseProject> = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }

  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }

  // Update the project, ensuring it belongs to the current user
  const { data, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .eq("user_id", userData.user.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Project not found or not accessible");

  return data as SupabaseProject;
}

export const toSceneGraph = (project: SupabaseProject): SceneGraph => {
  if (!project.data) throw new Error("Project data is empty");

  // project.data should now be a plain object, but handle both cases for backward compatibility
  const graphData =
    typeof project.data === "string" ? JSON.parse(project.data) : project.data;

  console.log("Deserializing sceneGraph from:", graphData);
  const sceneGraph = deserializeSceneGraphFromJson(JSON.stringify(graphData));

  sceneGraph.setMetadata({
    name: project.name,
    description: project.description || undefined,
  });
  return sceneGraph;
};
