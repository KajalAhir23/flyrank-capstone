/**
 * "Ink Signature" fragment shader.
 *
 * Concept: dark metallic ink, domain-warped into slow-moving veins,
 * that visibly bends toward the cursor — like a ferrofluid reacting
 * to a magnet. Built from a handful of classic, well-understood GLSL
 * techniques (value noise, fractal brownian motion, domain warping)
 * rather than any single "aurora" tutorial — see README for the
 * breakdown of what was written from scratch vs. adapted from the
 * standard technique (Inigo Quilez's domain-warp / palette approach,
 * which is public, widely-taught GLSL vocabulary, not copied code).
 */

export const vertexShaderSource = `
  // A fullscreen triangle needs only 3 vertices (not 4, no quad/2 triangles).
  // a_position comes in as clip-space coordinates for a triangle that
  // over-covers the viewport; gl_Position just passes it straight through.
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `
  precision highp float;

  // ---- Uniforms: the three values JS feeds in every frame ----
  uniform vec2  u_resolution; // canvas size in physical pixels
  uniform float u_time;       // seconds since the shader started
  uniform vec2  u_mouse;      // cursor position in physical pixels (0,0 = bottom-left)

  // ---- Palette (Inigo Quilez cosine palette technique) ----
  // A single formula that sweeps smoothly through a chosen set of
  // colors as "t" goes from 0 to 1. a = base, b = amplitude,
  // c = frequency, d = phase offset. Tuned by hand for an ink-black
  // -> copper -> antique-gold sweep instead of the usual rainbow.
  // (a - b) is kept close to 0 rather than deeply negative, since any
  // channel below 0 gets hard-clipped to pure black by the GPU —
  // that clipping is what caused the very first version of this
  // shader to render almost entirely black.
  vec3 palette(float t) {
    vec3 a = vec3(0.16, 0.11, 0.075);
    vec3 b = vec3(0.34, 0.24, 0.15);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.10, 0.16, 0.28);
    return a + b * cos(6.28318 * (c * t + d));
  }

  // ---- Pseudo-random hash ----
  // Turns a 2D point into a "random-looking" single float. Not truly
  // random (it's deterministic), just chaotic enough to seed noise.
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // ---- Value noise ----
  // Smoothly interpolates between hashed values at the 4 corners of
  // a grid cell, giving smooth "blobby" randomness instead of static.
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep-style easing
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // ---- Fractal Brownian Motion ----
  // Layers several octaves of the noise above (each smaller and
  // fainter than the last) to build up organic, marble-like detail
  // instead of one flat blob of noise.
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    // Normalize pixel coords to a -1..1 range, correcting for aspect
    // ratio so the noise field isn't stretched on wide screens.
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    // Mouse in the same coordinate space as uv, so we can measure
    // distance between "this pixel" and "the cursor" directly.
    vec2 mouseUv = (u_mouse - 0.5 * u_resolution) / u_resolution.y;

    float t = u_time * 0.08; // slow, ambient drift speed

    // ---- The ferrofluid "pull" toward the cursor ----
    // Vector from this pixel to the mouse, and how close we are to it.
    // smoothstep gives a soft falloff: pixels far from the cursor feel
    // zero pull, pixels close to it feel the full effect.
    vec2 toMouse = mouseUv - uv;
    float dist = length(toMouse);
    float pull = smoothstep(0.9, 0.0, dist) * 0.35;

    // Bend the sampling coordinate toward the mouse before warping,
    // like the ink field being tugged by a magnet under the canvas.
    // Scaled by 1.6 so the noise shows real structure across the full
    // frame instead of one soft blob (the field's natural "cell size"
    // is about 1 unit, close to the size of the whole viewport in uv
    // space, so without this the pattern barely varies at all).
    vec2 p = (uv + normalize(toMouse + 0.0001) * pull) * 1.6;

    // ---- Domain warp (the technique that makes this look "liquid") ----
    // Layer 1: sample fbm at two offset points to build a 2D
    // "distortion vector" q, which itself drifts over time.
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t),
      fbm(p + vec2(5.2, 1.3) - t)
    );

    // Layer 2: feed that distortion back into another fbm sample,
    // offset again — this double-warp is what produces the veiny,
    // marbled look instead of plain rolling hills of noise.
    vec2 r = vec2(
      fbm(p + 1.4 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(p + 1.4 * q + vec2(8.3, 2.8) + 0.126 * t)
    );

    // Final scalar field: how "inked" this pixel is.
    float f = fbm(p + r);

    // ---- Color from the field ----
    vec3 color = palette(f + 0.15 * length(q));

    // Thin bright "glint" band where the field crosses a threshold —
    // gives the impression of light catching a raised vein of metal.
    float glint = smoothstep(0.55, 0.58, f) - smoothstep(0.58, 0.62, f);
    color += glint * vec3(0.9, 0.75, 0.4) * 0.6;

    // ---- Vignette ----
    // Darkens the edges (and especially the lower area, where the
    // headline sits) so overlaid text stays readable regardless of
    // what the shader is doing underneath at that moment. Uses mix()
    // rather than a plain multiply so edges dim toward a floor value
    // instead of crushing all the way to pure black.
    float vignette = smoothstep(1.1, 0.2, length(uv));
    float bottomShade = smoothstep(-0.9, 0.3, -uv.y);
    color *= mix(0.4, 1.0, vignette);
    color *= mix(1.0, 0.55, bottomShade);

    // Brightness floor: guarantees there's always faint visible detail
    // rather than any region reading as flat, dead-black.
    color = max(color, vec3(0.02, 0.017, 0.014));

    // ---- Grain ----
    // A tiny amount of per-pixel noise breaks up color-banding on the
    // smooth gradients and adds a subtle physical, printed texture.
    float grain = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.035;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;