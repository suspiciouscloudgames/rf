import en from '../locales/en.json'
import ja from '../locales/ja.json'
import { useExperienceStore } from '../store/experienceStore'
import { TypewriterText } from './TypewriterText'

export function Interface() {
  const state = useExperienceStore((store) => store.state)
  const language = useExperienceStore((store) => store.language)
  const progress = useExperienceStore((store) => store.sequenceProgress)
  const isTransitioning = useExperienceStore((store) => store.isTransitioning)
  const isAudioEnabled = useExperienceStore((store) => store.isAudioEnabled)
  const effectActive = useExperienceStore((store) => store.effectActive)
  const enterApproach = useExperienceStore((store) => store.enterApproach)
  const enterObservation = useExperienceStore((store) => store.enterObservation)
  const beginReturn = useExperienceStore((store) => store.beginReturn)
  const setLanguage = useExperienceStore((store) => store.setLanguage)
  const setAudioEnabled = useExperienceStore((store) => store.setAudioEnabled)
  const copy = language === 'en' ? en : ja

  const stateLabel = state === 'hub'
    ? copy.hubLabel
    : state === 'approach'
      ? copy.approachLabel
      : state === 'observation'
        ? copy.observationLabel
        : copy.returningLabel

  const requestFullscreen = () => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.()
  }

  return (
    <div className={`interface state-${state} ${effectActive ? 'effect-active' : ''}`}>
      <header className="system-header">
        <div className="identity">
          <span className="archive-id">{copy.archive}</span>
          <span className="project-title">{copy.title}</span>
        </div>
        <div className="system-controls">
          <div className="language-switch" aria-label="Language">
            <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
            <span>/</span>
            <button className={language === 'ja' ? 'active' : ''} onClick={() => setLanguage('ja')}>日本語</button>
          </div>
          <button className="icon-control" onClick={() => setAudioEnabled(!isAudioEnabled)} aria-label={isAudioEnabled ? copy.soundOn : copy.soundOff}>
            {isAudioEnabled ? '◉' : '○'}
          </button>
          <button className="icon-control fullscreen-control" onClick={requestFullscreen} aria-label={copy.fullscreen}>⌗</button>
        </div>
      </header>

      {state !== 'loading' ? (
        <div className="telemetry" aria-live="polite">
          <span>{stateLabel}</span>
          <span className="telemetry-line" />
          <span>{String(Math.round(progress * 100)).padStart(3, '0')} / 100</span>
        </div>
      ) : null}

      {state === 'hub' ? (
        <>
          <div className="stage-copy hub-copy">
            <p>{copy.hubHint}</p>
            <span>FIELD 35.6812° N / 139.7671° E</span>
          </div>
          <button className="signal-button hub-signal" onClick={enterApproach} disabled={isTransitioning} aria-label={copy.hubAction}>
            <span className="signal-orbit" />
            <span className="signal-core" />
            <span className="signal-label">{copy.hubAction}</span>
          </button>
        </>
      ) : null}

      {state === 'approach' && !isTransitioning ? (
        <>
          <div className="stage-copy approach-copy"><p>{copy.approachHint}</p></div>
          <button className="signal-button approach-signal" onClick={enterObservation} aria-label={copy.approachAction}>
            <span className="signal-orbit" />
            <span className="signal-core" />
            <span className="signal-label">{copy.approachAction}</span>
          </button>
        </>
      ) : null}

      {state === 'observation' ? (
        <>
          <button className="home-button" onClick={beginReturn} disabled={isTransitioning}>
            <span aria-hidden="true">←</span> {copy.home}
          </button>
          {!isTransitioning ? (
            <aside className="narration-panel" lang={language}>
              <span className="narration-index">TRANSMISSION / {String(Math.round(progress * 24)).padStart(2, '0')}:24</span>
              <h1>{copy.narrationTitle}</h1>
              <TypewriterText text={copy.narration} />
            </aside>
          ) : null}
        </>
      ) : null}

      {state === 'returning' ? <div className="return-message">{copy.returningLabel}<span>•••</span></div> : null}

      {state === 'observation' ? (
        <div className="progress-track" aria-label="Sequence progress" aria-valuenow={Math.round(progress * 100)} role="progressbar">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      ) : null}

      <div className="orientation-warning"><span>{copy.rotateDevice}</span></div>
    </div>
  )
}
