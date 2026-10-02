import { useEffect, useRef } from 'react'

interface KeyMap {
  [key: string]: () => void
}

export function useKeyboard(map: KeyMap, active = true) {
  const mapRef = useRef(map)
  mapRef.current = map

  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const fn = mapRef.current[e.key]
      if (fn) {
        e.preventDefault()
        e.stopPropagation()
        fn()
      }
    }
    window.addEventListener('keydown', handler, { capture: true })
    return () => window.removeEventListener('keydown', handler, { capture: true })
  }, [active])
}
