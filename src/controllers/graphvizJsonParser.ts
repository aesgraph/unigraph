interface GraphvizNode {
  _gvid: number;
  name: string;
  pos: string;
  label: string;
  color: string;
  shape: string;
  height: string;
  width: string;
}

interface GraphvizJSON {
  name: string;
  directed: boolean;
  objects: GraphvizNode[];
  bb: string;
  layout: string;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

export const parseGraphvizPositions = (
  jsonData: GraphvizJSON
): NodePosition[] => {
  if (jsonData === undefined || jsonData.objects === undefined) {
    return [];
  }
  return jsonData.objects
    .filter((node) => "pos" in node)
    .map((node) => {
      // Graphviz pos format is "x,y"
      const [x, y] = node.pos.split(",").map(Number);

      return {
        id: node.name,
        x,
        y,
        label: node.label,
        color: node.color,
      };
    });
};

// Example usage:
// const graphData = {
//   name: "G",
//   directed: true,
//   objects: [
//     {
//       _gvid: 0,
//       name: "axiomOfInteraction",
//       pos: "326.91,251.8",
//       label: "axiomOfInteraction",
//       color: "#E29218",
//       shape: "box",
//       height: "0.5",
//       width: "1.7556",
//     },
//     // ... other nodes
//   ],
// } as GraphvizJSON;

// const positions = parseGraphvizPositions(graphData);
// console.log(positions);

/* Output example:
[
  {
    id: "axiomOfInteraction",
    x: 326.91,
    y: 251.8,
    label: "axiomOfInteraction",
    color: "#E29218"
  },
  // ... other nodes
]
*/
