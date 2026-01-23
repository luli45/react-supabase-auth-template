import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document';

interface UseDocumentsResult {
  documents: Document[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createDocument: (title?: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
}

export function useDocuments(): UseDocumentsResult {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = useCallback(async (title?: string) => {
    const doc = await documentService.createDocument({ title });
    setDocuments(prev => [doc, ...prev]);
    return doc;
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    await documentService.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
    createDocument,
    deleteDocument,
  };
}
