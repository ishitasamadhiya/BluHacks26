"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LiveInputPanel } from "@/components/emotiart/live-input-panel";
import { EmotionDetectionPanel } from "@/components/emotiart/emotion-detection-panel";
import { VisualGuidePanel } from "@/components/emotiart/visual-guide-panel";
import { ArtCanvas } from "@/components/emotiart/art-canvas";
import { Navbar } from "@/components/navbar";
import { EmotionKey, EmotiArtState, ArtOutput, EmotiArtBridgeResult } from "@/lib/emotiart-types";

export default function EmotiArtPage() {
  const [state, setState] = useState<EmotiArtState>({
    activeEmotion: "calm",
    confidence: 0,
    transcript: "",
    isListening: false,
    isGenerated: false,
    generationKey: 0,
    artOutput: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const canvasRef = useRef<{ regenerate: () => void; download: () => void }>(null);

  const setEmotion = useCallback((key: string, confidence?: number) => {
    setState((prev) => ({
      ...prev,
      activeEmotion: key as EmotionKey,
      confidence: confidence ?? prev.confidence,
    }));
  }, []);

  const setTranscript = useCallback((text: string) => {
    setState((prev) => ({ ...prev, transcript: text }));
  }, []);

  const setListening = useCallback((active: boolean) => {
    setState((prev) => ({ ...prev, isListening: active }));
  }, []);

  const generate = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isGenerated: true,
      generationKey: prev.generationKey + 1,
    }));
  }, []);

  const processGeminiResult = useCallback(
    (result: { emotion: string; confidence: number; transcript: string }) => {
      setState((prev) => ({
        ...prev,
        activeEmotion: result.emotion as EmotionKey,
        confidence: result.confidence,
        transcript: result.transcript,
      }));
    },
    []
  );

  // Process result from the Python backend via EmotiArtBridge
  const processBridgeResult = useCallback((result: EmotiArtBridgeResult) => {
    setState((prev) => ({
      ...prev,
      activeEmotion: result.emotion as EmotionKey,
      confidence: result.intensity,
      artOutput: result.art,
      isGenerated: true,
      generationKey: prev.generationKey + 1,
    }));
  }, []);

  // Set art output directly
  const setArtOutput = useCallback((art: ArtOutput | null) => {
    setState((prev) => ({ ...prev, artOutput: art }));
  }, []);

  // Expose global API for Gemini Live integration and Bridge
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as typeof window & { EmotiArt: typeof window.EmotiArt }).EmotiArt = {
        setEmotion,
        setTranscript,
        setListening,
        generate,
        processGeminiResult,
        processBridgeResult,
        setArtOutput,
        getVideoElement: () => videoRef.current,
      };
    }
  }, [setEmotion, setTranscript, setListening, generate, processGeminiResult, processBridgeResult, setArtOutput]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0d0d0f]">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile: Canvas on top */}
        <div className="flex-1 lg:order-2 min-h-[50vh] lg:min-h-0">
          <ArtCanvas
          ref={canvasRef}
          emotion={state.activeEmotion}
          isGenerated={state.isGenerated}
          generationKey={state.generationKey}
          artOutput={state.artOutput}
        />
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-[320px] lg:order-1 flex-shrink-0 p-3 flex flex-col gap-3 overflow-y-auto">
        <LiveInputPanel
          isListening={state.isListening}
          transcript={state.transcript}
        />
        <EmotionDetectionPanel
          activeEmotion={state.activeEmotion}
          confidence={state.confidence}
        />
        <VisualGuidePanel />
        
        <button
          onClick={generate}
          className="w-full h-11 bg-white text-black font-sans font-semibold text-sm rounded-lg hover:opacity-88 active:scale-[0.98] transition-all duration-150"
        >
          Generate Art
        </button>
      </aside>
      </main>
    </div>
  );
}

// Type augmentation for window
declare global {
  interface Window {
    EmotiArt: {
      setEmotion: (key: string, confidence?: number) => void;
      setTranscript: (text: string) => void;
      setListening: (active: boolean) => void;
      generate: () => void;
      processGeminiResult: (result: {
        emotion: string;
        confidence: number;
        transcript: string;
      }) => void;
      processBridgeResult: (result: EmotiArtBridgeResult) => void;
      setArtOutput: (art: ArtOutput | null) => void;
      getVideoElement: () => HTMLVideoElement | null;
    };
  }
}
