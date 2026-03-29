import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Emotion to art mapping from Flask backend
const EMOTION_ART_MAP: Record<string, { color: string; colorRgb: [number, number, number]; shape: string }> = {
  calm:      { color: "#5B8DB8", colorRgb: [91,  141, 184], shape: "circle" },
  tension:   { color: "#E63946", colorRgb: [230, 57,  70],  shape: "triangle" },
  joy:       { color: "#FFD166", colorRgb: [255, 209, 102], shape: "starburst" },
  happy:     { color: "#FFD166", colorRgb: [255, 209, 102], shape: "starburst" },
  sadness:   { color: "#6B7FD7", colorRgb: [107, 127, 215], shape: "arc" },
  sad:       { color: "#6B7FD7", colorRgb: [107, 127, 215], shape: "arc" },
  anger:     { color: "#C1121F", colorRgb: [193, 18,  31],  shape: "triangle" },
  angry:     { color: "#C1121F", colorRgb: [193, 18,  31],  shape: "triangle" },
  fear:      { color: "#7B2D8B", colorRgb: [123, 45,  139], shape: "dot" },
  love:      { color: "#FF6B9D", colorRgb: [255, 107, 157], shape: "circle" },
  gratitude: { color: "#06D6A0", colorRgb: [6,   214, 160], shape: "wave" },
  confusion: { color: "#F4A261", colorRgb: [244, 162, 97],  shape: "dot" },
  anxious:   { color: "#F4A261", colorRgb: [244, 162, 97],  shape: "dot" },
  hope:      { color: "#06AED4", colorRgb: [6,   174, 212], shape: "wave" },
  excited:   { color: "#FF6B9D", colorRgb: [255, 107, 157], shape: "starburst" },
  overwhelmed: { color: "#8ECAE6", colorRgb: [142, 202, 230], shape: "square" },
};

// Tuned constants from Flask backend
const BASE_SHAPE_COUNT = 18;
const SHAPE_COUNT_SCALE = 8;
const BASE_SIZE_MIN = 12;
const SIZE_MIN_SCALE = 8;
const BASE_SIZE_MAX = 40;
const SIZE_MAX_SCALE = 30;
const BASE_OPACITY_MIN = 0.20;
const OPACITY_MIN_SCALE = 0.108;
const BASE_OPACITY_MAX = 0.50;
const OPACITY_MAX_SCALE = 0.28;

interface EmotionResult {
  name: string;
  confidence: number;
  intensity: number;
}

function buildArtOutput(dominantEmotion: string, intensity: number, emotions: EmotionResult[]) {
  const primary = EMOTION_ART_MAP[dominantEmotion] || EMOTION_ART_MAP["calm"];

  let conflict = false;
  let conflictBlend = 0.0;
  let secondaryArt = primary;

  for (const e of emotions) {
    if (e.name !== dominantEmotion && e.confidence > 0.4) {
      conflict = true;
      conflictBlend = Math.round(Math.min(e.confidence * 0.6, 0.49) * 100) / 100;
      secondaryArt = EMOTION_ART_MAP[e.name] || EMOTION_ART_MAP["calm"];
      break;
    }
  }

  return {
    emotion: dominantEmotion,
    intensity: Math.round(intensity * 100) / 100,
    conflict,
    conflict_blend: conflictBlend,
    art: {
      primary: primary,
      secondary: secondaryArt,
      shapeCount: Math.round(BASE_SHAPE_COUNT + intensity * SHAPE_COUNT_SCALE),
      sizeMin: Math.round(BASE_SIZE_MIN + intensity * SIZE_MIN_SCALE),
      sizeMax: Math.round(BASE_SIZE_MAX + intensity * SIZE_MAX_SCALE),
      opacityMin: Math.round(Math.min(BASE_OPACITY_MIN + intensity * OPACITY_MIN_SCALE, 0.95) * 100) / 100,
      opacityMax: Math.round(Math.min(BASE_OPACITY_MAX + intensity * OPACITY_MAX_SCALE, 0.95) * 100) / 100,
      secondaryRatio: conflictBlend,
      speed: 0.5 + intensity * 0.5,
      animationStyle: intensity > 0.7 ? "pulse" : intensity > 0.4 ? "drift" : "float",
    },
  };
}

function fallbackAnalysis(text: string) {
  const keywords: Record<string, string[]> = {
    calm: ["peaceful", "serene", "relaxed", "quiet", "tranquil", "calm"],
    joy: ["happy", "joy", "excited", "wonderful", "amazing", "great", "love"],
    happy: ["happy", "glad", "delighted", "cheerful", "pleased"],
    sadness: ["sad", "depressed", "unhappy", "crying", "grief", "sorrowful"],
    sad: ["sad", "down", "melancholy", "gloomy", "disappointed"],
    anger: ["angry", "furious", "mad", "frustrated", "annoyed", "rage"],
    angry: ["angry", "irritated", "hostile", "hate"],
    fear: ["scared", "afraid", "worried", "anxious", "nervous", "fearful"],
    anxious: ["anxious", "worried", "nervous", "stressed", "tense", "uneasy"],
    love: ["love", "adore", "cherish", "heart", "affection"],
    gratitude: ["grateful", "thankful", "appreciate", "blessed"],
    hope: ["hope", "optimistic", "looking forward", "bright"],
    tension: ["stressed", "tense", "pressure", "overwhelmed"],
    confusion: ["confused", "uncertain", "unsure", "lost"],
    excited: ["excited", "thrilled", "eager", "enthusiastic", "hyped"],
    overwhelmed: ["overwhelmed", "overloaded", "swamped", "exhausted", "burnt"],
  };

  const textLower = text.toLowerCase();
  const detected: EmotionResult[] = [];

  for (const [emotion, kws] of Object.entries(keywords)) {
    const matches = kws.filter(kw => textLower.includes(kw)).length;
    if (matches) {
      detected.push({
        name: emotion,
        confidence: Math.min(0.9, 0.4 + matches * 0.15),
        intensity: 0.5,
      });
    }
  }

  if (detected.length === 0) {
    detected.push({ name: "calm", confidence: 0.5, intensity: 0.5 });
  }

  detected.sort((a, b) => b.confidence - a.confidence);
  const dominant = detected[0].name;

  return {
    emotions: detected.slice(0, 5),
    dominant_emotion: dominant,
    overall_valence: 0.0,
    overall_arousal: 0.5,
    art_output: buildArtOutput(dominant, 0.5, detected.slice(0, 5)),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "'text' must be a non-empty string" }, { status: 400 });
    }

    // Use provided API key or environment variable
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyC5KSaY1VTbg8R0yTGfKE79uI39pU-bbDo";
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      const prompt = `Analyze the emotional content of this text and return ONLY valid JSON.

Text to analyze:
"""${text}"""

Emotions to detect: calm, tension, joy, sadness, anger, fear, love, gratitude, confusion, hope, happy, sad, angry, anxious, excited, overwhelmed

Return format:
{
  "emotions": [
    {"name": "string", "confidence": number, "intensity": number}
  ],
  "dominant_emotion": "string",
  "overall_valence": number,
  "overall_arousal": number
}

Rules:
- confidence and intensity are 0.0 to 1.0
- overall_valence is -1.0 (negative) to 1.0 (positive)
- overall_arousal is 0.0 (calm) to 1.0 (energetic)
- only include emotions with confidence > 0.3
- order by confidence descending
- return ONLY the JSON object, no markdown, no explanation`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();

      // Strip markdown code fences if present
      if (responseText.startsWith("```")) {
        const lines = responseText.split("\n");
        responseText = lines.slice(1, -1).join("\n");
      }

      const parsed = JSON.parse(responseText);
      
      const emotions: EmotionResult[] = (parsed.emotions || [])
        .filter((e: { name?: string }) => e.name && EMOTION_ART_MAP[e.name])
        .map((e: { name: string; confidence?: number; intensity?: number }) => ({
          name: e.name,
          confidence: Math.max(0, Math.min(1, Number(e.confidence) || 0.5)),
          intensity: Math.max(0, Math.min(1, Number(e.intensity) || 0.5)),
        }));

      let dominant = parsed.dominant_emotion || "calm";
      if (!EMOTION_ART_MAP[dominant]) {
        dominant = emotions.length > 0 ? emotions[0].name : "calm";
      }

      const dominantIntensity = emotions.find(e => e.name === dominant)?.intensity || 0.5;

      return NextResponse.json({
        emotions,
        dominant_emotion: dominant,
        overall_valence: Math.max(-1, Math.min(1, Number(parsed.overall_valence) || 0)),
        overall_arousal: Math.max(0, Math.min(1, Number(parsed.overall_arousal) || 0.5)),
        art_output: buildArtOutput(dominant, dominantIntensity, emotions),
      });
    } catch {
      // Fallback to keyword-based analysis if Gemini fails
      return NextResponse.json(fallbackAnalysis(text));
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(EMOTION_ART_MAP);
}
