---
title: v0 Design Decisions
nav_order: 5
parent: "Development Notes"
---

## Unigraph v0 Design Decisions

The first iteration of Unigraph will be purely web-based and written in typescript.

* Strong typing is a must to maximize interpretability and extensability, and composability for developers.
* It must be easily accessible to build the user moat that further drives its development.
* By focusing on just client-side and not server side, we can do rapid development of the selling points of the application, and defer security and permissioning systems to V1.
* Unigraph is a big idea, and the priority is building an MVP around which the idea will be concretizied.

_Forward Looking_

A software-defined field-theoretical framework for graph-based display and interaction should be agnostic to the underlying implementation language.

If Unigraph is properly designed and well-understood, it can be rewritten in WASM for near-native performance.

Further down the road, Unigraph will offer robust rule-based and purpose-based access control systems to offer unprecedented composability of graph-based information that can be shared across organizational contexts.
