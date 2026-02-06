import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STICKER_SIZE = (SCREEN_WIDTH - 80) / 4;

// Sticker packs - these would be loaded from assets in production
const STICKER_PACKS = [
  {
    id: 'emoji',
    name: 'Emoji',
    stickers: [
      { id: 'emoji-1', emoji: '😀' },
      { id: 'emoji-2', emoji: '😍' },
      { id: 'emoji-3', emoji: '🎉' },
      { id: 'emoji-4', emoji: '🔥' },
      { id: 'emoji-5', emoji: '⭐' },
      { id: 'emoji-6', emoji: '❤️' },
      { id: 'emoji-7', emoji: '👍' },
      { id: 'emoji-8', emoji: '🚀' },
      { id: 'emoji-9', emoji: '💡' },
      { id: 'emoji-10', emoji: '🎨' },
      { id: 'emoji-11', emoji: '📝' },
      { id: 'emoji-12', emoji: '✨' },
    ],
  },
  {
    id: 'shapes',
    name: 'Shapes',
    stickers: [
      { id: 'shape-star', emoji: '⭐' },
      { id: 'shape-heart', emoji: '💜' },
      { id: 'shape-diamond', emoji: '💎' },
      { id: 'shape-moon', emoji: '🌙' },
      { id: 'shape-sun', emoji: '☀️' },
      { id: 'shape-cloud', emoji: '☁️' },
      { id: 'shape-lightning', emoji: '⚡' },
      { id: 'shape-sparkle', emoji: '✨' },
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    stickers: [
      { id: 'obj-camera', emoji: '📷' },
      { id: 'obj-music', emoji: '🎵' },
      { id: 'obj-book', emoji: '📚' },
      { id: 'obj-coffee', emoji: '☕' },
      { id: 'obj-laptop', emoji: '💻' },
      { id: 'obj-phone', emoji: '📱' },
      { id: 'obj-mail', emoji: '📧' },
      { id: 'obj-calendar', emoji: '📅' },
    ],
  },
  {
    id: 'arrows',
    name: 'Arrows',
    stickers: [
      { id: 'arrow-up', emoji: '⬆️' },
      { id: 'arrow-down', emoji: '⬇️' },
      { id: 'arrow-left', emoji: '⬅️' },
      { id: 'arrow-right', emoji: '➡️' },
      { id: 'arrow-curved', emoji: '↪️' },
      { id: 'arrow-double', emoji: '↔️' },
      { id: 'arrow-refresh', emoji: '🔄' },
      { id: 'arrow-check', emoji: '✅' },
    ],
  },
];

interface StickerPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (stickerId: string) => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [selectedPack, setSelectedPack] = useState(STICKER_PACKS[0].id);

  const currentPack = STICKER_PACKS.find((pack) => pack.id === selectedPack);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Stickers</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Pack Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {STICKER_PACKS.map((pack) => (
              <TouchableOpacity
                key={pack.id}
                style={[
                  styles.tab,
                  selectedPack === pack.id && styles.tabActive,
                ]}
                onPress={() => setSelectedPack(pack.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedPack === pack.id && styles.tabTextActive,
                  ]}
                >
                  {pack.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stickers Grid */}
          <FlatList
            data={currentPack?.stickers || []}
            numColumns={4}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.stickersGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stickerItem}
                onPress={() => onSelect(item.id)}
              >
                <Text style={styles.stickerEmoji}>{item.emoji}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#252525',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  stickersGrid: {
    padding: 16,
  },
  stickerItem: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#252525',
    margin: 4,
  },
  stickerEmoji: {
    fontSize: 32,
  },
});

export default StickerPicker;
