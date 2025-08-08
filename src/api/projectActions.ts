import { addNotification } from "../store/notificationStore";
import {
  deleteProject,
  getProject,
  saveProjectToSupabase,
  toSceneGraph,
  updateProject,
  UpdateProjectParams,
} from "./supabaseProjects";

export interface ProjectActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Export a project to a JSON file
 * @param projectId The ID of the project to export
 * @param projectName The name of the project (for filename)
 * @returns Promise<ProjectActionResult>
 */
export async function exportProject(
  projectId: string,
  projectName: string
): Promise<ProjectActionResult> {
  console.log("export called");
  try {
    // Get the project from Supabase
    const project = await getProject({ id: projectId });
    if (!project) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    // Convert to SceneGraph
    const sceneGraph = toSceneGraph(project);
    const metadata = sceneGraph.getMetadata();
    const fileName = metadata?.name || projectName || "scene-graph";

    // Serialize the scene graph to JSON
    const jsonData = JSON.stringify(sceneGraph, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create download link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: `Exported "${fileName}.json" successfully`,
    };
  } catch (err) {
    console.error("Error exporting project:", err);
    return {
      success: false,
      message: "Failed to export project",
    };
  }
}

/**
 * Delete a project from Supabase
 * @param projectId The ID of the project to delete
 * @param projectName The name of the project (for notification)
 * @returns Promise<ProjectActionResult>
 */
export async function deleteProjectAction(
  projectId: string,
  projectName: string
): Promise<ProjectActionResult> {
  try {
    await deleteProject(projectId);
    return {
      success: true,
      message: `Project "${projectName || projectId}" deleted`,
    };
  } catch (err) {
    console.error("Error deleting project:", err);
    return {
      success: false,
      message: "Failed to delete project",
    };
  }
}

/**
 * Copy a project with a new name
 * @param projectId The ID of the project to copy
 * @param newName The new name for the copied project
 * @returns Promise<ProjectActionResult>
 */
export async function copyProject(
  projectId: string,
  newName: string
): Promise<ProjectActionResult> {
  try {
    // Get the original project from Supabase
    const originalProject = await getProject({ id: projectId });
    if (!originalProject) {
      return {
        success: false,
        message: "Original project not found",
      };
    }

    // Convert to SceneGraph
    const sceneGraph = toSceneGraph(originalProject);

    // Update the metadata with the new name
    sceneGraph.setMetadata({
      ...sceneGraph.getMetadata(),
      name: newName.trim(),
    });

    // Save to Supabase with new name
    const savedProject = await saveProjectToSupabase(sceneGraph);

    return {
      success: true,
      message: `Project copied as "${newName}"`,
      data: savedProject,
    };
  } catch (err) {
    console.error("Error copying project:", err);
    return {
      success: false,
      message: "Failed to copy project",
    };
  }
}

/**
 * Edit a project's name and/or description
 * @param projectId The ID of the project to edit
 * @param updates Object containing name and/or description to update
 * @returns Promise<ProjectActionResult>
 */
export async function editProject(
  projectId: string,
  updates: UpdateProjectParams
): Promise<ProjectActionResult> {
  try {
    const updatedProject = await updateProject(projectId, updates);
    return {
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    };
  } catch (err) {
    console.error("Error updating project:", err);
    return {
      success: false,
      message: "Failed to update project",
    };
  }
}

/**
 * Load a project and return it as a SceneGraph
 * @param projectId The ID of the project to load
 * @returns Promise<ProjectActionResult>
 */
export async function loadProject(
  projectId: string
): Promise<ProjectActionResult> {
  try {
    const project = await getProject({ id: projectId });
    if (!project) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    const sceneGraph = toSceneGraph(project);
    return {
      success: true,
      message: `Loaded project: ${project.name}`,
      data: sceneGraph,
    };
  } catch (err) {
    console.error("Error loading project:", err);
    return {
      success: false,
      message: "Failed to load project",
    };
  }
}

/**
 * Helper function to handle project action results and show notifications
 * @param result The result from a project action
 * @param onSuccess Optional callback to execute on success
 * @param onError Optional callback to execute on error
 */
export function handleProjectActionResult(
  result: ProjectActionResult,
  onSuccess?: (data?: any) => void,
  onError?: (message: string) => void
): void {
  if (result.success) {
    addNotification({
      message: result.message,
      type: "success",
      duration: 3000,
    });
    onSuccess?.(result.data);
  } else {
    addNotification({
      message: result.message,
      type: "error",
      duration: 5000,
    });
    onError?.(result.message);
  }
}

/**
 * Confirm action with user before proceeding
 * @param message The confirmation message to show
 * @returns Promise<boolean> True if user confirms, false otherwise
 */
export function confirmAction(message: string): Promise<boolean> {
  return Promise.resolve(window.confirm(message));
}
