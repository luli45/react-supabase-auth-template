export type ToolType =
  | 'select'
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'text'
  | 'sticker'
  | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: ToolType;
  color: string;
  strokeWidth: number;
  points?: Point[];
  startPoint?: Point;
  endPoint?: Point;
  position?: Point;
  size?: { width: number; height: number };
  rotation?: number;
  scale?: number;
  text?: string;
  fontSize?: number;
  stickerId?: string;
  filled?: boolean;
}

export interface EditorState {
  elements: DrawingElement[];
  selectedElementId: string | null;
  currentTool: ToolType;
  currentColor: string;
  strokeWidth: number;
  fontSize: number;
  history: DrawingElement[][];
  historyIndex: number;
}

export const COLORS = [
  '#ffffff',
  '#ff4444',
  '#ff8844',
  '#ffcc00',
  '#44ff44',
  '#44ffff',
  '#4488ff',
  '#8844ff',
  '#ff44ff',
  '#000000',
];

export const STROKE_WIDTHS = [2, 4, 6, 8, 12, 16];
