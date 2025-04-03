import { create } from "zustand";
import { NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";

export interface DocumentState {
  id: string;
  nodeId: NodeId;
  content: string;
  lexicalState: string; // Serialized Lexical state
  lastModified: number;
  tags: string[];
}

interface DocumentStore {
  // State
  documents: Record<NodeId, DocumentState>;
  activeDocument: NodeId | null;
  previousView: string; // Track previous view

  // Actions
  createDocument: (nodeId: NodeId) => void;
  updateDocument: (
    nodeId: NodeId,
    content: string,
    lexicalState: string,
    tags?: string[]
  ) => void;
  setActiveDocument: (nodeId: NodeId | null, previousView?: string) => void;
  deleteDocument: (nodeId: NodeId) => void;
  getDocumentByNodeId: (nodeId: NodeId) => DocumentState | null;
  getPreviousView: () => string;
  getAllDocuments: () => Record<NodeId, DocumentState>;
  clearAllDocuments: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: {},
  activeDocument: null,
  previousView: "ForceGraph3d", // Default view

  clearAllDocuments: () => {
    set({ documents: {}, activeDocument: null });
  },

  createDocument: (nodeId) => {
    if (get().documents[nodeId]) {
      console.log(`Document for ${nodeId} alraedy exists.`);
      return;
    }
    set((state) => ({
      documents: {
        ...state.documents,
        [nodeId]: {
          id: `${nodeId}`,
          nodeId,
          content: "",
          lexicalState: "",
          lastModified: Date.now(),
          tags: [],
        },
      },
    }));
  },

  updateDocument: (nodeId, content, lexicalState, tags) => {
    set((state) => {
      const doc = state.documents[nodeId];
      return {
        documents: {
          ...state.documents,
          [nodeId]: {
            ...doc,
            content,
            lexicalState,
            lastModified: Date.now(),
            tags: tags || doc.tags,
          },
        },
      };
    });
  },

  setActiveDocument: (nodeId, previousView) => {
    console.log("Setting active document:", nodeId);

    // Validate nodeId
    if (!nodeId) {
      console.error("Cannot set active document: nodeId is null or undefined");
      return;
    }

    // Create document if it doesn't exist
    if (!get().documents[nodeId]) {
      console.log("Creating new document for:", nodeId);
      get().createDocument(nodeId);
    }

    // If previousView is provided, save it
    if (previousView) {
      set({ activeDocument: nodeId, previousView });
    } else {
      set({ activeDocument: nodeId });
    }

    console.log("New active document state:", get().activeDocument);
  },

  deleteDocument: (nodeId) => {
    set((state) => {
      const { [nodeId]: _, ...remainingDocs } = state.documents;
      return {
        documents: remainingDocs,
        activeDocument:
          state.activeDocument === nodeId ? null : state.activeDocument,
      };
    });
  },

  getDocumentByNodeId: (nodeId) => {
    return get().documents[nodeId] || null;
  },

  getPreviousView: () => {
    return get().previousView;
  },

  getAllDocuments: () => {
    return get().documents;
  },
}));

// Utility selectors
export const useActiveDocument = () => {
  return useDocumentStore((state) => {
    const activeId = state.activeDocument;
    return activeId ? state.documents[activeId] : null;
  });
};

export const useDocument = (nodeId: NodeId) => {
  return useDocumentStore((state) => state.documents[nodeId]);
};

export const getDocument = (nodeId: NodeId) => {
  return useDocumentStore.getState().getDocumentByNodeId(nodeId);
};

export const getAllDocuments = () => {
  return useDocumentStore.getState().getAllDocuments();
};

export const clearDocuments = () => {
  return useDocumentStore.getState().clearAllDocuments();
};

export const updateDocument = (nodeId: NodeId, document: DocumentState) => {
  return useDocumentStore
    .getState()
    .updateDocument(
      nodeId,
      document.content,
      document.lexicalState,
      document.tags
    );
};

export const loadDocumentsFromSceneGraph = (sceneGraph: SceneGraph) => {
  // Get the document store state
  const store = useDocumentStore.getState();

  // Clear all existing documents first
  store.clearAllDocuments();

  // Log the document loading process
  console.log("Loading documents from SceneGraph");

  // Get documents from scene graph
  const documents = sceneGraph.getDocuments();
  console.log(`Found ${Object.keys(documents).length} documents in SceneGraph`);

  // Validate all nodes exist before loading documents
  for (const key in documents) {
    const nodeId = key as NodeId;
    const node = sceneGraph.getNodeById(nodeId);

    if (!node) {
      console.warn(`Document refers to non-existent node: ${nodeId}`);
      continue; // Skip this document
    }

    // Update document with validated nodeId
    store.updateDocument(
      nodeId,
      documents[key].content,
      documents[key].lexicalState,
      documents[key].tags
    );

    console.log(`Loaded document for node: ${nodeId}`);
  }
};

export const saveDocumentsToSceneGraph = (sceneGraph: SceneGraph) => {
  const store = useDocumentStore.getState();
  for (const key in store.documents) {
    sceneGraph.setDocument(key, getDocument(key as NodeId));
  }
};

export const createDocument = (nodeId: NodeId) => {
  const store = useDocumentStore.getState();
  if (store.documents[nodeId]) {
    console.log(`Document for ${nodeId} already exists.`);
    return;
  }
  store.createDocument(nodeId);
};

export default useDocumentStore;
