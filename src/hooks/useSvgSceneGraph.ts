import { useEffect, useState } from "react";
import { Graph } from "../core/model/Graph";
import { SceneGraph } from "../core/model/SceneGraph";
import { loadSvgFromUrl } from "../utils/svgLoader";

export async function fetchSvgSceneGraph(svgUrl: string): Promise<{
  sceneGraph: SceneGraph;
  error: Error | null;
}> {
  try {
    const loadedSceneGraph = await loadSvgFromUrl(svgUrl);
    return { sceneGraph: loadedSceneGraph, error: null };
  } catch (err) {
    console.error("Error loading SVG:", err);
    return {
      sceneGraph: new SceneGraph({
        graph: new Graph(),
        displayConfig: {
          mode: "type",
          nodeConfig: {
            types: { error: { color: "#ff0000", isVisible: true } },
            tags: {},
          },
          edgeConfig: { types: {}, tags: {} },
          nodePositions: {},
        },
        metadata: {
          name: "Error Loading SVG Graph",
          description: "An error occurred while loading the SVG file.",
        },
      }),
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

export function useSvgSceneGraph(svgUrl: string): {
  sceneGraph: SceneGraph;
  loading: boolean;
  error: Error | null;
} {
  const [sceneGraph, setSceneGraph] = useState<SceneGraph>(
    new SceneGraph({
      graph: new Graph(),
      displayConfig: {
        mode: "type",
        nodeConfig: {
          types: { loading: { color: "#cccccc", isVisible: true } },
          tags: {},
        },
        edgeConfig: { types: {}, tags: {} },
        nodePositions: {},
      },
      metadata: {
        name: "Loading SVG Graph...",
        description: "The SVG file is being loaded...",
      },
    })
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSvg() {
      try {
        const { sceneGraph: loadedSceneGraph, error: loadError } =
          await fetchSvgSceneGraph(svgUrl);

        if (mounted) {
          setSceneGraph(loadedSceneGraph);
          setError(loadError);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading SVG:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    loadSvg();

    return () => {
      mounted = false;
    };
  }, [svgUrl]);

  return { sceneGraph, loading, error };
}

export const urlSceneGraph = await fetchSvgSceneGraph(
  "https://upload.wikimedia.org/wikipedia/commons/b/b3/1_42_t01_A5.svg"
);

console.log("WOAH", urlSceneGraph);
