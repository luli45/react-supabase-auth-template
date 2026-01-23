import { useState, useCallback, useEffect } from 'react';
import './editor.css';

interface EditorToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  lastSaved?: Date;
}

export function EditorToolbar({
  title,
  onTitleChange,
  onSave,
  isSaving,
  lastSaved,
}: EditorToolbarProps) {
  const [localTitle, setLocalTitle] = useState(title);

  // Sync local title when prop changes
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleTitleBlur = useCallback(() => {
    if (localTitle !== title) {
      onTitleChange(localTitle);
    }
  }, [localTitle, title, onTitleChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }, []);

  return (
    <div className="editor-toolbar">
      <input
        type="text"
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleKeyDown}
        className="editor-title-input"
        placeholder="Untitled Document"
      />
      <div className="editor-toolbar-actions">
        {lastSaved && (
          <span className="last-saved">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="btn btn--primary save-button"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
