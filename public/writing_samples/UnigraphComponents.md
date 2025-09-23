## Unigraph Components

### **Entity Component System**

Unigraph employs an **Entity Component System (ECS)** architecture to manage and render semantic data in a flexible and modular way. In this design:

- **Entities** are the fundamental units of data, representing any concept—whether abstract (like a “theorem” or “tag”) or concrete (like a “note” or “person”).
- **Components** are modular pieces of information that attach to entities, such as `type`, `tag`, `display`, `metrics`, or `layout`. These are lightweight and decoupled, allowing for easy composition and evolution over time.
- **Systems** process sets of entities and components to produce behavior, such as rendering, tagging, querying, or layout computation.

This architecture makes Unigraph highly extensible, decouples data logic from rendering logic, and allows for advanced reasoning or visualization pipelines to be constructed dynamically.

---

### **Graph**

At the heart of Unigraph is a **unified graph data model**, abstracting the underlying ontology, data, and relationships into a composable and explorable structure:

- All nodes (entities) and edges (relationships) are semantically meaningful and typed.
- Graph edges may represent anything from logical dependencies to causal flows, citations, UI linkages, or hierarchical structures.
- The graph is enriched with **metadata**, like centrality metrics, timestamps, perspectives, and provenance, enabling deep analytical queries.
- This model supports **multimodal composition**, where diagrams, text, code, and data can coexist and interconnect meaningfully.

The graph is not merely a database—it’s a **semantic substrate** for constructing interfaces, documentation, and tools that map to human reasoning.

---

### **SceneGraph**

The **SceneGraph** is the visual and logical runtime representation of a subset of the graph, rendered interactively within a UI "scene":

- It reflects the current **perspective**, **filter**, or **layout** context of a user.
- It is responsible for maintaining **spatial coherence**, handling dynamic layout updates, and rendering nodes/edges with styling based on user-configurable parameters like `displayMode`, `tagFilter`, `metricsMap`, etc.
- SceneGraph allows **layered views**, animations, transitions, and graph-aware UI composition (e.g., draggable, focusable, collapsible subgraphs).
- It decouples data from rendering via the DisplayManager and is optimized for human-scale interaction, not big data scale.

This enables a live, interactive interface for exploring structured thought or system architecture in a user-driven way.

---

### **Interactive Shell**

The **Interactive Shell** is a command-and-control interface that allows users (and LLMs) to:

- Query and manipulate the graph using structured commands or natural language.
- Create, modify, and link entities using commands like:
  pgsql
  CopyEdit
  `add node "Concept" tagged "Philosophy" link "Knowledge" -> "Inference" as "depends_on" display view as radial using centrality`
- Access a **scriptable REPL** environment that supports context-sensitive autocompletion, macros, and programmatic workflows.
- Act as a **programmable interface** for generating diagrams, filtering views, managing perspectives, or even launching custom tooling pipelines.

Over time, the Shell serves as both a **developer tool** and a **semantic thinking assistant**, bridging structured language and visual interaction.

---

### **Copilot**

The **Unigraph Copilot** is an intelligent assistant layer powered by local or external LLMs:

- It interprets ambiguous or incomplete user intent and maps it to graph operations, diagram generation, or knowledge structuring.
- It acts as a **zero-shot translator** from natural language to the internal command grammar of the Interactive Shell or SceneGraph operations.
- Capable of **multi-step planning**, the Copilot can scaffold documentation, build knowledge structures, answer questions based on the current graph state, or suggest optimizations to visualizations.
- Eventually, it enables **collaborative AI workflows**, where the user and Copilot co-construct knowledge graphs, diagrams, or systems.

This feature makes Unigraph not only a tool for experts but also a **cognitive prosthetic** for students, researchers, and technologists working across disciplines.

---

### **Web-based Graph-based Application Ecosystem**

Unigraph is not just a single app—it is the foundation of a **web-based application ecosystem** grounded in graph-based semantics:

- Any tool built on Unigraph (e.g., a documentation editor, diagram renderer, ontology builder, research assistant) is fundamentally interoperable with others via shared graph semantics.
- **Apps are composable**, allowing features like commenting, tagging, referencing, and layout to be shared across tools.
- Built on **web standards (TypeScript/WebGL)** and designed to run in the browser or on the server, Unigraph supports collaborative knowledge management and visualization without needing massive infrastructure.
- This positions Unigraph as the **“React for Knowledge”**—a modular framework for building and sharing smart, human-centric interfaces for graph-structured data.

This ecosystem vision ultimately bridges knowledge workers, developers, scientists, and creatives in a shared semantic medium.

---

### **Diagram Tooling**

Unigraph includes **first-class support for diagramming**, not as a secondary feature but as a **primary mode of knowledge expression**:

- Users can create, annotate, and manipulate diagrams that are **semantically linked** to the broader knowledge graph.
- Diagram layers can include freeform shapes, imported images, interactive nodes, edges, and nested references to other diagrams or entities.
- Features like **reverse ontology construction** allow diagrams to evolve from intuition or user perspectives into more formal knowledge representations.
- With **spatial reasoning** and **semantic linking** combined, diagrams become executable, shareable, and computationally analyzable.

The diagram tooling bridges the gap between freeform visual ideation (like whiteboarding) and structured knowledge engineering—unlocking a new modality of expression.
