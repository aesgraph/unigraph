import { SceneGraph } from "../../../core/model/SceneGraph";
import { sceneGraphs } from "../sceneGraphLib";

describe("SceneGraphLib", () => {
  Object.entries(sceneGraphs).forEach(([_categoryKey, category]) => {
    describe(`Category: ${category.label}`, () => {
      Object.entries(category.graphs).forEach(([graphKey, graphGenerator]) => {
        if (
          typeof graphGenerator === "function" &&
          graphGenerator.constructor.name === "AsyncFunction"
        ) {
          test.skip(`${graphKey} (async) - Skipped`, () => {
            // Skipping async graph generators
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
