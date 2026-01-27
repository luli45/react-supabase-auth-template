import { useState, useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDocument } from '../../hooks/useDocument';
import { useBlockSuiteEditor } from '../../hooks/useBlockSuiteEditor';
import { BlockSuiteEditor } from '../../components/editor/BlockSuiteEditor';
import { EditorToolbar } from '../../components/editor/EditorToolbar';
import type { Document } from '../../types/document';
import './documents.css';

// Inner component that handles the editor - only renders when document is loaded
interface EditorContentProps {
  document: Document;
  isSaving: boolean;
  save: (content: unknown, title?: string) => Promise<void>;
}

function EditorContent({ document, isSaving, save }: EditorContentProps) {
  const [title, setTitle] = useState(document.title);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  const [editorMode, setEditorMode] = useState<'page' | 'edgeless'>('page');

  const { doc, isReady, getSnapshot } = useBlockSuiteEditor({
    documentId: document.id,
    initialContent: document.content,
  });

  const handleSave = useCallback(async () => {
    if (!doc) return;
    try {
      const snapshot = await getSnapshot();
      await save(snapshot, title);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }, [doc, getSnapshot, save, title]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
        <EditorToolbar
          title={title}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />

        {/* Write/Draw Toggle */}
        <div className="mode-toggle glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: 'var(--radius-lg)', gap: '4px' }}>
          <button
            onClick={() => setEditorMode('page')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: editorMode === 'page' ? 'var(--color-primary)' : 'transparent',
              color: editorMode === 'page' ? 'white' : 'var(--color-text-subtle)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Write
          </button>
          <button
            onClick={() => setEditorMode('edgeless')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: editorMode === 'edgeless' ? 'var(--color-accent)' : 'transparent',
              color: editorMode === 'edgeless' ? 'var(--color-primary)' : 'var(--color-text-subtle)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Draw
          </button>
        </div>
      </div>

      {isReady && doc ? (
        <div style={{ height: 'calc(100vh - 140px)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <BlockSuiteEditor doc={doc} className="editor-main" mode={editorMode} />
        </div>
      ) : (
        <div className="editor-loading">Initializing editor...</div>
      )}
    </>
  );
}

export default function DocumentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { document, isLoading, error, isSaving, save } = useDocument(id);

  if (isLoading) {
    return (
      <main className="container section">
        <div className="loading-container">
          <p>Loading document...</p>
        </div>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="container section">
        <div className="error-container">
          <h2>Document not found</h2>
          <Link to="/documents" className="btn btn--secondary">Back to Documents</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="editor-page">
      <Link className="back-link" to="/documents">
        Back to Documents
      </Link>

      <EditorContent
        key={document.id}
        document={document}
        isSaving={isSaving}
        save={save}
      />
    </main>
  );
}
