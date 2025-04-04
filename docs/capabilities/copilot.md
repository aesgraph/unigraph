---
title: Copilot Integrations
nav_order: 2
parent: "Capabilities"
---

{: .highlight }
⚠️ Forward looking statements

## Natural Language Graph Construction with Copilot Integration

### Overview

### Unigraph’s **Copilot Integration** enables users to construct, edit, and navigate complex graphs using **natural language**. This system serves as a conversational assistant that turns plain English commands into structured graph operations, allowing users to build and manage information without needing to understand internal schemas or UI complexities.

### This feature dramatically lowers the barrier to entry for new users, speeds up prototyping, and augments expert workflows with an intuitive, low-friction interface.

---

### Why This Capability Matters

### As knowledge graphs grow in complexity, managing them through traditional interfaces becomes time-consuming and often intimidating. Manual UI interactions can be tedious for:

- Adding multiple interconnected nodes,
- Renaming or restructuring portions of a graph,
- Exploring hidden or complex relationships,
- Modifying types or metadata in bulk.

Natural language interfaces solve this by turning the **intent** of the user directly into **graph operations**, bypassing the need for low-level manipulation.
Unigraph’s Copilot is not just a command parser — it is a **graph-literate assistant** that understands:

- Graph structure,
- Type hierarchies,
- Entity relationships,
- User-created models and data.

---

### Core Capabilities

| Copilot Feature            | What It Does                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Graph Creation**         | Describe your idea in natural language, and Copilot will generate the corresponding nodes, edges, types, and initial layout.                                              |
| ---                        | ---                                                                                                                                                                       |
| **Graph Editing**          | Ask Copilot to add, rename, connect, or delete graph elements. It understands references like "the node about climate change" or "connect John to the project node".      |
| **Exploratory Questions**  | Query the graph conversationally: “What are the most connected nodes?”, “Show me all tags related to AI”, or “Highlight projects assigned to Sarah”.                      |
| **Perspective Generation** | Ask Copilot to create different views of the graph, e.g., “Create a timeline of events involving Company X” or “Make a view that only shows nodes with centrality > 0.8”. |
| **Multi-modal Commands**   | Combine natural language with clicks and selections: e.g., "Connect this node to everything related to education."                                                        |
| **Data-aware Suggestions** | Copilot leverages your graph’s types and entities to make intelligent suggestions, helping users refine and extend their structures naturally.                            |

---

### Use Cases

| Use Case                          | Description                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Non-technical user onboarding** | New users can create knowledge graphs without understanding schemas, config files, or syntax.                     |
| ---                               | ---                                                                                                               |
| **Rapid prototyping**             | Quickly generate graph structures during brainstorming or ideation.                                               |
| **Conversational modeling**       | Build a model by describing relationships between people, organizations, concepts, etc., in a human-friendly way. |
| **Editing at scale**              | Update names, tags, types, or connections in bulk by describing what needs to change.                             |
| **Graph discovery**               | Ask natural-language questions to uncover structures, bottlenecks, missing links, or anomalies in a graph.        |
| **Semantic scaffolding**          | Use Copilot to draft the high-level structure of an ontology or model before refining it in the UI.               |

---

### Workflow Overview

1. **Start Conversing**

   - Launch Copilot from any graph view or global prompt.
   - Example input:

> "Create a node called 'Photosynthesis' and link it to 'Plants' and 'Sunlight'."

1. **Context-Aware Understanding**

   - Copilot uses the surrounding graph context, entity types, and previous queries to interpret your command.

1. **Execution Preview**

   - Before applying changes, Copilot previews the impact:
     _“This will create 1 new node and 2 new edges. Proceed?”_

1. **Apply and Continue**

   - The graph is updated live, and users can continue the conversation with follow-ups:

> “Now group them into a cluster called 'Energy Cycle'.”

1. **Advanced Actions**

   - Generate alternative perspectives, set filters, attach metadata, define types — all through plain language.

---

### Why Unigraph’s Copilot is Unique

### Many AI assistants offer basic command-line parsing. Unigraph’s Copilot is fundamentally different:

### ✅ **Graph-native:** It understands graph structure, centrality, types, relationships, and layout.

✅ **Semantically aware:** It leverages type information, entity tags, and metrics to ground user intent.
✅ **Contextual memory:** Operates within the current workspace, using what’s already present in your graph.
✅ **Perspective-driven:** Supports dynamic creation of alternate views without duplicating the model.
✅ **Composable:** Combine with other Unigraph features (e.g. image annotation, dataset import, timeline mode) through language.

---

### Example Prompts

> “Create a new node for ‘Artificial Intelligence’ and link it to ‘Machine Learning’, ‘Neural Networks’, and ‘Ethics’.”

> “Color all nodes tagged ‘Important’ in red.”

> “Make a perspective that shows all research papers from 2021 connected to John.”

> “List the 5 nodes with the highest centrality.”

> “Convert this group into a typed subgraph called ‘Team A’.”

---

### Summary

### Unigraph’s Copilot turns natural language into an interface for **thinking in graphs**. It lowers the activation energy for users to express and refine knowledge, while retaining the full power and expressiveness of Unigraph’s graph engine.

### With this integration, Unigraph becomes not just a modeling tool — but a **conversational knowledge system**, enabling everyone from non-technical users to domain experts to speak their ideas into structured form.
