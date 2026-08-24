import { useEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  text: string
  className?: string
  characterDelay?: number
  sentenceDelay?: number
  autoScroll?: boolean
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
  autoScroll = false,
}: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(0)
  const paragraphRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    setVisibleLength(0)
  }, [text])

  useEffect(() => {
    if (visibleLength >= text.length) return
    const timer = window.setTimeout(
      () => setVisibleLength((length) => length + 1),
      delayForCharacter(text[Math.max(0, visibleLength - 1)] ?? '', characterDelay, sentenceDelay),
    )
    return () => window.clearTimeout(timer)
  }, [characterDelay, sentenceDelay, text, visibleLength])

  useEffect(() => {
    if (!autoScroll || !paragraphRef.current) return
    const container = paragraphRef.current.parentElement
    if (container) container.scrollTop = container.scrollHeight
  }, [autoScroll, visibleLength])

  return (
    <p ref={paragraphRef} className={className}>
      {text.slice(0, visibleLength)}
      <span className="type-cursor" aria-hidden="true" />
    </p>
  )
}
