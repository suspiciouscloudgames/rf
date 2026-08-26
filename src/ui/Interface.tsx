import { useEffect, useState } from 'react'
import { localeCopy } from '../locales'
import { useExperienceStore, type Language } from '../store/experienceStore'
import { TypewriterText } from './TypewriterText'
import { ExploreInterface } from './ExploreInterface'
import { getFocusContent } from '../content/focusContent'
import { hasDepthPortal } from '../signals/signalData'
import { ObservationSubtitles } from './ObservationSubtitles'
import { useTuningStore } from '../store/tuningStore'
import { ResearchDrawer } from './ResearchDrawer'
import { getApproachContent } from '../content/approachContent'

export function Interface() {
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false)
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const language = useExperienceStore((store) => store.language)
  const progress = useExperienceStore((store) => store.sequenceProgress)
  const effectActive = useExperienceStore((store) => store.effectActive)
  const observationMode = useExperienceStore((store) => store.observationMode)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const beginReturn = useExperienceStore((store) => store.beginReturn)
  const setLanguage = useExperienceStore((store) => store.setLanguage)
  const animateApproachRecord = useExperienceStore((store) => store.animateApproachRecord)
  const sequenceDuration = useTuningStore((store) => store.guidedObservationSeconds)
  const copy = localeCopy[language]
  const focusCopy = getFocusContent(language, selectedSignalId)
  const approachRecord = getApproachContent(language, selectedSignalId)
  const portalObservation = hasDepthPortal(selectedSignalId)
  const residentMemoObservation = selectedSignalId !== null
  const showResidentMemos = residentMemoObservation && (
    transition === 'approachToObservation'
    || (stage === 'observation' && transition === 'none')
  )

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (!isWelcomeOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsWelcomeOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isWelcomeOpen])

  return (
    <div className={`interface state-${stage} transition-${transition} ${effectActive ? 'effect-active' : ''}`}>
      {stage === 'hub' && transition === 'none' ? (
        <>
          <ResearchDrawer />
          <div className="hub-controls">
            <div className="language-switch" role="group" aria-label="Language">
              {([
                ['ja', 'JP'],
                ['en', 'EN'],
                ['ko', 'KO'],
              ] as Array<[Language, string]>).map(([option, label]) => (
                <button
                  key={option}
                  type="button"
                  className={language === option ? 'active' : ''}
                  aria-pressed={language === option}
                  onClick={() => setLanguage(option)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="welcome-message-button" type="button" onClick={() => setIsWelcomeOpen(true)}>
              <span aria-hidden="true">＋</span>{copy.welcomeMessageButton}
            </button>
          </div>
          <div className="stage-copy hub-copy">
            <p>{copy.hubHint}</p>
            <span>{copy.location}</span>
          </div>
          {isWelcomeOpen ? (
            <div
              className="welcome-modal-backdrop"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) setIsWelcomeOpen(false)
              }}
            >
              <section className="welcome-modal" role="dialog" aria-modal="true" aria-labelledby="welcome-message-title" lang={language}>
                <button className="welcome-modal-close" type="button" aria-label={copy.closeTrace} onClick={() => setIsWelcomeOpen(false)}>×</button>
                <div className="welcome-modal-copy">
                  <p id="welcome-message-title">
                    <span className="welcome-modal-title">{copy.welcomeMessageTitle}</span>
                    <br />
                    <br />
                    {copy.welcomeMessageParagraphs[0]}
                  </p>
                  {copy.welcomeMessageParagraphs.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            </div>
          ) : null}
        </>
      ) : null}

      {stage === 'approach' && transition === 'none' ? (
        <aside className="approach-record" lang={language}>
          <h1>{approachRecord.title}</h1>
          <TypewriterText
            text={approachRecord.body}
            className="approach-record-text"
            characterDelay={52}
            autoScroll
            instant={!animateApproachRecord}
          />
        </aside>
      ) : null}

      {(stage !== 'hub' || transition !== 'none') && stage !== 'loading' ? (
        <button className="home-button" onClick={beginReturn} disabled={transition !== 'none'}>
          <span aria-hidden="true">←</span> {copy.home}
        </button>
      ) : null}

      {showResidentMemos ? <ExploreInterface sequentialReveal /> : null}

      {stage === 'observation' ? (
        <>
          {transition === 'none' && observationMode === 'guided' && !portalObservation && !residentMemoObservation ? (
            <aside className="narration-panel" lang={language}>
              <span className="narration-index">{copy.transmission} / {String(Math.round(progress * sequenceDuration)).padStart(2, '0')}:{sequenceDuration}</span>
              <h1>{focusCopy.title}</h1>
              <TypewriterText text={focusCopy.narration} />
            </aside>
          ) : null}
          {transition === 'none' && observationMode === 'guided' && portalObservation && !residentMemoObservation ? <ObservationSubtitles /> : null}
          {transition === 'none' && observationMode === 'explore' && !residentMemoObservation ? <ExploreInterface /> : null}
        </>
      ) : null}

      {(transition === 'returnToHub' || transition === 'returnToApproach') ? <div className="return-message">{copy.returningLabel}<span>•••</span></div> : null}

      {stage === 'observation' && observationMode === 'guided' ? (
        <div className="progress-track" aria-label={copy.sequenceProgress} aria-valuenow={Math.round(progress * 100)} role="progressbar">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      ) : null}

      <div className="orientation-warning"><span>{copy.rotateDevice}</span></div>
    </div>
  )
}
