import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { Graph } from "../../../core/model/Graph";
import { createEdgesTo } from "../../../core/model/GraphUtils";
import { SceneGraph } from "../../../core/model/SceneGraph";

export const demo_SceneGraph_Numbers_Story = () => {
  const graph = new Graph();

  const mileOfPi = graph.createNode({
    id: "Mile of pi",
    type: "storyCard",
    userData: {
      title: "Mile of Pi",
      description:
        "Numberphile made a video where they rolled out a million digits of pi on a mile of paper.",
      tags: ["pi", "numberphile", "video"],
    },
  });

  const billionDigitsOfPi = graph.createNode({
    id: "Billion digits of pi",
    type: "storyCard",
    userData: {
      title: "Billion digits of Pi",
      description:
        "By extension, the first billion digits of pi would extend to 1000 miles of paper. That's new york to florida. This data can be stored with 1GB on a computer.",
      tags: ["pi", "numberphile", "video"],
    },
  });

  const peopleWhoComputedByHand = graph.createNode({
    id: "People who computed pi by hand",
    type: "storyCard",
    userData: {
      title: "People who computed pi by hand",
      description:
        "There are many people who have computed pi by hand, some of them were mathematicians, some were not. They used various methods, including polygonal approximations, series expansions, and iterative algorithms.",
      tags: ["pi", "history", "mathematics"],
    },
  });

  const eulerCalculatedByHand = graph.createNode({
    id: "Euler calculated pi by hand",
    type: "storyCard",
    userData: {
      title: "Euler calculated pi by hand",
      description:
        "Euler calculated pi by hand in 1770, and it took him 20 years to do it. He used a series of calculations that converged on the value of pi.",
      tags: ["pi", "euler", "history"],
    },
  });

  const ludolph = graph.createNode({
    id: "Ludolph van Ceulen",
    type: "storyCard",
    userData: {
      title: "Ludolph van Ceulen (1540–1610)",
      description:
        'Known for calculating π to 35 decimal places by hand using polygonal approximations. The digits were engraved on his tombstone. π was sometimes called "Ludolph\'s number" in his honor.',
      tags: ["pi", "history", "mathematics"],
    },
  });

  const shanks = graph.createNode({
    id: "William Shanks",
    type: "storyCard",
    userData: {
      title: "William Shanks (1812–1882)",
      description:
        "Known for calculating π to 707 digits by hand over many years. Only the first 527 digits were correct—an error in the 528th digit caused the rest to be wrong. This wasn't discovered until the 1940s using a computer.",
      tags: ["pi", "history", "mathematics", "error"],
    },
  });

  const ramanujan = graph.createNode({
    id: "Srinivasa Ramanujan",
    type: "storyCard",
    userData: {
      title: "Srinivasa Ramanujan (1887–1920)",
      description:
        "Known for deriving incredibly rapidly converging series for π, some of which were later used in high-precision algorithms. He wasn't focused on brute-force digit computation, but his formulas became the foundation for modern digit calculations.",
      tags: ["pi", "mathematics", "algorithms"],
    },
  });

  const ferguson = graph.createNode({
    id: "D.F. Ferguson",
    type: "storyCard",
    userData: {
      title: "D.F. Ferguson (1906–1987)",
      description:
        "Known for calculating π to 620 digits using a mechanical desk calculator (before computers), verifying Shanks' mistake. He developed new iterative algorithms and computed most of the digits manually or with punch-card calculators.",
      tags: ["pi", "mathematics", "verification"],
    },
  });

  const kanada = graph.createNode({
    id: "Yasumasa Kanada",
    type: "storyCard",
    userData: {
      title: "Yasumasa Kanada (1949–2020)",
      description:
        "Known for using supercomputers to calculate trillions of digits of π at the University of Tokyo. While not hand-calculated, his work continued the tradition of long-term devotion to numeric sequences.",
      tags: ["pi", "supercomputers", "mathematics"],
    },
  });

  const aitken = graph.createNode({
    id: "Alexander Aitken",
    type: "storyCard",
    userData: {
      title: "Alexander Aitken (1895–1967)",
      description:
        "Known for incredible mental calculation abilities. He memorized π to hundreds of digits and could perform lightning-fast arithmetic.",
      tags: ["pi", "mental calculation", "mathematics"],
    },
  });

  const machin = graph.createNode({
    id: "John Machin",
    type: "storyCard",
    userData: {
      title: "John Machin (1686–1751)",
      description:
        "Known for deriving Machin's formula for π, which was used for manual computation for centuries. He computed 100 digits of π by hand in 1706.",
      tags: ["pi", "mathematics", "formulas"],
    },
  });

  const borda = graph.createNode({
    id: "Jean-Charles de Borda",
    type: "storyCard",
    userData: {
      title: "Jean-Charles de Borda and 18th-century savants",
      description:
        "Spent years on logarithmic and trigonometric tables that required precise computation of constants to many digits for navigation and engineering.",
      tags: ["mathematics", "history", "navigation"],
    },
  });

  const nasaSigfigs = graph.createNode({
    id: "NASA significant figures",
    type: "storyCard",
    userData: {
      title: "NASA Significant Figures",
      description:
        "NASA has a policy of using 15 significant figures for π in calculations, which is more than sufficient for most engineering applications. This is because the precision required for most calculations does not exceed this level.",
      tags: ["pi", "NASA", "engineering"],
    },
  });

  graph.createEdge(billionDigitsOfPi.getId(), nasaSigfigs.getId(), {
    type: "think about this",
  });

  createEdgesTo(
    graph,
    peopleWhoComputedByHand.getId(),
    [
      eulerCalculatedByHand,
      ludolph,
      shanks,
      ramanujan,
      ferguson,
      kanada,
      aitken,
      machin,
      borda,
    ].map((node) => node.getId()),
    { type: "computed pi by hand", tags: ["storyNode"] }
  );

  graph.createEdge(mileOfPi.getId(), billionDigitsOfPi.getId(), {
    type: "related",
  });

  graph.createEdge(mileOfPi.getId(), peopleWhoComputedByHand.getId(), {
    type: "related",
  });

  // for (const storyCard of createSampleStoryCardEntities()) {
  //   graph.createNode({
  //     id: storyCard.getId(),
  //     type: "storyCard",
  //     userData: {
  //       title: storyCard.getTitle(),
  //       description: storyCard.getDescription(),
  //       tags: storyCard.getData().tags,
  //       storyCard: storyCard,
  //     },
  //   });
  // }

  return new SceneGraph({
    graph,
    metadata: {
      name: "StoryCard Demo",
      description: "For demonstrating story cards in a scene graph.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: "dot",
      activeView: "storyCard",
    },
  });
};
