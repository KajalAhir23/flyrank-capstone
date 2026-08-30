# Ink Signature — FE-AA3: A Fullscreen Shader Hero

A fullscreen WebGL fragment shader hero: dark, metallic ink veins that slowly
drift and warp across the canvas, visibly bending toward the cursor like a
ferrofluid reacting to a magnet. Built as a literal pun on "signature" — the
shader itself is styled like flowing ink, with the name set in an italic
serif over it.

**Live URL:** https://flyrank-capstone-ify8.vercel.app/

## Reduced-motion / perf fallback (one-liner)

If `prefers-reduced-motion` is set, no `<canvas>` or WebGL context is created
at all — the component renders a plain CSS gradient using the same
ink → copper → gold palette instead, so there's zero animation and zero GPU
cost for that audience.

## How it works (shader walkthrough)

The full source lives in `lib/shaders.ts`, with comments inline. Summary of
each block, for a mentor walkthrough:

1. **Vertex shader** — draws a single triangle big enough to cover the whole
   viewport (corners get clipped off-screen). Cheaper than a quad because it
   needs 3 vertices and no index buffer instead of 4+index data for 2
   triangles.

2. **`hash(p)`** — turns a 2D point into a chaotic-looking single float.
   Deterministic, not truly random, but that's what seeds noise functions.

3. **`noise(p)`** — value noise: smoothly interpolates between hashed values
   at the 4 corners of a grid cell (with a smoothstep-style ease curve), so
   you get smooth blobs instead of static.

4. **`fbm(p)`** (fractal Brownian motion) — layers 5 octaves of that noise,
   each half the size and half the strength of the last, to build up
   organic, marble-like detail instead of one flat noise blob. This is the
   standard technique for "natural-looking" procedural texture.

5. **Domain warp** — the technique that makes the result look liquid rather
   than like plain rolling noise. It samples `fbm` twice to build a 2D
   offset vector `q`, then feeds `q` back in as an offset to a *second*
   round of `fbm` sampling (`r`), and finally samples once more using both
   `q` and `r`. Each layer distorts the coordinate space the next layer
   reads from — this is Inigo Quilez's well-known domain-warp pattern
   (public GLSL technique, not copied code; re-derived and re-tuned here).

6. **Mouse pull** — before any of the warping happens, the sampling
   coordinate is nudged toward the cursor, scaled by how close the current
   pixel is to it (`smoothstep` falloff). This is what makes the ink
   visibly "lean" toward wherever the cursor is, like a magnet under the
   canvas.

7. **`palette(t)`** — Inigo Quilez's cosine-palette formula, tuned by hand to
   sweep through ink-black → copper → antique gold instead of the usual
   rainbow demo values.

8. **Glint band** — a thin `smoothstep` ridge around one threshold of the
   noise field, tinted warm gold, to fake light catching a raised vein of
   metal.

9. **Vignette + bottom shade** — darkens the edges and especially the lower
   third of the frame (where the name/role text sits), so the overlaid text
   stays legible regardless of what the shader is doing at that moment —
   contrast is treated as part of the shader, not left to chance.

10. **Grain** — a tiny per-pixel hash-based dither added at the very end, to
    break up color banding on the smooth gradients.

## Uniforms used

- `u_resolution` — canvas size in physical pixels, used to normalize
  coordinates and correct for aspect ratio.
- `u_time` — drives the slow ambient drift of the ink field.
- `u_mouse` — cursor position in the same coordinate space, used for the
  ferrofluid pull effect.

All three of the assignment's core uniforms are used (only two were
required).

## Shipping responsibly

- **`devicePixelRatio` capped at 2** in `resize()` — rendering at native 3x
  resolution on a high-end phone burns GPU for a difference nobody can see.
- **Tab-visibility pause** — the render loop is fully cancelled via
  `cancelAnimationFrame` when `document.hidden` is true (Page Visibility
  API), and resumes automatically when the tab is foregrounded again. No
  wasted frames on a backgrounded tab.
- **Reduced-motion fallback** — see above; a completely separate, WebGL-free
  code path.
- **No 3D/shader library dependency** — raw WebGL1 (`gl_FragColor`, no
  `#version 300 es`) instead of Three.js/R3F, since the assignment only
  needs a single fullscreen fragment shader. Keeps the bundle at ~91 kB
  First Load JS (`next build` output) rather than paying for a 3D engine's
  scene graph, camera, and renderer abstractions this project doesn't use.

## What I'd add with more time

- A subtle secondary "trail" buffer (render-to-texture, feedback loop) so
  the ink visibly remembers recent cursor movement for a second or two,
  rather than reacting only to the current frame's position.
- Click/tap "ripple" impulse that briefly intensifies the pull at the touch
  point, for a more game-like interaction on mobile.
- Expose the palette as a small set of CSS custom properties translated
  into uniforms, so the hero could be reused with a different accent
  palette elsewhere in the capstone without touching the GLSL.

## Stack

Next.js 14 (App Router) · TypeScript · raw WebGL1 (no shader/3D library)

## Local dev

```bash
npm install
npm run dev
```
