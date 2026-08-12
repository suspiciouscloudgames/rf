# Touch Observation Prototype — Additional Interaction Design

## 0. Purpose and terminology

This document extends `touch_3d_web_simulation_prototype_spec.md` for the
requested interaction revision.

Stage names used below:

| Product term | Existing code state | Meaning |
| --- | --- | --- |
| 1step | `hub` | Exterior exploration and signal selection |
| 2step | `approach` | Close inspection of one selected surface signal |
| 3step | `observation` | Entered observation space and its content |

The main design principle remains continuity. Objects should change state,
material, scale, and meaning without being unmounted and recreated in front of
the visitor.

## 1. Revised experience flow

```text
LOADING
  ↓
1STEP / HUB
  ├─ drag: constrained manual orbit
  ├─ idle: slow automatic orbit resumes
  └─ tap one of five signals
          ↓
TRANSITION / HUB_TO_APPROACH
  ├─ selected signal remains visible
  ├─ non-selected signals recede
  └─ house material morph begins
          ↓
2STEP / APPROACH
  ├─ selected signal remains actionable
  ├─ Home is always available
  └─ tap the selected signal
          ↓
TRANSITION / ENTER_OBSERVATION
  ├─ camera passes through a surface aperture
  ├─ exterior world morphs into observation world
  └─ selected signal becomes the entry aperture
          ↓
3STEP / OBSERVATION / GUIDED
  └─ automatic audiovisual sequence
          ↓ sequence completes
3STEP / OBSERVATION / EXPLORE
  ├─ tap text signal
  ├─ tap image signal
  ├─ tap video signal
  └─ Home is always available
          ↓
TRANSITION / RETURN_TO_HUB
  └─ one continuous curve through the approach area, without stopping
          ↓
1STEP / HUB
```

## 2. State and data model revision

Do not encode every animation phase as a separate page-like state. Keep the
spatial stage and transition progress separate.

```ts
type ExperienceStage = 'loading' | 'hub' | 'approach' | 'observation'

type TransitionKind =
  | 'none'
  | 'hubToApproach'
  | 'approachToObservation'
  | 'returnToHub'

type ObservationMode = 'guided' | 'explore'

interface ExperienceStore {
  stage: ExperienceStage
  transition: TransitionKind
  transitionProgress: number
  selectedSignalId: SignalId | null
  observationMode: ObservationMode
  selectedExploreItemId: string | null
  orbitInputEnabled: boolean
  sequenceProgress: number
  language: 'en' | 'ja'
  lastInteractionTime: number
}
```

Important rules:

- `stage` represents where the visitor is, not whether the camera is moving.
- `transitionProgress` is a ref-updated render value. It should not cause a
  React render every frame.
- `selectedSignalId` is set before the first camera movement begins and remains
  set through 2step and 3step.
- Returning completes by atomically resetting the selected signal, observation
  mode, sequence, media, materials, and orbit state.
- Input locking is action-specific. Camera transitions block selection and
  orbit, but the Home action remains available in 2step and 3step.

## 3. Five locate signals

### 3.1 Data definition

Replace the single hard-coded beacon with five data-driven signals. All five
are selectable and use the same component implementation.

```ts
interface ObservationSignal {
  id: 'signal-01' | 'signal-02' | 'signal-03' | 'signal-04' | 'signal-05'
  observationId: string
  anchor: [number, number, number]       // house-local position
  normal: [number, number, number]       // house-local outward normal
  approachDistance: number
  observationDepth: number
  accent: string
  content: {
    titleKey: string
    hintKey: string
  }
}
```

Proposed initial distribution:

| Signal | Surface | Role |
| --- | --- | --- |
| 01 | upper front window | primary warm transmission |
| 02 | lower front wall | low-frequency archive trace |
| 03 | right side wall | moving-image trace |
| 04 | roof edge | atmospheric / sound trace |
| 05 | left rear edge | unstable hidden trace |

Final positions must be tuned against the real GLB. The placeholder house may
use approximate anchors, but the data structure should not change when the GLB
is replaced.

### 3.2 Persistent signal lifecycle

All signals are mounted once under the rotating house root.

- HUB: all five are visible. Their pulses are phase-offset to avoid a uniform
  blinking pattern.
- HUB → APPROACH: the selected signal never disappears. It smoothly increases
  in emphasis and its label changes from `Locate signal` to `Enter signal`.
- Non-selected signals fade to 10–20% opacity and disable hit testing. They are
  not unmounted.
- APPROACH: only the selected signal is prominent and actionable.
- APPROACH → OBSERVATION: the selected signal expands into the observation
  aperture and then dissolves into the 3step visual field.
- RETURN: it reverses from aperture to marker and rejoins the five-signal set.

This removes the current flicker caused by conditional rendering such as
`state === 'approach' && !isTransitioning`.

### 3.3 3D position and accessible HTML hit target

The visible marker belongs in the 3D scene so it rotates with the house. Its
touch target should be an HTML overlay projected from the same world position.

- Visible marker: Three.js ring, core, line, and emissive glow.
- Touch target: transparent 56–72 CSS px button.
- Each frame, project the marker world position to screen coordinates using the
  active camera.
- Hide the HTML target when the marker is behind the house or outside the
  camera frustum.
- The 3D and HTML parts share one stable signal ID.

## 4. Manual orbit in HUB

### 4.1 Gesture behavior

Manual orbit is available only in HUB when no transition is active.

- One-finger horizontal drag: camera azimuth around the house.
- One-finger vertical drag: limited elevation adjustment.
- No pinch zoom, pan, or free orbit.
- Horizontal range: continuous or clamped to ±160° from the initial view.
- Vertical range: approximately −8° to +18°.
- Drag sensitivity: about 0.12–0.18° per CSS pixel, tuned on the target tablet.
- Add light inertia for 350–600 ms after release.
- Automatic slow orbit pauses immediately on pointer down.
- Automatic orbit resumes 1.5–2.5 seconds after pointer release, blending its
  speed in over roughly one second.

### 4.2 Tap versus drag arbitration

Signals must remain easy to tap while orbit is enabled.

```text
pointer down on signal
  ↓
movement < 8 CSS px and duration < 500 ms → tap signal
movement ≥ 8 CSS px                         → orbit drag, cancel tap
```

Use pointer capture so the drag remains stable if the finger crosses a signal
or leaves its initial element.

### 4.3 Camera ownership

There is still one actual camera.

- `HubOrbitController` owns spherical azimuth/elevation while HUB is idle.
- `CameraTransitionController` takes ownership during transitions.
- On signal selection, the transition starts from the camera's exact current
  orbit pose. It must not snap back to the default HUB preset first.
- On return, the final HUB pose may either preserve the last orbit azimuth or
  return to the configured default. For exhibition consistency, the initial
  implementation should return to the default pose and then resume auto-orbit.

## 5. Signal-relative camera framing

The house continues its subtle rotation in all stages, so static world-space
camera targets are insufficient.

Each signal provides a local anchor and outward normal. Resolve them through the
house root every frame:

```ts
worldAnchor = house.localToWorld(signal.anchor)
worldNormal = signal.normal.transformDirection(house.matrixWorld)

approachPosition = worldAnchor + worldNormal * signal.approachDistance
approachTarget = worldAnchor
```

During HUB → APPROACH, smoothly update the destination from these live values.
This allows the selected marker to remain attached to the slowly moving house
instead of drifting away from the camera framing.

## 6. 2step house material transition

### 6.1 Visual intention

The house should still be recognizable, but it should stop feeling like a plain
physical model. The surface becomes a mysterious receiver containing latent
image information.

Recommended material layers:

1. Base material: existing neutral, rough exterior.
2. Mystery albedo: dark blue-green and charcoal variation.
3. Fine scan/noise mask: locally generated texture or lightweight shader noise.
4. Slow emissive veins around the selected signal.
5. Subtle normal disturbance and low-frequency color drift.
6. Window emission changes from warm static light to intermittent cool/amber
   transmission.

Avoid a hard texture swap. Use one shared material controller with a continuous
`surfaceMorph` uniform from 0 to 1.

```glsl
baseColor = mix(exteriorColor, mysteryColor, smoothstep(0.0, 1.0, surfaceMorph));
emission += signalField * surfaceMorph * pulse;
roughness = mix(0.92, 0.68, surfaceMorph);
```

### 6.2 Timing

Tie the texture transition to `hubToApproach` progress:

- 0–15%: keep the familiar HUB material.
- 15–70%: blend mystery texture, scan noise, and selected-signal emission.
- 70–100%: settle into the 2step material with only slow ambient fluctuation.

Returning reverses this morph over the complete return path, not in a separate
animation after the camera stops.

### 6.3 Asset and performance constraints

- Two 1024–2048 textures maximum for the base transition.
- Prefer WebP for albedo/masks and KTX2 later if the final GLB requires it.
- Reuse one material instance per material group; do not clone a material every
  frame or for every signal.
- Do not use a full-screen heavy post-processing stack for this step.

## 7. Always-available Home in 2step and 3step

Add the Home control as soon as HUB → APPROACH begins and keep it mounted until
returning completes.

- Visible during the HUB → APPROACH transition, APPROACH, APPROACH →
  OBSERVATION transition, guided observation, and explore observation.
- Minimum 48 CSS px high with safe-area margins.
- A Home tap cancels the current destination and starts `returnToHub` from the
  camera's current position and current material/visual morph values.
- Repeated Home taps are ignored once the return transition is active.
- Media fades immediately and resets when HUB is reached.

## 8. Natural entry into 3step

### 8.1 Entry aperture

The selected 2step signal becomes an aperture rather than disappearing.

1. The signal ring expands along the selected surface tangent.
2. A soft circular/irregular mask reveals depth behind the wall.
3. The wall locally darkens and becomes slightly translucent near the aperture.
4. Parallax layers appear inside the opening before the camera begins to cross
   the surface.
5. The camera moves through the aperture, not merely toward a closer static
   preset.

Use one of these lightweight implementations:

- Preferred: shader mask on the wall plus two or three parallax planes behind
  it.
- Fallback: a dark portal plane positioned slightly above the wall plus a
  depth tunnel; less geometrically exact but robust on tablets.

Stencil portals are not required for the first revision unless the real GLB
surface makes the mask solution impossible.

### 8.2 Camera path

Replace linear interpolation between two presets with a cubic Bézier or
Catmull–Rom curve resolved from the selected signal:

```text
P0 current approach camera
P1 slight lateral alignment with the signal normal
P2 just behind the surface aperture
P3 inside the observation field
```

Recommended duration: 3.2–4.2 seconds.

Camera treatment over the path:

- 0–35%: target tightens on the signal and FOV narrows slightly.
- 35–65%: pass the surface threshold; near clip may reduce carefully.
- 65–100%: FOV opens a little and the target shifts into the internal content
  field, creating the sensation that a space has opened behind the wall.
- Roll may change by at most 1–2°; avoid motion sickness.

The path endpoint and target are signal-specific so all five signals can lead
to different internal compositions without changing the controller.

## 9. 3step world transformation

3step should not look like the same house with a new plane placed in front of
it. Introduce a dedicated `ObservationWorld` that is mounted during preload but
initially invisible.

Transition channels driven from the same `observationMorph` value:

| Channel | Exterior | Threshold | Observation world |
| --- | --- | --- | --- |
| House | solid | local aperture / partial dissolve | silhouette or absent |
| Background | sparse black field | compressed darkness | archival spatial field |
| Fog | neutral black | denser near surface | signal-specific colored depth |
| Particles | small distant points | flow toward aperture | elongated scan/data traces |
| Color | warm neutral | desaturated | signal-specific limited palette |
| Image layers | hidden | appear behind aperture | distributed parallax planes |
| Video | paused/prepared | first frame visible | begins with guided sequence |
| UI | approach hint | fades/repositions | narration and sequence progress |

Reference mapping:

- `03_2step.png`: close framing and restrained information panel.
- `03_2step_anather.png`: image plane becoming spatial terrain.
- `3step_1.png`: CRT and archival moving image.
- `3step_2.png`: isolated high-intensity red object.
- `3step_3.png`: RGB-separated scan particles and unstable silhouette.

Per-signal visual profiles can be data-driven:

```ts
interface ObservationVisualProfile {
  palette: { background: string; fog: string; accent: string }
  particlePreset: 'scanRain' | 'drift' | 'rgbBlocks' | 'dust' | 'pulseField'
  apertureShape: 'circle' | 'verticalScan' | 'irregular'
  imageLayout: Array<ImageLayerConfig>
  effectSchedule: Array<SequenceEvent>
}
```

Keep the first implementation lightweight: at most three large transparent
planes, one particle system, one video texture, and one simple full-screen
effect active simultaneously.

## 10. Guided sequence followed by touch exploration

### 10.1 Modes

3step has two explicit modes:

#### `guided`

- Existing timed narration, video, object reveal, and progress behavior.
- Content touch markers remain invisible or non-interactive.
- Home remains available.

#### `explore`

- Starts automatically when `sequenceProgress === 1`.
- Progress bar resolves into a thin navigation line rather than disappearing.
- Show a restrained localized cue such as `Touch a trace to continue`.
- Reveal three to five spatial content signals.
- The visitor decides the viewing order and may revisit items.

### 10.2 Explore content types

Each observation supports additional content through data rather than custom
component logic.

```ts
interface ExploreItem {
  id: string
  type: 'text' | 'image' | 'video'
  anchor: [number, number, number]
  titleKey: string
  bodyKey?: string
  asset?: string
  thumbnail?: string
  duration?: number
}
```

Initial item set per signal:

- one text fragment;
- one still image with caption;
- one short local video segment;
- optional fourth mixed item after performance testing.

### 10.3 Presentation behavior

Avoid conventional centered modals.

- The selected spatial signal grows and draws a thin line toward a side panel.
- Text appears in the existing narration region.
- Images and video remain spatial planes where practical; captions use HTML.
- A second tap closes the item or selecting another item crossfades directly.
- Only one explore video may play at a time.
- Selecting text/image pauses explore video; closing or switching resets it.
- Completed items get a subtle visited state but remain selectable.
- Home is always visible and has priority over content interaction.

### 10.4 Idle reset

Any explore interaction refreshes `lastInteractionTime`. When the exhibition
idle timeout expires, close the active item, stop media, and start the seamless
return path. Do not abruptly replace the 3step world with HUB.

## 11. Seamless return to HUB

The current return uses two separately eased legs:

```text
observation → approach  (ease-out to zero velocity)
approach → hub          (ease-in from zero velocity)
```

This produces the visible pause at the approach waypoint.

Replace it with one curve and one time domain:

```text
P0 current camera position
P1 inside-surface exit control point
P2 approach-area control point
P3 HUB camera position
```

- Use cubic Bézier or Catmull–Rom interpolation.
- Parameterize approximately by arc length so motion speed does not visibly
  change near uneven control-point spacing.
- Apply easing only at the entire path's start and end.
- The approach-area point influences direction but is never a stopping point.
- Blend `observationMorph` and `surfaceMorph` back toward zero continuously
  along the same progress value.
- Keep the house's ambient movement active.

Suggested total return duration: 3.8–4.8 seconds.

## 12. Proposed component boundaries

```text
src/
  interaction/
    HubOrbitController.tsx
    PointerGestureController.tsx
    SignalHitTargets.tsx

  signals/
    ObservationSignals.tsx
    ObservationSignal.tsx
    signalData.ts
    signalProjection.ts

  camera/
    CameraRig.tsx
    CameraPathController.tsx
    cameraPath.ts

  scene/
    House.tsx
    HouseMaterialController.tsx
    ObservationAperture.tsx
    ObservationWorld.tsx

  observation/
    GuidedSequence.tsx
    ExploreLayer.tsx
    ExploreItem.tsx

  content/
    observations.json
    visualProfiles.ts
```

Responsibility rules:

- Store: discrete stage/mode/selection only.
- Refs and `useFrame`: orbit values, camera path progress, shader morphs, world
  positions, and other per-frame values.
- Content JSON: five signals, observation sequences, and explore items.
- Camera rig: the only writer of actual camera transforms.
- Signal components: remain mounted; visual state is driven by stage and
  selection.
- UI: accessibility targets, narration, Home, language, and captions.

## 13. Implementation phases

### Phase A — interaction foundation

1. Split `stage`, `transition`, and `observationMode` in the store.
2. Add signal data for five house-local anchors.
3. Render five persistent signal instances and projected hit targets.
4. Add HUB drag orbit with tap/drag arbitration.
5. Add Home throughout 2step and transition states.

### Phase B — continuous camera system

6. Resolve signal-relative world anchors every frame.
7. Transition from the current manual-orbit pose to the selected signal.
8. Add curved aperture-entry camera path.
9. Replace two-leg return with one continuous curve.

### Phase C — visual morphing

10. Add shared house `surfaceMorph` material.
11. Add selected-signal aperture and parallax depth layers.
12. Add `ObservationWorld` and synchronized `observationMorph`.
13. Add the five data-driven visual profiles, initially sharing lightweight
    assets where final content is unavailable.

### Phase D — post-sequence exploration

14. Add `guided → explore` mode transition.
15. Add text, image, and video explore items.
16. Add visited state, media exclusivity, and idle reset behavior.
17. Verify repeated loops and tablet performance.

## 14. Acceptance criteria

### HUB and orbit

- Five distinct locate signals are visible and attached to the rotating house.
- A one-finger drag rotates the HUB camera without enabling zoom or pan.
- A tap still selects a signal reliably; a drag does not accidentally select.
- Camera transition starts from the exact manually orbited pose.

### Signal continuity

- The selected signal remains continuously visible from first tap through
  arrival at 2step.
- No selected-signal unmount, opacity-to-zero frame, or position jump occurs.
- Non-selected signals recede without disappearing abruptly.

### 2step

- House material blends naturally into the mystery treatment during approach.
- Texture/material transition has no one-frame pop or shader compilation hitch
  after the first interaction.
- Home is visible and usable throughout 2step and its entry transition.

### 3step entry and world

- Camera visibly aligns with and passes through the selected surface signal.
- Exterior-to-interior visual change begins before crossing the wall and
  completes after it, rather than switching on one frame.
- The 3step spatial composition is visibly different from HUB/2step.
- Each selected signal can provide a distinct camera endpoint and visual
  profile.

### Guided and explore content

- The timed sequence completes without requiring input.
- Completion reveals touchable text, image, and video items.
- Only one explore item/video is active at a time.
- All items can be revisited, and Home remains available.
- Language changes update both guided and explore content without reload.

### Return and reliability

- Return passes through the approach area without stopping or visibly slowing
  to zero there.
- Visual/material morphs reverse during the same continuous camera path.
- Media, selected content, progress, and signals fully reset on HUB arrival.
- Ten repeated full loops do not duplicate videos, event listeners, materials,
  or signal hit targets.
- Target tablet sustains at least 30 FPS throughout transitions.

## 15. Verification plan

Automated browser checks should cover:

1. five signal buttons exist in HUB;
2. drag changes camera pose without firing selection;
3. tap selects the correct signal ID;
4. the same selected signal DOM/scene identity survives HUB → APPROACH;
5. Home is present in all non-HUB phases;
6. transition progress is monotonic;
7. guided sequence enters explore mode at 100%;
8. text/image/video items open and replace one another;
9. video stops and resets on Home;
10. return camera speed does not approach zero near the approach waypoint;
11. offline reload retains all five signal definitions and local media;
12. repeated loops do not increase mounted media element count.

Visual checks on a real tablet should confirm drag sensitivity, motion comfort,
surface-morph readability, aperture depth, touch target overlap, and sustained
frame rate.
