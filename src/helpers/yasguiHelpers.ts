import { EdgeId } from "../core/model/Edge";
import { NodeDataArgs, NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";

export const processYasguiResults = (results: any, sceneGraph: SceneGraph) => {
  console.log("results are ", results);
  const nodes: { [id: string]: NodeDataArgs } = {};
  const edges: {
    [id: string]: { source: string; target: string; label: string };
  } = {};

  results.forEach((binding: any) => {
    const sourceId = binding.sub;
    const predId = binding.pred;
    const targetId = binding.obj;

    if (!nodes[sourceId]) {
      nodes[sourceId] = {
        label: getLabelFromUri(sourceId),
        type: "dbpedia Node",
        tags: [],
        description: "",
      };
    }

    if (!nodes[targetId]) {
      nodes[targetId] = {
        label: getLabelFromUri(targetId),
        type: "dbpedia Node",
        tags: [],
        description: "",
      };
    }

    const edgeId: EdgeId = `${sourceId}-${targetId}` as EdgeId;
    edges[edgeId] = {
      source: sourceId,
      target: targetId,
      label: getLabelFromUri(predId),
    };
  });

  console.log("generated node and edge count is ", nodes, edges);

  Object.entries(nodes).forEach(([nodeId, nodeData]) => {
    sceneGraph.getGraph().createNode(nodeId as NodeId, nodeData);
  });

  Object.entries(edges).forEach(([edgeId, edgeData]) => {
    console.log("creating edge", edgeData);
    // sceneGraph.getGraph().setStrictMode(true);
    sceneGraph.getGraph().createEdge(edgeData.source, edgeData.target, {
      label: edgeData.label,
      type: "dbpedia Edge",
    });
  });

  const randomColor = getRandomColorFromPalette();

  sceneGraph.getDisplayConfig().nodeConfig.types["dbpedia Node"] = {
    color: randomColor,
    isVisible: true,
  };
  sceneGraph.getDisplayConfig().edgeConfig.tags["dbpedia Node"] = {
    color: randomColor,
    isVisible: true,
  };

  sceneGraph.getDisplayConfig().edgeConfig.types["dbpedia Edge"] = {
    color: randomColor,
    isVisible: true,
  };
  sceneGraph.getDisplayConfig().edgeConfig.tags["dbpedia Edge"] = {
    color: randomColor,
    isVisible: true,
  };

  sceneGraph.notifyGraphChanged();
};

import fetch from "node-fetch";
import { getRandomColorFromPalette } from "../utils/colorUtils";

export async function bfsQuery(
  dbpediaId: string,
  limitLevel1: number = 200,
  limitLevel2: number = 150,
  totalLimit: number = 500
) {
  const endpoint = "https://dbpedia.org/sparql";

  const sparqlQuery = `
    PREFIX dbr: <http://dbpedia.org/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT ?sub ?pred ?obj
    WHERE {
      {
        # Level 1: Direct links to the central entity (limited)
        SELECT DISTINCT ?sub ?pred ?obj
        WHERE {
          dbr:${dbpediaId} ?pred ?obj .
          BIND(dbr:${dbpediaId} AS ?sub)
        }
        LIMIT ${limitLevel1}
      }
      UNION
      {
        # Level 2: Expand from Level 1 entities (limited)
        SELECT DISTINCT ?sub ?pred ?obj
        WHERE {
          ?sub1 ?p1 dbr:${dbpediaId} .
          ?sub1 ?pred ?obj .
          FILTER(?sub1 != dbr:${dbpediaId})
          BIND(?sub1 AS ?sub)
        }
        LIMIT ${limitLevel2}
      }
      UNION
      {
        # Level 3: Expand from Level 2 entities
        ?sub2 ?p2 ?sub1 .
        ?sub1 ?pred ?obj .
        FILTER(?sub2 != dbr:${dbpediaId} && ?sub1 != dbr:${dbpediaId})
        BIND(?sub1 AS ?sub)
      }
    }
    LIMIT ${totalLimit}
    `;

  const url = `${endpoint}?query=${encodeURIComponent(sparqlQuery)}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.results.bindings.map((row: any) => ({
      sub: row.sub.value,
      pred: row.pred.value,
      obj: row.obj.value,
    }));
  } catch (error) {
    console.error("SPARQL Query Error:", error);
    return [];
  }
}

// Example usage:
// bfsQuery("Albert_Einstein", 200, 150, 500).then((results) =>
//   console.log(results)
// );

const getLabelFromUri = (uri: string) => {
  return uri.split("/").pop()!;
};
