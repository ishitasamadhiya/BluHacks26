"use client";

import { useState, useRef, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { EmotionDetectionPanel } from "@/components/emotiart/emotion-detection-panel";
import { VisualGuidePanel } from "@/components/emotiart/visual-guide-panel";
import { ArtCanvas } from "@/components/emotiart/art-canvas";
import { EmotionKey } from "@/lib/emotiart-types";
import { AnimatedOrbs } from "@/components/ui/animated-orbs";

const emotionKeywords: Record<EmotionKey, string[]> = {
  happy: ["happy", "joy", "excited", "great", "wonderful", "amazing", "love", "glad", "delighted", "cheerful", "fantastic", "awesome", "thrilled", "pleased", "elated"],
  calm: ["calm", "peaceful", "relaxed", "serene", "tranquil", "content", "gentle", "quiet", "still", "composed", "centered", "mindful", "balanced"],
  sad: ["sad", "unhappy", "depressed", "down", "melancholy", "gloomy", "sorrowful", "heartbroken", "disappointed", "lonely", "grief", "crying", "tears"],
  angry: ["angry", "mad", "furious", "rage", "irritated", "annoyed", "frustrated", "outraged", "livid", "hostile", "hate", "disgusted"],
  anxious: ["anxious", "worried", "nervous", "stressed", "tense", "uneasy", "fearful", "panic", "dread", "apprehensive", "restless", "scared"],
  excited: ["excited", "thrilled", "eager", "enthusiastic", "hyped", "pumped", "energized", "animated", "vibrant", "passionate", "exhilarated"],
  overwhelmed: ["overwhelmed", "overloaded", "swamped", "drowning", "exhausted", "burnt", "chaos", "too much", "cant handle", "breaking down", "pressure"],
};

function analyzeText(text: string): { emotion: EmotionKey; confidence: number } {
  const lowerText = text.toLowerCase();
  const scores: Record<EmotionKey, number> = {
    happy: 0,
    calm: 0,
    sad: 0,
    angry: 0,
    anxious: 0,
    excited: 0,
    overwhelmed: 0,
  };

  let totalMatches = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        scores[emotion as EmotionKey] += matches.length;
        totalMatches += matches.length;
      }
    }
  }

  let topEmotion: EmotionKey = "calm";
  let topScore = 0;

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topEmotion = emotion as EmotionKey;
    }
  }

  const confidence = totalMatches > 0 ? Math.min((topScore / totalMatches) * 100, 100) : 0;

  return { emotion: topEmotion, confidence: Math.round(confidence) };
}

export default function TextAnalysisPage() {
  const [text, setText] = useState("");
  const [activeEmotion, setActiveEmotion] = useState<EmotionKey>("calm");
  const [confidence, setConfidence] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generationKey, setGenerationKey] = useState(0);

  const canvasRef = useRef<{ regenerate: () => void; download: () => void }>(null);

  const handleAnalyze = useCallback(() => {
    if (!text.trim()) return;

    const result = analyzeText(text);
    setActiveEmotion(result.emotion);
    setConfidence(result.confidence);
    setIsGenerated(true);
    setGenerationKey((prev) => prev + 1);
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
