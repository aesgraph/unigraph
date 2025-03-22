---
title: Whitepaper Drafts
nav_order: 10
parent: "Development Notes"
---

## SceneGraph Configuration State and External States

There are seemingly duplicate states inside/outside the SceneGraph data container.
There is RenderingConfig in the SceneGraph that holds NodePositions and Node+Edge Legend Configs.
The Legend Configs are specifically for type and tag driven behaviors that can be bulk applied to entities.

Then there is the global context store for the Active Legend Configs (and soon to be NodePositions, aka Active Layout)
Then there are states on the Entities themselves, like position, color and visibility. These are to be individually set.

The SceneGraph will eventually hold many 'layers' of legend configs and layouts, and it will be the App state that drives which layer is currently active.

The legend configs will be mode driven, such as Entity Type, Tags, and various qualitative metrics to come. Quantitative metrics should be handled differently, but if we do bucketing then even those can be legend config layers. One of the modes will be Entity Attribute Driven, where we use the manually applied attributes stored directly on the nodes, and the legend config does not apply.

The store will only contain the Active Legend Config currently in use by the App.

### In summary

The **SceneGraph** is essentially a file containing all the various LegendConfigs and Custom Layouts that are more than the computed layouts provided. (Custom Layouts are not an exact result of one of the provided layout computations. These can be created by repositioning nodes after applying a layout).

The **App Store** is used for managing the Active LegendConfig and Layout. There is only 1 active Legend Config, and 1 active layout.

The **Entity Attributes** are used for manual sets on the base Graph data. They can also drive coloring, visibility, positions, etc. They function as intrinsic graph data. Although there are only Type and Tag modes for the Legend, there will eventaully be a Graph-based mode that will use these attributes directly. It should be possible to manually set these per individually entity, or apply from a Legend Config / Layout Config.

**Until this feature set is fully implemented, the default App behavior should use Legend config to drive rendering, and Layouts for positioning.**

_Note that manual repositioning of nodes sets their attribute position immediately, and also updates the layout so that it becomes Custom_
