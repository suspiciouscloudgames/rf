# Layers of Observation Prototype

A touch-first 3D exhibition prototype built from
`touch_3d_web_simulation_prototype_spec.md`.

## Run locally

```bash
npm install
npm run dev
```

Production and offline-capable PWA build:

```bash
npm run build
npm run preview
```

## Implemented flow

- HUB: procedural house, ambient movement, touch signal
- APPROACH: scripted position/target/FOV camera interpolation
- OBSERVATION: local image and H.264 video planes, typewriter narration,
  sequence progress, glitch treatment
- RETURNING: two-leg camera return and complete media/state reset
- English/Japanese switching without reload
- 90-second inactivity return
- landscape, safe-area, touch-target, reduced-motion support
- generated service worker and local precache for offline exhibition use

The visual source images are retained in `references/`. Optimized runtime
derivatives are in `public/assets/`.
