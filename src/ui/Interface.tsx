import { useEffect, useState } from 'react'
import ja from '../locales/ja.json'
import { localeCopy } from '../locales'
import { useExperienceStore, type Language } from '../store/experienceStore'
import { TypewriterText } from './TypewriterText'
import { ExploreInterface } from './ExploreInterface'
import { getFocusContent } from '../content/focusContent'
import { hasDepthPortal } from '../signals/signalData'
import { ObservationSubtitles } from './ObservationSubtitles'
import { useTuningStore } from '../store/tuningStore'

interface WebkitFullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitIsFullScreen?: boolean
  webkitExitFullscreen?: () => Promise<void> | void
  webkitCancelFullScreen?: () => Promise<void> | void
}

interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
  webkitRequestFullScreen?: () => Promise<void> | void
}

function HubFullscreenControl({ copy }: { copy: typeof ja }) {
  const registerInteraction = useExperienceStore((store) => store.registerInteraction)
  const webkitDocument = document as WebkitFullscreenDocument
  const fullscreenActive = () => Boolean(
    document.fullscreenElement
    ?? webkitDocument.webkitFullscreenElement
    ?? webkitDocument.webkitIsFullScreen,
  )
  const [isFullscreen, setIsFullscreen] = useState(fullscreenActive())
  const [showInstallHint, setShowInstallHint] = useState(false)

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(fullscreenActive())
      setShowInstallHint(false)
    }
    const handleFullscreenError = () => setShowInstallHint(true)
    document.addEventListener('fullscreenchange', syncFullscreen)
    document.addEventListener('webkitfullscreenchange', syncFullscreen)
    document.addEventListener('fullscreenerror', handleFullscreenError)
    document.addEventListener('webkitfullscreenerror', handleFullscreenError)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      document.removeEventListener('webkitfullscreenchange', syncFullscreen)
      document.removeEventListener('fullscreenerror', handleFullscreenError)
      document.removeEventListener('webkitfullscreenerror', handleFullscreenError)
    }
  }, [])

  const toggleFullscreen = async () => {
    registerInteraction()
    setShowInstallHint(false)
    if (fullscreenActive()) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (webkitDocument.webkitExitFullscreen) {
          await webkitDocument.webkitExitFullscreen()
        } else if (webkitDocument.webkitCancelFullScreen) {
          await webkitDocument.webkitCancelFullScreen()
        }
        return
      } catch {
        setShowInstallHint(true)
        return
      }
    }

    const root = document.documentElement as WebkitFullscreenElement
    if (root.requestFullscreen) {
      try {
        await root.requestFullscreen()
        return
      } catch {
        // Older iPadOS versions expose the standard method but only complete
        // fullscreen through the prefixed WebKit implementation.
      }
    }
    const webkitRequestFullscreen = root.webkitRequestFullscreen ?? root.webkitRequestFullScreen
    if (webkitRequestFullscreen) {
      try {
        await webkitRequestFullscreen.call(root)
        return
      } catch {
        // Fall through to the platform guidance below.
      }
    }
    setShowInstallHint(true)
  }

  return (
    <div className="system-controls hub-fullscreen-controls">
      <button
        type="button"
        className={`fullscreen-control${isFullscreen ? ' is-active' : ''}`}
        aria-pressed={isFullscreen}
        onClick={() => { void toggleFullscreen() }}
      >
        <span className="fullscreen-control-icon" aria-hidden="true">{isFullscreen ? '×' : '⛶'}</span>
        <span>{isFullscreen ? copy.exitFullscreen : copy.fullscreen}</span>
      </button>
      {showInstallHint ? (
        <p className="fullscreen-install-hint" role="status">{copy.fullscreenInstallHint}</p>
      ) : null}
    </div>
  )
}

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
  const sequenceDuration = useTuningStore((store) => store.guidedObservationSeconds)
  const copy = localeCopy[language]
  const focusCopy = getFocusContent(language, selectedSignalId)
  const portalObservation = hasDepthPortal(selectedSignalId)

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
          </div>
          <HubFullscreenControl copy={copy} />
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
                <h1 id="welcome-message-title">{copy.welcomeMessageTitle}</h1>
                <div className="welcome-modal-copy">
                  {copy.welcomeMessageParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            </div>
          ) : null}
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
              <span className="narration-index">{copy.transmission} / {String(Math.round(progress * sequenceDuration)).padStart(2, '0')}:{sequenceDuration}</span>
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
        <div className="progress-track" aria-label={copy.sequenceProgress} aria-valuenow={Math.round(progress * 100)} role="progressbar">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      ) : null}

      <div className="orientation-warning"><span>{copy.rotateDevice}</span></div>
    </div>
  )
}
