import { Graph } from '../../core/model/Graph';
import { GraphBuilder } from '../../core/model/GraphBuilder';
import { SceneGraph } from '../../core/model/SceneGraph';

export const journalSceneGraph = () => {
  const journalGraph = new Graph();

  journalGraph.createNode('axiomOfInteraction', {
    type: 'concept pillar',
    tags: ['axiom of interaction', 'story entrypoint'],
  });

  journalGraph.createNode('theoryOfEverything', {
    type: 'concept pillar',
    tags: ['theory of everything', 'story entrypoint'],
  });

  journalGraph.createNode('unigraph', {
    type: 'concept pillar',
    tags: ['unigraph', 'story entrypoint', 'graph software'],
  });

  journalGraph.createNode('graphviz', {
    type: 'graph software',
    tags: ['graph software'],
  });

  journalGraph.createNode('reactflow', {
    type: 'graph software',
    tags: ['graph software', 'story entrypoint'],
  });

  journalGraph.createEdge('axiomOfInteraction', 'theoryOfEverything', {
    type: 'philosophical approach to',
  });

  journalGraph.createEdge('unigraph', 'theoryOfEverything', {
    type: 'technology to implement a',
  });

  journalGraph.createNode('communication medium', {
    type: 'technology',
    tags: ['technology', 'language'],
  });

  journalGraph.createEdge('unigraph', 'communication medium', {
    type: 'is a',
  });

  journalGraph.createNode('analytics engine', { type: 'concept pillar' });
  journalGraph.createEdge('unigraph', 'analytics engine', {
    type: 'is a',
  });

  journalGraph.createEdge('unigraph', 'axiomOfInteraction', {
    type: 'can be understood through',
  });

  journalGraph.createEdge('unigraph', 'graphviz', { type: 'adaptor for' });
  journalGraph.createEdge('unigraph', 'reactflow', { type: 'adaptor for' });

  journalGraph.createNode('logical mind maps', { type: 'material thing' });
  journalGraph.createEdge('axiomOfInteraction', 'logical mind maps', {
    type: 'is a',
  });

  journalGraph.createEdge('unigraph', 'logical mind maps', { type: 'builds' });

  journalGraph.createEdge('logical mind maps', 'theoryOfEverything', {
    type: 'to describe a',
  });

  journalGraph.createEdge('logical mind maps', 'analytics engine', {
    type: 'powered by',
  });

  journalGraph.createEdge('communication medium', 'logical mind maps', {
    type: 'in the form of',
  });

  // journalGraph.createEdge("theoryOfEverything", "analytics engine", {
  //   type: "described within",
  // });

  journalGraph.createEdge('analytics engine', 'theoryOfEverything', {
    type: 'to build and navigate a',
  });

  const builder = new GraphBuilder(journalGraph);
  builder.addEdge('theoryOfEverything', 'is a', 'overloaded term');

  // console.log("journal", journalSceneGraph);
  return new SceneGraph({ graph: journalGraph });
};
