import { useEffect, useRef, useState } from 'react'
import { researchArticleBodyAliases, researchArticleLinkPhrases, researchArticles, type ResearchArticleId } from '../content/researchArticles'
import { researchArticleTranslations } from '../content/researchArticleTranslations'
import { useExperienceStore, type Language } from '../store/experienceStore'
import { localeCopy } from '../locales'
import { assetUrl } from '../lib/assetUrl'

type FilmSubtitle = {
  id: number
  start: number
  end: number
  text: string
}

type FilmSubtitleFile = {
  subtitles: FilmSubtitle[]
}

type FilmSubtitleTranslationFile = {
  subtitles: Array<Pick<FilmSubtitle, 'id' | 'text'>>
}

const FILM_VIDEO_URL = assetUrl('assets/video/resonant-field-film/resonant_field_picture.mp4')
const FILM_SUBTITLE_URL = assetUrl('assets/video/resonant-field-film/resonant_field_subtitles.json')
const filmSubtitleTranslationUrls: Partial<Record<Language, string>> = {
  ja: assetUrl('assets/video/resonant-field-film/resonant_field_subtitles_ja.json'),
  en: assetUrl('assets/video/resonant-field-film/resonant_field_subtitles_en.json'),
}

const filmCueArticleMap: Partial<Record<number, ResearchArticleId>> = {
  2: 'observation-patterns',
  3: 'emotion',
  5: 'affective-field',
  7: 'emergent-entities',
  10: 'detector',
  13: 'companions',
  14: 'service-app',
  19: 'characteristics',
  20: 'real-estate',
  28: 'end-of-solitude',
}

const filmCueArticlePhrases: Partial<Record<number, Record<Language, string>>> = {
  2: { ko: '패턴', ja: 'パターン', en: 'pattern' },
  3: { ko: '감정', ja: '感情', en: 'emotion' },
  5: { ko: '감응장', ja: '感応場', en: 'resonant field' },
  7: { ko: '출현체', ja: '出現体', en: 'entities' },
  10: { ko: '검출기', ja: '検出器', en: 'detector' },
  13: { ko: '반려체', ja: '伴侶体', en: 'companion entities' },
  14: { ko: '서비스 앱', ja: 'サービスアプリ', en: 'service apps' },
  19: { ko: '반려체', ja: '反侶体', en: 'companion entity' },
  20: { ko: '부동산', ja: '不動産', en: 'real estate' },
  28: { ko: '고독의 종말', ja: '孤独の終焉', en: 'the end of solitude' },
}

export function ResearchDrawer() {
  const language = useExperienceStore((store) => store.language)
  const registerInteraction = useExperienceStore((store) => store.registerInteraction)
  const [isOpen, setIsOpen] = useState(false)
  const [filmSubtitles, setFilmSubtitles] = useState<FilmSubtitle[]>([])
  const [filmTime, setFilmTime] = useState(0)
  const [selectedArticleId, setSelectedArticleId] = useState<ResearchArticleId>('observation-patterns')
  const articlePanelRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const copy = localeCopy[language]
  const activeSubtitleIndex = filmSubtitles.findIndex((subtitle) => (
    filmTime >= subtitle.start && filmTime < subtitle.end
  ))
  const activeSubtitle = activeSubtitleIndex >= 0 ? filmSubtitles[activeSubtitleIndex] : null
  const linkedArticleId = activeSubtitle ? filmCueArticleMap[activeSubtitle.id] : undefined
  const linkedPhrase = activeSubtitle ? filmCueArticlePhrases[activeSubtitle.id]?.[language] ?? null : null
  const cueText = activeSubtitle?.text ?? ''
  const linkedPhraseIndex = linkedPhrase ? cueText.indexOf(linkedPhrase) : -1
  const selectedArticle = researchArticles.find((article) => article.id === selectedArticleId) ?? researchArticles[0]
  const selectedArticleBody = language === 'ko'
    ? selectedArticle.body
    : researchArticleTranslations[language][selectedArticle.id]
  const cycleTargetId: ResearchArticleId = selectedArticle.id === 'end-of-solitude'
    ? 'observation-patterns'
    : 'end-of-solitude'
  const cycleTarget = researchArticles.find((article) => article.id === cycleTargetId) ?? researchArticles[0]
  const breakObservationTitle = language === 'ko' && selectedArticle.id === 'observation-patterns'

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
    const linkedTargets = new Set<ResearchArticleId>()
    return parts.map((part, index) => {
      const targetId = aliasTargets.get(part.toLocaleLowerCase())
      if (!targetId || linkedTargets.has(targetId)) return part
      linkedTargets.add(targetId)
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
    const controller = new AbortController()
    const translationUrl = filmSubtitleTranslationUrls[language]
    const fetchJson = async <T,>(url: string) => {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error(`Unable to load film subtitles: ${response.status}`)
      return response.json() as Promise<T>
    }
    setFilmSubtitles([])
    void Promise.all([
      fetchJson<FilmSubtitleFile>(FILM_SUBTITLE_URL),
      translationUrl
        ? fetchJson<FilmSubtitleTranslationFile>(translationUrl)
        : Promise.resolve<FilmSubtitleTranslationFile | null>(null),
    ])
      .then(([timedData, translatedData]) => {
        const timedSubtitles = Array.isArray(timedData.subtitles)
          ? timedData.subtitles.filter((subtitle) => (
            Number.isFinite(subtitle.id)
            && Number.isFinite(subtitle.start)
            && Number.isFinite(subtitle.end)
            && subtitle.end > subtitle.start
            && typeof subtitle.text === 'string'
          ))
          : []
        const translatedText = new Map(
          Array.isArray(translatedData?.subtitles)
            ? translatedData.subtitles
              .filter((subtitle) => Number.isFinite(subtitle.id) && typeof subtitle.text === 'string')
              .map((subtitle) => [subtitle.id, subtitle.text] as const)
            : [],
        )
        setFilmSubtitles(timedSubtitles.map((subtitle) => ({
          ...subtitle,
          text: translatedText.get(subtitle.id) ?? subtitle.text,
        })))
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFilmSubtitles([])
    })
    return () => controller.abort()
  }, [language])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isOpen) void video.play().catch(() => undefined)
    else video.pause()
  }, [isOpen])

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
            <video
              ref={videoRef}
              className="research-video"
              src={FILM_VIDEO_URL}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onTimeUpdate={(event) => setFilmTime(event.currentTarget.currentTime)}
              onSeeked={(event) => setFilmTime(event.currentTarget.currentTime)}
            />
            <span className="research-countdown" aria-label={`${Math.max(0, filmSubtitles.length - Math.max(activeSubtitleIndex, 0))}`}>
              {String(Math.max(0, filmSubtitles.length - Math.max(activeSubtitleIndex, 0))).padStart(2, '0')}
            </span>
            <div className="research-subtitle" aria-live="polite" lang={language}>
              {activeSubtitle ? (
                linkedArticleId && linkedPhrase && linkedPhraseIndex >= 0 ? (
                  <p key={`film-subtitle-${activeSubtitle.id}`}>
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
                ) : <p key={`film-subtitle-${activeSubtitle.id}`}>{activeSubtitle.text}</p>
              ) : <p aria-hidden="true">&nbsp;</p>}
            </div>
          </div>
          <article ref={articlePanelRef} className="research-article-panel" lang={language}>
            <h2>
              {breakObservationTitle ? (
                <>
                  우주 관측 데이터와<br />미분류 관측 패턴
                </>
              ) : selectedArticle.title[language]}
            </h2>
            <p>
              {renderArticleBody()}
              <button
                type="button"
                className="research-cycle-link"
                onClick={() => selectArticle(cycleTargetId)}
                aria-label={cycleTarget.title[language]}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <mask id="research-cycle-reveal">
                      <circle className="research-cycle-mask" cx="12" cy="12" r="8.5" pathLength="1" />
                    </mask>
                  </defs>
                  <circle className="research-cycle-guide" cx="12" cy="12" r="8.5" pathLength="1" />
                  <circle className="research-cycle-dots" cx="12" cy="12" r="8.5" pathLength="1" mask="url(#research-cycle-reveal)" />
                </svg>
              </button>
            </p>
          </article>
        </div>
        <button
          type="button"
          className="research-drawer-handle"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? copy.closeResearchArchive : copy.openResearchArchive}
        >
          <span className="research-drawer-handle-arrow" aria-hidden="true">{isOpen ? '←' : '→'}</span>
          <span className="research-drawer-handle-label">{copy.researchMaterials}</span>
        </button>
      </aside>
    </div>
  )
}
