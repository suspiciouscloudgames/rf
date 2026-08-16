import { useEffect } from 'react'
import type { ExperienceTuning } from '../store/tuningStore'
import { useTuningStore } from '../store/tuningStore'

interface ControlDefinition {
  key: keyof ExperienceTuning
  label: string
  hint: string
  min: number
  max: number
  step: number
  unit: string
  digits: number
}

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

export function TuningPanel() {
  const panelOpen = useTuningStore((store) => store.panelOpen)
  const togglePanel = useTuningStore((store) => store.togglePanel)
  const resetTuning = useTuningStore((store) => store.resetTuning)

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
            <h3>Timeline</h3>
            {timingControls.map((control) => <TuningControl key={control.key} definition={control} />)}
          </section>

          <section>
            <h3>2.5D Depth</h3>
            {depthControls.map((control) => <TuningControl key={control.key} definition={control} />)}
          </section>

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
