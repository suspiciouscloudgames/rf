import { useEffect, useRef, useState } from 'react'
import { researchSubtitles } from '../content/researchSubtitles'
import { researchArticleBodyAliases, researchArticleCueMap, researchArticleCuePhrases, researchArticleLinkPhrases, researchArticles, type ResearchArticleId } from '../content/researchArticles'
import { researchArticleTranslations } from '../content/researchArticleTranslations'
import { useExperienceStore } from '../store/experienceStore'
import { localeCopy } from '../locales'

const CUE_DURATION_MS = 8_000

export function ResearchDrawer() {
  const language = useExperienceStore((store) => store.language)
  const registerInteraction = useExperienceStore((store) => store.registerInteraction)
  const [isOpen, setIsOpen] = useState(false)
  const [cueIndex, setCueIndex] = useState(0)
  const [selectedArticleId, setSelectedArticleId] = useState<ResearchArticleId>('observation-patterns')
  const articlePanelRef = useRef<HTMLElement>(null)
  const cues = researchSubtitles[language]
  const copy = localeCopy[language]
  const linkedArticleId = researchArticleCueMap[cueIndex]
  const linkedPhrase = linkedArticleId ? researchArticleCuePhrases[cueIndex]?.[language] ?? null : null
  const cueText = cueIndex < cues.length ? cues[cueIndex] : ''
  const linkedPhraseIndex = linkedPhrase ? cueText.toLocaleLowerCase().indexOf(linkedPhrase.toLocaleLowerCase()) : -1
  const selectedArticle = researchArticles.find((article) => article.id === selectedArticleId) ?? researchArticles[0]
  const selectedArticleBody = language === 'ko'
    ? selectedArticle.body
    : researchArticleTranslations[language][selectedArticle.id]

  const selectArticle = (articleId: ResearchArticleId) => {
    setSelectedArticleId(articleId)
    articlePanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderArticleBody = () => {
    const aliasTargets = new Map<string, ResearchArticleId>()
    researchArticles.forEach((article) => {
      if (article.id === selectedArticle.id) return
      const aliases = [
        article.title[language],
        researchArticleLinkPhrases[article.id][language],
        ...(researchArticleBodyAliases[article.id]?.[language] ?? []),
      ]
      aliases.forEach((alias) => aliasTargets.set(alias.toLocaleLowerCase(), article.id))
    })
    const aliases = [...aliasTargets.keys()].sort((a, b) => b.length - a.length)
    if (aliases.length === 0) return selectedArticleBody
    const escapedAliases = aliases.map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const pattern = new RegExp(`(${escapedAliases.join('|')})`, 'giu')
    const parts = selectedArticleBody.split(pattern)
    return parts.map((part, index) => {
      const targetId = aliasTargets.get(part.toLocaleLowerCase())
      if (!targetId) return part
      return (
        <button
          key={`${targetId}-${index}`}
          type="button"
          className="research-article-link"
          onClick={() => selectArticle(targetId)}
        >
          {part}
        </button>
      )
    })
  }

  useEffect(() => {
    setCueIndex(0)
  }, [language])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setCueIndex(0)
    const timer = window.setInterval(() => {
      setCueIndex((current) => current >= cues.length - 1 ? 0 : current + 1)
    }, CUE_DURATION_MS)
    return () => window.clearInterval(timer)
  }, [isOpen, cues.length])

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const toggle = () => {
    registerInteraction()
    setIsOpen((open) => !open)
  }

  return (
    <div
      className={`research-drawer-layer ${isOpen ? 'open' : ''}`}
      onPointerDown={(event) => {
        if (isOpen && event.target === event.currentTarget) setIsOpen(false)
      }}
    >
      <aside className="research-drawer" aria-label={copy.researchArchive}>
        <div className="research-drawer-content">
          <div className="research-video-frame" aria-hidden={!isOpen}>
            <div className="research-video-mock" aria-hidden="true">
            </div>
            <span className="research-countdown" aria-label={`${Math.max(0, cues.length - cueIndex)}`}>
              {String(Math.max(0, cues.length - cueIndex)).padStart(2, '0')}
            </span>
            <div className="research-subtitle" aria-live="polite" lang={language}>
              {cueIndex < cues.length ? (
                linkedArticleId && linkedPhrase && linkedPhraseIndex >= 0 ? (
                  <p key={`${language}-${cueIndex}`}>
                    {cueText.slice(0, linkedPhraseIndex)}
                    <button
                      type="button"
                      className="research-subtitle-link"
                      onClick={() => selectArticle(linkedArticleId)}
                    >
                      {cueText.slice(linkedPhraseIndex, linkedPhraseIndex + linkedPhrase.length)}
                      <span aria-hidden="true">↗</span>
                    </button>
                    {cueText.slice(linkedPhraseIndex + linkedPhrase.length)}
                  </p>
                ) : <p key={`${language}-${cueIndex}`}>{cues[cueIndex]}</p>
              ) : <p>&nbsp;</p>}
            </div>
          </div>
          <article ref={articlePanelRef} className="research-article-panel" lang={language}>
            <h2>{selectedArticle.title[language]}</h2>
            <p>{renderArticleBody()}</p>
          </article>
        </div>
        <button
          type="button"
          className="research-drawer-handle"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? copy.closeResearchArchive : copy.openResearchArchive}
        >
          <span aria-hidden="true">{isOpen ? '←' : '→'}</span>
        </button>
      </aside>
    </div>
  )
}
