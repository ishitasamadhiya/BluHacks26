"use client";

import { useEffect, useRef, useCallback } from "react";

interface ShaderBackgroundProps {
  className?: string;
  intensity?: number;
  speed?: number;
  colorAccent?: string;
}

export function ShaderBackground({
  className = "",
  intensity = 0.15,
  speed = 0.0003,
  colorAccent = "#06AED4",
}: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0.02, g: 0.68, b: 0.83 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const accentColor = hexToRgb(colorAccent);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader - creates flowing aurora-like effect
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_intensity;
      uniform vec3 u_accent;

      // Simplex noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        
        // Create flowing noise pattern
        float noise1 = snoise(vec2(uv.x * 2.0 + u_time * 0.5, uv.y * 2.0 + u_time * 0.3));
        float noise2 = snoise(vec2(uv.x * 3.0 - u_time * 0.4, uv.y * 1.5 + u_time * 0.2));
        float noise3 = snoise(vec2(uv.x * 1.5 + u_time * 0.3, uv.y * 3.0 - u_time * 0.5));
        
        float combined = (noise1 + noise2 * 0.5 + noise3 * 0.25) / 1.75;
        
        // Background color (dark)
        vec3 bgColor = vec3(0.051, 0.051, 0.059);
        
        // Create subtle color gradients
        vec3 color1 = u_accent;
        vec3 color2 = vec3(0.608, 0.447, 0.812); // Purple
        
        vec3 gradientColor = mix(color1, color2, uv.x + sin(u_time * 0.5) * 0.2);
        
        // Apply noise to create aurora effect
        float aurora = smoothstep(0.2, 0.8, combined) * u_intensity;
        aurora *= smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.5, uv.y);
        
        vec3 finalColor = mix(bgColor, gradientColor, aurora);
        
        // Add subtle vignette
        float vignette = 1.0 - length((uv - 0.5) * 1.2);
        finalColor *= 0.8 + vignette * 0.2;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Compile shaders
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    // Set up geometry (full-screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const intensityLocation = gl.getUniformLocation(program, "u_intensity");
    const accentLocation = gl.getUniformLocation(program, "u_accent");

    // Handle resize
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const startTime = performance.now();

    const render = () => {
      const currentTime = (performance.now() - startTime) * speed;

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, currentTime);
      gl.uniform1f(intensityLocation, intensity);
      gl.uniform3f(accentLocation, accentColor.r, accentColor.g, accentColor.b);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [colorAccent, intensity, speed, hexToRgb]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full -z-10 ${className}`}
      style={{ background: "#0d0d0f" }}
    />
  );
}
