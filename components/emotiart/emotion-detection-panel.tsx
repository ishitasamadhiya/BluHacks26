"use client";

import { EMOTIONS, EmotionKey } from "@/lib/emotiart-types";

interface EmotionDetectionPanelProps {
  activeEmotion: EmotionKey;
  confidence: number;
}

export function EmotionDetectionPanel({
  activeEmotion,
  confidence,
}: EmotionDetectionPanelProps) {
  const activeEmotionData = EMOTIONS.find((e) => e.key === activeEmotion);
  const activeColor = activeEmotionData?.color ?? "#6b6b7a";

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-4 hover-lift transition-all duration-200">
      <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#6b6b7a]">
        Detected Emotion
      </label>

      {/* Emotion Grid - 2x4 but we have 7 so last row has 1 */}
      <div className="grid grid-cols-4 gap-2">
        {EMOTIONS.map((emotion) => {
          const isActive = emotion.key === activeEmotion;
          return (
            <div
              key={emotion.key}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-150 ${
                isActive ? "animate-chip-activate" : ""
              }`}
              style={{
                backgroundColor: isActive
                  ? `${emotion.color}15`
                  : "transparent",
                boxShadow: isActive
                  ? `0 0 0 2px ${emotion.color}`
                  : "none",
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: emotion.color }}
              />
              <span className="font-sans text-[11px] text-[#e8e8ec] text-center leading-tight">
                {emotion.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Confidence Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#6b6b7a]">
            Confidence
          </label>
          <span className="font-mono text-[11px] text-[#6b6b7a]">
            {Math.round(confidence)}%
          </span>
        </div>
        <div className="h-1 w-full bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-400 ease-out"
            style={{
              width: `${confidence}%`,
              backgroundColor: activeColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
