import { createContext, useContext, useEffect, useState } from 'react'

export interface EnvState {
  reduced: boolean
  mobile: boolean
  webgl: boolean
}

function detectWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

const EnvContext = createContext<EnvState>({ reduced: false, mobile: false, webgl: true })

export function EnvProvider({ children }: { children: React.ReactNode }) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const mobile = useMedia('(max-width: 767px), (pointer: coarse)')
  const [webgl] = useState(detectWebGL)
  return <EnvContext.Provider value={{ reduced, mobile, webgl }}>{children}</EnvContext.Provider>
}

export const useEnv = () => useContext(EnvContext)
