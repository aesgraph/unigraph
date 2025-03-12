import { GraphEntityType } from "../../components/common/GraphSearch";
import { RenderingConfig } from "../../controllers/RenderingManager";
import { DisplayManager } from "./DisplayManager";
import { Graph } from "./Graph";
import { Node } from "./Node";
import { SceneGraph } from "./SceneGraph";

export const GetRandomNodeFromSceneGraph = (sceneGraph: SceneGraph): Node => {
  return sceneGraph.getGraph().getNodes().getRandomEntity();
};

export const getRandomNode = (graph: Graph): Node => {
  const nodes = Array.from(graph.getNodes());
  const randomIndex = Math.floor(Math.random() * nodes.length);
  return nodes[randomIndex];
};

export const GetCurrentDisplayConfigOf = (
  sceneGraph: SceneGraph,
  type: GraphEntityType
) => {
  const renderingManager = sceneGraph.getRenderingManager();
  const displayConfig = renderingManager.getDisplayConfig(
    type,
    sceneGraph.getDisplayConfig().mode
  );
  return displayConfig;
};

export const SetCurrentDisplayConfigOf = (
  sceneGraph: SceneGraph,
  type: GraphEntityType,
  config: any
) => {
  const renderingManager = sceneGraph.getRenderingManager();
  renderingManager.setDisplayConfig(
    sceneGraph.getDisplayConfig().mode,
    type,
    config
  );
  DisplayManager.applyRenderingConfigToGraph(
    sceneGraph.getGraph(),
    sceneGraph.getDisplayConfig()
  );
};

export const saveRenderingConfigToFile = (
  config: RenderingConfig,
  filename: string
) => {
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const loadRenderingConfigFromFile = (
  file: File
): Promise<RenderingConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(
          event.target?.result as string
        ) as RenderingConfig;
        resolve(config);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};