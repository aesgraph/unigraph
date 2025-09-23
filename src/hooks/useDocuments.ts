import { NodeId } from "@/core/model/Node";
import { useCallback, useEffect, useState } from "react";
import {
  CreateDocumentParams,
  Document,
  UpdateDocumentParams,
  createDocument,
  deleteDocument,
  duplicateDocument,
  getDocument,
  getDocumentStats,
  getDocumentTree,
  listDocuments,
  moveDocumentToProject,
  searchDocuments,
  updateDocument,
} from "../api/documentsApi";
import { useDocumentStore } from "../store/documentStore";
import { useAuth } from "./useAuth";

export interface UseDocumentsOptions {
  autoSync?: boolean;
  projectId?: string;
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { autoSync = true, projectId } = options;
  const { user } = useAuth();
  const documentStore = useDocumentStore();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents from Supabase
  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const docs = await listDocuments({
        userId: user.id,
        projectId,
      });
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId]);

  // Create a new document
  const createNewDocument = useCallback(
    async (params: CreateDocumentParams) => {
      if (!user?.id) throw new Error("User not authenticated");

      setLoading(true);
      setError(null);

      try {
        const newDoc = await createDocument({
          ...params,
          data: params.data || {},
        });

        setDocuments((prev) => [...prev, newDoc]);

        // Also update the document store for compatibility
        documentStore.createDocument(newDoc.id as NodeId);
        documentStore.updateDocument(
          newDoc.id as NodeId,
          newDoc.content || "",
          JSON.stringify(newDoc.data),
          newDoc.metadata?.tags || []
        );

        return newDoc;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create document"
        );
        console.error("Error creating document:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, documentStore]
  );

  // Update a document
  const updateExistingDocument = useCallback(
    async (params: UpdateDocumentParams) => {
      setLoading(true);
      setError(null);

      try {
        const updatedDoc = await updateDocument(params);

        setDocuments((prev) =>
          prev.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
        );

        // Also update the document store for compatibility
        if (params.content !== undefined || params.data !== undefined) {
          documentStore.updateDocument(
            updatedDoc.id as NodeId,
            params.content || updatedDoc.content || "",
            JSON.stringify(params.data || updatedDoc.data),
            updatedDoc.metadata?.tags || []
          );
        }

        return updatedDoc;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update document"
        );
        console.error("Error updating document:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [documentStore]
  );

  // Delete a document
  const removeDocument = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        await deleteDocument(id);

        setDocuments((prev) => prev.filter((doc) => doc.id !== id));

        // Also update the document store for compatibility
        documentStore.deleteDocument(id as NodeId);

        // If this was the active document, clear it
        if (documentStore.activeDocument === id) {
          documentStore.setActiveDocument(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete document"
        );
        console.error("Error deleting document:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [documentStore]
  );

  // Get a single document
  const getDocumentById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const doc = await getDocument(id);
      return doc;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get document");
      console.error("Error getting document:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search documents
  const searchDocumentsByTerm = useCallback(
    async (searchTerm: string) => {
      if (!user?.id) return [];

      setLoading(true);
      setError(null);

      try {
        const results = await searchDocuments({
          userId: user.id,
          searchTerm,
          projectId,
        });
        return results;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to search documents"
        );
        console.error("Error searching documents:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user?.id, projectId]
  );

  // Get document tree
  const getDocumentsTree = useCallback(async () => {
    if (!user?.id) return [];

    setLoading(true);
    setError(null);

    try {
      const tree = await getDocumentTree({
        userId: user.id,
        projectId,
      });
      return tree;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get document tree"
      );
      console.error("Error getting document tree:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId]);

  // Duplicate a document
  const duplicateExistingDocument = useCallback(
    async (id: string, newTitle?: string) => {
      setLoading(true);
      setError(null);

      try {
        const duplicatedDoc = await duplicateDocument(id, newTitle);
        setDocuments((prev) => [...prev, duplicatedDoc]);
        return duplicatedDoc;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to duplicate document"
        );
        console.error("Error duplicating document:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Move document to different project
  const moveDocument = useCallback(
    async (documentId: string, newProjectId: string) => {
      setLoading(true);
      setError(null);

      try {
        const movedDoc = await moveDocumentToProject(documentId, newProjectId);

        setDocuments((prev) =>
          prev.map((doc) => (doc.id === movedDoc.id ? movedDoc : doc))
        );

        return movedDoc;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to move document"
        );
        console.error("Error moving document:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get document statistics
  const getStats = useCallback(async () => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const stats = await getDocumentStats({
        userId: user.id,
        projectId,
      });
      return stats;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get document stats"
      );
      console.error("Error getting document stats:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId]);

  // Sync document store with Supabase
  const syncWithStore = useCallback(async () => {
    if (!user?.id) return;

    try {
      const docs = await listDocuments({
        userId: user.id,
        projectId,
      });

      // Update document store with Supabase data
      docs.forEach((doc) => {
        documentStore.createDocument(doc.id as NodeId);
        documentStore.updateDocument(
          doc.id as NodeId,
          doc.content || "",
          JSON.stringify(doc.data),
          doc.metadata?.tags || []
        );
      });
    } catch (err) {
      console.error("Error syncing with store:", err);
    }
  }, [user?.id, projectId, documentStore]);

  // Auto-sync when user changes or on mount
  useEffect(() => {
    if (autoSync && user?.id) {
      loadDocuments();
      syncWithStore();
    }
  }, [autoSync, user?.id, projectId, loadDocuments, syncWithStore]);

  return {
    // State
    documents,
    loading,
    error,

    // Actions
    loadDocuments,
    createDocument: createNewDocument,
    updateDocument: updateExistingDocument,
    deleteDocument: removeDocument,
    getDocument: getDocumentById,
    searchDocuments: searchDocumentsByTerm,
    getDocumentTree: getDocumentsTree,
    duplicateDocument: duplicateExistingDocument,
    moveDocument,
    getStats,
    syncWithStore,

    // Utilities
    clearError: () => setError(null),
  };
}
