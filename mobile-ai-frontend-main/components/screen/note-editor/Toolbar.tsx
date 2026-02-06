import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import {
  MousePointer2,
  Pencil,
  Minus,
  MoveRight,
  Square,
  Circle,
  Triangle,
  Type,
  Sticker,
  Eraser,
  Undo2,
  Redo2,
  Palette,
} from 'lucide-react-native';
import { ToolType, COLORS, STROKE_WIDTHS } from './types';

interface ToolbarProps {
  currentTool: ToolType;
  currentColor: string;
  strokeWidth: number;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenStickers: () => void;
}

const tools: { type: ToolType; icon: React.FC<any>; label: string }[] = [
  { type: 'select', icon: MousePointer2, label: 'Select' },
  { type: 'pen', icon: Pencil, label: 'Pen' },
  { type: 'line', icon: Minus, label: 'Line' },
  { type: 'arrow', icon: MoveRight, label: 'Arrow' },
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'triangle', icon: Triangle, label: 'Triangle' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'eraser', icon: Eraser, label: 'Eraser' },
];

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  currentColor,
  strokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenStickers,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showStrokeWidthPicker, setShowStrokeWidthPicker] = React.useState(false);

  return (
    <View style={styles.container}>
      {/* Tools Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.toolsRow}
        contentContainerStyle={styles.toolsContent}
      >
        {tools.map(({ type, icon: Icon, label }) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.toolButton,
              currentTool === type && styles.toolButtonActive,
            ]}
            onPress={() => onToolChange(type)}
          >
            <Icon
              size={22}
              color={currentTool === type ? '#6366f1' : '#fff'}
            />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.toolButton,
            currentTool === 'sticker' && styles.toolButtonActive,
          ]}
          onPress={() => {
            onToolChange('sticker');
            onOpenStickers();
          }}
        >
          <Sticker
            size={22}
            color={currentTool === 'sticker' ? '#6366f1' : '#fff'}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Options Row */}
      <View style={styles.optionsRow}>
        {/* Undo/Redo */}
        <View style={styles.undoRedoContainer}>
          <TouchableOpacity
            style={[styles.actionButton, !canUndo && styles.actionButtonDisabled]}
            onPress={onUndo}
            disabled={!canUndo}
          >
            <Undo2 size={20} color={canUndo ? '#fff' : '#555'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, !canRedo && styles.actionButtonDisabled]}
            onPress={onRedo}
            disabled={!canRedo}
          >
            <Redo2 size={20} color={canRedo ? '#fff' : '#555'} />
          </TouchableOpacity>
        </View>

        {/* Color Picker */}
        <TouchableOpacity
          style={styles.colorButton}
          onPress={() => {
            setShowColorPicker(!showColorPicker);
            setShowStrokeWidthPicker(false);
          }}
        >
          <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
          <Palette size={16} color="#fff" />
        </TouchableOpacity>

        {/* Stroke Width */}
        <TouchableOpacity
          style={styles.strokeButton}
          onPress={() => {
            setShowStrokeWidthPicker(!showStrokeWidthPicker);
            setShowColorPicker(false);
          }}
        >
          <View
            style={[
              styles.strokePreview,
              {
                height: Math.min(strokeWidth, 12),
                backgroundColor: currentColor,
              },
            ]}
          />
          <Text style={styles.strokeText}>{strokeWidth}px</Text>
        </TouchableOpacity>
      </View>

      {/* Color Picker Dropdown */}
      {showColorPicker && (
        <View style={styles.pickerDropdown}>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  currentColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => {
                  onColorChange(color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </View>
        </View>
      )}

      {/* Stroke Width Picker Dropdown */}
      {showStrokeWidthPicker && (
        <View style={styles.pickerDropdown}>
          <View style={styles.strokeGrid}>
            {STROKE_WIDTHS.map((width) => (
              <TouchableOpacity
                key={width}
                style={[
                  styles.strokeOption,
                  strokeWidth === width && styles.strokeOptionSelected,
                ]}
                onPress={() => {
                  onStrokeWidthChange(width);
                  setShowStrokeWidthPicker(false);
                }}
              >
                <View
                  style={[
                    styles.strokeLine,
                    {
                      height: width,
                      backgroundColor: currentColor,
                    },
                  ]}
                />
                <Text style={styles.strokeOptionText}>{width}px</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingBottom: 20,
  },
  toolsRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  toolsContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#252525',
  },
  toolButtonActive: {
    backgroundColor: '#2a2a4a',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  undoRedoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#252525',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
  },
  strokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  strokePreview: {
    width: 24,
    borderRadius: 2,
  },
  strokeText: {
    color: '#fff',
    fontSize: 12,
  },
  pickerDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 12,
    right: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#6366f1',
  },
  strokeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  strokeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
    minWidth: 80,
  },
  strokeOptionSelected: {
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  strokeLine: {
    width: 30,
    borderRadius: 2,
  },
  strokeOptionText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default Toolbar;
