import { useEffect, useRef, useState, useCallback } from 'react';
import type { Doc, DocCollection, DocSnapshot } from '@blocksuite/store';
import { createDocCollection } from '../blocksuite';
import { exportDocToSnapshot, createOrLoadDoc, isValidSnapshot } from '../blocksuite/utils';

interface UseBlockSuiteEditorOptions {
  documentId: string;
  initialContent?: unknown;
}

interface UseBlockSuiteEditorResult {
  doc: Doc | null;
  collection: DocCollection | null;
  isReady: boolean;
  getSnapshot: () => Promise<DocSnapshot>;
  getDocText: () => Promise<string>;
}

export function useBlockSuiteEditor({
  documentId,
  initialContent,
}: UseBlockSuiteEditorOptions): UseBlockSuiteEditorResult {
  const collectionRef = useRef<DocCollection | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initEditor = async () => {
      try {
        // Create collection
        const collection = createDocCollection(`collection-${documentId}`);
        collectionRef.current = collection;

        // Load from snapshot if valid, otherwise create empty doc
        const snapshot = isValidSnapshot(initialContent) ? initialContent : null;
        const newDoc = await createOrLoadDoc(collection, documentId, snapshot);

        setDoc(newDoc);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize editor:', error);
        setIsReady(true); // Still set ready so UI doesn't hang
      }
    };

    initEditor();

    return () => {
      // Cleanup on unmount
      initializedRef.current = false;
      if (collectionRef.current) {
        collectionRef.current = null;
      }
    };
  }, [documentId, initialContent]);

  const getSnapshot = useCallback(async (): Promise<DocSnapshot> => {
    if (!doc) throw new Error('Document not initialized');
    return exportDocToSnapshot(doc);
  }, [doc]);

  const getDocText = useCallback(async (): Promise<string> => {
    if (!doc) return '';
    // Quick and dirty extraction: iterate blocks
    // Ideally we use a markdown exporter
    try {
      // We can use the snapshot json to extract text
      const snapshot = await exportDocToSnapshot(doc);
      const blocks = snapshot.blocks;
      let text = '';
      // Recursive text extraction or simple iteration depending on structure
      // Assuming simple structure for now or using titles+text
      Object.values(blocks).forEach((block: any) => {
        if (block.props?.text) {
          text += block.props.text.deltas?.map((d: any) => d.insert).join('') + '\n';
        }
        if (block.props?.caption) { // For images/other blocks
          text += block.props.caption + '\n';
        }
      });
      return text;
    } catch (e) {
      console.error("Error extracting text", e);
      return "";
    }
  }, [doc]);

  return {
    doc,
    collection: collectionRef.current,
    isReady,
    getSnapshot,
    getDocText,
  };
}
