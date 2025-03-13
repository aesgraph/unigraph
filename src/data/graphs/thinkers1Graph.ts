import { Color, digraph } from 'ts-graphviz';
import {
  RenderingConfig,
  RenderingManager,
} from '../../controllers/RenderingManager';
import { Graph } from '../../core/model/Graph';
import { SceneGraph } from '../../core/model/SceneGraph';
import {
  DEFAULT_RENDERING_CONFIG_AcademicDataset,
  Field,
  fields,
  people,
  Person,
} from '../datasets/academic-works';
import { thinkers2 } from './thinkers2Graph';

class KnowledgeGraphBuilder {
  private graph: Graph;
  private thinkers2: SceneGraph;

  constructor() {
    this.graph = new Graph();
    this.thinkers2 = thinkers2();
  }

  addPerson(person: Person) {
    this.graph.createNodeIfMissing(person.name, { type: person.type });
    person.majorWorks.forEach((work) => {
      this.graph.createNodeIfMissing(work.name, { type: 'major work' });
      this.graph.createNodeIfMissing(work.field, { type: 'field' });
      this.graph.createEdgeIfMissing(person.name, work.name, {
        type: 'contributed',
      });
      this.graph.createEdgeIfMissing(work.name, work.field, {
        type: 'within the field of',
      });
      if (work.year) {
        this.graph.createNodeIfMissing(work.year.toString(), { type: 'year' });
        this.graph.createEdgeIfMissing(work.name, work.year.toString(), {
          type: 'published in',
        });
      }
      if (work.description) {
        this.graph.createNodeIfMissing(work.description, {
          type: 'description',
        });
        this.graph.createEdgeIfMissing(work.name, work.description, {
          type: 'described as',
        });
      }
    });
  }

  addField(field: Field) {
    this.graph.createNodeIfMissing(field.name, { type: 'field' });
    if (field.parentField) {
      this.graph.createEdgeIfMissing(field.name, field.parentField, {
        type: 'subcategory of',
      });
    }
  }

  addInitialNodes() {
    const initialNodes = [
      'Graphviz',
      'ReactFlow',
      'Unigraph',
      'A technology for communication',
      'Use it to tell a story',
      'Diagramming tool',
      'Describes itself',
    ];
    initialNodes.forEach((node) => this.graph.createNodeIfMissing(node));
    this.thinkers2
      .getGraph()
      .getNodes()
      .forEach((node) => {
        this.graph.addNode(node);
      });
    this.thinkers2
      .getGraph()
      .getEdges()
      .forEach((edge) => {
        this.graph.addEdge(edge);
      });
  }

  buildGraph(): Graph {
    // this.addInitialNodes();
    people.forEach((person) => this.addPerson(person));
    fields.forEach((field) => this.addField(field));
    return this.graph;
  }
}

export const constructModel = () => {
  const builder = new KnowledgeGraphBuilder();
  return builder.buildGraph();
};

export const buildGraph = (graph: Graph, renderConfig: RenderingConfig) => {
  const renderingManager = new RenderingManager(renderConfig);
  const g = digraph('G', (g) => {
    g.set('rankdir', 'LR');
    for (const node of graph.getNodes()) {
      if (!renderingManager.getNodeIsVisible(node)) {
        continue;
      }
      g.node(node.getId(), {
        label: node.getId(),
        shape: 'box',
        color: renderingManager.getNodeColor(node),
      });
    }
    for (const edge of graph.getEdges()) {
      if (!renderingManager.getEdgeIsVisible(edge, graph)) {
        continue;
      }
      g.edge([edge.getSource(), edge.getTarget()], {
        label: edge.getType(),
        color: renderingManager.getEdgeColor(edge),
        fontcolor: renderingManager.getEdgeColor(edge) as Color,
      });
    }
  });
  return g;
};

export const thinkers1 = () => {
  return new SceneGraph({
    graph: constructModel(),
    displayConfig: DEFAULT_RENDERING_CONFIG_AcademicDataset,
    metadata: {
      name: 'Great Minds',
      description:
        'A graph of some of the greatest minds and contributors in history',
    },
  });
};
