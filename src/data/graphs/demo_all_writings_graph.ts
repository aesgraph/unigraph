import { mergeIntoSceneGraph } from "../../core/model/mergeSceneGraphs";
import { SceneGraph } from "../../core/model/SceneGraph";
import { demo_scenegraph_notes_axiomatic_systems_and_primitives } from "./demo_notes_axiomatic_systems_and_primitives";
import { demo_scenegraph_notes_complexity_and_primitives } from "./demo_notes_complexity_and_primitives";
import { demo_scenegraph_unigraph_components } from "./demo_unigraph_components";
import { demo_scenegraph_unigraph_overview } from "./demo_unigraph_overview";
import { demo_scenegraph_writing_terms } from "./demo_writing_terms";

export const demo_scenegraph_all_writings = () => {
  console.log("Building AllWritings graph...");
  const tmp = new SceneGraph();
  mergeIntoSceneGraph(tmp, demo_scenegraph_unigraph_overview());
  mergeIntoSceneGraph(
    tmp,
    demo_scenegraph_notes_axiomatic_systems_and_primitives()
  );
  mergeIntoSceneGraph(tmp, demo_scenegraph_notes_complexity_and_primitives());
  mergeIntoSceneGraph(tmp, demo_scenegraph_unigraph_components());
  mergeIntoSceneGraph(tmp, demo_scenegraph_writing_terms());
  console.log("AllWritings graph built.");

  return new SceneGraph({
    graph: tmp.getGraph(),
    metadata: {
      name: "AllWritings",
      description:
        "A merged graph of all Unigraph writings and conceptual demos.",
    },
  });
};
