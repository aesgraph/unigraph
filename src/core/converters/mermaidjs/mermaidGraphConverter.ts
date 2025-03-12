import mermaid from 'mermaid';
import { DEFAULT_APP_CONFIG } from '../../../AppConfig';
import { DEFAULT_FORCE_GRAPH_RENDER_CONFIG } from '../../force-graph/createForceGraph';
import { GraphvizLayoutType } from '../../layouts/GraphvizLayoutEngine';
import { Graph } from '../../model/Graph';
import { NodeDataArgs } from '../../model/Node';
import { SceneGraph } from '../../model/SceneGraph';

// Define your Mermaid graph as a string
const mermaidGraph = `
graph TD;
  A-->B-->C
  A-->C
`;

// Configure Mermaid to use the desired settings
mermaid.initialize({
  startOnLoad: false,
});

const parser = (
  await mermaid.mermaidAPI.getDiagramFromText(mermaidGraph)
).getParser().yy;

const generateTypescript = () => {
  const statements = {};
  const vertices = parser.getVertices();
};

const edges = parser.getEdges();
/* Output:
[
  {
    start: 'A',
    end: 'B',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'A',
    end: 'C',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'B',
    end: 'D',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'C',
    end: 'D',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  }
]
*/

const vertices = parser.getVertices();

/* Output:
{
  A: {
    id: 'A',
    labelType: 'text',
    domId: 'flowchart-A-0',
    styles: [],
    classes: [],
    text: 'A',
    props: {}
  },
  B: {
    id: 'B',
    labelType: 'text',
    domId: 'flowchart-B-1',
    styles: [],
    classes: [],
    text: 'B',
    props: {}
  },
  C: {
    id: 'C',
    labelType: 'text',
    domId: 'flowchart-C-2',
    styles: [],
    classes: [],
    text: 'C',
    props: {}
  },
  D: {
    id: 'D',
    labelType: 'text',
    domId: 'flowchart-D-5',
    styles: [],
    classes: [],
    text: 'D',
    props: {}
  }
}

*/

function traverse(vertex: string, visited: { [key: string]: string }): string {
  if (visited[vertex]) {
    return visited[vertex];
  }

  const currentVertex = vertices[vertex];
  const args = Object.values(edges)
      .filter((edge: any) => (edge as any).start === vertex)
      .map((edge: any) => `${traverse((edge as any).end, visited)}`)
      .join(', ');

  visited[vertex] = `out_${vertex.toLowerCase()}`;
  return `${visited[vertex]} = ${currentVertex.id}(${args})`;
}

let output = '';

for (const vertex in vertices) {
  output += `${traverse(vertex, {})}\n`;
}

console.log(output);

export const loadMermaidTextToSceneGraph = async (mermaidText: string): Promise<SceneGraph> => {
  const graph = new Graph();
  
  // Configure Mermaid to use the desired settings
  mermaid.initialize({
    startOnLoad: false,
  });

  const parser = (await mermaid.mermaidAPI.getDiagramFromText(mermaidText)).getParser().yy;

  const vertices = parser.getVertices();
  const edges = parser.getEdges();

  // Add nodes to the scene graph
  for (const vertexId in vertices) {
    const vertex = vertices[vertexId];
    console.log("vertex is ", vertex);
    const nodeData: NodeDataArgs = {
      label: vertex.text,
      type: 'default',
      tags: [],
      description: '',
    };
    graph.createNode(vertexId, nodeData);
  }

  // Add edges to the scene graph
  for (const edge of edges) {
    graph.createEdge(edge.start, edge.end, {type: 'default'});
  }

  return new SceneGraph({graph, metadata: {name: "Mermaid Graph Import"}, forceGraphDisplayConfig: {
    ...DEFAULT_FORCE_GRAPH_RENDER_CONFIG,
    nodeTextLabels: true,
  }, defaultAppConfig: {
    ...DEFAULT_APP_CONFIG(),
    forceGraph3dOptions: {
      ...DEFAULT_APP_CONFIG().forceGraph3dOptions,
      layout: "Layout",
    },
    activeLayout: GraphvizLayoutType.Graphviz_dot
  }});
};
