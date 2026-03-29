"use client";

import { useState } from "react";
import { EMOTIONS } from "@/lib/emotiart-types";

function EmotionShapeSVG({ emotion }: { emotion: (typeof EMOTIONS)[number] }) {
  const { key, color } = emotion;

  switch (key) {
    case "happy":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10" fill={color} />
        </svg>
      );
    case "calm":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M2 14 C6 10, 10 18, 14 14 C18 10, 22 18, 26 14"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "sad":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M4 10 Q14 24 24 10"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "angry":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,4 24,24 4,24" fill={color} />
        </svg>
      );
    case "anxious":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="8" cy="12" r="3" fill={color} />
          <circle cx="18" cy="8" r="2" fill={color} />
          <circle cx="20" cy="18" r="3.5" fill={color} />
        </svg>
      );
    case "excited":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 16.5,10.5 25,10.5 18.5,15.5 21,24 14,19 7,24 9.5,15.5 3,10.5 11.5,10.5"
            fill={color}
          />
        </svg>
      );
    case "overwhelmed":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="4" width="14" height="14" fill={color} fillOpacity="0.6" />
          <rect x="10" y="10" width="14" height="14" fill={color} fillOpacity="0.8" />
        </svg>
      );
    default:
      return null;
  }
}

export function VisualGuidePanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3 hover-lift transition-all duration-200">
      <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#6b6b7a]">
        Shape Guide
      </label>

      {/* Legend List */}
      <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
        {EMOTIONS.map((emotion) => (
          <div
            key={emotion.key}
            className="flex items-center gap-3"
          >
            <div className="flex-shrink-0">
              <EmotionShapeSVG emotion={emotion} />
            </div>
            <span className="font-sans text-[13px] text-[#e8e8ec]">
              <span style={{ color: emotion.color }}>{emotion.name}</span>
              {" — "}
              {emotion.shapeDescription}
            </span>
          </div>
        ))}
      </div>

      {/* How to read this */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-left mt-1"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        >
          <path
            d="M4 2L8 6L4 10"
            stroke="#6b6b7a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-mono text-[11px] text-[#6b6b7a]">
          How to read this
        </span>
      </button>

      {expanded && (
        <p className="font-sans text-[12px] text-[#6b6b7a] leading-relaxed pl-4">
          EmotiArt translates your detected emotion into a unique visual pattern.
          Each emotion has a signature shape and color. The canvas generates
          multiple instances with varying sizes and positions to create an
          abstract representation of your emotional state.
        </p>
      )}
    </div>
  );
}
