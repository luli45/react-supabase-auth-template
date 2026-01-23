import { useEffect, useRef } from 'react';
import type { Doc } from '@blocksuite/store';
import { AffineEditorContainer } from '@blocksuite/presets';
import '@blocksuite/presets/themes/affine.css';
import './editor.css';

interface BlockSuiteEditorProps {
  doc: Doc;
  className?: string;
}

export function BlockSuiteEditor({ doc, className }: BlockSuiteEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<AffineEditorContainer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !doc) return;

    // Create the AffineEditorContainer
    const editor = new AffineEditorContainer();
    editor.doc = doc;
    editorRef.current = editor;

    // Mount to container
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(editor);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      editorRef.current = null;
    };
  }, [doc]);

  return (
    <div
      ref={containerRef}
      className={`blocksuite-editor-container ${className || ''}`}
    />
  );
}
