import { useRef, type CSSProperties, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEnv } from '../lib/env'
import { ProgressContext, useScrollProgress } from '../lib/scroll'
import { Rich } from '../lib/rich'
import { MEDAL_COLORS, TIER_COLORS } from '../lib/tiers'
import type { Medal, Tier, TierGroup } from '../data/content'

/** Frosted glass panel that tilts toward the cursor and fades in on scroll. */
export function GlassCard({
  children,
  className = '',
  glow,
  tilt = true,
  style,
}: {
  children: ReactNode
  className?: string
  glow?: string
  tilt?: boolean
  style?: CSSProperties
}) {
  const { reduced, mobile } = useEnv()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sx = useSpring(rx, { stiffness: 160, damping: 18 })
  const sy = useSpring(ry, { stiffness: 160, damping: 18 })
  const canTilt = tilt && !reduced && !mobile

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: reduced ? 0.3 : 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      onPointerMove={(e) => {
        if (!canTilt) return
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 7)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 7)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 1000, ...(glow ? { ['--glow' as string]: glow } : {}), ...style }}
      className={`glass ${glow ? 'glass-glow' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function Section({
  id,
  index,
  kicker,
  title,
  intro,
  children,
}: {
  id: string
  index: number
  kicker: string
  title: ReactNode
  intro?: ReactNode
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const progress = useScrollProgress(ref)
  return (
    <ProgressContext.Provider value={progress}>
      <section id={id} ref={ref} aria-labelledby={`${id}-title`} className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-range">
            {String(index).padStart(2, '0')} · {kicker}
          </p>
          <h2 id={`${id}-title`} className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {intro && <div className="mt-4 text-base text-slate-300 sm:text-lg">{intro}</div>}
        </header>
        {children}
      </section>
    </ProgressContext.Provider>
  )
}

/** Two-column layout: a sticky 3D viewport beside scrolling HTML content. Stacks on mobile. */
export function Split({ scene, children, sceneRight = false }: { scene: ReactNode; children: ReactNode; sceneRight?: boolean }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className={`min-w-0 lg:sticky lg:top-24 lg:self-start ${sceneRight ? 'lg:order-2' : ''}`}>{scene}</div>
      <div className="min-w-0 space-y-6">{children}</div>
    </div>
  )
}

export function TierPill({ tier, children }: { tier: Tier; children: ReactNode }) {
  const color = TIER_COLORS[tier]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold"
      style={{ color, borderColor: `${color}66`, background: `${color}14` }}
    >
      {children}
    </span>
  )
}

export function MedalHeading({ medal, children }: { medal: Medal; children: string }) {
  return (
    <h3 className="font-display text-lg font-semibold" style={{ color: MEDAL_COLORS[medal] }}>
      <Rich text={children} />
    </h3>
  )
}

/**
 * The tiered lists used by LOR / SOP / internships / certifications.
 * Every title and body is always shown as text; selecting an item links it to its 3D object.
 */
export function TierGroups({
  groups,
  selected,
  onSelect,
  numbered = true,
}: {
  groups: TierGroup[]
  selected: number | null
  onSelect: (n: number | null) => void
  numbered?: boolean
}) {
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <GlassCard key={g.medal} glow={MEDAL_COLORS[g.medal]} className="p-5 sm:p-6">
          <MedalHeading medal={g.medal}>{g.heading}</MedalHeading>
          <ol className="mt-4 space-y-2">
            {g.items.map((it) => {
              const active = selected === it.n
              return (
                <li key={it.n}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(active ? null : it.n)}
                    onMouseEnter={() => onSelect(it.n)}
                    className={`tier-item w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                      active ? 'bg-white/[0.07]' : 'border-transparent hover:bg-white/[0.04]'
                    }`}
                    style={active ? { borderColor: `${MEDAL_COLORS[g.medal]}88`, boxShadow: `0 0 24px -6px ${MEDAL_COLORS[g.medal]}` } : undefined}
                  >
                    <span className="flex gap-3">
                      {numbered && (
                        <span
                          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-ink"
                          style={{ background: MEDAL_COLORS[g.medal] }}
                          aria-hidden
                        >
                          {it.n}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="sr-only">{it.n}. </span>
                        <strong className="block font-semibold text-white">
                          <Rich text={it.title} />
                        </strong>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-300">
                          <Rich text={it.body} />
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </GlassCard>
      ))}
    </div>
  )
}

export function Callout({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  const color = tone === 'warn' ? TIER_COLORS.warning : TIER_COLORS.range
  return (
    <div className="rounded-xl border px-4 py-3 text-sm leading-relaxed text-slate-200" style={{ borderColor: `${color}55`, background: `${color}10` }}>
      {children}
    </div>
  )
}
