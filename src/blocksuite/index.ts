import { Schema, DocCollection, type Doc } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks';
import '@blocksuite/presets/themes/affine.css';

const schema = new Schema().register(AffineSchemas);

export function createDocCollection(id: string): DocCollection {
  const collection = new DocCollection({ schema, id });
  collection.meta.initialize();
  return collection;
}

export function createEmptyDoc(collection: DocCollection, docId?: string): Doc {
  const doc = collection.createDoc({ id: docId });
  doc.load(() => {
    const pageBlockId = doc.addBlock('affine:page', {});
    doc.addBlock('affine:surface', {}, pageBlockId);
    const noteId = doc.addBlock('affine:note', {}, pageBlockId);
    doc.addBlock('affine:paragraph', {}, noteId);
  });
  return doc;
}

export { schema };
