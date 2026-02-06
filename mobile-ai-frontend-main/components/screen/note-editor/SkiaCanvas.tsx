import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Line,
  Circle,
  Rect,
  Text as SkiaText,
  useFont,
  Group,
  vec,
} from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { DrawingElement, ToolType, Point } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SkiaCanvasProps {
  elements: DrawingElement[];
  currentTool: ToolType;
  currentColor: string;
  strokeWidth: number;
  onElementAdd: (element: DrawingElement) => void;
  onElementUpdate: (id: string, element: Partial<DrawingElement>) => void;
  onElementDelete: (id: string) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const SkiaCanvas: React.FC<SkiaCanvasProps> = ({
  elements,
  currentTool,
  currentColor,
  strokeWidth,
  onElementAdd,
  onElementUpdate,
  onElementDelete,
  selectedElementId,
  onSelectElement,
}) => {
  const canvasRef = useCanvasRef();

  // Drawing state
  const isDrawing = useSharedValue(false);
  const currentPath = useSharedValue<Point[]>([]);
  const startPoint = useSharedValue<Point | null>(null);
  const endPoint = useSharedValue<Point | null>(null);
  const currentElementId = useSharedValue<string | null>(null);

  // Transform state for zoom/pan
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const createPathString = useCallback((points: Point[]): string => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }, []);

  const handleDrawingEnd = useCallback(() => {
    'worklet';
    if (!isDrawing.value) return;

    const tool = currentTool;
    const color = currentColor;
    const width = strokeWidth;

    if (tool === 'pen' || tool === 'eraser') {
      const points = [...currentPath.value];
      if (points.length > 1) {
        runOnJS(onElementAdd)({
          id: generateId(),
          type: tool,
          color: tool === 'eraser' ? '#0a0a0a' : color,
          strokeWidth: tool === 'eraser' ? width * 3 : width,
          points,
        });
      }
    } else if (tool === 'line' || tool === 'arrow') {
      const start = startPoint.value;
      const end = endPoint.value;
      if (start && end) {
        runOnJS(onElementAdd)({
          id: generateId(),
          type: tool,
          color,
          strokeWidth: width,
          startPoint: start,
          endPoint: end,
        });
      }
    } else if (tool === 'rectangle' || tool === 'circle' || tool === 'triangle') {
      const start = startPoint.value;
      const end = endPoint.value;
      if (start && end) {
        runOnJS(onElementAdd)({
          id: generateId(),
          type: tool,
          color,
          strokeWidth: width,
          startPoint: start,
          endPoint: end,
          filled: false,
        });
      }
    }

    isDrawing.value = false;
    currentPath.value = [];
    startPoint.value = null;
    endPoint.value = null;
  }, [currentTool, currentColor, strokeWidth, onElementAdd]);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      'worklet';
      const point = { x: event.x, y: event.y };

      if (currentTool === 'select') {
        // Handle selection logic
        return;
      }

      isDrawing.value = true;
      currentElementId.value = generateId();

      if (currentTool === 'pen' || currentTool === 'eraser') {
        currentPath.value = [point];
      } else {
        startPoint.value = point;
        endPoint.value = point;
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (!isDrawing.value) return;

      const point = { x: event.x, y: event.y };

      if (currentTool === 'pen' || currentTool === 'eraser') {
        currentPath.value = [...currentPath.value, point];
      } else {
        endPoint.value = point;
      }
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handleDrawingEnd)();
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      'worklet';
      scale.value = Math.max(0.5, Math.min(3, event.scale));
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const renderElement = useCallback((element: DrawingElement) => {
    const isSelected = selectedElementId === element.id;
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(element.color));
    paint.setStrokeWidth(element.strokeWidth);
    paint.setStyle(element.filled ? 0 : 1); // 0 = Fill, 1 = Stroke

    switch (element.type) {
      case 'pen':
      case 'eraser':
        if (element.points && element.points.length > 1) {
          const pathString = createPathString(element.points);
          const skPath = Skia.Path.MakeFromSVGString(pathString);
          if (skPath) {
            return (
              <Path
                key={element.id}
                path={skPath}
                color={element.color}
                style="stroke"
                strokeWidth={element.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            );
          }
        }
        return null;

      case 'line':
        if (element.startPoint && element.endPoint) {
          return (
            <Line
              key={element.id}
              p1={vec(element.startPoint.x, element.startPoint.y)}
              p2={vec(element.endPoint.x, element.endPoint.y)}
              color={element.color}
              strokeWidth={element.strokeWidth}
              strokeCap="round"
            />
          );
        }
        return null;

      case 'arrow':
        if (element.startPoint && element.endPoint) {
          const start = element.startPoint;
          const end = element.endPoint;
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;

          const arrowP1 = {
            x: end.x - arrowLength * Math.cos(angle - arrowAngle),
            y: end.y - arrowLength * Math.sin(angle - arrowAngle),
          };
          const arrowP2 = {
            x: end.x - arrowLength * Math.cos(angle + arrowAngle),
            y: end.y - arrowLength * Math.sin(angle + arrowAngle),
          };

          return (
            <Group key={element.id}>
              <Line
                p1={vec(start.x, start.y)}
                p2={vec(end.x, end.y)}
                color={element.color}
                strokeWidth={element.strokeWidth}
                strokeCap="round"
              />
              <Line
                p1={vec(end.x, end.y)}
                p2={vec(arrowP1.x, arrowP1.y)}
                color={element.color}
                strokeWidth={element.strokeWidth}
                strokeCap="round"
              />
              <Line
                p1={vec(end.x, end.y)}
                p2={vec(arrowP2.x, arrowP2.y)}
                color={element.color}
                strokeWidth={element.strokeWidth}
                strokeCap="round"
              />
            </Group>
          );
        }
        return null;

      case 'rectangle':
        if (element.startPoint && element.endPoint) {
          const x = Math.min(element.startPoint.x, element.endPoint.x);
          const y = Math.min(element.startPoint.y, element.endPoint.y);
          const width = Math.abs(element.endPoint.x - element.startPoint.x);
          const height = Math.abs(element.endPoint.y - element.startPoint.y);
          return (
            <Rect
              key={element.id}
              x={x}
              y={y}
              width={width}
              height={height}
              color={element.color}
              style="stroke"
              strokeWidth={element.strokeWidth}
            />
          );
        }
        return null;

      case 'circle':
        if (element.startPoint && element.endPoint) {
          const cx = (element.startPoint.x + element.endPoint.x) / 2;
          const cy = (element.startPoint.y + element.endPoint.y) / 2;
          const rx = Math.abs(element.endPoint.x - element.startPoint.x) / 2;
          const ry = Math.abs(element.endPoint.y - element.startPoint.y) / 2;
          const r = Math.max(rx, ry);
          return (
            <Circle
              key={element.id}
              cx={cx}
              cy={cy}
              r={r}
              color={element.color}
              style="stroke"
              strokeWidth={element.strokeWidth}
            />
          );
        }
        return null;

      case 'triangle':
        if (element.startPoint && element.endPoint) {
          const minX = Math.min(element.startPoint.x, element.endPoint.x);
          const maxX = Math.max(element.startPoint.x, element.endPoint.x);
          const minY = Math.min(element.startPoint.y, element.endPoint.y);
          const maxY = Math.max(element.startPoint.y, element.endPoint.y);

          const topX = (minX + maxX) / 2;
          const topY = minY;
          const bottomLeftX = minX;
          const bottomLeftY = maxY;
          const bottomRightX = maxX;
          const bottomRightY = maxY;

          const pathString = `M ${topX} ${topY} L ${bottomLeftX} ${bottomLeftY} L ${bottomRightX} ${bottomRightY} Z`;
          const skPath = Skia.Path.MakeFromSVGString(pathString);
          if (skPath) {
            return (
              <Path
                key={element.id}
                path={skPath}
                color={element.color}
                style="stroke"
                strokeWidth={element.strokeWidth}
              />
            );
          }
        }
        return null;

      default:
        return null;
    }
  }, [selectedElementId, createPathString]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.canvasContainer, animatedStyle]}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {/* Render saved elements */}
            {elements.map(renderElement)}
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});

export default SkiaCanvas;
