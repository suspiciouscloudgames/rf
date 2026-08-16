import en from '../locales/en.json'
import ja from '../locales/ja.json'
import { useExperienceStore } from '../store/experienceStore'
import { TypewriterText } from './TypewriterText'
import { ExploreInterface } from './ExploreInterface'
import { getFocusContent } from '../content/focusContent'
import { hasDepthPortal } from '../signals/signalData'
import { ObservationSubtitles } from './ObservationSubtitles'
import { useTuningStore } from '../store/tuningStore'

export function Interface() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const language = useExperienceStore((store) => store.language)
  const progress = useExperienceStore((store) => store.sequenceProgress)
  const effectActive = useExperienceStore((store) => store.effectActive)
  const observationMode = useExperienceStore((store) => store.observationMode)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const beginReturn = useExperienceStore((store) => store.beginReturn)
  const sequenceDuration = useTuningStore((store) => store.guidedObservationSeconds)
  const copy = language === 'en' ? en : ja
  const focusCopy = getFocusContent(language, selectedSignalId)
  const portalObservation = hasDepthPortal(selectedSignalId)

  const stateLabel = stage === 'hub'
    ? copy.hubLabel
    : stage === 'approach'
      ? copy.approachLabel
      : stage === 'observation'
        ? copy.observationLabel
        : copy.returningLabel

  return (
    <div className={`interface state-${stage} transition-${transition} ${effectActive ? 'effect-active' : ''}`}>
      {stage !== 'loading' ? (
        <div className="telemetry" aria-live="polite">
          <span>{stateLabel}</span>
          <span className="telemetry-line" />
          <span>{String(Math.round(progress * 100)).padStart(3, '0')} / 100</span>
        </div>
      ) : null}

      {stage === 'hub' && transition === 'none' ? (
        <>
          <div className="stage-copy hub-copy">
            <p>{copy.hubHint}</p>
            <span>FIELD 35.6812° N / 139.7671° E</span>
          </div>
        </>
      ) : null}

      {stage === 'approach' && transition === 'none' ? (
        <>
          <div className="stage-copy approach-copy"><p>{copy.approachHint}</p></div>
        </>
      ) : null}

      {(stage !== 'hub' || transition !== 'none') && stage !== 'loading' ? (
        <button className="home-button" onClick={beginReturn} disabled={transition === 'returnToHub'}>
          <span aria-hidden="true">←</span> {copy.home}
        </button>
      ) : null}

      {stage === 'observation' ? (
        <>
          {transition === 'none' && observationMode === 'guided' && !portalObservation ? (
            <aside className="narration-panel" lang={language}>
              <span className="narration-index">TRANSMISSION / {String(Math.round(progress * sequenceDuration)).padStart(2, '0')}:{sequenceDuration}</span>
              <h1>{focusCopy.title}</h1>
              <TypewriterText text={focusCopy.narration} />
            </aside>
          ) : null}
          {transition === 'none' && observationMode === 'guided' && portalObservation ? <ObservationSubtitles /> : null}
          {transition === 'none' && observationMode === 'explore' ? <ExploreInterface /> : null}
        </>
      ) : null}

      {transition === 'returnToHub' ? <div className="return-message">{copy.returningLabel}<span>•••</span></div> : null}

      {stage === 'observation' && observationMode === 'guided' ? (
        <div className="progress-track" aria-label="Sequence progress" aria-valuenow={Math.round(progress * 100)} role="progressbar">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      ) : null}

      <div className="orientation-warning"><span>{copy.rotateDevice}</span></div>
    </div>
  )
}
