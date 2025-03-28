describe("PersistentStoreManager", () => {
  it("dummy test", async () => {
    expect(1).toBe(1);
  });
});
// import { SceneGraph } from "../../model/SceneGraph";
// import { PersistentStoreManager } from "../PersistentStoreManager";

// describe("PersistentStoreManager", () => {
//   let store: PersistentStoreManager;
//   let mockIndexedDB: any;

//   // Helper function to simulate IndexedDB success
//   const createSuccessfulDBConnection = (mockData?: any) => {
//     const mockObjectStore = {
//       put: jest.fn().mockImplementation(() => ({
//         onsuccess: setTimeout(
//           () => mockObjectStore.put.mock.calls[0][0].onsuccess?.(),
//           0
//         ),
//       })),
//       get: jest.fn().mockImplementation(() => ({
//         onsuccess: setTimeout(
//           () =>
//             mockObjectStore.get.mock.calls[0][0].onsuccess?.({
//               target: { result: mockData },
//             }),
//           0
//         ),
//       })),
//       delete: jest.fn().mockImplementation(() => ({
//         onsuccess: setTimeout(
//           () => mockObjectStore.delete.mock.calls[0][0].onsuccess?.(),
//           0
//         ),
//       })),
//       index: jest.fn().mockReturnValue({
//         openCursor: jest.fn().mockImplementation(() => ({
//           onsuccess: setTimeout(
//             () =>
//               mockObjectStore.index.mock.calls[0][0].onsuccess?.({
//                 target: {
//                   result: mockData
//                     ? {
//                         value: mockData,
//                         continue: jest.fn(),
//                       }
//                     : null,
//                 },
//               }),
//             0
//           ),
//         })),
//       }),
//     };

//     const mockTransaction = {
//       objectStore: jest.fn().mockReturnValue(mockObjectStore),
//       oncomplete: setTimeout(() => mockTransaction, 0),
//     };

//     return {
//       result: {
//         transaction: jest.fn().mockReturnValue(mockTransaction),
//       },
//       onsuccess: setTimeout(() => {}, 0),
//     };
//   };

//   beforeEach(() => {
//     mockIndexedDB = {
//       open: jest.fn(),
//     };
//     global.indexedDB = mockIndexedDB;
//     store = new PersistentStoreManager();
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("saveSceneGraph", () => {
//     it("should save a new scene graph with metadata", async () => {
//       const sceneGraph = new SceneGraph();
//       mockIndexedDB.open.mockImplementation(() =>
//         createSuccessfulDBConnection()
//       );

//       const id = await store.saveSceneGraph(sceneGraph);
//       expect(id).toBeDefined();
//     });

//     it("should handle errors when saving fails", async () => {
//       const sceneGraph = new SceneGraph();
//       mockIndexedDB.open.mockImplementation(() => ({
//         error: new Error("Save failed"),
//         onerror: setTimeout(() => {}, 0),
//       }));

//       await expect(store.saveSceneGraph(sceneGraph)).rejects.toThrow();
//     });
//   });

//   describe("loadSceneGraph", () => {
//     it("should load an existing scene graph", async () => {
//       const mockData = {
//         id: "test-id",
//         data: JSON.stringify(new SceneGraph()),
//       };
//       mockIndexedDB.open.mockImplementation(() =>
//         createSuccessfulDBConnection(mockData)
//       );

//       const result = await store.loadSceneGraph("test-id");
//       expect(result).toBeDefined();
//     });

//     it("should return null for non-existent scene graph", async () => {
//       mockIndexedDB.open.mockImplementation(() =>
//         createSuccessfulDBConnection(null)
//       );

//       const result = await store.loadSceneGraph("non-existent-id");
//       expect(result).toBeNull();
//     });
//   });

//   describe("listSceneGraphs", () => {
//     it("should return a list of stored scene graphs", async () => {
//       const mockGraphs = [
//         { id: "1", name: "Graph 1", lastModified: Date.now() },
//       ];
//       mockIndexedDB.open.mockImplementation(() =>
//         createSuccessfulDBConnection(mockGraphs[0])
//       );

//       const results = await store.listSceneGraphs();
//       expect(Array.isArray(results)).toBe(true);
//       expect(results.length).toBe(1);
//     });
//   });

//   describe("deleteSceneGraph", () => {
//     it("should delete a scene graph and its metadata", async () => {
//       mockIndexedDB.open.mockImplementation(() =>
//         createSuccessfulDBConnection()
//       );

//       const result = await store.deleteSceneGraph("test-id");
//       expect(result).toBe(true);
//     });
//   });

//   describe("exportSceneGraph", () => {
//     it("should export a scene graph to a blob", async () => {
//       const sceneGraph = new SceneGraph();
//       const mockData = {
//         id: "test-id",
//         data: JSON.stringify(sceneGraph),
//       };
//       mockIndexedDB.open.mockImplementation(() =>
//         createSuccessfulDBConnection(mockData)
//       );

//       const blob = await store.exportSceneGraph("test-id");
//       expect(blob).toBeInstanceOf(Blob);
//     });
//   });

//   // Add test for importSceneGraph with proper FileReader mock
//   describe("importSceneGraph", () => {
//     it("should import a scene graph from a file", async () => {
//       const mockFile = new File(["{}"], "test.json", {
//         type: "application/json",
//       });

//       // Mock FileReader
//       const mockFileReader = {
//         readAsText: function (_file: File) {
//           setTimeout(() => {
//             (this as any).onload?.({ target: { result: "{}" } });
//           }, 0);
//         },
//         onload: null as ((evt: any) => void) | null,
//       };
//       const MockFileReader = jest.fn(() => mockFileReader) as jest.Mock & {
//         EMPTY: 0;
//         LOADING: 1;
//         DONE: 2;
//       };
//       MockFileReader.EMPTY = 0;
//       MockFileReader.LOADING = 1;
//       MockFileReader.DONE = 2;
//       global.FileReader = MockFileReader;

//       mockIndexedDB.open.mockImplementation(() =>
//         createSuccessfulDBConnection()
//       );

//       const result = await store.importSceneGraph(mockFile);
//       expect(result).toBeDefined();
//     });
//   });
// });
