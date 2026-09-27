import { lazy, useState } from 'react'
import { faculty, footer } from '../data/content'
import { SceneCanvas } from '../components/SceneCanvas'
import { Callout, GlassCard, Section, Split } from '../components/ui'
import { TIER_COLORS } from '../lib/tiers'
import { Rich } from '../lib/rich'

const FacultyScene = lazy(() => import('../scenes/FacultyScene'))
const FooterScene = lazy(() => import('../scenes/FooterScene'))

// which path each network node belongs to (hovering a node lights up its path card)
const NODE_PATH: Record<string, string> = { abroad: 'abroad', honours: 'honours', lab: 'lab', amutha: 'lab' }

export function Faculty() {
  const [activePath, setActivePath] = useState<string | null>(null)
  const [node, setNode] = useState<string | null>(null)
  const lit = activePath ?? (node ? NODE_PATH[node] ?? null : null)
  return (
    <Section id="faculty" index={9} kicker="SRM Faculty & Paths" title="Who to approach at SRM, and the routes out">
      <Callout tone="warn">
        <Rich text={faculty.checkFirst} />
      </Callout>
      <div className="mt-8">
        <Split
          scene={
            <SceneCanvas label="3D network graph: you at the centre, SRM faculty, visiting professors and programmes as connected nodes; edge thickness shows fit, and the 3 paths glow as highlighted routes" icon="🕸️" camera={[0, 1, 9]}>
              <FacultyScene activePath={lit} onNode={setNode} />
            </SceneCanvas>
          }
        >
          <h3 className="font-display text-2xl font-semibold text-white">{faculty.tableTitle}</h3>
          <GlassCard className="hidden p-2 md:block" tilt={false}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400">
                  {faculty.columns.map((c) => (
                    <th key={c} scope="col" className="p-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {faculty.people.map((p) => (
                  <tr key={p.id} className={`border-t border-white/5 align-top transition ${node === p.id ? 'bg-white/[0.06]' : ''}`}>
                    <th scope="row" className="p-3 font-semibold text-white">
                      {p.name}
                    </th>
                    <td className="p-3 text-slate-300">{p.background}</td>
                    <td className="p-3 text-slate-100">{p.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
          <div className="space-y-3 md:hidden">
            {faculty.people.map((p) => (
              <GlassCard key={p.id} className="p-4" glow={p.stars === 3 ? TIER_COLORS.safety : undefined}>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-sm text-slate-300">{p.background}</p>
                <p className="mt-2 text-sm text-slate-100">{p.fit}</p>
              </GlassCard>
            ))}
          </div>
          <Callout>{faculty.visiting}</Callout>

          <h3 className="pt-4 font-display text-2xl font-semibold text-white">{faculty.pathsTitle}</h3>
          <ol className="space-y-3">
            {faculty.paths.map((p, i) => {
              const on = lit === p.id
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onMouseEnter={() => setActivePath(p.id)}
                    onMouseLeave={() => setActivePath(null)}
                    onFocus={() => setActivePath(p.id)}
                    onBlur={() => setActivePath(null)}
                    onClick={() => setActivePath(on ? null : p.id)}
                    className="glass w-full p-4 text-left transition sm:p-5"
                    style={on ? { borderColor: `${TIER_COLORS.dream}aa`, boxShadow: `0 0 30px -8px ${TIER_COLORS.dream}` } : undefined}
                  >
                    <span className="flex gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display font-bold text-ink" style={{ background: TIER_COLORS.dream }} aria-hidden>
                        {i + 1}
                      </span>
                      <span>
                        <span className="sr-only">{i + 1}. </span>
                        <strong className="block font-semibold text-white">{p.title}</strong>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-300">{p.body}</span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div>
            <h4 className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Sources</h4>
            <ul className="flex flex-wrap gap-2">
              {faculty.sources.map((s) => (
                <li key={s} className="min-w-0 max-w-full">
                  <a
                    href={s}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-chip inline-block max-w-full rounded-full border border-range/30 bg-range/5 px-3 py-1 text-xs text-range hover:bg-range/15"
                  >
                    {s.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Split>
      </div>
    </Section>
  )
}

export function Footer() {
  return (
    <footer id="footer" aria-labelledby="footer-title" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 pb-16 pt-10 sm:px-6">
      <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-range">10 · Disclaimer</p>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
        <SceneCanvas label="Slowly turning red warning beacon" icon="⚠️" camera={[0, 0.3, 6]} className="scene-short" grid={false}>
          <FooterScene />
        </SceneCanvas>
        <GlassCard glow={TIER_COLORS.warning} className="p-6 sm:p-8">
          <h2 id="footer-title" className="font-display text-2xl font-bold text-white sm:text-3xl">
            {footer.card}
          </h2>
          <p className="mt-4 text-slate-300">{footer.text}</p>
        </GlassCard>
      </div>
      <p className="mt-12 text-center text-xs text-slate-500">MS Abroad Roadmap – Fall 2028 · CS / Cloud Computing / AI Infrastructure</p>
    </footer>
  )
}
