# Touch-Based 3D Web Simulation Prototype Specification

## 0. Document Purpose

This document defines the implementation requirements for a prototype of a touch-based 3D web simulation intended for an exhibition environment.

The prototype should prioritize:

- stable tablet performance
- clear three-stage camera progression
- continuous visual motion
- touch-first interaction
- English / Japanese localization
- modular content replacement
- easy iteration in Codex
- offline-capable exhibition deployment

This prototype is not a conventional website. It should feel like a continuous interactive 3D observation interface.

---

# 1. Project Overview

## Project Type

Interactive 3D web simulation / media art prototype.

## Primary Device

- touch-based tablet
- landscape orientation
- approximately 10–13 inch display
- no keyboard or mouse required
- intended for kiosk / fullscreen exhibition use

## Languages

- English
- Japanese

Language should be switchable without reloading the application.

## Core Experience

The experience has three main stages:

```text
HUB
  ↓
APPROACH
  ↓
OBSERVATION
  ↓
RETURN HOME
```

The entire experience should happen inside one continuous 3D scene.

Do not implement each stage as a separate web page.

---

# 2. Recommended Technical Stack

Use the following stack unless there is a strong implementation reason not to.

```text
React
Vite
Three.js
React Three Fiber
Zustand
HTML/CSS UI overlay
```

Optional:

```text
@react-three/drei
@react-three/postprocessing
vite-plugin-pwa
```

## Rendering

Primary renderer:

```text
WebGL
```

Target:

```text
60 FPS preferred
30 FPS minimum
```

## Deployment

The final prototype should be buildable as a static web application.

Preferred deployment model:

```text
PWA / offline-capable static build
```

The app should continue working if the exhibition network connection is unavailable.

---

# 3. Core Design Principle

The experience should feel like an observation system rather than a conventional website.

Avoid:

- page transitions
- standard modal windows
- excessive navigation menus
- free orbit controls
- pinch zoom
- drag-to-rotate 3D model viewer behavior
- UI-heavy dashboard aesthetics

Prefer:

- slow continuous environmental movement
- subtle observation markers
- scripted camera movement
- sparse interface elements
- image, video, noise and scan-like visual layers

---

# 4. Scene State Machine

Implement a central state machine.

Required states:

```ts
type ExperienceState =
  | "loading"
  | "hub"
  | "approach"
  | "observation"
  | "returning";
```

Also track:

```ts
currentObservationId
language
sequenceProgress
isTransitioning
isAudioEnabled
lastInteractionTime
```

Recommended global state:

```ts
interface ExperienceStore {
  state: ExperienceState;
  currentObservationId: string | null;
  language: "en" | "ja";
  sequenceProgress: number;
  isTransitioning: boolean;
}
```

Use Zustand or an equally simple centralized state solution.

---

# 5. Scene Structure

Suggested component structure:

```text
src/
  app/
    App.tsx

  scene/
    ExperienceCanvas.tsx
    World.tsx
    House.tsx
    ObservationLayer.tsx
    Environment.tsx

  camera/
    CameraController.tsx
    cameraPresets.ts

  interaction/
    Hotspot.tsx
    InteractionController.tsx

  sequence/
    SequenceController.tsx
    sequenceData.ts

  effects/
    NoiseEffect.tsx
    GlitchEffect.tsx
    PixelEffect.tsx

  ui/
    Interface.tsx
    LanguageSwitcher.tsx
    NarrationPanel.tsx
    ProgressBar.tsx
    HomeButton.tsx

  store/
    experienceStore.ts

  content/
    observations.json

  locales/
    en.json
    ja.json

  assets/
    models/
    images/
    videos/
    audio/
```

Keep the 3D scene system and HTML UI system separated.

---

# 6. Rendering Architecture

Use:

```text
Three.js / React Three Fiber
```

for:

- 3D house
- observation objects
- image planes
- video planes
- particles
- shaders
- camera movement
- environmental effects

Use regular HTML/CSS overlay for:

- buttons
- language selector
- narration text
- progress bar
- exhibition controls

Do not render Japanese or English narration inside the Three.js scene unless strictly necessary.

---

# 7. Stage 1 — HUB

Reference:

```text
01_hub.png
```

## Required Visual Behavior

The central visual element is a house-shaped 3D model.

The camera observes the house from an external third-person viewpoint.

The house should slowly rotate at all times.

Suggested baseline:

```text
rotationY ≈ 0.5–1.0 degrees / second
```

The rotation should feel subtle and continuous.

Optional subtle vertical movement:

```ts
positionY = baseY + Math.sin(time * 0.15) * 0.01;
```

Avoid making the house feel like a commercial product turntable.

Small irregularity in rotation speed is acceptable.

## HUB Camera

Use a predefined camera preset.

Example only:

```ts
{
  position: [0, 1.8, 5.5],
  target: [0, 0.3, 0],
  fov: 38
}
```

Actual values should be editable in one configuration file.

## HUB Interaction

The house contains one or more observation entry points.

Each observation entry point should be represented by a subtle hotspot / signal marker.

The hotspot should not look like a normal web button.

Preferred visual vocabulary:

- thin orbital ring
- wireframe marker
- faint pulse
- tracking point
- small glowing signal
- concentric lines

Tapping a hotspot starts Stage 2.

---

# 8. Stage 2 — APPROACH

References:

```text
02_1step.png
02_1step_another.png
```

## Trigger

User taps an observation hotspot from the HUB.

## Camera Behavior

The camera slowly moves toward a specific surface region of the house.

The camera transition must interpolate:

```text
position
target
field of view
```

Do not only move camera position.

Suggested transition duration:

```text
2.5–4.0 seconds
```

Suggested easing:

```text
easeInOutCubic
```

or:

```text
easeInOutSine
```

During the transition:

- disable repeated input
- keep the house moving
- keep environmental motion active

## Important Requirement

The house must continue to rotate while the camera moves.

The world should not freeze during camera transitions.

Suggested house rotation speed:

```text
HUB:
0.5–1.0 deg/sec

APPROACH:
0.15–0.35 deg/sec
```

The slowdown may be gradual.

## APPROACH Camera Preset

Example:

```ts
{
  position: [1.1, 1.1, 2.4],
  target: [0.3, 0.5, 0],
  fov: 30
}
```

## APPROACH Interaction

After the camera reaches the surface:

- show or emphasize a second observation marker
- allow the user to tap again
- tapping begins Stage 3

The second interaction should feel like "looking closer" rather than clicking a generic Continue button.

---

# 9. Stage 3 — OBSERVATION

References:

```text
03_2step.png
03_2step_anather.png
3step_1.png
3step_2.png
3step_3.png
```

## Trigger

User taps the observation marker while in APPROACH state.

## Camera Behavior

The camera moves closer again.

The framing should suggest:

- looking through the house surface
- entering a hidden visual layer
- observing an interior signal
- penetrating an image / memory / data layer

It does not need to behave like realistic architectural navigation.

Suggested example:

```ts
{
  position: [0.6, 0.6, 0.9],
  target: [0.4, 0.3, 0],
  fov: 24
}
```

Values must remain editable.

---

# 10. Observation Layer

Content that is invisible in HUB and APPROACH may become visible in OBSERVATION.

Supported content types:

```text
3D object
image plane
video plane
sprite
particle system
shader effect
distortion layer
animated texture
glitch layer
```

Create the Observation Layer as a modular content container.

Example:

```text
Observation 01
  ├─ 3D object
  ├─ image plane
  ├─ particle effect
  └─ narration

Observation 02
  ├─ video plane
  ├─ RGB distortion
  └─ narration
```

The prototype only needs enough content to demonstrate the system.

---

# 11. Visual Direction

The prototype should support an intentionally imperfect visual language.

Useful visual qualities:

- archival image
- low resolution
- CRT-like texture
- image scan artifact
- RGB channel separation
- glitch
- pixel noise
- degraded texture
- overexposure
- incorrect color
- imperfect 3D scan
- flat image mixed with volumetric 3D

Avoid making all content look clean, glossy or photorealistic.

The 3D house can remain relatively simple.

Observation content may be more visually unstable.

---

# 12. Image and Video Content

## Images

Preferred format:

```text
WebP
```

Use image planes inside the 3D scene where needed.

## Video

Preferred format:

```text
MP4
H.264
```

Recommended prototype resolutions:

```text
1280×720
1024×576
```

Do not use 4K video for this prototype.

Implementation pattern:

```text
HTMLVideoElement
  ↓
THREE.VideoTexture
  ↓
mesh / plane
```

Videos must be local assets.

---

# 13. Browser Media Unlock

Tablet browsers may block autoplay.

On the first user touch:

```text
resume AudioContext
initialize video playback permissions
prepare muted video
```

The first interaction may be used to unlock media playback.

Do not depend on autoplay before any user input.

---

# 14. Narration System

Narration begins automatically after entering OBSERVATION.

The narration appears as an HTML overlay, preferably on the right side of the screen.

Required:

- automatic text playback
- typewriter animation
- English / Japanese content
- progress indication

## Typewriter Behavior

Recommended base speed:

```text
25–45 ms / character
```

Optional punctuation delay:

```text
space: 20 ms
comma: 100–140 ms
period: 180–260 ms
```

The typewriter speed should be configurable.

## Narration Layout

Avoid a conventional scrollable article.

Prefer a restrained block of text.

The user should be able to understand that the narration is progressing automatically.

---

# 15. Progress Bar

Stage 3 requires a progress indicator.

Preferred visual form:

```text
thin horizontal line
```

Example:

```text
━━━━━━━━━━────────
```

Avoid a large commercial UI progress bar.

Progress should preferably be calculated by sequence time:

```ts
progress = elapsedTime / totalDuration;
```

This allows narration, video and visual events to stay synchronized.

---

# 16. Sequence System

Each observation should support a timeline.

Example data structure:

```json
{
  "id": "observation-01",
  "duration": 45,
  "events": [
    {
      "time": 0,
      "action": "startNarration"
    },
    {
      "time": 7,
      "action": "showImage"
    },
    {
      "time": 14,
      "action": "playVideo"
    },
    {
      "time": 25,
      "action": "enableGlitch"
    }
  ]
}
```

The prototype should implement at least:

```text
startNarration
showObject
hideObject
playVideo
enableEffect
disableEffect
```

Sequence content must be editable without rewriting the main application structure.

---

# 17. Return Home

A Home button must be visible during OBSERVATION.

When tapped:

```text
OBSERVATION
  ↓
RETURNING
  ↓
HUB
```

Do not instantly teleport the camera.

The camera should visually move back out of the close observation state.

Preferred return sequence:

```text
Observation camera
  ↓
Approach camera
  ↓
Hub camera
```

or use equivalent waypoints.

Suggested duration:

```text
3–5 seconds total
```

During RETURNING:

- disable interaction
- hide narration gradually
- stop or fade observation-specific media
- preserve environmental motion

---

# 18. Camera System

Use one actual camera.

Do not create multiple active Three.js cameras unless required.

Store reusable camera presets instead.

Example:

```ts
export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  duration: number;
}
```

Example preset collection:

```ts
export const cameraPresets = {
  hub: {...},
  approach01: {...},
  observation01: {...},
  approach02: {...},
  observation02: {...}
}
```

Use interpolated camera movement.

The camera controller should be isolated from world animation.

---

# 19. Continuous World Motion

This is a core requirement.

The following systems must remain independent:

```text
camera animation
house animation
observation animation
UI animation
sequence timeline
```

Camera transitions must not stop the house rotation or other subtle ambient movement.

Avoid using React state updates every frame.

Use `useFrame` and refs for rapidly changing values.

---

# 20. Touch Interaction

The prototype is touch-first.

Minimum interactive hit area:

```text
44–48 CSS px
```

Recommended:

```text
48–64 CSS px
```

The visible icon may be smaller than its touch hitbox.

## Supported Gestures

Primary:

```text
tap
```

Optional:

```text
very subtle drag-based camera parallax
```

Do not implement by default:

```text
pinch zoom
free orbit
free pan
two-finger navigation
```

The user should experience a directed sequence rather than a 3D model viewer.

---

# 21. Optional Parallax

If implemented, HUB may support extremely small camera parallax in response to drag.

Example maximum:

```text
horizontal: ±3 degrees
vertical: ±2 degrees
```

When the touch ends, smoothly return to the base camera alignment.

This is optional for the first prototype.

---

# 22. Localization

Do not hard-code interface strings.

Use:

```text
src/locales/en.json
src/locales/ja.json
```

Example:

```json
{
  "home": "Return Home",
  "lookCloser": "Look closer",
  "observation01": {
    "title": "Observation 01",
    "text": "I was born to listen..."
  }
}
```

Japanese equivalent should exist in `ja.json`.

The narration system must restart or correctly update when language changes.

---

# 23. Typography

English and Japanese may require separate typography settings.

Allow per-language:

```text
font family
font size
line height
letter spacing
```

Suggested default multilingual font:

```text
Noto Sans JP
```

or another locally bundled font with English and Japanese support.

Avoid relying on remote font loading during exhibition.

---

# 24. Asset Guidelines

## 3D House

Format:

```text
GLB / glTF
```

Prototype target:

```text
30k–80k triangles preferred
150k triangles maximum unless tested
```

Preferred file size:

```text
2–10 MB
```

## Textures

Preferred working size:

```text
2048×2048
```

Use 4096 textures only if visually necessary.

Preferred compression:

```text
KTX2 / Basis Universal
```

if available.

Otherwise use optimized WebP textures.

---

# 25. Performance Requirements

## Frame Rate

```text
Target: 60 FPS
Minimum acceptable: 30 FPS
```

The prototype should be tested on the real target tablet.

## Pixel Ratio

Limit device pixel ratio.

Example:

```ts
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 1.5)
);
```

Do not automatically render at full Retina / high-DPI resolution.

## Shadows

Keep shadows minimal.

Preferred:

```text
0–1 realtime shadow-casting light
```

Consider baked AO or texture-based shading.

## Lighting

Recommended simple setup:

```text
ambient / hemisphere light
1 key directional light
emissive materials where needed
```

---

# 26. Post-Processing

Possible effects:

- noise
- vignette
- mild chromatic aberration
- RGB shift
- pixelation
- glitch
- bloom

Do not enable many fullscreen effects simultaneously.

Prefer lightweight real-time effects.

Use pre-rendered video or image distortion for heavy effects.

---

# 27. Idle Reset

The exhibition application must recover automatically if a visitor leaves mid-experience.

Default inactivity timeout:

```text
90 seconds
```

After timeout:

```text
return to HUB
reset sequence
stop observation video
reset narration
restore initial interaction state
```

Make timeout configurable.

---

# 28. Loading State

Required state:

```text
loading
```

Preload:

- house GLB
- essential textures
- localization files
- first observation content

The application should not enter HUB before critical assets are ready.

Loading UI can remain visually minimal.

Avoid a generic large percentage indicator unless needed.

---

# 29. Offline / Exhibition Reliability

The prototype should be able to run without an active network connection after installation or initial caching.

Requirements:

- all assets stored locally
- no CDN dependency for critical runtime resources
- no remote video streaming
- local fonts
- local localization files
- no required external API

Optional:

```text
PWA service worker
```

---

# 30. Kiosk Expectations

The application should be designed for:

```text
fullscreen
landscape
touch-only
fixed tablet device
```

Avoid browser-dependent UI.

No external links should be required during the experience.

---

# 31. Prototype Content Requirement

For the first functional prototype, implement:

## One HUB

- one house model
- continuous slow rotation
- background environment
- one observation hotspot

## One APPROACH state

- camera transition
- continued house movement
- second interaction marker

## One OBSERVATION state

- second camera transition
- at least one hidden image or 3D object appears
- one sample video plane
- typewriter narration
- progress bar
- Home button
- one visual effect

## Return

- animated return to HUB
- complete state reset

Do not build multiple observations until this flow is stable.

---

# 32. Prototype Interaction Flow

```text
APP LOAD

↓

LOADING

↓

HUB
house slowly rotating
hotspot visible

↓

USER TAPS HOTSPOT

↓

APPROACH
camera moves toward house
house keeps moving

↓

CAMERA ARRIVES
second marker becomes available

↓

USER TAPS SECOND MARKER

↓

OBSERVATION
camera moves closer
hidden content appears

↓

NARRATION STARTS
typewriter animation
progress bar advances
visual sequence plays

↓

USER TAPS HOME
or idle timeout occurs

↓

RETURNING
camera exits observation
media stops
UI fades out

↓

HUB
initial state restored
```

---

# 33. Prototype Acceptance Criteria

The prototype is considered successful when all conditions below are met.

## Camera

- camera has three clearly distinct views
- transitions are smooth
- FOV, target and position interpolate
- no abrupt teleporting
- return animation works

## World

- house rotates continuously
- house does not freeze during camera movement
- observation content appears only at the intended stage

## Touch

- all primary interactions work with single touch
- controls are large enough for tablet use
- accidental double input is blocked during transitions

## Narration

- typewriter effect works
- English and Japanese both work
- progress bar reflects sequence progress

## Media

- local image loads
- local video plays after interaction unlock
- video stops or resets when returning home

## Reliability

- app can reset to HUB
- idle reset works
- no obvious memory leak after repeated loops
- scene can be replayed multiple times
- tablet maintains acceptable frame rate

---

# 34. Development Priorities

Implement in this order.

## Phase 1 — Core Structure

1. Vite + React project
2. R3F canvas
3. placeholder house model
4. house rotation
5. global state machine

## Phase 2 — Camera

6. HUB camera preset
7. APPROACH preset
8. OBSERVATION preset
9. animated camera controller
10. animated return

## Phase 3 — Interaction

11. first hotspot
12. second hotspot
13. transition input lock
14. Home button

## Phase 4 — Observation

15. hidden observation layer
16. sample image
17. sample 3D object
18. sample video
19. simple glitch / noise effect

## Phase 5 — Narration

20. English narration
21. Japanese narration
22. typewriter animation
23. progress bar
24. language switch

## Phase 6 — Exhibition Stability

25. idle reset
26. media reset
27. preload state
28. pixel ratio optimization
29. fullscreen / PWA setup
30. real tablet performance test

---

# 35. Non-Goals for First Prototype

Do not spend time on:

- user accounts
- backend
- database
- analytics
- multiplayer
- procedural world generation
- advanced physics
- complex collision
- realistic architecture navigation
- free camera controls
- multiple complete observation stories
- heavy post-processing
- 4K video

The goal is to validate the exhibition interaction language first.

---

# 36. Implementation Notes for Codex

When generating code:

1. Keep components small and modular.
2. Keep camera positions in configuration files.
3. Keep observation content in data files.
4. Keep language strings outside components.
5. Do not call React state setters every frame.
6. Use refs and `useFrame` for continuous animation.
7. Prevent user input while camera transitions are active.
8. Dispose Three.js resources when components unmount.
9. Pause and reset video elements when leaving Observation.
10. Do not introduce a backend.
11. Avoid unnecessary dependencies.
12. Optimize for Safari / Chrome tablet environments.
13. Keep all prototype assets replaceable.
14. Use placeholder assets if final art assets are unavailable.
15. Prefer deterministic scripted transitions over physics.

---

# 37. Visual Reference Mapping

Use the provided reference files as mood / composition references.

```text
01_hub.png
→ HUB
→ distant 3D subject
→ orbital / observation interface
→ sparse UI

02_1step.png
02_1step_another.png
→ APPROACH
→ close surface observation
→ large object partially leaving frame
→ continuing environmental motion

03_2step.png
03_2step_anather.png
→ OBSERVATION
→ close framing
→ text narration
→ progress UI
→ hidden observational content

3step_1.png
3step_2.png
3step_3.png
→ visual treatment references
→ archival / CRT
→ unstable 3D object
→ RGB split
→ scan / glitch / pixel artifacts
```

Do not reproduce the reference images literally.

Use them to guide interaction rhythm, spatial framing and visual texture.

---

# 38. Final Prototype Goal

The finished prototype should communicate the following experience:

> The visitor starts outside a slowly moving house-like object, identifies a subtle signal, moves closer to its surface, then penetrates another visual layer where hidden images, objects, video and narration begin to unfold. The visitor can return to the original exterior view at any time.

The key quality is continuity.

The experience should feel like moving through layers of observation inside one living interface, not navigating between separate screens.
