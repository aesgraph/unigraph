import { v4 as uuidv4 } from "uuid";
import { SceneGraph } from "../model/SceneGraph";
import { saveAppConfigToSceneGraph } from "../serializers/sceneGraphSaver";
import {
  deserializeSceneGraphFromJson,
  serializeSceneGraphToJson,
} from "../serializers/toFromJson";
import { IPersistentStore, StoredSceneGraphInfo } from "./IPersistentStore";

/**
 * Implementation of persistent storage for scene graphs using IndexedDB
 */
export class PersistentStoreManager implements IPersistentStore {
  private dbName = "unigraph-scene-graphs";
  private dbVersion = 1;
  private storeName = "scene-graphs";
  private metadataStoreName = "metadata";

  /**
   * Open the IndexedDB database
   */
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(new Error("Failed to open database"));

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create store for scene graphs if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("id", "id", { unique: true });
        }

        // Create store for metadata if it doesn't exist
        if (!db.objectStoreNames.contains(this.metadataStoreName)) {
          const metadataStore = db.createObjectStore(this.metadataStoreName, {
            keyPath: "id",
          });
          metadataStore.createIndex("id", "id", { unique: true });
          metadataStore.createIndex("name", "name", { unique: false });
          metadataStore.createIndex("lastModified", "lastModified", {
            unique: false,
          });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
    });
  }

  /**
   * Check if a scene graph ID already exists
   */
  private async checkIdExists(id: string): Promise<boolean> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], "readonly");
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
          db.close();
          const result = (event.target as IDBRequest).result;
          resolve(!!result);
        };

        request.onerror = (event) => {
          db.close();
          reject(
            new Error(
              `Failed to check ID: ${(event.target as IDBRequest).error}`
            )
          );
        };
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  }

  /**
   * Generate a unique ID for a new scene graph
   */
  private async generateUniqueId(): Promise<string> {
    let id = uuidv4();
    while (await this.checkIdExists(id)) {
      id = uuidv4();
    }
    return id;
  }

  /**
   * Generate a thumbnail for the scene graph (simplified implementation)
   */
  private async generateThumbnail(_sceneGraph: SceneGraph): Promise<string> {
    // In a real implementation, this could render a small version of the graph
    // For now, we'll just use a placeholder
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAB1UlEQVR4nO3cMU7DQBRF0UlEkYJl0LKMbIKGLehYBhVLSAEFTRRFKIrsjD3z5p97JKsJ8u/VK9mxPRwAAAAAAAAAAADQzXH08wwcgGv0FcTovoPjpr5GH0FOwGn0STc1AuU7CsIMIgiDCMIggjCIIAwiCIMIwiCCMIggDCIIgwjCIIIwiCAMIgiDCMIggjCIIAwiCIMIwiCCMIggDCIIgwjCIIIwiCAMIgiDCMIggjCIIAwiCIMIwiCCMIggDCIIgwjCIIIwiCAMIgiDCMIggjDIHoO8jz6B/3xEH+Aa7DHIc+mYZ9oIVgV5Gn0CDTyOPsHUIIe9BjHnrSBGvRXEmBaiGFOxCmLUW0GMeinI6JLetRDNmIpVECNeCjL6TXWLhWjGVKyCGPFSkJHvs1suhOZKrIIY8VKQUYsYopDOtRDNmIpVECNeCjIixtCFdKyFaMZUrIIY8VKQ3jFKLaRTLUQzpmIVZM+MeamF1P5zmjEVqyDGvBRkz09b5RbSoRaiGVOxCrJnQeQgO7XnQqQgBQrCYMxLQfb82VsK0oHfQxhSEAZjXgqitPdkzEtBVPo+GPNSEOPeijEVqyBGvRVkj38Oc41mTMUqiHFvBdnTbytbNGMqVkEAAAAAAAAAgM34Bpd4GrPJhJzfAAAAAElFTkSuQmCC";
  }

  /**
   * Save a scene graph to IndexedDB
   */
  public async saveSceneGraph(
    sceneGraph: SceneGraph,
    options: { id?: string; createThumbnail?: boolean } = {}
  ): Promise<string> {
    // If an ID is provided, verify it doesn't already exist
    if (options.id) {
      const exists = await this.checkIdExists(options.id);
      if (exists) {
        throw new Error(
          `Scene graph with ID ${options.id} already exists. Use updateSceneGraph to modify existing scene graphs.`
        );
      }
    }

    // Generate a new unique ID if none provided
    const id = options.id || (await this.generateUniqueId());
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(
          [this.storeName, this.metadataStoreName],
          "readwrite"
        );

        saveAppConfigToSceneGraph(sceneGraph);

        // Capture SceneGraph data as a serializable object
        const serializedGraph = {
          id,
          data: serializeSceneGraphToJson(sceneGraph),
        };

        // Save the graph itself
        const objectStore = transaction.objectStore(this.storeName);
        objectStore.put(serializedGraph);

        // Generate metadata
        const thumbnailPromise = options.createThumbnail
          ? this.generateThumbnail(sceneGraph)
          : Promise.resolve(undefined);

        thumbnailPromise.then((thumbnail) => {
          const metadata: StoredSceneGraphInfo = {
            id,
            name:
              sceneGraph.getMetadata().name ||
              `Scene Graph ${id.substring(0, 6)}`,
            description: sceneGraph.getMetadata().description,
            lastModified: Date.now(),
            thumbnailUrl: thumbnail,
            tags: [],
          };

          // Save metadata
          const metadataStore = transaction.objectStore(this.metadataStoreName);
          metadataStore.put(metadata);

          transaction.oncomplete = () => {
            db.close();
            resolve(id);
          };

          transaction.onerror = (event) => {
            db.close();
            reject(
              new Error(
                `Failed to save scene graph: ${(event.target as IDBTransaction).error}`
              )
            );
          };
        });
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  }

  /**
   * Load a scene graph from IndexedDB
   */
  public async loadSceneGraph(id: string): Promise<SceneGraph | null> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], "readonly");
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
          db.close();
          const result = (event.target as IDBRequest).result;

          if (result) {
            try {
              // Create new SceneGraph from the stored data
              const sceneGraph = deserializeSceneGraphFromJson(result?.data);
              resolve(sceneGraph);
            } catch (error) {
              console.error("Error reconstructing scene graph:", error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };

        request.onerror = (event) => {
          db.close();
          reject(
            new Error(
              `Failed to load scene graph: ${(event.target as IDBRequest).error}`
            )
          );
        };
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  }

  /**
   * List all available scene graphs
   */
  public async listSceneGraphs(): Promise<StoredSceneGraphInfo[]> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(
          [this.metadataStoreName],
          "readonly"
        );
        const objectStore = transaction.objectStore(this.metadataStoreName);
        const request = objectStore
          .index("lastModified")
          .openCursor(null, "prev"); // Sort by last modified (newest first)

        const results: StoredSceneGraphInfo[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;

          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            db.close();
            resolve(results);
          }
        };

        request.onerror = (event) => {
          db.close();
          reject(
            new Error(
              `Failed to list scene graphs: ${(event.target as IDBRequest).error}`
            )
          );
        };
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  }

  /**
   * Delete a scene graph from IndexedDB
   */
  public async deleteSceneGraph(id: string): Promise<boolean> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(
          [this.storeName, this.metadataStoreName],
          "readwrite"
        );

        // Delete from both stores
        transaction.objectStore(this.storeName).delete(id);
        transaction.objectStore(this.metadataStoreName).delete(id);

        transaction.oncomplete = () => {
          db.close();
          resolve(true);
        };

        transaction.onerror = (event) => {
          db.close();
          reject(
            new Error(
              `Failed to delete scene graph: ${(event.target as IDBTransaction).error}`
            )
          );
        };
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  }

  /**
   * Export a scene graph to a file
   */
  public async exportSceneGraph(id: string): Promise<Blob> {
    const sceneGraph = await this.loadSceneGraph(id);

    if (!sceneGraph) {
      throw new Error(`Scene graph with ID ${id} not found`);
    }

    const jsonString = JSON.stringify(sceneGraph);
    return new Blob([jsonString], { type: "application/json" });
  }

  /**
   * Import a scene graph from a file
   */
  public async importSceneGraph(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target!.result as string);
          const sceneGraph = new SceneGraph(jsonData);

          // Save the imported scene graph with a new ID
          const id = await this.saveSceneGraph(sceneGraph, {
            createThumbnail: true,
          });
          resolve(id);
        } catch (error) {
          reject(new Error(`Failed to import scene graph: ${error}`));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Update a scene graph in IndexedDB
   */
  public async updateSceneGraph(
    id: string,
    sceneGraph: SceneGraph,
    options?: { createThumbnail?: boolean }
  ): Promise<string> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(
          [this.storeName, this.metadataStoreName],
          "readwrite"
        );

        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(id);

        request.onsuccess = async (event) => {
          const existingGraph = (event.target as IDBRequest).result;

          if (!existingGraph) {
            db.close();
            reject(new Error(`Scene graph with ID ${id} not found`));
            return;
          }

          saveAppConfigToSceneGraph(sceneGraph);

          // Capture SceneGraph data as a serializable object
          const serializedGraph = {
            id,
            data: serializeSceneGraphToJson(sceneGraph),
          };

          // Save the graph itself
          objectStore.put(serializedGraph);

          // Generate metadata
          const thumbnailPromise = options?.createThumbnail
            ? this.generateThumbnail(sceneGraph)
            : Promise.resolve(existingGraph.thumbnailUrl);

          const thumbnail = await thumbnailPromise;

          const metadata: StoredSceneGraphInfo = {
            id,
            name:
              sceneGraph.getMetadata().name ||
              `Scene Graph ${id.substring(0, 6)}`,
            description: sceneGraph.getMetadata().description,
            lastModified: Date.now(),
            thumbnailUrl: thumbnail,
            tags: existingGraph.tags || [],
          };

          // Save metadata
          const metadataStore = transaction.objectStore(this.metadataStoreName);
          metadataStore.put(metadata);

          transaction.oncomplete = () => {
            db.close();
            resolve(id);
          };

          transaction.onerror = (event) => {
            db.close();
            reject(
              new Error(
                `Failed to update scene graph: ${(event.target as IDBTransaction).error}`
              )
            );
          };
        };

        request.onerror = (event) => {
          db.close();
          reject(
            new Error(
              `Failed to update scene graph: ${(event.target as IDBRequest).error}`
            )
          );
        };
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  }
}

// Create and export a singleton instance
export const persistentStore = new PersistentStoreManager();

// Add function to get most recent project
export const getMostRecentProjectId = async (): Promise<string | undefined> => {
  try {
    const projects = await persistentStore.listSceneGraphs();
    if (projects.length > 0) {
      // Projects are already sorted by lastModified in descending order
      return projects[0].id;
    }
  } catch (err) {
    console.error("Failed to get recent projects:", err);
  }
  return undefined;
};
