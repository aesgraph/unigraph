---
title: "Composability"
nav_order: 2
parent: "Core Concepts"
---

## Composability in Unigraph

Unigraph emphasizes composability to create a state-of-the-art diagramming and collaboration environment.

There are three separate conceptual layers of composability in Unigraph.

1. Graph Model: Graphs are composed of nodes and edges in an agent-based modeling format, so it is possible to merge disparate graphs seamlessly.
2. Display Model: Graph Representation States are decoupled from the underlying Graph Model. There can be many Graph Representation States defined for a single Graph, and each Graph Representation State itself is a composable scene that includes Graph Model + Layout + Filters + Rendering Settings
3. Entity Component System: Unigraph uses an Entity Component System under the hood to centralize development and behavior of data management and UI components. This streamlines development and lowers the barrier of complexity to creating powerful, higher-level components than what are found in traditional UI component libraries.
    Unigraph: Entity Component System

