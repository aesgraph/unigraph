import { SceneGraph } from "../model/SceneGraph";

/**
 * Represents metadata about a stored scene graph
 */
export interface StoredSceneGraphInfo {
  id: string;
  name: string;
  description?: string;
  lastModified: number;
  createdAt?: number; // Add created timestamp
  thumbnailUrl?: string;
  tags?: string[];
}

/**
 * Interface defining a persistent storage mechanism for scene graphs
 */
export interface IPersistentStore {
  /**
   * Saves a scene graph to persistent storage
   * @param sceneGraph The scene graph to save
   * @param options Additional save options
   * @returns The ID of the saved scene graph
   */
  saveSceneGraph(
    sceneGraph: SceneGraph,
    options?: {
      id?: string;
      createThumbnail?: boolean;
    }
  ): Promise<string>;

  /**
   * Loads a scene graph from persistent storage
   * @param id The ID of the scene graph to load
   * @returns The loaded scene graph or null if not found
   */
  loadSceneGraph(id: string): Promise<SceneGraph | null>;

  /**
   * Retrieves a list of all stored scene graphs
   * @returns Array of metadata about available scene graphs
   */
  listSceneGraphs(): Promise<StoredSceneGraphInfo[]>;

  /**
   * Deletes a scene graph from persistent storage
   * @param id The ID of the scene graph to delete
   * @returns true if successfully deleted, false otherwise
   */
  deleteSceneGraph(id: string): Promise<boolean>;

  /**
   * Export a scene graph to a file
   * @param id The ID of the scene graph to export
   * @returns A file blob of the scene graph
   */
  exportSceneGraph(id: string): Promise<Blob>;

  /**
   * Import a scene graph from a file
   * @param file The file containing the scene graph
   * @returns The ID of the imported scene graph
   */
  importSceneGraph(file: File): Promise<string>;

  /**
   * Updates an existing scene graph
   * @param id The ID of the scene graph to update
   * @param sceneGraph The updated scene graph
   * @returns The ID of the updated scene graph
   */
  updateSceneGraph(
    id: string,
    sceneGraph: SceneGraph,
    options?: { createThumbnail?: boolean }
  ): Promise<string>;
}
