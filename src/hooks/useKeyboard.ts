import { useEffect } from 'react'

interface KeyboardHandlers {
  onFlip: () => void
  onNext: () => void
  onPrev: () => void
  onMastered: () => void
}

export function useKeyboard({ onFlip, onNext, onPrev, onMastered }: KeyboardHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          onFlip()
          break
        case 'ArrowRight':
          e.preventDefault()
          onNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onPrev()
          break
        case 'Enter':
          e.preventDefault()
          onMastered()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onFlip, onNext, onPrev, onMastered])
}
