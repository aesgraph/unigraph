---
title: Graph Layouts
order: 2
---

Unigraph provides a comprehensive set of layout algorithms for organizing graph nodes in both 2D and 3D space. The layout engine supports multiple layout libraries and custom algorithms, making it easy to find the right visualization for your data.

## Layout Categories

### Graphviz Layouts

Professional graph layout algorithms from the Graphviz library:

- **dot** - Hierarchical layout for directed graphs
- **neato** - Spring model layout for undirected graphs
- **fdp** - Spring model layout for undirected graphs (faster than neato)
- **sfdp** - Scalable force-directed placement
- **circo** - Circular layout
- **twopi** - Radial layout
- **osage** - Layered layout
- **patchwork** - Squarified treemap layout
- **nop** - No layout (preserves existing positions)
- **nop2** - No layout variant

### Graphology Layouts

Force-directed and physics-based layouts from the Graphology library:

- **force** - Force-directed layout with customizable physics parameters
- **forceatlas2** - Advanced force-directed algorithm with improved performance
- **nooverlap** - Prevents node overlap while maintaining layout structure
- **grid** - Regular grid arrangement of nodes

### Custom Layouts

Custom algorithms designed specifically for Unigraph:

- **Circular** - Arranges nodes in concentric circles, grouped by type
- **OrderedGrid** - Places nodes in a structured grid, sorted by type and tags
- **Spherical** - 3D layout using Fibonacci sphere distribution, grouped by type
- **Box** - 3D box layout with nodes organized by type and tags
- **Random** - Random 3D positioning for exploratory visualization
- **TypeDriven3D** - 3D layout with nodes separated by type on different Z-planes
- **ChatGptConversation** - Specialized layout for ChatGPT conversation threads and message chains

### Preset Layouts

Special layout options for specific use cases:

- **Preset** - Uses predefined layout configurations

### Physics-Based Algorithms

Force-directed layouts use physics simulations to automatically position nodes based on their connections and relationships.
Currently this is avaialble in the ForceGraph3D view. There are plans to add more physics-based layout algorithms in the future,
or let users write their own.

## Usage

Layout algorithms can be selected through the application interface, and many support customizable parameters for fine-tuning the visualization to your specific needs.

## Extensibility

The layout system is designed to be easily extensible. New layout algorithms can be added by implementing the appropriate interfaces and registering them with the layout engine.
