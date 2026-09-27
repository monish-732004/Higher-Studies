import { createContext, useContext, useEffect, useRef, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Progress of a section through the viewport (0 = entering bottom, 1 = leaving top), stored in a ref so 3D frames read it without re-rendering. */
export function useScrollProgress(target: RefObject<HTMLElement | null>) {
  const progress = useRef(0)
  useEffect(() => {
    if (!target.current) return
    const st = ScrollTrigger.create({
      trigger: target.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        progress.current = self.progress
      },
    })
    progress.current = st.progress
    return () => st.kill()
  }, [target])
  return progress
}

export const ProgressContext = createContext<{ current: number }>({ current: 0.5 })
export const useSectionProgress = () => useContext(ProgressContext)
