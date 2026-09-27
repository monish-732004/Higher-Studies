import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useEnv } from '../lib/env'

const CanvasInner = lazy(() => import('./CanvasInner'))

function useNearViewport(ref: React.RefObject<HTMLElement | null>, margin: string) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return inView
}

class GLErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function Fallback2D({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="fallback-2d absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
      <span className="text-5xl" aria-hidden>
        {icon}
      </span>
      <span className="px-6 text-xs text-slate-400">{label}</span>
    </div>
  )
}

interface Props {
  label: string
  icon: string
  children: ReactNode
  camera?: [number, number, number]
  fov?: number
  grid?: boolean
  className?: string
}

/**
 * A lazily mounted 3D viewport. The WebGL context only exists while the
 * viewport is near the screen, and the render loop only runs while visible.
 */
export function SceneCanvas({ label, icon, children, camera = [0, 1.5, 8], fov = 45, grid = true, className = '' }: Props) {
  const { webgl } = useEnv()
  const ref = useRef<HTMLDivElement>(null)
  const near = useNearViewport(ref, '300px 0px')
  const visible = useNearViewport(ref, '0px')
  const fallback = <Fallback2D icon={icon} label={`${label} (static view, 3D not available)`} />

  return (
    <div ref={ref} role="img" aria-label={label} className={`scene-frame relative overflow-hidden ${className}`}>
      {!webgl ? (
        fallback
      ) : near ? (
        <GLErrorBoundary fallback={fallback}>
          <Suspense fallback={<div className="scene-loading absolute inset-0" />}>
            <CanvasInner camera={camera} fov={fov} grid={grid} active={visible}>
              {children}
            </CanvasInner>
          </Suspense>
        </GLErrorBoundary>
      ) : (
        <div className="scene-loading absolute inset-0" />
      )}
    </div>
  )
}
