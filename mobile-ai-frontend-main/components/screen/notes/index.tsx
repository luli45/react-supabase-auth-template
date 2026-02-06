import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, FileText, Trash2, MoreVertical } from 'lucide-react-native';
import { notesService, Note } from '@/services/notesService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const NotesListScreen: React.FC = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = useCallback(async () => {
    const data = await notesService.getNotes();
    setNotes(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const handleCreateNote = async () => {
    const newNote = await notesService.createNote({
      title: 'Untitled Note',
    });
    if (newNote) {
      router.push({
        pathname: '/(auth)/(features)/note-editor',
        params: { noteId: newNote.id },
      });
    }
  };

  const handleOpenNote = (note: Note) => {
    router.push({
      pathname: '/(auth)/(features)/note-editor',
      params: { noteId: note.id },
    });
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await notesService.deleteNote(note.id);
            if (success) {
              setNotes((prev) => prev.filter((n) => n.id !== note.id));
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderNoteCard = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOpenNote(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardPreview}>
        {item.thumbnail_url ? (
          <View style={styles.thumbnail} />
        ) : (
          <View style={styles.emptyPreview}>
            <FileText size={32} color="#666" />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardDate}>{formatDate(item.updated_at)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNote(item)}
      >
        <Trash2 size={18} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FileText size={64} color="#444" />
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to create your first note
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateNote}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardPreview: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    backgroundColor: '#222',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default NotesListScreen;
