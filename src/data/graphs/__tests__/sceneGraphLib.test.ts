import { SceneGraph } from "../../../core/model/SceneGraph";
import { DEMO_SCENE_GRAPHS } from "../../DemoSceneGraphs";

describe("SceneGraphLib", () => {
  Object.entries(DEMO_SCENE_GRAPHS).forEach(([_categoryKey, category]) => {
    describe(`Category: ${category.label}`, () => {
      Object.entries(category.graphs).forEach(([graphKey, graphGenerator]) => {
        if (
          typeof graphGenerator === "function" &&
          (graphGenerator.constructor.name === "AsyncFunction" ||
            graphGenerator.constructor.name === "Promise")
        ) {
          test.skip(`${graphKey} (async/promise) - Skipped`, () => {
            // Skipping async graph generators and promises
          });
        } else {
          test(`${graphKey} - Should load without errors`, () => {
            const graph =
              typeof graphGenerator === "function"
                ? graphGenerator()
                : graphGenerator;

            expect(graph).toBeInstanceOf(SceneGraph);
          });
        }
      });
    });
  });
});
