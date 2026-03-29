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

export interface EmotiArtBridgeConfig {
  videoElement: HTMLVideoElement;
  onResult: (artOutput: EmotiArtBridgeResult) => void;
  onError?: (error: Error) => void;
  intervalMs?: number;
  serverUrl?: string;
}

export interface EmotiArtBridgeAPI {
  start: (config: EmotiArtBridgeConfig) => void;
  stop: () => void;
  setTranscript: (text: string) => void;
  sendFrame: () => Promise<EmotiArtBridgeResult | null>;
}

declare global {
  interface Window {
    EmotiArtBridge: EmotiArtBridgeAPI;
  }
}
