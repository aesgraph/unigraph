---
title: Graphviz Integrations
nav_order: 1
parent: "Capabilities"
---

## From Static to Interactive:<br/>Converting Graphviz DOT Graphs into Enhanced Unigraph Graphs

### Overview

### Unigraph offers a seamless way to import **Graphviz DOT** graphs and convert them into fully interactive, dynamic, and extensible **Unigraph Graphs**. This capability is essential for users who work with complex graph structures and are constrained by the limitations of static visualization tools like Graphviz.

### By importing DOT files into Unigraph, users can:

- Make their graphs interactive and editable,
- Overcome Graphviz's layouting and scalability limitations,
- Attach semantics, types, metrics, and behaviors to graph components,
- Generate multiple **views** and **perspectives** from a single underlying model.

This feature makes Unigraph not just a visualizer, but a graph-native platform for managing **living models**.

---

### Why This Capability Matters

### Graphviz has served as the de-facto standard for describing graphs declaratively via the DOT language. However, Graphviz is not suited for modern, large-scale, interactive, or multi-perspective graph-based workflows.

| Graphviz Limitation                                | Unigraph Solution                                                                                                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Struggles with large, dense, or complex graphs** | Unigraph handles dense graphs interactively with panning, zooming, filtering, and subgraph exploration tools.                                                                                                            |
| ---                                                | ---                                                                                                                                                                                                                      |
| **Global layout control only**                     | In Graphviz, layouting applies globally. You cannot adjust the positioning of only a subset of nodes or edges. In Unigraph, you can override layouts locally and create partial or custom layouts within the same graph. |
| **Static output**                                  | Graphviz renders static images or exports fixed layouts. Unigraph generates interactive, dynamic, and explorable graphs.                                                                                                 |
| **Single-view limitation**                         | Graphviz renders a single visualization for each DOT file. Unigraph supports multiple **perspectives** derived from the same graph, each with custom filters, layouts, styles, or user-defined semantics.                |
| **No runtime editing**                             | Graphviz graphs are defined in DOT source files. In Unigraph, users can edit nodes, edges, and attributes directly inside the graph view.                                                                                |
| **No data integration**                            | Graphviz cannot link nodes to external datasets, live data, or dynamic content. Unigraph graphs can integrate with external data, annotations, documents, AI systems, and more.                                          |

---

### Workflow Overview

1. **Import**

   - Upload a Graphviz `.dot` file via Unigraph's import interface.

1. **Conversion**

   - The DOT graph is parsed and converted into Unigraph’s `SceneGraph`, mapping:
     - Nodes → Unigraph Nodes,
     - Edges → Unigraph Edges,
     - Attributes (optional) → Display styles or semantic properties.

1. **Enhance**

   - Define types, relationships, metrics, and annotations.
   - Attach dynamic data to nodes and edges.
   - Define local or global layouts interactively.
   - Filter, group, or highlight parts of the graph without altering the base model.

1. **Create Perspectives**

   - Build multiple **views** from the same graph.
   - Each perspective can:
     - Show different subsets,
     - Use different layouts,
     - Highlight different semantics,
     - Integrate additional data sources.

1. **Explore and Operate**

   - Dynamically interact with graphs:
     - Drag, reposition, edit,
     - Filter or search nodes,
     - Link to documents or APIs,
     - Combine imported DOT graphs with other Unigraph-native graphs.

---

### Use Cases

| Scenario                       | Benefit                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Legacy Graph Modernization** | Modernize DOT-defined graphs into interactive, dynamic graphs without starting from scratch.                                         |
| ---                            | ---                                                                                                                                  |
| **Complex System Diagrams**    | Handle graphs with thousands of nodes where Graphviz layouting becomes unreadable, by selectively applying layouts and perspectives. |
| **Ontology & Data Modeling**   | Start with DOT to bootstrap, then extend into a rich, typed, explorable model.                                                       |
| **Interactive Documentation**  | Convert static architectural diagrams into interactive documentation linked to code, specs, metrics, or other systems.               |
| **Educational Tools**          | Build explorable learning materials from simple DOT graphs into complex interactive graph systems.                                   |
| **Multi-view Analysis**        | Use the same base graph to produce different analytical perspectives without duplicating or rewriting the model.                     |

---

### Why Unigraph Unlocks New Possibilities

### Most graph-based workflows eventually hit a ceiling with static tools like Graphviz:

- The larger the graph, the more **global layouting** fails, forcing you to manually split graphs or compromise readability.
- The inability to make **partial adjustments** prevents expressing subtle structures within graphs.
- The lack of interactivity makes it hard to engage users beyond simply looking at the graph.

**Unigraph** solves this by turning DOT into a canvas:

- Graphs become interactive **knowledge spaces**.
- Layouts are **modular**, and can be recomposed dynamically.
- Perspectives are **first-class**, allowing multiple interpretations of the same data.
- Users operate on **living models** instead of static images.

---

### Summary

By bridging static graph definitions into Unigraph’s dynamic ecosystem, users unlock:

- Better visualization,
- Better analysis,
- Better communication,
- And continuous evolution of their models.
