import { Job, type Doc, type DocCollection, type DocSnapshot } from '@blocksuite/store';
import { createEmptyDoc } from './index';

export async function exportDocToSnapshot(doc: Doc): Promise<DocSnapshot> {
  const job = new Job({ collection: doc.collection });
  const snapshot = await job.docToSnapshot(doc);
  return snapshot;
}

export async function importSnapshotToDoc(
  collection: DocCollection,
  snapshot: DocSnapshot
): Promise<Doc> {
  const job = new Job({ collection });
  const doc = await job.snapshotToDoc(snapshot);
  return doc;
}

export async function createOrLoadDoc(
  collection: DocCollection,
  docId: string,
  snapshot?: DocSnapshot | null
): Promise<Doc> {
  // If we have a valid snapshot with blocks, load it
  if (snapshot && snapshot.blocks && Object.keys(snapshot.blocks).length > 0) {
    try {
      const job = new Job({ collection });
      const doc = await job.snapshotToDoc(snapshot);
      doc.load();
      return doc;
    } catch (error) {
      console.error('Failed to load snapshot, creating empty doc:', error);
      return createEmptyDoc(collection, docId);
    }
  }
  return createEmptyDoc(collection, docId);
}

export function isValidSnapshot(content: unknown): content is DocSnapshot {
  if (!content || typeof content !== 'object') return false;
  const snapshot = content as Record<string, unknown>;
  return (
    'blocks' in snapshot &&
    snapshot.blocks !== null &&
    typeof snapshot.blocks === 'object' &&
    Object.keys(snapshot.blocks as object).length > 0
  );
}
