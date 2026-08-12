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

- HUB: procedural house, five persistent locate signals, touch/mouse orbit with
  constrained pitch, inertia, and automatic-orbit resume
- APPROACH: selected-signal camera framing, continuous surface texture morph,
  and an aperture-style transition into the house
- OBSERVATION: signal-relative image/video/particle space, guided typewriter
  sequence, then touch-driven text, image, and video exploration
- RETURNING: single continuous camera curve to the hub with complete media and
  interaction-state reset
- English/Japanese switching without reload
- 90-second inactivity return
- landscape, safe-area, touch-target, reduced-motion support
- generated service worker and local precache for offline exhibition use

The visual source images are retained in `references/`. Optimized runtime
derivatives are in `public/assets/`.
