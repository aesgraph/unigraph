import { ObjectOf } from "../../../App";
import { PresetLayoutType } from "../../../core/layouts/layoutEngineTypes";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

/**
 * Creates a Graph representing a phylogenetic tree of the myosin superfamily
 */
const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Define colors for different classes
  const colorMap: ObjectOf<string> = {
    I: "rgb(219, 64, 175)", // Magenta - Subclass I
    II: "rgb(0, 0, 255)", // Blue - Class II
    III: "rgb(128, 0, 255)", // Purple - Class III
    V: "rgb(139, 69, 19)", // Brown - Class V
    VI: "rgb(148, 0, 211)", // Violet - Class VI
    VII: "rgb(128, 0, 128)", // Purple - Class VII
    VIII: "rgb(0, 255, 0)", // Green - Class VIII
    IX: "rgb(0, 191, 255)", // Sky Blue - Class IX
    X: "rgb(255, 165, 0)", // Orange - Class X
    XI: "rgb(0, 128, 0)", // Dark Green - Class XI
    XII: "rgb(0, 255, 255)", // Cyan - Class XII
    XIII: "rgb(144, 238, 144)", // Light Green - Class XIII
    XIV: "rgb(255, 0, 0)", // Red - Class XIV
    XV: "rgb(255, 215, 0)", // Gold - Class XV
    XVI: "rgb(0, 0, 128)", // Navy - Class XVI
    XVII: "rgb(255, 20, 147)", // Deep Pink - Class XVII
    XVIII: "rgb(128, 128, 0)", // Olive - Class XVIII
  };

  // Create root node
  const root = g.createNode({
    id: "root",
    label: "Myosin Superfamily Root",
    type: "root",
    position: { x: 0, y: 0, z: 0 },
    color: "rgb(128, 128, 128)",
    size: 2.5,
  });

  // Define the main classes and their sub-branches
  const classes = [
    {
      id: "I",
      label: "I",
      children: ["subclass1", "subclass2", "subclass3", "subclass4"],
    },
    {
      id: "II",
      label: "II",
      children: ["smooth", "cardiac", "skeletal", "nonmuscle"],
    },
    { id: "III", label: "III", children: [] },
    { id: "V", label: "V", children: [] },
    { id: "VI", label: "VI", children: [] },
    { id: "VII", label: "VII", children: [] },
    { id: "VIII", label: "VIII", children: [] },
    { id: "IX", label: "IX", children: [] },
    { id: "X", label: "X", children: [] },
    { id: "XI", label: "XI", children: ["plantMyosins"] },
    { id: "XII", label: "XII", children: [] },
    { id: "XIII", label: "XIII", children: [] },
    { id: "XIV", label: "XIV", children: [] },
    { id: "XV", label: "XV", children: [] },
    { id: "XVI", label: "XVI", children: [] },
    { id: "XVII", label: "XVII", children: [] },
    { id: "XVIII", label: "XVIII", children: [] },
  ];

  // Calculate angular positions for the main branches
  const angleStep = (2 * Math.PI) / classes.length;
  const mainRadius = 300;
  const classNodes: { [key: string]: any } = {};

  // Create class nodes
  classes.forEach((classInfo, index) => {
    const angle = index * angleStep;
    const x = mainRadius * Math.cos(angle);
    const y = mainRadius * Math.sin(angle);

    const node = g.createNode({
      id: `class_${classInfo.id}`,
      label: `Class ${classInfo.label}`,
      type: "class",
      position: { x, y, z: 0 },
      color: colorMap[classInfo.id] || "rgb(150, 150, 150)",
      size: 2.0,
      borderWidth: 1.5,
      borderColor: "rgb(255, 255, 255)",
      shape: "circle",
    });

    classNodes[classInfo.id] = node;

    // Connect to root
    g.createEdgeIfMissing(root.getId(), node.getId(), {
      id: `root_to_${classInfo.id}`,
      type: "phylogenetic_branch",
    });
  });

  // Create specific subclass branches (only for the most important ones)
  // Subclass I (amoeboid)
  const subclass1 = g.createNode({
    id: "subclass_1",
    label: "Subclass 1 (amoeboid)",
    type: "subclass",
    position: { x: -450, y: 550, z: 0 },
    color: colorMap.I,
    size: 1.8,
    shape: "circle",
  });

  g.createEdgeIfMissing(classNodes.I.getId(), subclass1.getId(), {
    id: "I_to_subclass1",
    type: "phylogenetic_branch",
  });

  // Add specific myosin proteins for different classes
  const myosins = [
    // Class I myosins
    { id: "Dd MyoA", label: "Dd MyoA", classId: "I", x: -480, y: 580 },
    { id: "Dd MyoB", label: "Dd MyoB", classId: "I", x: -500, y: 590 },
    { id: "Dd MyoC", label: "Dd MyoC", classId: "I", x: -520, y: 600 },
    { id: "Dd MyoD", label: "Dd MyoD", classId: "I", x: -540, y: 610 },
    { id: "Dd MyoE", label: "Dd MyoE", classId: "I", x: -560, y: 620 },

    // Class II myosins
    { id: "Skeletal", label: "Skeletal", classId: "II", x: -100, y: 580 },
    { id: "Cardiac alpha", label: "Cardiac α", classId: "II", x: -80, y: 600 },
    { id: "Cardiac beta", label: "Cardiac β", classId: "II", x: -60, y: 620 },
    { id: "Smooth", label: "Smooth", classId: "II", x: -40, y: 640 },
    { id: "Nonmuscle", label: "Nonmuscle", classId: "II", x: -20, y: 660 },

    // Plant myosins
    { id: "At MYA1", label: "At MYA1", classId: "XI", x: 250, y: 200 },
    { id: "At MYA2", label: "At MYA2", classId: "XI", x: 270, y: 210 },
    { id: "Zm ZM2", label: "Zm ZM2", classId: "XI", x: 290, y: 220 },
    { id: "Zm ZM3", label: "Zm ZM3", classId: "XI", x: 310, y: 230 },

    // Add representatives from other classes
    { id: "Hs Myo3", label: "Hs Myo3", classId: "III", x: -300, y: 300 },
    { id: "Hs Myo5", label: "Hs Myo5", classId: "V", x: -200, y: 200 },
    { id: "Hs Myo6", label: "Hs Myo6", classId: "VI", x: -100, y: 100 },
    { id: "Hs Myo7", label: "Hs Myo7", classId: "VII", x: 0, y: 300 },
  ];

  // Create myosin protein nodes
  myosins.forEach((myosin) => {
    const node = g.createNode({
      id: myosin.id.replace(/\s+/g, "_"),
      label: myosin.label,
      type: "protein",
      position: { x: myosin.x, y: myosin.y, z: 0 },
      color: colorMap[myosin.classId] || "rgb(150, 150, 150)",
      size: 1.2,
      shape: "circle",
    });

    // Connect to its class
    g.createEdgeIfMissing(classNodes[myosin.classId].getId(), node.getId(), {
      id: `${myosin.classId}_to_${myosin.id.replace(/\s+/g, "_")}`,
      type: "phylogenetic_branch",
      //   color: colorMap[myosin.classId] || "rgb(150, 150, 150)",
      //   width: 1.0,
    });
  });

  // Add some special nodes for highlighting bootstrap values
  const bootstrap90 = g.createNode({
    id: "bootstrap90",
    label: "Node found in >90% Bootstrap trials",
    type: "legend",
    position: { x: 500, y: 500, z: 0 },
    color: "rgb(0, 0, 0)",
    size: 1.0,
    shape: "circle",
  });

  const partialSequence = g.createNode({
    id: "partialSequence",
    label: "Partial Sequence",
    type: "legend",
    position: { x: 500, y: 530, z: 0 },
    color: "rgb(0, 0, 0)",
    size: 1.0,
  });

  // Create a legend edge
  g.createEdgeIfMissing(partialSequence.getId(), bootstrap90.getId(), {
    id: "legend_edge",
    type: "legend_line",
    // color: "rgb(0, 0, 0)",
    // width: 1.0,
    // style: "dashed",
  });

  // Add labels for the domains/regions
  const domains = [
    { id: "skeletal", label: "Skeletal", x: -100, y: 540 },
    { id: "cardiac", label: "Cardiac", x: -50, y: 540 },
    { id: "smooth_nonmuscle", label: "Smooth & non-muscle", x: 0, y: 540 },
    { id: "conventional", label: "Conventional Myosins II", x: -50, y: 680 },
    {
      id: "plant_myosins",
      label: "Plant Myosins VIII, XI, XIII",
      x: 250,
      y: 180,
    },
    { id: "amoeboid", label: "Subclass 1 (amoeboid)", x: -500, y: 550 },
  ];

  domains.forEach((domain) => {
    g.createNode({
      id: domain.id,
      label: domain.label,
      type: "domain_label",
      position: { x: domain.x, y: domain.y, z: 0 },
      color: "rgb(0, 0, 0)",
      size: 1.0,
      fontColor: "rgb(0, 0, 0)",
    });
  });

  return g;
};

/**
 * Creates a SceneGraph representing a phylogenetic tree
 */
export const createPhylogeneticTreeSceneGraph =
  async (): Promise<SceneGraph> => {
    return new SceneGraph({
      graph: createGraph(),
      metadata: {
        name: "PhylogeneticTree",
        description:
          "A phylogenetic tree of the myosin superfamily, showing evolutionary relationships.",
      },
      defaultAppConfig: {
        activeView: "ForceGraph3d",
        activeSceneGraph: "PhylogeneticTree",
        windows: {
          showEntityDataCard: false,
        },
        forceGraph3dOptions: {
          layout: "Layout",
        },
        activeLayout: PresetLayoutType.NodePositions, // Use the positions we defined
        legendMode: "type",
        activeFilter: null,
      },
      forceGraphDisplayConfig: {
        nodeTextLabels: true,
        nodeSize: 2,
        nodeOpacity: 1,
        linkTextLabels: false,
        linkWidth: 1.5,
        linkOpacity: 0.8,
        chargeStrength: -30,
        backgroundColor: "rgba(255, 255, 255, 1)",
        fontSize: 12,
      },
      displayConfig: {
        mode: "type",
        nodeConfig: {
          types: {
            root: { color: "rgb(128, 128, 128)", isVisible: true },
            class: { color: "rgb(0, 0, 0)", isVisible: true },
            subclass: { color: "rgb(100, 100, 100)", isVisible: true },
            protein: { color: "rgb(150, 150, 150)", isVisible: true },
            legend: { color: "rgb(0, 0, 0)", isVisible: true },
            domain_label: { color: "rgb(0, 0, 0)", isVisible: true },
          },
          tags: {},
        },
        edgeConfig: {
          types: {
            phylogenetic_branch: {
              color: "rgb(100, 100, 100)",
              isVisible: true,
            },
            legend_line: { color: "rgb(0, 0, 0)", isVisible: true },
          },
          tags: {},
        },
        nodePositions: {},
      },
    });
  };

// Export the function to create the phylogenetic tree
export const demo_SceneGraph_PhylogeneticTree = async () =>
  await createPhylogeneticTreeSceneGraph();

export default demo_SceneGraph_PhylogeneticTree;
