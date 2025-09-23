import { SceneGraph } from "../../../core/model/SceneGraph";
import { DEMO_SCENE_GRAPHS } from "../../DemoSceneGraphs";

// List of demo functions to skip testing (e.g., demos that make API calls)
const DEMOS_TO_SKIP = [
  "wikipediaDemo",
  "ast",
  // Add more demos to skip here as needed
];

describe("SceneGraphLib", () => {
  Object.entries(DEMO_SCENE_GRAPHS).forEach(([_categoryKey, category]) => {
    describe(`Category: ${category.label}`, () => {
      Object.entries(category.graphs).forEach(([graphKey, graphGenerator]) => {
        // Skip demos that are in our skip list
        if (DEMOS_TO_SKIP.includes(graphKey)) {
          test.skip(`${graphKey} - SKIPPED - Makes API calls or takes too long`, () => {});
          return;
        }

        // First check if the generator is an async function
        const isAsyncFunction =
          typeof graphGenerator === "function" &&
          (graphGenerator.constructor.name === "AsyncFunction" ||
            graphGenerator.toString().includes("async"));

        // Then handle different cases
        if (isAsyncFunction) {
          // test(`${graphKey} - Should load without errors (async)`, async () => {
          //   const graph = await graphGenerator();
          //   expect(graph).toBeInstanceOf(SceneGraph);
          // });
          return;
        } else if (typeof graphGenerator === "function") {
          test(`${graphKey} - Should load without errors`, async () => {
            const graph = graphGenerator();

            // Handle the case where a regular function returns a Promise
            if (graph instanceof Promise) {
              const resolvedGraph = await graph;
              expect(resolvedGraph).toBeInstanceOf(SceneGraph);
            } else {
              expect(graph).toBeInstanceOf(SceneGraph);
            }
          });
        } else {
          // Direct SceneGraph instance case
          test(`${graphKey} - Should load without errors (direct)`, () => {
            expect(graphGenerator).toBeInstanceOf(SceneGraph);
          });
        }
      });
    });
  });
});
