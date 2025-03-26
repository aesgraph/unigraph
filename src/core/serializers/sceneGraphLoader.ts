import { SceneGraph } from "../model/SceneGraph";
import { deserializeDotToSceneGraph } from "./fromDot";
import { deserializeGraphmlToSceneGraph } from "./fromGraphml";
import { deserializeSvgToSceneGraph } from "./fromSvg";
import { deserializeSceneGraphFromJson } from "./toFromJson";

export type FileFormat = "json" | "graphml" | "svg" | "dot" | "unknown";

export async function loadSceneGraphFromFile(file: File): Promise<SceneGraph> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase() as FileFormat;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let sceneGraph: SceneGraph | undefined;

      try {
        switch (fileExtension) {
          case "json":
            sceneGraph = deserializeSceneGraphFromJson(content);
            break;
          case "graphml":
            sceneGraph = await deserializeGraphmlToSceneGraph(content);
            break;
          case "svg":
            sceneGraph = deserializeSvgToSceneGraph(content);
            break;
          case "dot":
            sceneGraph = deserializeDotToSceneGraph(content);
            break;
          default:
            reject(
              new Error(`Unsupported file type: ${fileExtension || file.type}`)
            );
            return;
        }

        if (sceneGraph) {
          resolve(sceneGraph);
        } else {
          reject(new Error("Failed to load scene graph from file"));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
}
