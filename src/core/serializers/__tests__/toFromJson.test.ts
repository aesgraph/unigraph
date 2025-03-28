import { demo_sceneGraph_academicsKG } from "../../../data/graphs/academicsKGraph";
import {
  compareEquality,
  deserializeSceneGraphFromJson,
  serializeSceneGraphToJson,
} from "../toFromJson";

describe("SceneGraph Serialization Roundtrip", () => {
  const sceneGraph = demo_sceneGraph_academicsKG();

  const serialized = serializeSceneGraphToJson(sceneGraph);
  const deserialized = deserializeSceneGraphFromJson(serialized);

  test("should correctly serialize and deserialize scene graph", () => {
    expect(compareEquality(sceneGraph, deserialized)).toBe(true);
  });
});

describe("SceneGraph Serialization Roundtrip, difference", () => {
  const sceneGraph = demo_sceneGraph_academicsKG();

  const serialized = serializeSceneGraphToJson(sceneGraph);
  const deserialized = deserializeSceneGraphFromJson(serialized);
  deserialized.getDisplayConfig().nodeConfig.types["new"] = {
    isVisible: true,
    color: "red",
  };

  test("should correctly serialize and deserialize scene graph", () => {
    expect(compareEquality(sceneGraph, deserialized)).toBe(false);
  });
});

describe("SceneGraph Serialization Roundtrip, add properties to node and edges", () => {
  const sceneGraph = demo_sceneGraph_academicsKG();

  sceneGraph.getGraph().createNode("newNode1", {
    label: "newNode1",
    type: "newType",
    dimensions: { width: 123, height: 456 },
    color: "blue",
    isVisible: false,
  });

  sceneGraph.getGraph().createNode("newNode2", {
    label: "newNode2",
    type: "newType",
    dimensions: { width: 234, height: 567 },
  });

  sceneGraph.getGraph().createEdge("newNode1", "newNode2", {
    label: "newEdge",
    type: "newType",
  });

  const serialized = serializeSceneGraphToJson(sceneGraph);
  const deserialized = deserializeSceneGraphFromJson(serialized);

  test("should correctly serialize and deserialize scene graph", () => {
    expect(compareEquality(sceneGraph, deserialized)).toBe(true);
  });
});

describe("SceneGraph Serialization Roundtrip, displayConfig, positions", () => {
  const sceneGraph = demo_sceneGraph_academicsKG();

  sceneGraph.getGraph().createNode("newNode1", {
    label: "newNode1",
    type: "newType",
    dimensions: { width: 123, height: 456 },
    color: "blue",
    isVisible: false,
  });

  sceneGraph.getGraph().createNode("newNode2", {
    label: "newNode2",
    type: "newType",
    dimensions: { width: 234, height: 567 },
  });

  sceneGraph.getGraph().createEdge("newNode1", "newNode2", {
    label: "newEdge",
    type: "newType",
  });

  const serialized = serializeSceneGraphToJson(sceneGraph);
  const deserialized = deserializeSceneGraphFromJson(serialized);

  test("should correctly serialize and deserialize scene graph", () => {
    expect(compareEquality(sceneGraph, deserialized)).toBe(true);
  });
});

// TODO: Make EntityCache serialized/deserialized roundtrip
// describe("SceneGraph Serialization Roundtrip, add entities to cache", () => {
//   const sceneGraph = demo_sceneGraph_academicsKG();
//   sceneGraph.getEntityCache().addEntities(songAnnotation247_2_entities);
//   sceneGraph.getEntityCache().addEntities(IMAGE_ANNOTATION_ENTITIES());

//   const serialized = serializeSceneGraphToJson(sceneGraph);
//   const deserialized = deserializeSceneGraphFromJson(serialized);

//   test("should correctly serialize and deserialize scene graph", () => {
//     expect(compareEquality(sceneGraph, deserialized)).toBe(true);
//     expect(sceneGraph.getEntityCache().getSize()).toBe(
//       deserialized.getEntityCache().getSize()
//     );
//   });
// });
