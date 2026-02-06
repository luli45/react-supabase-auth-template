import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, MoreVertical } from 'lucide-react-native';
import { notesService, Note } from '@/services/notesService';
import SkiaCanvas from './SkiaCanvas';
import Toolbar from './Toolbar';
import StickerPicker from './StickerPicker';
import { DrawingElement, ToolType, EditorState } from './types';

const MAX_HISTORY = 50;

const NoteEditorScreen: React.FC = () => {
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('Untitled Note');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load note
  useEffect(() => {
    const loadNote = async () => {
      if (noteId) {
        const loadedNote = await notesService.getNoteById(noteId);
        if (loadedNote) {
          setNote(loadedNote);
          setTitle(loadedNote.title);
          setElements(loadedNote.elements || []);
          setHistory([loadedNote.elements || []]);
        }
      }
      setLoading(false);
    };
    loadNote();
  }, [noteId]);

  // Auto-save with debounce
  useEffect(() => {
    if (!noteId || loading) return;

    const saveTimeout = setTimeout(async () => {
      setSaving(true);
      await notesService.updateNote(noteId, {
        title,
        elements,
      });
      setSaving(false);
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [elements, title, noteId, loading]);

  const addToHistory = useCallback((newElements: DrawingElement[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const handleElementAdd = useCallback((element: DrawingElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    addToHistory(newElements);
  }, [elements, addToHistory]);

  const handleElementUpdate = useCallback((id: string, updates: Partial<DrawingElement>) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  }, [elements, addToHistory]);

  const handleElementDelete = useCallback((id: string) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [elements, selectedElementId, addToHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleStickerSelect = useCallback((stickerId: string) => {
    // Add sticker at center of canvas
    const newElement: DrawingElement = {
      id: Math.random().toString(36).substring(2, 11),
      type: 'sticker',
      color: currentColor,
      strokeWidth: 0,
      position: { x: 150, y: 300 },
      scale: 1,
      rotation: 0,
      stickerId,
    };
    handleElementAdd(newElement);
    setShowStickerPicker(false);
    setCurrentTool('select');
  }, [currentColor, handleElementAdd]);

  const handleBack = async () => {
    if (noteId && !saving) {
      await notesService.updateNote(noteId, {
        title,
        elements,
      });
    }
    router.back();
  };

  const handleSave = async () => {
    if (!noteId) return;
    setSaving(true);
    await notesService.updateNote(noteId, {
      title,
      elements,
    });
    setSaving(false);
    Alert.alert('Saved', 'Note saved successfully');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>

        {isEditingTitle ? (
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            onBlur={() => setIsEditingTitle(false)}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => setIsEditingTitle(true)}
          >
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.headerActions}>
          {saving && <Text style={styles.savingText}>Saving...</Text>}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Check size={22} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <SkiaCanvas
          elements={elements}
          currentTool={currentTool}
          currentColor={currentColor}
          strokeWidth={strokeWidth}
          onElementAdd={handleElementAdd}
          onElementUpdate={handleElementUpdate}
          onElementDelete={handleElementDelete}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
        />
      </View>

      {/* Toolbar */}
      <Toolbar
        currentTool={currentTool}
        currentColor={currentColor}
        strokeWidth={strokeWidth}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onOpenStickers={() => setShowStickerPicker(true)}
      />

      {/* Sticker Picker Modal */}
      <StickerPicker
        visible={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelect={handleStickerSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingText: {
    color: '#888',
    fontSize: 12,
  },
  saveButton: {
    padding: 8,
  },
  canvasContainer: {
    flex: 1,
  },
});

export default NoteEditorScreen;
