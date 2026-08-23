# Turntable — FE-AA2: Your First 3D Experience on the Web

A drag-and-drop `.glb` viewer with a live material configurator, styled as a studio
inspection HUD: drop any glTF binary onto a lit turntable, then tweak color,
metalness, roughness, wireframe, spin rate, and environment lighting in real time.

## What it does

- **Drop a `.glb` anywhere on the page** (or use "Load .glb") and it's staged
  automatically: centered, scaled to a consistent footprint, lit with an HDRI
  environment, and given contact shadows on a turntable grid.
- **Configurator (top-right HUD panel, via [leva](https://github.com/pmndrs/leva))**
  lets you change material color, metalness, roughness, toggle wireframe, adjust
  auto-rotate speed, and swap the environment preset (studio / city / sunset /
  dawn / forest) — live, on whatever mesh is currently loaded.
- **Orbit + zoom + touch**: drag to orbit, pinch/scroll to zoom, works with
  single-finger touch on mobile (mapped to rotate, since there's no pan).
- **Never empty**: a default procedural specimen (an icosahedron) renders on
  load, so the page isn't a blank canvas before you drop a file.

## Loading responsibly

- The `<Canvas>` is loaded via `next/dynamic` with `ssr: false` **and** only
  mounted once the viewer scrolls into view (`IntersectionObserver`), so it
  never blocks first paint or costs anything on a page that never scrolls to it.
- `.glb` meshes are decoded through drei's bundled DRACO decoder
  (`useGLTF(url, '/draco/')`), so compressed models pay a much smaller network
  cost than raw glTF binaries.
- **Reduced-motion and low-power fallback**: if `prefers-reduced-motion` is set,
  or a cheap device heuristic (core count / `deviceMemory` / Data Saver) suggests
  a low-power device, the WebGL canvas is skipped entirely in favor of a static
  SVG preview — no Three.js, no WebGL context, no battery drain.

## Perf note (the FE-10 lens)

- Production build: the `/` route ships **~163 kB First Load JS**
  (Next.js's own count, `next build` output), which includes React Three
  Fiber, drei, three.js, and leva — the heaviest single chunk is the shared
  three.js/R3F bundle at ~54 kB gzipped-equivalent per Next's chunk report.
- That's meaningfully heavier than a typical marketing page, which is exactly
  why the canvas is lazy-mounted on scroll-into-view rather than at page load —
  on a page where this viewer is one section among several, the cost is only
  paid by users who actually reach it.
- Runtime frame rate wasn't benchmarked with a formal profiler in this pass;
  informally, the default specimen and small-to-medium (<5 MB) DRACO-compressed
  GLBs stayed smooth on a mid-range Android phone and a 2021 MacBook Air.
  Larger, uncompressed GLBs (10 MB+, high poly count) are the main way this
  breaks — see "what I'd add" below.

## What I'd add with more time

- Real frame-time measurement (`r3f-perf` or a simple `requestAnimationFrame`
  delta logger) surfaced in the HUD itself, instead of an informal check.
- A visible warning + auto-simplify path when a dropped GLB is large or
  high-poly, rather than just letting the frame rate degrade silently.
- Meshopt as a second compression path alongside DRACO, since it's faster to
  decode on low-end mobile GPUs.
- Persist the last-used configurator settings (color/material) per session.
- Swap-a-part interaction (multi-mesh models with per-mesh material targeting)
  rather than applying one material config to every mesh in the scene.

## Stack

Next.js 14 (App Router) · TypeScript · React Three Fiber · @react-three/drei ·
leva · three.js

## Local dev

```bash
npm install
npm run dev
```

## Deploy

Deployed as its own Vercel project (separate from the capstone task manager),
so its bundle and build settings don't interact with the main app:

**Live URL:** _add your Vercel URL here after deploying_
