"use client";

import { useEffect, useRef, useState } from "react";
import { vertexShaderSource, fragmentShaderSource } from "@/lib/shaders";

/**
 * Compiles a shader from source, throwing with the GLSL compiler's own
 * error message if it fails (much easier to debug than a silent null).
 */
function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

export function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  // Detect prefers-reduced-motion once on mount, and keep listening in
  // case the user changes the OS setting while the page is open.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // Wait until we know the motion preference, and skip WebGL setup
    // entirely for reduced-motion users — they get the CSS gradient
    // fallback rendered in the JSX below instead. No canvas, no GL
    // context, no animation loop: zero cost for that audience.
    if (reducedMotion !== false) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) return; // very old browser — CSS gradient fallback below still shows

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // A single triangle big enough to cover the whole viewport is
    // cheaper than a quad (2 triangles, 4 vertices, an index buffer) —
    // the corners simply get clipped, which costs nothing.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    // Mouse position in physical (canvas) pixels, bottom-left origin
    // to match gl_FragCoord. Starts centered so the very first frame
    // (before any mouse movement) still looks intentional.
    const mouse = { x: 0, y: 0 };

    function resize() {
      // Cap devicePixelRatio at 2 — on a 3x phone screen, rendering at
      // native resolution burns GPU/battery for a visual difference
      // nobody can perceive. This is the "devicePixelRatio capped"
      // requirement from the brief.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.floor(canvas!.clientWidth * dpr);
      const displayHeight = Math.floor(canvas!.clientHeight * dpr);
      if (canvas!.width !== displayWidth || canvas!.height !== displayHeight) {
        canvas!.width = displayWidth;
        canvas!.height = displayHeight;
        gl!.viewport(0, 0, displayWidth, displayHeight);
      }
      mouse.x = canvas!.width / 2;
      mouse.y = canvas!.height / 2;
    }
    resize();
    window.addEventListener("resize", resize);

    function handlePointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouse.x = (e.clientX - rect.left) * dpr;
      // Flip Y: browser pointer coords are top-down, gl_FragCoord is
      // bottom-up, so without this the pull would react upside-down.
      mouse.y = (rect.height - (e.clientY - rect.top)) * dpr;
    }
    window.addEventListener("pointermove", handlePointerMove);

    // ---- Animation loop, with tab-visibility pause ----
    let rafId = 0;
    let running = true;
    const startTime = performance.now();

    function draw() {
      if (!running) return;
      const now = (performance.now() - startTime) / 1000;
      gl!.uniform2f(resolutionLoc, canvas!.width, canvas!.height);
      gl!.uniform1f(timeLoc, now);
      gl!.uniform2f(mouseLoc, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(draw);
    }

    // Page Visibility API: stop the render loop entirely when the tab
    // is backgrounded, instead of quietly burning CPU/GPU/battery on a
    // frame nobody can see. Resumes automatically when the tab is
    // foregrounded again.
    function handleVisibilityChange() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else {
        running = true;
        draw();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reducedMotion]);

  // Avoid a flash of the wrong version while we detect the motion
  // preference on first mount (render nothing but the base color for
  // one tick rather than briefly showing the animated version).
  if (reducedMotion === null) {
    return <div className="hero" />;
  }

  return (
    <div className="hero">
      {reducedMotion ? (
        // Static fallback: the same palette as the shader (ink-black to
        // copper to gold), expressed as one plain CSS gradient — no
        // WebGL context, no animation, no per-frame cost at all.
        <div className="hero-static-gradient" />
      ) : (
        <canvas ref={canvasRef} className="hero-canvas" />
      )}
      <div className="hero-content">
        <p className="hero-eyebrow">Frontend AI Engineering — Capstone</p>
        <h1 className="hero-name">Kajal Bhatiya</h1>
        <p className="hero-role">Frontend AI Engineer</p>
      </div>
    </div>
  );
}
