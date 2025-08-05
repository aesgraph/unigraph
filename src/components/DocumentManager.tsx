import React, { useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { CreateDocumentParams } from "../api/documentsApi";

interface DocumentManagerProps {
  projectId?: string;
}

export function DocumentManager({ projectId }: DocumentManagerProps) {
  const {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    getStats,
  } = useDocuments({ projectId });

  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) return;

    try {
      const params: CreateDocumentParams = {
        title: newDocumentTitle,
        content: "",
        extension: "md",
        metadata: { tags: [] },
        data: { lexicalState: "" },
        project_id: projectId,
      };

      await createDocument(params);
      setNewDocumentTitle("");
    } catch (err) {
      console.error("Failed to create document:", err);
    }
  };

  const handleUpdateDocument = async (id: string) => {
    try {
      await updateDocument({
        id,
        title: editTitle,
        content: editContent,
      });
      setEditingDocument(null);
      setEditTitle("");
      setEditContent("");
    } catch (err) {
      console.error("Failed to update document:", err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id);
      } catch (err) {
        console.error("Failed to delete document:", err);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const results = await searchDocuments(searchTerm);
      console.log("Search results:", results);
    } catch (err) {
      console.error("Failed to search documents:", err);
    }
  };

  const handleGetStats = async () => {
    try {
      const stats = await getStats();
      console.log("Document stats:", stats);
    } catch (err) {
      console.error("Failed to get stats:", err);
    }
  };

  const startEditing = (doc: any) => {
    setEditingDocument(doc.id);
    setEditTitle(doc.title);
    setEditContent(doc.content || "");
  };

  const cancelEditing = () => {
    setEditingDocument(null);
    setEditTitle("");
    setEditContent("");
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="document-manager">
      <h2>Document Manager</h2>

      {/* Create new document */}
      <div className="create-document">
        <h3>Create New Document</h3>
        <input
          type="text"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="Document title"
        />
        <button onClick={handleCreateDocument}>Create Document</button>
      </div>

      {/* Search documents */}
      <div className="search-documents">
        <h3>Search Documents</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search term"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Get stats */}
      <div className="document-stats">
        <button onClick={handleGetStats}>Get Document Stats</button>
      </div>

      {/* List documents */}
      <div className="documents-list">
        <h3>Documents ({documents.length})</h3>
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            {editingDocument === doc.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Content"
                />
                <button onClick={() => handleUpdateDocument(doc.id)}>
                  Save
                </button>
                <button onClick={cancelEditing}>Cancel</button>
              </div>
            ) : (
              <div className="document-display">
                <h4>{doc.title}</h4>
                <p>{doc.content?.substring(0, 100)}...</p>
                <p>Extension: {doc.extension}</p>
                <p>Created: {new Date(doc.created_at!).toLocaleDateString()}</p>
                <div className="document-actions">
                  <button onClick={() => startEditing(doc)}>Edit</button>
                  <button onClick={() => handleDeleteDocument(doc.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
