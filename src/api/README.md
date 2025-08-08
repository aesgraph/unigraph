# Documents API

This module provides comprehensive CRUD operations for documents in the Unigraph application, integrated with Supabase.

## Overview

The documents API supports:

- Creating, reading, updating, and deleting documents
- Document hierarchy (parent-child relationships)
- Project organization
- Search functionality
- Document statistics
- Integration with the existing document store

## Database Schema

The documents table has the following structure:

```sql
CREATE TABLE public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    extension TEXT DEFAULT 'md',
    metadata JSONB DEFAULT '{}'::jsonb,
    data JSONB NOT NULL,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Functions

### Core CRUD Operations

#### `createDocument(params: CreateDocumentParams): Promise<Document>`

Creates a new document.

```typescript
const newDoc = await createDocument({
  title: "My Document",
  content: "# Hello World",
  extension: "md",
  metadata: { tags: ["important"] },
  data: { lexicalState: "..." },
  project_id: "project-uuid",
  parent_id: "parent-doc-uuid",
});
```

#### `getDocument(id: string): Promise<Document>`

Retrieves a single document by ID.

#### `updateDocument(params: UpdateDocumentParams): Promise<Document>`

Updates an existing document.

```typescript
const updatedDoc = await updateDocument({
  id: "doc-uuid",
  title: "Updated Title",
  content: "Updated content",
});
```

#### `deleteDocument(id: string): Promise<void>`

Deletes a document and all its children.

### Query Operations

#### `listDocuments(filters?: DocumentFilters): Promise<Document[]>`

Lists documents with optional filtering.

```typescript
// Get all user documents
const docs = await listDocuments({ userId: "user-uuid" });

// Get documents in a project
const projectDocs = await listDocuments({ projectId: "project-uuid" });

// Get child documents
const children = await listDocuments({ parentId: "parent-uuid" });
```

#### `searchDocuments(params: SearchParams): Promise<Document[]>`

Searches documents by title or content.

```typescript
const results = await searchDocuments({
  userId: "user-uuid",
  searchTerm: "important",
  projectId: "project-uuid",
});
```

#### `getDocumentTree(params: TreeParams): Promise<Document[]>`

Gets documents organized in a tree structure.

### Advanced Operations

#### `duplicateDocument(documentId: string, newTitle?: string): Promise<Document>`

Creates a copy of an existing document.

#### `moveDocumentToProject(documentId: string, newProjectId: string): Promise<Document>`

Moves a document to a different project.

#### `getDocumentStats(params: StatsParams): Promise<DocumentStats>`

Gets document statistics.

## React Hook

### `useDocuments(options?: UseDocumentsOptions)`

A React hook that provides easy access to document operations with state management.

```typescript
function MyComponent() {
  const {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    getStats,
  } = useDocuments({ projectId: "project-uuid" });

  // Use the hook methods...
}
```

#### Options

- `autoSync`: Automatically sync with Supabase (default: true)
- `projectId`: Filter documents by project

#### Return Value

- **State**: `documents`, `loading`, `error`
- **Actions**: All CRUD operations
- **Utilities**: `clearError`, `syncWithStore`

## Integration with Document Store

The documents API integrates with the existing `documentStore` to maintain compatibility:

- Document creation/updates sync with the store
- The store's `activeDocument` is managed
- Lexical state is preserved in the `data` field

## Error Handling

All API functions throw errors that can be caught and handled:

```typescript
try {
  const doc = await createDocument(params);
} catch (error) {
  console.error("Failed to create document:", error);
  // Handle error appropriately
}
```

## Security

- All operations are protected by Row Level Security (RLS)
- Users can only access their own documents
- Authentication is required for all operations

## Usage Examples

### Basic Document Management

```typescript
import { useDocuments } from "../hooks/useDocuments";

function DocumentEditor() {
  const { documents, createDocument, updateDocument } = useDocuments();

  const handleCreate = async () => {
    await createDocument({
      title: "New Document",
      content: "# Start writing...",
      data: { lexicalState: "" },
    });
  };

  const handleUpdate = async (id: string, content: string) => {
    await updateDocument({
      id,
      content,
    });
  };
}
```

### Project-based Organization

```typescript
// Get documents for a specific project
const projectDocs = useDocuments({ projectId: "project-uuid" });

// Move document between projects
await moveDocumentToProject("doc-uuid", "new-project-uuid");
```

### Search and Statistics

```typescript
// Search documents
const results = await searchDocuments({
  userId: "user-uuid",
  searchTerm: "important",
});

// Get statistics
const stats = await getDocumentStats({
  userId: "user-uuid",
  projectId: "project-uuid",
});
console.log(`Total documents: ${stats.total}`);
console.log(`By extension:`, stats.byExtension);
```
