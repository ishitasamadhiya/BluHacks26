"use client";

import { useEffect, useRef } from "react";

interface AnimatedOrbsProps {
  className?: string;
}

export function AnimatedOrbs({ className = "" }: AnimatedOrbsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const orbs = container.querySelectorAll<HTMLDivElement>(".orb");
    let animationId: number;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTime) * 0.0001;

      orbs.forEach((orb, index) => {
        const speed = 0.5 + index * 0.2;
        const amplitude = 30 + index * 10;
        const phase = index * (Math.PI / 3);

        const x = Math.sin(elapsed * speed + phase) * amplitude;
        const y = Math.cos(elapsed * speed * 0.7 + phase) * amplitude * 0.6;
        const scale = 1 + Math.sin(elapsed * speed * 0.5) * 0.1;

        orb.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Cyan orb */}
      <div
        className="orb absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px] transition-transform duration-100"
        style={{
          background: "radial-gradient(circle, #06AED4 0%, transparent 70%)",
        }}
      />
      {/* Purple orb */}
      <div
        className="orb absolute top-1/2 right-1/4 w-[350px] h-[350px] rounded-full opacity-15 blur-[100px] transition-transform duration-100"
        style={{
          background: "radial-gradient(circle, #9B72CF 0%, transparent 70%)",
        }}
      />
      {/* Pink orb */}
      <div
        className="orb absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-10 blur-[100px] transition-transform duration-100"
        style={{
          background: "radial-gradient(circle, #FF6B9D 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
