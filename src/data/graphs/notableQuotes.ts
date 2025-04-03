import { Graph } from "../../core/model/Graph";

const nq = new Graph();

nq.createNode({
  id: "You get simplicity by finding a slightly more sophisticated building block to build your theories out of.",
  type: "quote",
  tags: ["complexity theory"],
  userData: {
    reference: "Alan Kay's Power of Simplicity Talk",
  },
});
