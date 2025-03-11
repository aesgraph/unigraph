---
title: "Quick Guides"
nav_order: 3
---

## Getting Started with Unigraph

There are several ways Unigraph can be used immediately.

The first focus of Unigraph is to offer enhanced inspection and interaction tools for Graphs.
Unigraph is a central application that allows importing, editing, and exporting of Graphs between various other Graph-based tool formats.


```mermaid
graph LR;
    TextDefinedGraph --> Graphviz
    Graphviz --> SVG
    TextDefinedGraph --> MermaidJS 
    MermaidJS --> SVG 
    SVG --> Unigraph 
    Unigraph --> UpdateNodePositions
    Unigraph --> ApplyNode/EdgeVisibilityFilters
    Unigraph --> AdjustNodeSizes
    ApplyNode/EdgeVisibilityFilters --> UnigraphModelGraph
    AdjustNodeSizes --> UnigraphModelGraph
    UpdateNodePositions --> UnigraphModelGraph
    UnigraphModelGraph --> Export
    Export --> TextDefinedGraph
```
