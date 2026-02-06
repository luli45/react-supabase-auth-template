import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import { notesService, Note } from '@/services/notesService';

// Web fallback - Skia canvas is not available on web
const NoteEditorScreen: React.FC = () => {
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('Untitled Note');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      if (noteId) {
        const loadedNote = await notesService.getNoteById(noteId);
        if (loadedNote) {
          setNote(loadedNote);
          setTitle(loadedNote.title);
          // Extract text from elements if any
          const textElements = loadedNote.elements?.filter(e => e.type === 'text') || [];
          if (textElements.length > 0) {
            setTextContent(textElements.map(e => e.text).join('\n'));
          }
        }
      }
      setLoading(false);
    };
    loadNote();
  }, [noteId]);

  const handleSave = async () => {
    if (!noteId) return;
    setSaving(true);
    await notesService.updateNote(noteId, {
      title,
      elements: textContent ? [{
        id: '1',
        type: 'text',
        color: '#ffffff',
        strokeWidth: 0,
        text: textContent,
        position: { x: 20, y: 20 },
      }] : [],
    });
    setSaving(false);
  };

  const handleBack = async () => {
    await handleSave();
    router.back();
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

        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Note title"
          placeholderTextColor="#666"
        />

        <View style={styles.headerActions}>
          {saving && <Text style={styles.savingText}>Saving...</Text>}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Check size={22} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Web Notice */}
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Drawing tools are only available on mobile devices.
          Use the text editor below on web.
        </Text>
      </View>

      {/* Simple Text Editor for Web */}
      <View style={styles.editorContainer}>
        <TextInput
          style={styles.textEditor}
          value={textContent}
          onChangeText={setTextContent}
          placeholder="Start typing your note..."
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />
      </View>
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
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  notice: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  noticeText: {
    color: '#a5b4fc',
    fontSize: 14,
    textAlign: 'center',
  },
  editorContainer: {
    flex: 1,
    padding: 16,
  },
  textEditor: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
});

export default NoteEditorScreen;
