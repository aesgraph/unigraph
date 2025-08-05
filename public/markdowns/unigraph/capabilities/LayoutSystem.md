---
title: "Layout System"
order: 6
---

Unigraph has a highly configurable layout system with many tools for users and developers to create their own applets.
It follows a classic pattern by offering the following core features:

- Resizable panes (Left, Center, Right, and Bottom) which each fit multiple tabs, where each tab is an instantiation of a registered view.
- A File Menu at the top with three separate sections, Left: dropdown menus, Center: A general search bar, Right: a shortcut tray
- A command processor - opened by pressing ctrl+shift+p.
- A bottom status bar - for infomrational items
- Left and right side panels - for additional layout options for applets that only need one pane but want additional actions available on the left and right.

Functional capabilities

- Layout preset and session saving and loading

The Layout System is largely powered by the @aesgraph/app-shell npm package. Github repo available here:
https://github.com/aesgraph/app-shell
https://www.npmjs.com/package/@aesgraph/app-shell

The layout system highlights a core feature of Unigraph, which is being able to configure an arrangement of views on top of a unified data model to gain new insights and do interoperable work. Unigraph can effectively function as a dashboarding tool, but it also provides a wide range of capabilities outside of that scope.
