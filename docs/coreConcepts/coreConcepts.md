---
title: "Core Concepts"
nav_order: 2
---

## Core Concepts

### Composability

Unigraph emphasizes composability to create a state-of-the-art diagramming and collaboration environment.

There are three separate conceptual layers of composability in Unigraph.

1. Composable Graph Models: Graphs are composed of nodes and edges in an agent-based modeling format, so it is possible to merge disparate graphs seamlessly. Composable graphs are important from the perspective of distributed collaboration and regulatory controls.
2. Display Model and Composable Presets: Graph Representation States are decoupled from the underlying Graph Model. There can be many Graph Representation States defined for a single Graph, and each Graph Representation State itself is a composable scene that includes Graph Model + Filters + Layout + Rendering Settings. These different settings can be saved individually, and combined together for deeper inspections.
3. Entity Component System: Unigraph uses an Entity Component System under the hood to centralize development and behavior of data management and UI components. This streamlines development and lowers the barrier of complexity to creating powerful, higher-level components than what are found in traditional UI component libraries.

### Entity Component System

Unigraph uses an Entity Component System (ECS) under the hood to centralize development and behavior of data management and UI components. This streamlines development and lowers the barrier of complexity to creating powerful, higher-level components than what are found in traditional UI component libraries, and applications.

In the context of Unigraph, an Entity is a piece of data that fits in the Unigraph application ecosystem. Developers can extend Unigraph and introduce new Entity types and add custom logic to the application quickly using the ECS framework.

### 2D & 3D Visualization

Both 2D and 3D spaces present distinct advantages in how humans interact with and interpret information. While 2D environments offer clarity and efficiency for structured visualization, 3D spaces enhance spatial reasoning and immersive interaction. Unigraph aims to provide a complete solution for both 2D and 3D display modes.

### Model Display Separation

Unigraph is a graph engine that decouples graph structure from its presentation, enabling flexible, context-aware visualization. By separating the underlying model from its display, users can create multiple representations of the same data, tailoring views to different needs and audiences.

This separation allows for configurable presets that simplify complex system diagrams, ensuring they remain human-interpretable and adaptable. Users can define custom configurations to highlight specific aspects of a graph, enhancing clarity and usability across diverse applications.