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

- HUB: a fully transparent house shell, five persistent locate signals, touch/mouse orbit with
  constrained pitch, inertia, automatic-orbit resume, and a full-screen video
  background
- APPROACH: selected-signal camera framing and progressive reveal of a
  procedurally modeled interior
- OBSERVATION: object-specific camera focus, fully materialized furniture and
  architecture, guided typewriter sequence, then touch-driven exploration
- RETURNING: single continuous camera curve to the hub with complete media and
  interaction-state reset
- English/Japanese switching without reload
- 90-second inactivity return
- landscape, safe-area, touch-target, reduced-motion support
- generated service worker and local precache for offline exhibition use

Runtime media is stored in `public/assets/`; the interior itself uses no
reference-image planes.
