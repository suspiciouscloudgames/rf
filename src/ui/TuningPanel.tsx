import { useEffect } from 'react'
import type { ExperienceTuning, HubPersistenceMode } from '../store/tuningStore'
import { useTuningStore } from '../store/tuningStore'
import { useRoomVisualModeStore, type RoomVisualMode } from '../store/roomVisualModeStore'

type NumericTuningKey = {
  [Key in keyof ExperienceTuning]: ExperienceTuning[Key] extends number ? Key : never
}[keyof ExperienceTuning]

interface ControlDefinition {
  key: NumericTuningKey
  label: string
  hint: string
  min: number
  max: number
  step: number
  unit: string
  digits: number
}

type MorphColorKey = 'morphBaseColor' | 'morphHighlightColor' | 'morphShadowColor'

const roomModeOptions: Array<{ value: RoomVisualMode; label: string; hint: string }> = [
  { value: 'classic', label: 'Classic', hint: '기존 2step 비주얼' },
  { value: 'morph', label: 'Morph', hint: '실험적 표면 몰핑 룸' },
]

const persistenceOptions: Array<{ value: HubPersistenceMode; label: string; hint: string }> = [
  { value: 'particles', label: 'Particles Only', hint: '모든 단계와 암전 위에 파티클만 유지' },
  { value: 'fullHub', label: 'Full Hub', hint: '허브 배경·환경·비선택 신호까지 유지' },
]

const timingControls: ControlDefinition[] = [
  { key: 'hubToApproachSeconds', label: 'Hub → Approach', hint: '다음 전환부터 적용', min: 0.5, max: 15, step: 0.1, unit: 's', digits: 1 },
  { key: 'approachToObservationSeconds', label: 'Approach → Observation', hint: '카메라 이동 · 다음 전환부터 적용', min: 0.5, max: 20, step: 0.1, unit: 's', digits: 1 },
  { key: 'observationEntrySeconds', label: 'Observation Entry', hint: '2.5D 등장 연출', min: 0.5, max: 20, step: 0.1, unit: 's', digits: 1 },
  { key: 'entryTravelDistance', label: 'Entry Travel Distance', hint: '2→3 카메라 최대 이동 거리', min: 0.2, max: 6, step: 0.1, unit: 'm', digits: 1 },
  { key: 'entryCurveStrength', label: 'Entry Curve Strength', hint: '0은 직선, 1은 최대 곡선', min: 0, max: 1, step: 0.01, unit: '', digits: 2 },
  { key: 'entryFov', label: 'Entry FOV', hint: '3step 도착 시 시야각', min: 25, max: 50, step: 0.5, unit: '°', digits: 1 },
  { key: 'targetRotationDelay', label: 'Target Rotation Delay', hint: '시선 회전 시작 지연', min: 0, max: 80, step: 1, unit: '%', digits: 0 },
  { key: 'guidedObservationSeconds', label: 'Guided Observation', hint: '자동 관찰 및 카메라 돌리', min: 5, max: 120, step: 1, unit: 's', digits: 0 },
  { key: 'darkenSeconds', label: 'Blackout', hint: '클릭 후 완전 암전까지', min: 1, max: 30, step: 0.5, unit: 's', digits: 1 },
]

const depthControls: ControlDefinition[] = [
  { key: 'perceivedDepth', label: 'Perceived Depth', hint: 'Depth map 셰이더 변위', min: 0, max: 0.5, step: 0.005, unit: '', digits: 3 },
  { key: 'worldDepth', label: 'World Depth', hint: '3step 진행 방향의 월드 기준점', min: 2, max: 14, step: 0.1, unit: 'm', digits: 1 },
  { key: 'layerDepth', label: 'Layer Depth', hint: '전경·중경 카드 간격', min: 0, max: 0.6, step: 0.01, unit: 'm', digits: 2 },
  { key: 'parallaxStrength', label: 'Parallax', hint: '관찰 중 시차 강도', min: 0, max: 0.1, step: 0.002, unit: '', digits: 3 },
]

const morphAppearanceControls: ControlDefinition[] = [
  { key: 'morphMonochromeMix', label: 'Monochrome Mix', hint: '지정 색상을 흑백 필름 톤과 혼합', min: 0, max: 1, step: 0.01, unit: '', digits: 2 },
  { key: 'morphRoomOpacity', label: 'Room Opacity', hint: '바닥과 외벽의 투명도', min: 0.02, max: 1, step: 0.01, unit: '', digits: 2 },
  { key: 'morphPropOpacity', label: 'Prop Opacity', hint: '돌출 집기와 연결부 투명도', min: 0.05, max: 1, step: 0.01, unit: '', digits: 2 },
]

const morphMotionControls: ControlDefinition[] = [
  { key: 'morphWaverAmount', label: 'Waver Amount', hint: '표면 변위 강도', min: 0, max: 0.12, step: 0.002, unit: '', digits: 3 },
  { key: 'morphWaverScale', label: 'Waver Scale', hint: '일렁임의 크기와 밀도', min: 0.5, max: 10, step: 0.1, unit: '', digits: 1 },
  { key: 'morphWaverSpeed', label: 'Waver Speed', hint: '표면이 움직이는 속도', min: 0, max: 1.5, step: 0.01, unit: '', digits: 2 },
  { key: 'morphRippleAmount', label: 'Ripple Amount', hint: '터치 파동의 변위 강도', min: 0, max: 0.15, step: 0.002, unit: '', digits: 3 },
  { key: 'morphRippleRadius', label: 'Ripple Radius', hint: '터치 파동의 확산 범위', min: 0.2, max: 3, step: 0.05, unit: 'm', digits: 2 },
]

const morphFilmControls: ControlDefinition[] = [
  { key: 'morphFilmFlicker', label: 'Film Flicker', hint: '12fps 명암 흔들림', min: 0, max: 0.15, step: 0.005, unit: '', digits: 3 },
  { key: 'morphFilmGrain', label: 'Film Grain', hint: '16mm 입자와 스크래치 강도', min: 0, max: 0.5, step: 0.01, unit: '', digits: 2 },
]

const morphColorControls: Array<{ key: MorphColorKey; label: string; hint: string }> = [
  { key: 'morphBaseColor', label: 'Base Color', hint: '몰프룸의 중간 톤' },
  { key: 'morphHighlightColor', label: 'Highlight Color', hint: '돌출부와 광원 방향의 밝은 톤' },
  { key: 'morphShadowColor', label: 'Shadow Color', hint: '함몰부와 벽·바닥의 어두운 톤' },
]

function TuningControl({ definition }: { definition: ControlDefinition }) {
  const value = useTuningStore((store) => store[definition.key])
  const setTuningValue = useTuningStore((store) => store.setTuningValue)

  return (
    <label className="tuning-control">
      <span className="tuning-control-heading">
        <span>{definition.label}</span>
        <output>{value.toFixed(definition.digits)}{definition.unit}</output>
      </span>
      <input
        type="range"
        min={definition.min}
        max={definition.max}
        step={definition.step}
        value={value}
        onChange={(event) => setTuningValue(definition.key, Number(event.currentTarget.value))}
      />
      <small>{definition.hint}</small>
    </label>
  )
}

function PersistenceSelector() {
  const mode = useTuningStore((store) => store.hubPersistenceMode)
  const setTuningValue = useTuningStore((store) => store.setTuningValue)

  return (
    <div className="persistence-selector" role="radiogroup" aria-label="Hub persistence mode">
      {persistenceOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={mode === option.value}
          className={mode === option.value ? 'is-active' : ''}
          onClick={() => setTuningValue('hubPersistenceMode', option.value)}
        >
          <span>{option.label}</span>
          <small>{option.hint}</small>
        </button>
      ))}
    </div>
  )
}

function RoomModeSelector() {
  const mode = useRoomVisualModeStore((store) => store.mode)
  const setMode = useRoomVisualModeStore((store) => store.setMode)

  return (
    <div className="persistence-selector" role="radiogroup" aria-label="Approach room visual mode">
      {roomModeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={mode === option.value}
          className={mode === option.value ? 'is-active' : ''}
          onClick={() => setMode(option.value)}
        >
          <span>{option.label}</span>
          <small>{option.hint}</small>
        </button>
      ))}
    </div>
  )
}

function MorphColorControl({ definition }: { definition: (typeof morphColorControls)[number] }) {
  const value = useTuningStore((store) => store[definition.key])
  const setTuningValue = useTuningStore((store) => store.setTuningValue)

  return (
    <label className="tuning-color-control">
      <span>
        <strong>{definition.label}</strong>
        <small>{definition.hint}</small>
      </span>
      <input
        type="color"
        value={value}
        aria-label={definition.label}
        onChange={(event) => setTuningValue(definition.key, event.currentTarget.value)}
      />
      <output>{value.toUpperCase()}</output>
    </label>
  )
}

export function TuningPanel() {
  const panelOpen = useTuningStore((store) => store.panelOpen)
  const togglePanel = useTuningStore((store) => store.togglePanel)
  const resetTuning = useTuningStore((store) => store.resetTuning)
  const resetMorphVisuals = useTuningStore((store) => store.resetMorphVisuals)
  const roomVisualMode = useRoomVisualModeStore((store) => store.mode)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === 't') togglePanel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePanel])

  return (
    <div className={`tuning-ui ${panelOpen ? 'is-open' : ''}`}>
      <button
        className="tuning-toggle"
        type="button"
        onClick={togglePanel}
        aria-expanded={panelOpen}
        aria-controls="experience-tuning-panel"
      >
        {panelOpen ? 'CLOSE' : 'TUNE'}
      </button>
      {panelOpen ? (
        <aside id="experience-tuning-panel" className="tuning-panel" aria-label="Experience tuning panel">
          <header className="tuning-panel-header">
            <div>
              <span>EXHIBITION TOOL</span>
              <h2>Runtime Tuning</h2>
            </div>
            <button type="button" onClick={resetTuning}>RESET</button>
          </header>

          <section>
            <h3>Approach Room Mode</h3>
            <RoomModeSelector />
          </section>

          <section>
            <h3>Hub Persistence</h3>
            <PersistenceSelector />
          </section>

          <section>
            <h3>Timeline</h3>
            {timingControls.map((control) => <TuningControl key={control.key} definition={control} />)}
          </section>

          <section>
            <h3>2.5D Depth</h3>
            {depthControls.map((control) => <TuningControl key={control.key} definition={control} />)}
          </section>

          {roomVisualMode !== 'classic' ? (
            <>
              <section>
                <div className="tuning-section-heading">
                  <h3>Morph Appearance</h3>
                  <button type="button" onClick={resetMorphVisuals}>RESET MORPH</button>
                </div>
                {morphColorControls.map((control) => <MorphColorControl key={control.key} definition={control} />)}
                {morphAppearanceControls.map((control) => <TuningControl key={control.key} definition={control} />)}
              </section>
              <section>
                <h3>Morph Surface Motion</h3>
                {morphMotionControls.map((control) => <TuningControl key={control.key} definition={control} />)}
              </section>
              <section>
                <h3>Morph Film Tone</h3>
                {morphFilmControls.map((control) => <TuningControl key={control.key} definition={control} />)}
              </section>
            </>
          ) : null}

          <footer>
            <span>Shift + T</span>
            <span>Saved locally</span>
          </footer>
        </aside>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {panelOpen ? 'Tuning panel opened' : 'Tuning panel closed'}
      </span>
    </div>
  )
}
