import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document';

interface UseDocumentResult {
  document: Document | null;
  isLoading: boolean;
  error: Error | null;
  isSaving: boolean;
  save: (content: unknown, title?: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useDocument(id: string | undefined): UseDocumentResult {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const doc = await documentService.getDocument(id);
      setDocument(doc);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch document'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const save = useCallback(async (content: unknown, title?: string) => {
    if (!id) return;
    try {
      setIsSaving(true);
      const updated = await documentService.updateDocument(id, { content, title });
      setDocument(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save document'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [id]);

  return {
    document,
    isLoading,
    error,
    isSaving,
    save,
    refetch: fetchDocument,
  };
}
