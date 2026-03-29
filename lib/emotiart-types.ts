export type EmotionKey =
  | "happy"
  | "calm"
  | "sad"
  | "angry"
  | "anxious"
  | "excited"
  | "overwhelmed";

export interface Emotion {
  key: EmotionKey;
  name: string;
  color: string;
  shape: string;
  shapeDescription: string;
}

export const EMOTIONS: Emotion[] = [
  { key: "happy", name: "Happy", color: "#FFD166", shape: "circle", shapeDescription: "Circle" },
  { key: "calm", name: "Calm", color: "#06AED4", shape: "wave", shapeDescription: "Horizontal wave line" },
  { key: "sad", name: "Sad", color: "#9B72CF", shape: "arc", shapeDescription: "Downward arc" },
  { key: "angry", name: "Angry", color: "#EF233C", shape: "triangle", shapeDescription: "Sharp upward triangle" },
  { key: "anxious", name: "Anxious", color: "#F4A261", shape: "dots", shapeDescription: "Scattered small dots" },
  { key: "excited", name: "Excited", color: "#FF6B9D", shape: "starburst", shapeDescription: "6-point starburst" },
  { key: "overwhelmed", name: "Overwhelmed", color: "#8ECAE6", shape: "squares", shapeDescription: "Overlapping squares" },
];

export interface EmotiArtState {
  activeEmotion: EmotionKey;
  confidence: number;
  transcript: string;
  isListening: boolean;
  isGenerated: boolean;
  generationKey: number;
  artOutput?: ArtOutput | null;
}

// Art output from the Python backend
export interface ArtShapeOutput {
  color: string;
  colorRgb: [number, number, number];
  shape: "dot" | "circle" | "wave" | "arc" | "triangle" | "starburst" | "square";
}

export interface ArtOutput {
  primary: ArtShapeOutput;
  secondary: ArtShapeOutput;
  shapeCount: number;
  sizeMin: number;
  sizeMax: number;
  opacityMin: number;
  opacityMax: number;
  speed: number;
  animationStyle: "float" | "pulse" | "drift" | "jitter";
}

export interface EmotiArtBridgeResult {
  emotion: string;
  intensity: number;
  conflict: boolean;
  conflict_blend: number;
  art: ArtOutput;
}
