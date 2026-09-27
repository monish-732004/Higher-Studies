import { lazy, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { countries, documents, hero, type CountryCode } from '../data/content'
import { SceneCanvas } from '../components/SceneCanvas'
import { Callout, GlassCard, Section, Split } from '../components/ui'
import { ProgressContext, useScrollProgress } from '../lib/scroll'
import { useEnv } from '../lib/env'
import { TIER_COLORS, TIER_LABELS } from '../lib/tiers'
import { Rich } from '../lib/rich'

const GlobeScene = lazy(() => import('../scenes/GlobeScene'))
const DocsScene = lazy(() => import('../scenes/DocsScene'))

const collegesOf = (code: CountryCode) => documents.countries.find((c) => c.code === code)!.colleges

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const progress = useScrollProgress(ref)
  const { reduced } = useEnv()
  const [active, setActive] = useState<CountryCode | null>(null)
  const [fromList, setFromList] = useState(false)
  const activeCountry = countries.find((c) => c.code === active)

  const pick = (code: CountryCode | null, list: boolean) => {
    setActive(code)
    setFromList(list)
  }

  return (
    <ProgressContext.Provider value={progress}>
      <section id="hero" ref={ref} aria-labelledby="hero-title" className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-4 pb-16 pt-24 sm:px-6 lg:min-h-screen lg:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="min-w-0">
            <p className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.3em] text-range">01 · Overview</p>
            <h1 id="hero-title" className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-4 text-lg text-slate-300 sm:text-xl">{hero.subtitle}</p>

            <motion.div
              animate={reduced ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-8"
            >
              <GlassCard glow={TIER_COLORS.dream} className="p-5 sm:p-6">
                <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-dream">Profile</p>
                <ul className="space-y-2.5">
                  {hero.profile.map((line, i) => (
                    <li key={line} className="flex gap-3 text-[15px] text-slate-100">
                      <span aria-hidden className="mt-0.5">
                        {['🎓', '📊', '🎯'][i]}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>

            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Tier colours</p>
              <ul className="flex flex-wrap gap-2">
                {TIER_LABELS.map((t) => (
                  <li key={t.tier} className="rounded-full border px-2.5 py-1 text-xs font-medium" style={{ color: TIER_COLORS[t.tier], borderColor: `${TIER_COLORS[t.tier]}55` }}>
                    {t.label}
                  </li>
                ))}
                {(['🥇 Tier 1', '🥈 Tier 2', '🥉 Tier 3'] as const).map((t, i) => (
                  <li key={t} className="rounded-full border px-2.5 py-1 text-xs font-medium" style={{ color: ['#E8B84A', '#C9D1DE', '#C8804A'][i], borderColor: ['#E8B84A55', '#C9D1DE55', '#C8804A55'][i] }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="min-w-0">
            <div className="relative">
              <SceneCanvas label="Rotating 3D globe with glowing pins and arcs from India to the 7 target countries" icon="🌍" camera={[0, 0.6, 6.6]} grid={false} className="scene-hero">
                <GlobeScene active={active} focusFromList={fromList} onHover={(c) => pick(c, false)} />
              </SceneCanvas>
              <div aria-live="polite" className="pointer-events-none absolute inset-x-3 bottom-3">
                <AnimatePresence>
                  {activeCountry && (
                    <motion.div
                      key={activeCountry.code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="glass p-4"
                    >
                      <p className="font-display font-semibold text-white">
                        {activeCountry.flag} {activeCountry.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">{collegesOf(activeCountry.code)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="mt-4 mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Countries (hover a pin or a country)</p>
            <ul className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onMouseEnter={() => pick(c.code, true)}
                    onMouseLeave={() => pick(null, false)}
                    onFocus={() => pick(c.code, true)}
                    onBlur={() => pick(null, false)}
                    onClick={() => pick(active === c.code ? null : c.code, true)}
                    aria-pressed={active === c.code}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${active === c.code ? 'border-dream/60 bg-dream/10 text-white' : 'border-white/10 text-slate-300 hover:border-white/25'}`}
                  >
                    {c.flag} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </ProgressContext.Provider>
  )
}

const DOC_ICONS: Record<string, string> = { transcript: '📄', certificate: '🎓', cv: '🧾', passport: '🛂', score: '📝' }

function CountryFlipCard({ code, flipped, onFlip, onHover }: { code: CountryCode; flipped: boolean; onFlip: () => void; onHover: (c: CountryCode | null) => void }) {
  const country = countries.find((c) => c.code === code)!
  const data = documents.countries.find((c) => c.code === code)!
  return (
    <div className={`flip ${flipped ? 'is-flipped' : ''}`} onMouseEnter={() => onHover(code)} onMouseLeave={() => onHover(null)}>
      <div className="flip-inner">
        <div className="flip-front glass flex flex-col p-5">
          <h3 className="font-display text-lg font-semibold text-white">
            <span aria-hidden className="mr-2 text-2xl">
              {country.flag}
            </span>
            {country.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{data.colleges}</p>
          <p className="mt-auto pt-4 text-xs text-slate-500" aria-hidden>
            Flip for requirements ↻
          </p>
        </div>
        <div className="flip-back glass p-5" style={{ ['--glow' as string]: TIER_COLORS.range }}>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-range">
            {country.flag} {country.name} requirements
          </h4>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-200">
            {data.requirements.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-range">
                  ›
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={onFlip}
        onFocus={() => onHover(code)}
        aria-pressed={flipped}
        className="mt-2 w-full rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-white/25 hover:text-white"
      >
        {flipped ? `Show ${country.name} colleges` : `Show ${country.name} requirements`}
      </button>
    </div>
  )
}

export function Documents() {
  const [active, setActive] = useState<CountryCode | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const allFlipped = countries.every((c) => flipped[c.code])
  return (
    <Section id="documents" index={2} kicker="Documents & Tests" title="What every application needs">
      <Split
        scene={
          <SceneCanvas label="Floating stack of documents (passport, transcript, CV, certificate, test score) fanning out, with a ring of waving country flags" icon="📄">
            <DocsScene active={active} />
          </SceneCanvas>
        }
      >
        <GlassCard glow={TIER_COLORS.safety} className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold text-safety">{documents.commonTitle}</h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {documents.common.map((d) => (
              <li key={d.text} className="flex gap-3 rounded-xl bg-white/[0.03] p-3 text-sm text-slate-100">
                <span aria-hidden className="text-lg">
                  {DOC_ICONS[d.icon]}
                </span>
                <span>{d.text}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-white">By country</h3>
          <button
            type="button"
            onClick={() => setFlipped(allFlipped ? {} : Object.fromEntries(countries.map((c) => [c.code, true])))}
            className="rounded-full border border-range/40 px-3 py-1.5 text-xs font-medium text-range hover:bg-range/10"
          >
            {allFlipped ? 'Show all colleges' : 'Show all requirements'}
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {countries.map((c) => (
            <CountryFlipCard key={c.code} code={c.code} flipped={!!flipped[c.code]} onFlip={() => setFlipped((f) => ({ ...f, [c.code]: !f[c.code] }))} onHover={setActive} />
          ))}
        </div>

        <GlassCard className="space-y-2 p-5">
          <h3 className="font-display text-lg font-semibold text-white">Key points</h3>
          {documents.keyPoints.map((k) => (
            <Callout key={k} tone={k.startsWith('⚠️') ? 'warn' : 'info'}>
              <Rich text={k} />
            </Callout>
          ))}
        </GlassCard>
      </Split>
    </Section>
  )
}

