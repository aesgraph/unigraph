import { supabase } from "../utils/supabaseClient";

export interface Document {
  id: string;
  title: string;
  content?: string;
  extension?: string;
  metadata?: any;
  data: any; // JSONB field for additional data
  user_id: string;
  project_id?: string | null;
  parent_id?: string | null;
  created_at?: string;
  last_updated_at?: string | null;
}

export interface CreateDocumentParams {
  title: string;
  content?: string;
  extension?: string;
  metadata?: any;
  data: any;
  project_id?: string;
  parent_id?: string;
}

export interface UpdateDocumentParams {
  id: string;
  title?: string;
  content?: string;
  extension?: string;
  metadata?: any;
  data?: any;
  project_id?: string;
  parent_id?: string;
}

export interface SearchResult extends Document {
  snippet?: string;
  matchCount?: number;
}

// Create a new document
export async function createDocument(
  params: CreateDocumentParams
): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        title: params.title,
        content: params.content || "",
        extension: params.extension || "md",
        metadata: params.metadata || {},
        data: params.data,
        project_id: params.project_id,
        parent_id: params.parent_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get a single document by id
export async function getDocument(id: string): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Update a document
export async function updateDocument(
  params: UpdateDocumentParams
): Promise<Document> {
  const updateData: Partial<Document> = {};

  if (params.title !== undefined) updateData.title = params.title;
  if (params.content !== undefined) updateData.content = params.content;
  if (params.extension !== undefined) updateData.extension = params.extension;
  if (params.metadata !== undefined) updateData.metadata = params.metadata;
  if (params.data !== undefined) updateData.data = params.data;
  if (params.project_id !== undefined)
    updateData.project_id = params.project_id;
  if (params.parent_id !== undefined) updateData.parent_id = params.parent_id;

  const { data, error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a document
export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) throw error;
}

// Recursively delete a document and all its children
export async function deleteDocumentRecursive(id: string): Promise<void> {
  // First, get all child documents
  const children = await getChildDocuments(id);

  // Recursively delete all children
  for (const child of children) {
    await deleteDocumentRecursive(child.id);
  }

  // Finally, delete the parent document
  await deleteDocument(id);
}

// List documents with optional filters
export async function listDocuments({
  userId,
  projectId,
  parentId,
  extension,
}: {
  userId?: string;
  projectId?: string;
  parentId?: string;
  extension?: string;
} = {}): Promise<Document[]> {
  let query = supabase.from("documents").select("*");

  if (userId) query = query.eq("user_id", userId);
  if (projectId) query = query.eq("project_id", projectId);
  if (parentId) query = query.eq("parent_id", parentId);
  if (extension) query = query.eq("extension", extension);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get documents by project
export async function getDocumentsByProject(
  projectId: string
): Promise<Document[]> {
  return listDocuments({ projectId });
}

// Get child documents of a parent document
export async function getChildDocuments(parentId: string): Promise<Document[]> {
  return listDocuments({ parentId });
}

// Get document tree (hierarchy)
export async function getDocumentTree({
  userId,
  projectId,
}: {
  userId?: string;
  projectId?: string;
} = {}): Promise<Document[]> {
  // Get all documents and build tree structure
  const documents = await listDocuments({ userId, projectId });

  // Filter to only root documents (no parent_id)
  const rootDocuments = documents.filter((doc) => !doc.parent_id);

  // Build tree structure recursively
  const buildTree = (parentId: string | null): Document[] => {
    return documents
      .filter((doc) => doc.parent_id === parentId)
      .map((doc) => ({
        ...doc,
        children: buildTree(doc.id),
      }));
  };

  return rootDocuments.map((doc) => ({
    ...doc,
    children: buildTree(doc.id),
  }));
}

// Duplicate a document
export async function duplicateDocument(
  documentId: string,
  newTitle?: string
): Promise<Document> {
  // Get the original document
  const originalDoc = await getDocument(documentId);

  // Create a new document with the same content but new title
  const newTitleText = newTitle || `${originalDoc.title} (Copy)`;

  return createDocument({
    title: newTitleText,
    content: originalDoc.content,
    extension: originalDoc.extension,
    metadata: originalDoc.metadata,
    data: originalDoc.data,
    project_id: originalDoc.project_id ?? undefined,
    parent_id: originalDoc.parent_id ?? undefined,
  });
}

// Move document to different project
export async function moveDocumentToProject(
  documentId: string,
  newProjectId: string
): Promise<Document> {
  return updateDocument({
    id: documentId,
    project_id: newProjectId,
  });
}

// Get document statistics
export async function getDocumentStats({
  userId,
  projectId,
}: {
  userId?: string;
  projectId?: string;
} = {}): Promise<{
  total: number;
  byExtension: Record<string, number>;
  byProject: Record<string, number>;
}> {
  const documents = await listDocuments({ userId, projectId });

  const byExtension: Record<string, number> = {};
  const byProject: Record<string, number> = {};

  documents.forEach((doc) => {
    // Count by extension
    const ext = doc.extension || "md";
    byExtension[ext] = (byExtension[ext] || 0) + 1;

    // Count by project
    if (doc.project_id) {
      byProject[doc.project_id] = (byProject[doc.project_id] || 0) + 1;
    }
  });

  return {
    total: documents.length,
    byExtension,
    byProject,
  };
}

// Get documents by extension
export async function getDocumentsByExtension(
  extension: string,
  {
    userId,
    projectId,
  }: {
    userId?: string;
    projectId?: string;
  } = {}
): Promise<Document[]> {
  return listDocuments({ userId, projectId, extension });
}

// Search documents by text content
export async function searchDocuments({
  searchTerm,
  userId,
  projectId,
}: {
  searchTerm: string;
  userId: string;
  projectId?: string;
}): Promise<SearchResult[]> {
  if (!searchTerm.trim()) {
    return [];
  }

  let query = supabase
    .from("documents")
    .select(
      "id, title, content, extension, project_id, created_at, last_updated_at"
    )
    .eq("user_id", userId)
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order("last_updated_at", { ascending: false })
    .limit(50);

  // Filter by project if specified
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error searching documents:", error);
    throw error;
  }

  // Process results to add snippets and match counts
  const results: SearchResult[] = (data || []).map((doc: Document) => {
    const content = doc.content || "";
    const title = doc.title || "";

    // Count matches in title and content
    const titleMatches = (
      title.toLowerCase().match(new RegExp(searchTerm.toLowerCase(), "g")) || []
    ).length;
    const contentMatches = (
      content.toLowerCase().match(new RegExp(searchTerm.toLowerCase(), "g")) ||
      []
    ).length;
    const matchCount = titleMatches + contentMatches;

    // Create a snippet around the first match in content
    let snippet = "";
    const searchRegex = new RegExp(searchTerm, "gi");
    const match = searchRegex.exec(content);
    if (match) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(
        content.length,
        match.index + searchTerm.length + 50
      );
      snippet = content.substring(start, end);

      // Highlight the search term in the snippet
      snippet = snippet.replace(searchRegex, `<mark>$&</mark>`);

      // Add ellipsis if truncated
      if (start > 0) snippet = "..." + snippet;
      if (end < content.length) snippet = snippet + "...";
    } else {
      // If no match in content, take first 100 characters
      snippet = content.substring(0, 100) + (content.length > 100 ? "..." : "");
    }

    return {
      ...doc,
      content,
      snippet,
      matchCount,
    };
  });

  // Sort by relevance (match count, then recency)
  results.sort((a, b) => {
    if (a.matchCount !== b.matchCount) {
      return (b.matchCount || 0) - (a.matchCount || 0);
    }
    return (
      new Date(b.last_updated_at || 0).getTime() -
      new Date(a.last_updated_at || 0).getTime()
    );
  });

  return results;
}

// Save PDF document from blob data
export async function savePdfDocument({
  title,
  pdfBlob,
  url,
  projectId,
}: {
  title: string;
  pdfBlob: Blob;
  url?: string;
  projectId?: string;
}): Promise<Document> {
  // Convert blob to base64 for storage using FileReader (more reliable for large files)
  console.log(
    "Converting PDF to base64 for Supabase storage, size:",
    pdfBlob.size,
    "bytes"
  );

  if (pdfBlob.size > 50 * 1024 * 1024) {
    // 50MB limit
    throw new Error("PDF file is too large (max 50MB supported)");
  }

  // Use FileReader for more reliable base64 conversion
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove the data URL prefix (data:application/pdf;base64,)
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read PDF file"));
    reader.readAsDataURL(pdfBlob);
  });

  console.log("Base64 conversion completed, storing to Supabase...");

  const pdfData = {
    base64: base64Data,
    size: pdfBlob.size,
    type: pdfBlob.type || "application/pdf",
    originalUrl: url,
    savedAt: new Date().toISOString(),
  };

  return createDocument({
    title,
    content: "", // PDFs don't have text content in the content field
    extension: "pdf",
    metadata: {
      fileSize: pdfBlob.size,
      mimeType: pdfBlob.type || "application/pdf",
      originalUrl: url,
    },
    data: pdfData,
    project_id: projectId,
  });
}

// Get PDF document data
export async function getPdfDocumentData(documentId: string): Promise<{
  blob: Blob;
  metadata: any;
}> {
  const document = await getDocument(documentId);

  if (document.extension !== "pdf") {
    throw new Error("Document is not a PDF");
  }

  // Handle both old format (raw base64 string) and new format (structured object)
  let base64Data: string;
  let blobType: string;

  if (typeof document.data === "string") {
    // Old format: raw base64 string
    console.log("Loading PDF with old data format (raw base64 string)");
    base64Data = document.data;
    blobType = "application/pdf";
  } else if (document.data?.base64) {
    // New format: structured object with base64 property
    console.log("Loading PDF with new data format (structured object)");
    base64Data = document.data.base64;
    blobType = document.data.type || "application/pdf";
  } else {
    throw new Error("PDF data not found");
  }

  // Convert base64 back to blob
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], {
    type: blobType,
  });

  return {
    blob,
    metadata: document.metadata || {},
  };
}
