"use client";

import { Navbar } from "@/components/navbar";
import { ShaderBackground } from "@/components/ui/shader-background";
import { AnimatedOrbs } from "@/components/ui/animated-orbs";

const textAnalysisFeatures = [
  {
    step: "01",
    title: "Paste Your Text",
    description:
      "Copy and paste messages, journal entries, emails, or any text you want to analyze for emotional content.",
    color: "#06AED4",
  },
  {
    step: "02",
    title: "Keyword Analysis",
    description:
      "Our algorithm scans your text for emotion-related keywords and phrases to determine the dominant emotional tone.",
    color: "#FFD166",
  },
  {
    step: "03",
    title: "Generate Art",
    description:
      "Based on the detected emotion, EmotiArt creates unique visual artwork with shapes, colors, and patterns that represent the emotional content.",
    color: "#9B72CF",
  },
  {
    step: "04",
    title: "Download & Share",
    description:
      "Save your personalized artwork as a high-resolution PNG and share your emotional analysis with others.",
    color: "#FF6B9D",
  },
];

const liveAnalysisFeatures = [
  {
    step: "01",
    title: "Enable Camera & Mic",
    description:
      "Use your camera and microphone to let EmotiArt analyze your facial expressions and voice tone in real-time.",
    color: "#06AED4",
  },
  {
    step: "02",
    title: "AI Detection",
    description:
      "Our AI powered by Gemini Live detects 7 distinct emotions: Happy, Calm, Sad, Angry, Anxious, Excited, and Overwhelmed.",
    color: "#FFD166",
  },
  {
    step: "03",
    title: "Generate Art",
    description:
      "Each emotion maps to unique visual elements - shapes, colors, and patterns that represent your emotional state.",
    color: "#9B72CF",
  },
  {
    step: "04",
    title: "Download & Share",
    description:
      "Save your personalized artwork as a high-resolution PNG and share your emotional journey with others.",
    color: "#FF6B9D",
  },
];

const emotions = [
  { name: "Happy", color: "#FFD166", shape: "Circles" },
  { name: "Calm", color: "#06AED4", shape: "Waves" },
  { name: "Sad", color: "#9B72CF", shape: "Arcs" },
  { name: "Angry", color: "#EF233C", shape: "Triangles" },
  { name: "Anxious", color: "#F4A261", shape: "Dots" },
  { name: "Excited", color: "#FF6B9D", shape: "Starbursts" },
  { name: "Overwhelmed", color: "#8ECAE6", shape: "Rectangles" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0f] relative overflow-hidden">
      <ShaderBackground intensity={0.12} speed={0.0002} />
      <AnimatedOrbs />
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="px-6 py-20 text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="font-sans font-bold text-4xl md:text-5xl text-white mb-6 text-balance">
            Transform Your Emotions Into{" "}
            <span className="text-[#06AED4] glow-cyan">Visual Art</span>
          </h1>
          <p className="font-sans text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            EmotiArt uses AI-powered facial expression and voice analysis to
            detect your emotional state and translate it into unique,
            personalized artwork in real-time.
          </p>
        </section>

        {/* Text Analysis */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="font-sans font-semibold text-2xl text-white mb-4 text-center">
            Text Analysis
          </h2>
          <p className="font-sans text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Analyze the emotional tone of messages, journal entries, or any written text.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-stagger">
            {textAnalysisFeatures.map((feature) => (
              <div
                key={feature.step}
                className="p-6 rounded-xl glass hover-lift hover:border-white/[0.15] transition-all duration-200"
              >
                <div
                  className="font-mono text-sm font-medium mb-3"
                  style={{ color: feature.color }}
                >
                  {feature.step}
                </div>
                <h3 className="font-sans font-semibold text-lg text-white mb-2">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Analysis */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="font-sans font-semibold text-2xl text-white mb-4 text-center">
            Live Analysis
          </h2>
          <p className="font-sans text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Use your camera and microphone for real-time emotion detection powered by AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-stagger">
            {liveAnalysisFeatures.map((feature) => (
              <div
                key={feature.step}
                className="p-6 rounded-xl glass hover-lift hover:border-white/[0.15] transition-all duration-200"
              >
                <div
                  className="font-mono text-sm font-medium mb-3"
                  style={{ color: feature.color }}
                >
                  {feature.step}
                </div>
                <h3 className="font-sans font-semibold text-lg text-white mb-2">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Emotion Legend */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="font-sans font-semibold text-2xl text-white mb-12 text-center">
            Emotion Color Palette
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 animate-stagger">
            {emotions.map((emotion) => (
              <div
                key={emotion.name}
                className="p-4 rounded-xl glass hover-lift text-center transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3"
                  style={{ backgroundColor: emotion.color }}
                />
                <div className="font-sans font-medium text-sm text-white mb-1">
                  {emotion.name}
                </div>
                <div className="font-mono text-xs text-white/40">
                  {emotion.shape}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/text-analysis"
              className="inline-flex items-center justify-center h-12 px-8 bg-white text-black font-sans font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            >
              Try Text Analysis
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#06AED4] text-black font-sans font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 glow-cyan"
            >
              Try Live Analysis
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
