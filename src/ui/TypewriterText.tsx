import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  text: string
  className?: string
  characterDelay?: number
  sentenceDelay?: number
  charactersPerTick?: number
  autoScroll?: boolean
  instant?: boolean
}

const delayForCharacter = (character: string, characterDelay: number, sentenceDelay: number) => {
  if (/[.!?。！？]/.test(character)) return sentenceDelay
  if (/[,、]/.test(character)) return 120
  if (/\s/.test(character)) return 24
  return characterDelay
}

export function TypewriterText({
  text,
  className = 'narration-text',
  characterDelay = 38,
  sentenceDelay = 220,
  charactersPerTick = 1,
  autoScroll = false,
  instant = false,
}: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(instant ? text.length : 0)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const autoScrollStoppedRef = useRef(false)
  const lastAutoScrollHeightRef = useRef(0)

  useEffect(() => {
    autoScrollStoppedRef.current = false
    lastAutoScrollHeightRef.current = 0
    setVisibleLength(instant ? text.length : 0)
  }, [instant, text])

  useEffect(() => {
    if (!autoScroll || !paragraphRef.current) return
    const container = paragraphRef.current.parentElement
    if (!container) return

    const stopAutoScroll = () => {
      autoScrollStoppedRef.current = true
    }
    const stopFromScrollbar = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect()
      const scrollbarWidth = Math.max(14, container.offsetWidth - container.clientWidth + 8)
      if (event.clientX >= bounds.right - scrollbarWidth) stopAutoScroll()
    }

    container.addEventListener('wheel', stopAutoScroll, { passive: true })
    container.addEventListener('touchmove', stopAutoScroll, { passive: true })
    container.addEventListener('pointerdown', stopFromScrollbar)
    return () => {
      container.removeEventListener('wheel', stopAutoScroll)
      container.removeEventListener('touchmove', stopAutoScroll)
      container.removeEventListener('pointerdown', stopFromScrollbar)
    }
  }, [autoScroll, text])

  useEffect(() => {
    if (visibleLength >= text.length) return
    const nextLength = Math.min(text.length, visibleLength + charactersPerTick)
    const revealedChunk = text.slice(visibleLength, nextLength)
    const delayCharacter = [...revealedChunk].reverse().find((character) => /[.!?。！？,、\s]/.test(character))
      ?? revealedChunk.charAt(revealedChunk.length - 1)
    const timer = window.setTimeout(
      () => setVisibleLength(nextLength),
      delayForCharacter(delayCharacter, characterDelay, sentenceDelay),
    )
    return () => window.clearTimeout(timer)
  }, [characterDelay, charactersPerTick, sentenceDelay, text, visibleLength])

  useLayoutEffect(() => {
    if (!autoScroll || autoScrollStoppedRef.current || !paragraphRef.current) return
    const container = paragraphRef.current.parentElement
    if (!container) return
    const nextScrollHeight = container.scrollHeight
    if (nextScrollHeight <= container.clientHeight || nextScrollHeight === lastAutoScrollHeightRef.current) return
    lastAutoScrollHeightRef.current = nextScrollHeight
    container.scrollTop = nextScrollHeight
  }, [autoScroll, visibleLength])

  return (
    <p ref={paragraphRef} className={className}>
      {text.slice(0, visibleLength)}
      <span className="type-cursor" aria-hidden="true" />
    </p>
  )
}
