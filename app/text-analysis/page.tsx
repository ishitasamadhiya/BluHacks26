"use client";

import { useState, useRef, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { EmotionDetectionPanel } from "@/components/emotiart/emotion-detection-panel";
import { VisualGuidePanel } from "@/components/emotiart/visual-guide-panel";
import { ArtCanvas } from "@/components/emotiart/art-canvas";
import { EmotionKey, ArtOutput } from "@/lib/emotiart-types";
import { AnimatedOrbs } from "@/components/ui/animated-orbs";

// Map API emotion names to our EmotionKey type
const emotionMapping: Record<string, EmotionKey> = {
  calm: "calm",
  joy: "happy",
  happy: "happy",
  sadness: "sad",
  sad: "sad",
  anger: "angry",
  angry: "angry",
  fear: "anxious",
  anxious: "anxious",
  love: "happy",
  gratitude: "happy",
  confusion: "anxious",
  hope: "calm",
  tension: "anxious",
  excited: "excited",
  overwhelmed: "overwhelmed",
};

export default function TextAnalysisPage() {
  const [text, setText] = useState("");
  const [activeEmotion, setActiveEmotion] = useState<EmotionKey>("calm");
  const [confidence, setConfidence] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generationKey, setGenerationKey] = useState(0);
  const [artOutput, setArtOutput] = useState<ArtOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedEmotions, setDetectedEmotions] = useState<Array<{ name: string; confidence: number }>>([]);

  const canvasRef = useRef<{ regenerate: () => void; download: () => void }>(null);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      
      // Map the dominant emotion to our EmotionKey type
      const mappedEmotion = emotionMapping[result.dominant_emotion] || "calm";
      setActiveEmotion(mappedEmotion);
      
      // Set confidence from the dominant emotion
      const dominantEmotionData = result.emotions?.find(
        (e: { name: string }) => e.name === result.dominant_emotion
      );
      setConfidence(Math.round((dominantEmotionData?.confidence || 0.5) * 100));
      
      // Store detected emotions for display
      setDetectedEmotions(result.emotions || []);
      
      // Set art output from API response
      if (result.art_output?.art) {
        setArtOutput({
          primary: {
            color: result.art_output.art.primary.color,
            colorRgb: result.art_output.art.primary.colorRgb,
            shape: result.art_output.art.primary.shape as ArtOutput["primary"]["shape"],
          },
          secondary: {
            color: result.art_output.art.secondary.color,
            colorRgb: result.art_output.art.secondary.colorRgb,
            shape: result.art_output.art.secondary.shape as ArtOutput["secondary"]["shape"],
          },
          shapeCount: result.art_output.art.shapeCount,
          sizeMin: result.art_output.art.sizeMin,
          sizeMax: result.art_output.art.sizeMax,
          opacityMin: result.art_output.art.opacityMin,
          opacityMax: result.art_output.art.opacityMax,
          speed: result.art_output.art.speed || 0.5,
          animationStyle: result.art_output.art.animationStyle || "float",
        });
      }
      
      setIsGenerated(true);
      setGenerationKey((prev) => prev + 1);
    } catch (error) {
      console.error("Analysis error:", error);
      // Fallback to calm emotion on error
      setActiveEmotion("calm");
      setConfidence(50);
      setArtOutput(null);
      setIsGenerated(true);
      setGenerationKey((prev) => prev + 1);
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0d0d0f] relative">
      <AnimatedOrbs />
      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 lg:order-2 min-h-[50vh] lg:min-h-0">
          <ArtCanvas
            ref={canvasRef}
            emotion={activeEmotion}
            isGenerated={isGenerated}
            generationKey={generationKey}
            artOutput={artOutput}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] lg:order-1 flex-shrink-0 p-3 flex flex-col gap-3 overflow-y-auto animate-fade-in">
          {/* Text Input Panel */}
          <div className="p-4 rounded-xl glass hover-lift transition-all duration-200">
            <h2 className="font-sans font-semibold text-sm text-white mb-3">
              Text Input
            </h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your messages, journal entry, or any text here to analyze its emotional tone..."
              className="w-full h-32 px-3 py-2 rounded-lg glass text-white font-sans text-sm placeholder:text-white/30 focus:outline-none focus:border-[#06AED4]/50 focus:ring-1 focus:ring-[#06AED4]/50 transition-all duration-200 resize-none"
            />
            <p className="font-mono text-xs text-white/40 mt-2">
              {text.length} characters
            </p>
          </div>

          <EmotionDetectionPanel
            activeEmotion={activeEmotion}
            confidence={confidence}
          />
          <VisualGuidePanel />

          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="w-full h-11 bg-white text-black font-sans font-semibold text-sm rounded-lg hover:opacity-90 hover-lift active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
          >
            Analyze Text
          </button>
        </aside>
      </main>
    </div>
  );
}
