import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
  searchDocuments,
  duplicateDocument,
  moveDocumentToProject,
  getDocumentStats,
} from '../documentsApi';

// Mock Supabase client
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-doc-id',
              title: 'Test Document',
              content: 'Test content',
              extension: 'md',
              metadata: {},
              data: { lexicalState: '' },
              user_id: 'test-user-id',
              created_at: '2023-01-01T00:00:00Z',
              last_updated_at: '2023-01-01T00:00:00Z',
            },
            error: null,
          })),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-doc-id',
              title: 'Test Document',
              content: 'Test content',
              extension: 'md',
              metadata: {},
              data: { lexicalState: '' },
              user_id: 'test-user-id',
              created_at: '2023-01-01T00:00:00Z',
              last_updated_at: '2023-01-01T00:00:00Z',
            },
            error: null,
          })),
        })),
        or: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [
              {
                id: 'test-doc-id',
                title: 'Test Document',
                content: 'Test content',
                extension: 'md',
                metadata: {},
                data: { lexicalState: '' },
                user_id: 'test-user-id',
                created_at: '2023-01-01T00:00:00Z',
                last_updated_at: '2023-01-01T00:00:00Z',
              },
            ],
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-doc-id',
                title: 'Updated Document',
                content: 'Updated content',
                extension: 'md',
                metadata: {},
                data: { lexicalState: '' },
                user_id: 'test-user-id',
                created_at: '2023-01-01T00:00:00Z',
                last_updated_at: '2023-01-01T00:00:00Z',
              },
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    }),
  },
}));

describe('Documents API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const params = {
        title: 'Test Document',
        content: 'Test content',
        extension: 'md',
        metadata: { tags: [] },
        data: { lexicalState: '' },
      };

      const result = await createDocument(params);

      expect(result).toEqual({
        id: 'test-doc-id',
        title: 'Test Document',
        content: 'Test content',
        extension: 'md',
        metadata: {},
        data: { lexicalState: '' },
        user_id: 'test-user-id',
        created_at: '2023-01-01T00:00:00Z',
        last_updated_at: '2023-01-01T00:00:00Z',
      });
    });
  });

  describe('getDocument', () => {
    it('should retrieve a document by id', async () => {
      const result = await getDocument('test-doc-id');

      expect(result).toEqual({
        id: 'test-doc-id',
        title: 'Test Document',
        content: 'Test content',
        extension: 'md',
        metadata: {},
        data: { lexicalState: '' },
        user_id: 'test-user-id',
        created_at: '2023-01-01T00:00:00Z',
        last_updated_at: '2023-01-01T00:00:00Z',
      });
    });
  });

  describe('updateDocument', () => {
    it('should update a document', async () => {
      const params = {
        id: 'test-doc-id',
        title: 'Updated Document',
        content: 'Updated content',
      };

      const result = await updateDocument(params);

      expect(result).toEqual({
        id: 'test-doc-id',
        title: 'Updated Document',
        content: 'Updated content',
        extension: 'md',
        metadata: {},
        data: { lexicalState: '' },
        user_id: 'test-user-id',
        created_at: '2023-01-01T00:00:00Z',
        last_updated_at: '2023-01-01T00:00:00Z',
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      await expect(deleteDocument('test-doc-id')).resolves.not.toThrow();
    });
  });

  describe('listDocuments', () => {
    it('should list documents with filters', async () => {
      const result = await listDocuments({
        userId: 'test-user-id',
        projectId: 'test-project-id',
      });

      expect(result).toEqual([
        {
          id: 'test-doc-id',
          title: 'Test Document',
          content: 'Test content',
          extension: 'md',
          metadata: {},
          data: { lexicalState: '' },
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          last_updated_at: '2023-01-01T00:00:00Z',
        },
      ]);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by term', async () => {
      const result = await searchDocuments({
        userId: 'test-user-id',
        searchTerm: 'test',
      });

      expect(result).toEqual([
        {
          id: 'test-doc-id',
          title: 'Test Document',
          content: 'Test content',
          extension: 'md',
          metadata: {},
          data: { lexicalState: '' },
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          last_updated_at: '2023-01-01T00:00:00Z',
        },
      ]);
    });
  });

  describe('duplicateDocument', () => {
    it('should duplicate a document', async () => {
      const result = await duplicateDocument('test-doc-id', 'Duplicated Document');

      expect(result).toEqual({
        id: 'test-doc-id',
        title: 'Test Document',
        content: 'Test content',
        extension: 'md',
        metadata: {},
        data: { lexicalState: '' },
        user_id: 'test-user-id',
        created_at: '2023-01-01T00:00:00Z',
        last_updated_at: '2023-01-01T00:00:00Z',
      });
    });
  });

  describe('moveDocumentToProject', () => {
    it('should move a document to a different project', async () => {
      const result = await moveDocumentToProject('test-doc-id', 'new-project-id');

      expect(result).toEqual({
        id: 'test-doc-id',
        title: 'Test Document',
        content: 'Test content',
        extension: 'md',
        metadata: {},
        data: { lexicalState: '' },
        user_id: 'test-user-id',
        created_at: '2023-01-01T00:00:00Z',
        last_updated_at: '2023-01-01T00:00:00Z',
      });
    });
  });

  describe('getDocumentStats', () => {
    it('should get document statistics', async () => {
      const result = await getDocumentStats({
        userId: 'test-user-id',
        projectId: 'test-project-id',
      });

      expect(result).toEqual({
        total: 1,
        byExtension: { md: 1 },
        byProject: { 'test-project-id': 1 },
      });
    });
  });
}); 