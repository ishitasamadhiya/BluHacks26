"use client";

import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { EMOTIONS, EmotionKey, ArtOutput, ArtShapeOutput } from "@/lib/emotiart-types";

interface ArtCanvasProps {
  emotion: EmotionKey;
  isGenerated: boolean;
  generationKey: number;
  artOutput?: ArtOutput | null;
}

interface Shape {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation?: number;
  // For anxious dots cluster
  dots?: { dx: number; dy: number; r: number }[];
  // For overwhelmed rectangles cluster
  rects?: { dx: number; dy: number; w: number; h: number; opacity: number }[];
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbaFromArray(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

// Draw shape based on backend art output shape type
function drawBridgeShape(
  ctx: CanvasRenderingContext2D,
  shapeType: ArtShapeOutput["shape"],
  x: number,
  y: number,
  size: number,
  color: [number, number, number],
  opacity: number,
  rotation: number = 0
) {
  const alpha = opacity;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  switch (shapeType) {
    case "circle":
    case "dot": {
      ctx.fillStyle = rgbaFromArray(color, alpha);
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "wave": {
      ctx.strokeStyle = rgbaFromArray(color, alpha);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      const amplitude = size * 0.3;
      const frequency = 0.05;
      const length = size * 2;
      ctx.moveTo(-length / 2, 0);
      for (let px = -length / 2; px <= length / 2; px += 2) {
        const py = Math.sin(px * frequency) * amplitude;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
    case "arc": {
      ctx.strokeStyle = rgbaFromArray(color, alpha);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, Math.PI, 2 * Math.PI);
      ctx.stroke();
      break;
    }
    case "triangle": {
      ctx.fillStyle = rgbaFromArray(color, alpha);
      ctx.beginPath();
      const h = size;
      const w = size * 0.8;
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "starburst": {
      ctx.fillStyle = rgbaFromArray(color, alpha);
      ctx.beginPath();
      const outerR = size / 2;
      const innerR = outerR * 0.4;
      for (let i = 0; i < 12; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / 6 - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "square": {
      ctx.fillStyle = rgbaFromArray(color, alpha);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      break;
    }
  }

  ctx.restore();
}

function generateShapes(
  emotion: EmotionKey,
  width: number,
  height: number
): Shape[] {
  const count = Math.floor(Math.random() * 11) + 18; // 18-28 shapes
  const shapes: Shape[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 60 + 20; // 20-80px
    const opacity = Math.random() * 0.5 + 0.2; // 0.2-0.7
    const rotation = (Math.random() - 0.5) * 0.8; // ±0.4 radians

    if (emotion === "anxious") {
      // Generate cluster of 3-7 tiny dots
      const dotCount = Math.floor(Math.random() * 5) + 3;
      const dots = [];
      for (let j = 0; j < dotCount; j++) {
        dots.push({
          dx: (Math.random() - 0.5) * size,
          dy: (Math.random() - 0.5) * size,
          r: Math.random() * 6 + 2, // 2-8px radius
        });
      }
      shapes.push({ x, y, size, opacity, dots });
    } else if (emotion === "overwhelmed") {
      // Generate cluster of 2-4 overlapping rectangles
      const rectCount = Math.floor(Math.random() * 3) + 2;
      const rects = [];
      for (let j = 0; j < rectCount; j++) {
        rects.push({
          dx: (Math.random() - 0.5) * size * 0.5,
          dy: (Math.random() - 0.5) * size * 0.5,
          w: Math.random() * size * 0.6 + size * 0.3,
          h: Math.random() * size * 0.6 + size * 0.3,
          opacity: Math.random() * 0.3 + 0.2,
        });
      }
      shapes.push({ x, y, size, opacity, rects });
    } else {
      shapes.push({ x, y, size, opacity, rotation });
    }
  }

  return shapes;
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  emotion: EmotionKey,
  shape: Shape,
  color: string,
  progress: number
) {
  const alpha = shape.opacity * progress;

  ctx.save();
  ctx.translate(shape.x, shape.y);

  switch (emotion) {
    case "happy": {
      // Filled circle, some with outer ring
      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.beginPath();
      ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
      ctx.fill();
      // 40% chance of outer ring
      if (Math.random() > 0.6) {
        ctx.strokeStyle = hexToRgba(color, alpha * 0.3);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, shape.size / 2 + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case "calm": {
      // Sine wave stroke
      ctx.strokeStyle = hexToRgba(color, alpha);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      const amplitude = shape.size * 0.3;
      const frequency = 0.05 + Math.random() * 0.03;
      const length = shape.size * 2;
      ctx.moveTo(-length / 2, 0);
      for (let x = -length / 2; x <= length / 2; x += 2) {
        const y = Math.sin(x * frequency) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
    case "sad": {
      // Lower half-circle arc (drooping)
      ctx.strokeStyle = hexToRgba(color, alpha);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, shape.size / 2, Math.PI, 2 * Math.PI);
      ctx.stroke();
      break;
    }
    case "angry": {
      // Solid filled triangle, slightly rotated
      ctx.rotate(shape.rotation || 0);
      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.beginPath();
      const h = shape.size;
      const w = shape.size * 0.8;
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "anxious": {
      // Cluster of tiny dots
      if (shape.dots) {
        ctx.fillStyle = hexToRgba(color, alpha);
        for (const dot of shape.dots) {
          ctx.beginPath();
          ctx.arc(dot.dx, dot.dy, dot.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "excited": {
      // 6-point star polygon, randomly rotated
      ctx.rotate(shape.rotation || 0);
      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.beginPath();
      const outerR = shape.size / 2;
      const innerR = outerR * 0.4;
      for (let i = 0; i < 12; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / 6 - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "overwhelmed": {
      // Cluster of overlapping rectangles
      if (shape.rects) {
        for (const rect of shape.rects) {
          ctx.fillStyle = hexToRgba(color, rect.opacity * progress);
          ctx.fillRect(
            rect.dx - rect.w / 2,
            rect.dy - rect.h / 2,
            rect.w,
            rect.h
          );
        }
      }
      break;
    }
  }

  ctx.restore();
}

export const ArtCanvas = forwardRef<
  { regenerate: () => void; download: () => void },
  ArtCanvasProps
>(function ArtCanvas({ emotion, isGenerated, generationKey, artOutput }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [shapes, setShapes] = useState<Shape[]>([]);
  const animationRef = useRef<number>(0);
  const [timestamp, setTimestamp] = useState("");

  const emotionData = EMOTIONS.find((e) => e.key === emotion)!;

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Draw grid background
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "#0d0d0f";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;

      const gridSize = 40;
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
    []
  );

  // Generate bridge shapes from artOutput
  interface BridgeShape {
    x: number;
    y: number;
    size: number;
    opacity: number;
    rotation: number;
    isPrimary: boolean;
  }

  const generateBridgeShapes = useCallback((art: ArtOutput, width: number, height: number): BridgeShape[] => {
    const bridgeShapes: BridgeShape[] = [];
    const count = art.shapeCount;
    
    for (let i = 0; i < count; i++) {
      bridgeShapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (art.sizeMax - art.sizeMin) + art.sizeMin,
        opacity: Math.random() * (art.opacityMax - art.opacityMin) + art.opacityMin,
        rotation: (Math.random() - 0.5) * 0.8,
        isPrimary: Math.random() > 0.3, // 70% primary, 30% secondary
      });
    }
    return bridgeShapes;
  }, []);

  // Generate and animate shapes
  const generateArt = useCallback(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    setTimestamp(
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const startTime = performance.now();
    const duration = 600;

    // Use artOutput from bridge if available, otherwise use local emotion-based generation
    if (artOutput) {
      const bridgeShapes = generateBridgeShapes(artOutput, dimensions.width, dimensions.height);

      const animateBridge = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        drawGrid(ctx, dimensions.width * dpr, dimensions.height * dpr);

        ctx.save();
        ctx.scale(dpr, dpr);

        bridgeShapes.forEach((shape, index) => {
          const shapeDelay = (index / bridgeShapes.length) * 0.5;
          const shapeProgress = Math.max(0, Math.min(1, (progress - shapeDelay) / 0.5));
          
          if (shapeProgress > 0) {
            const shapeData = shape.isPrimary ? artOutput.primary : artOutput.secondary;
            drawBridgeShape(
              ctx,
              shapeData.shape,
              shape.x,
              shape.y,
              shape.size,
              shapeData.colorRgb,
              shape.opacity * shapeProgress,
              shape.rotation
            );
          }
        });

        ctx.font = "11px var(--font-mono), monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fillText(
          `${emotion} · ${new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}`,
          16,
          dimensions.height - 16
        );

        ctx.restore();

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateBridge);
        }
      };

      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateBridge);
    } else {
      // Fallback to local emotion-based generation
      const newShapes = generateShapes(emotion, dimensions.width, dimensions.height);
      setShapes(newShapes);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        drawGrid(ctx, dimensions.width * dpr, dimensions.height * dpr);

        ctx.save();
        ctx.scale(dpr, dpr);

        newShapes.forEach((shape, index) => {
          const shapeDelay = (index / newShapes.length) * 0.5;
          const shapeProgress = Math.max(
            0,
            Math.min(1, (progress - shapeDelay) / 0.5)
          );
          if (shapeProgress > 0) {
            drawShape(ctx, emotion, shape, emotionData.color, shapeProgress);
          }
        });

        ctx.font = "11px var(--font-mono), monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fillText(
          `${emotion} · ${new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}`,
          16,
          dimensions.height - 16
        );

        ctx.restore();

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [dimensions, emotion, emotionData.color, drawGrid, artOutput, generateBridgeShapes]);

  // Initial grid draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGrid(ctx, dimensions.width * dpr, dimensions.height * dpr);

    if (isGenerated && shapes.length > 0) {
      // Redraw existing shapes
      ctx.save();
      ctx.scale(dpr, dpr);
      shapes.forEach((shape) => {
        drawShape(ctx, emotion, shape, emotionData.color, 1);
      });
      ctx.font = "11px var(--font-mono), monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillText(`${emotion} · ${timestamp}`, 16, dimensions.height - 16);
      ctx.restore();
    }
  }, [dimensions, isGenerated, shapes, emotion, emotionData.color, timestamp, drawGrid]);

  // Generate on key change
  useEffect(() => {
    if (isGenerated && generationKey > 0) {
      generateArt();
    }
  }, [generationKey, isGenerated, generateArt]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `emotiart-${emotion}-${ts}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [emotion]);

  useImperativeHandle(ref, () => ({
    regenerate: generateArt,
    download,
  }));

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />

      {/* Canvas Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={generateArt}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          title="Regenerate"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </button>
        <button
          onClick={download}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          title="Download"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
});
