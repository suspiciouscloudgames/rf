import { useEffect, useState } from 'react'

interface TypewriterTextProps {
  text: string
}

const delayForCharacter = (character: string) => {
  if (/[.!?。！？]/.test(character)) return 220
  if (/[,、]/.test(character)) return 120
  if (/\s/.test(character)) return 24
  return 38
}

export function TypewriterText({ text }: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(0)

  useEffect(() => {
    setVisibleLength(0)
  }, [text])

  useEffect(() => {
    if (visibleLength >= text.length) return
    const timer = window.setTimeout(
      () => setVisibleLength((length) => length + 1),
      delayForCharacter(text[visibleLength] ?? ''),
    )
    return () => window.clearTimeout(timer)
  }, [text, visibleLength])

  return (
    <p className="narration-text">
      {text.slice(0, visibleLength)}
      <span className="type-cursor" aria-hidden="true" />
    </p>
  )
}
