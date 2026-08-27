import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
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

const FILM_VIDEO_URL = import.meta.env.BASE_URL === '/rf/'
  ? 'https://media.githubusercontent.com/media/suspiciouscloudgames/rf/main/public/assets/video/resonant-field-film/resonant_field_picture.mp4'
  : assetUrl('assets/video/resonant-field-film/resonant_field_picture.mp4')
const FILM_SUBTITLE_URL = assetUrl('assets/video/resonant-field-film/resonant_field_subtitles.json')
const filmSubtitleTranslationUrls: Partial<Record<Language, string>> = {
  ja: assetUrl('assets/video/resonant-field-film/resonant_field_subtitles_ja.json'),
  en: assetUrl('assets/video/resonant-field-film/resonant_field_subtitles_en.json'),
}

type FilmCueArticleLink = {
  articleId: ResearchArticleId
  phrase: Record<Language, string>
}

const filmCueArticleLinks: Partial<Record<number, FilmCueArticleLink[]>> = {
  2: [{ articleId: 'observation-patterns', phrase: { ko: '패턴', ja: 'パターン', en: 'pattern' } }],
  3: [{ articleId: 'emotion', phrase: { ko: '감정', ja: '感情', en: 'emotion' } }],
  5: [{ articleId: 'affective-field', phrase: { ko: '감응장', ja: '感応場', en: 'resonant field' } }],
  7: [
    { articleId: 'classification', phrase: { ko: '유형', ja: 'タイプ', en: 'types' } },
    { articleId: 'emergent-entities', phrase: { ko: '출현체', ja: '出現体', en: 'entities' } },
  ],
  10: [{ articleId: 'detector', phrase: { ko: '검출기', ja: '検出器', en: 'detector' } }],
  13: [{ articleId: 'companions', phrase: { ko: '반려체라 부르기 시작했다', ja: '伴侶体と呼び始めた', en: 'companion entities' } }],
  14: [{ articleId: 'service-app', phrase: { ko: '서비스 앱', ja: 'サービスアプリ', en: 'service apps' } }],
  20: [{ articleId: 'real-estate', phrase: { ko: '부동산', ja: '不動産', en: 'real estate' } }],
  28: [{ articleId: 'end-of-solitude', phrase: { ko: '고독의 종말', ja: '孤独の終焉', en: 'the end of solitude' } }],
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

  const renderFilmSubtitle = (): ReactNode => {
    if (!activeSubtitle) return '\u00a0'
    const matches = (filmCueArticleLinks[activeSubtitle.id] ?? [])
      .map((link) => {
        const phrase = link.phrase[language]
        return { ...link, phrase, index: activeSubtitle.text.indexOf(phrase) }
      })
      .filter((link) => link.index >= 0)
      .sort((a, b) => a.index - b.index)
    if (matches.length === 0) return activeSubtitle.text

    const parts: ReactNode[] = []
    let cursor = 0
    matches.forEach((match) => {
      parts.push(activeSubtitle.text.slice(cursor, match.index))
      parts.push(
        <button
          key={`${activeSubtitle.id}-${match.articleId}`}
          type="button"
          className="research-subtitle-link"
          onClick={() => selectArticle(match.articleId)}
        >
          {match.phrase}
          <span aria-hidden="true">↗</span>
        </button>,
      )
      cursor = match.index + match.phrase.length
    })
    parts.push(activeSubtitle.text.slice(cursor))
    return parts
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
              <p key={`film-subtitle-${activeSubtitle?.id ?? 'empty'}`} aria-hidden={!activeSubtitle}>
                {renderFilmSubtitle()}
              </p>
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
