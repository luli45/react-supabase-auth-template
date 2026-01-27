import { useEffect, useRef } from 'react';
import type { Doc } from '@blocksuite/store';
import { AffineEditorContainer } from '@blocksuite/presets';
import '@blocksuite/presets/themes/affine.css';
import './editor.css';

interface BlockSuiteEditorProps {
  doc: Doc;
  className?: string;
  mode?: 'page' | 'edgeless';
}

export function BlockSuiteEditor({ doc, className, mode = 'page' }: BlockSuiteEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<AffineEditorContainer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !doc) return;

    // Create the AffineEditorContainer
    const editor = new AffineEditorContainer();
    editor.doc = doc;
    editor.mode = mode; // Set initial mode
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
  }, [doc]); // Re-create if doc changes

  // Dynamic mode update
  useEffect(() => {
    if (editorRef.current && mode) {
      editorRef.current.mode = mode;
    }
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className={`blocksuite-editor-container ${className || ''}`}
    />
  );
}
