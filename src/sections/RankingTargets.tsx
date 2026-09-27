import { lazy, useState } from 'react'
import { cgpa, flagOf, gre, ielts, ranking } from '../data/content'
import { SceneCanvas } from '../components/SceneCanvas'
import { Callout, GlassCard, Section, Split, TierPill } from '../components/ui'
import { levelHex, TIER_COLORS } from '../lib/tiers'
import { Rich } from '../lib/rich'

const RankingScene = lazy(() => import('../scenes/RankingScene'))
const IeltsScene = lazy(() => import('../scenes/TargetScenes').then((m) => ({ default: m.IeltsScene })))
const GreScene = lazy(() => import('../scenes/TargetScenes').then((m) => ({ default: m.GreScene })))
const CgpaScene = lazy(() => import('../scenes/TargetScenes').then((m) => ({ default: m.CgpaScene })))

export function Ranking() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <Section id="ranking" index={3} kicker="College Ranking" title="13 levels, top to bottom" intro={<p>{ranking.intro}</p>}>
      <Split
        scene={
          <SceneCanvas label="3D spiral tower of 13 ranking levels, gold at level 1 fading to green at level 13, each holding its colleges' flags" icon="🏛️" camera={[1.7, 4.2, 8.5]}>
            <RankingScene selected={selected} onSelect={setSelected} />
          </SceneCanvas>
        }
      >
        <ol className="space-y-2">
          {ranking.levels.map((level, i) => {
            const color = levelHex(i, ranking.levels.length)
            const on = selected === i
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(on ? null : i)}
                  className={`glass flex w-full items-start gap-3 !rounded-2xl p-3 text-left transition sm:p-4 ${on ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'}`}
                  style={on ? { borderColor: color, boxShadow: `0 0 28px -8px ${color}` } : undefined}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold text-ink" style={{ background: color }}>
                    <span className="sr-only">Level </span>
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 flex-wrap gap-x-1 gap-y-1 pt-1.5 text-[15px] text-slate-100">
                    {level.map((c, k) => (
                      <span key={c.name} className="whitespace-nowrap">
                        {c.name} {flagOf(c.country)}
                        {c.warn && '⚠️'}
                        {k < level.length - 1 && <span className="px-1 text-slate-500">/</span>}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <GlassCard className="space-y-2 p-5">
          <h3 className="font-display text-lg font-semibold text-white">Notes</h3>
          {ranking.notes.map((n) => (
            <Callout key={n} tone={n.startsWith('⚠️') ? 'warn' : 'info'}>
              {n}
            </Callout>
          ))}
        </GlassCard>
      </Split>
    </Section>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">{children}</h3>
}

export function Targets() {
  return (
    <Section id="targets" index={4} kicker="Test & CGPA Targets" title="Scores to aim for">
      <div className="space-y-20">
        {/* IELTS / TOEFL */}
        <Split
          scene={
            <SceneCanvas label="3D bar towers per tier comparing minimum and aim-for IELTS scores, with a glowing plane at the 7.5 target" icon="📊">
              <IeltsScene />
            </SceneCanvas>
          }
        >
          <SubHeading>IELTS / TOEFL targets</SubHeading>
          <GlassCard className="hidden p-2 md:block" tilt={false}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400">
                  {ielts.columns.map((c) => (
                    <th key={c} scope="col" className="p-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ielts.rows.map((r) => (
                  <tr key={r.tier} className="border-t border-white/5 align-top">
                    <th scope="row" className="p-3 font-semibold whitespace-nowrap" style={{ color: TIER_COLORS[r.tier] }}>
                      {r.label}
                    </th>
                    <td className="p-3 text-slate-300">{r.colleges}</td>
                    <td className="p-3 text-slate-100">{r.minimum}</td>
                    <td className="p-3 text-slate-100">{r.aim}</td>
                    <td className="p-3 text-slate-100">{r.toefl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
          <div className="space-y-3 md:hidden">
            {ielts.rows.map((r) => (
              <GlassCard key={r.tier} glow={TIER_COLORS[r.tier]} className="p-4">
                <TierPill tier={r.tier}>{r.label}</TierPill>
                <p className="mt-2 text-sm text-slate-300">{r.colleges}</p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-slate-400">{ielts.columns[2]}</dt>
                  <dd className="text-slate-100">{r.minimum}</dd>
                  <dt className="text-slate-400">{ielts.columns[3]}</dt>
                  <dd className="text-slate-100">{r.aim}</dd>
                  <dt className="text-slate-400">{ielts.columns[4]}</dt>
                  <dd className="text-slate-100">{r.toefl}</dd>
                </dl>
              </GlassCard>
            ))}
          </div>
          <ul className="space-y-2">
            {ielts.notes.map((n) => (
              <li key={n}>
                <Callout>
                  <Rich text={n} />
                </Callout>
              </li>
            ))}
          </ul>
        </Split>

        {/* GRE */}
        <Split
          sceneRight
          scene={
            <SceneCanvas label="3D Quant gauges per tier, and a wall of flags for countries where the GRE is not needed" icon="🎛️">
              <GreScene />
            </SceneCanvas>
          }
        >
          <SubHeading>
            <Rich text={gre.title} />
          </SubHeading>
          <div className="space-y-3">
            {gre.tiers.map((t) => (
              <GlassCard key={t.tier} glow={TIER_COLORS[t.tier]} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg" style={{ color: TIER_COLORS[t.tier] }}>
                    <Rich text={t.label} />
                  </span>
                  <span className="text-slate-300">– {t.colleges}</span>
                </div>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-slate-400">Status:</dt>
                  <dd className="text-slate-100">{t.status}</dd>
                  <dt className="text-slate-400">Aim:</dt>
                  <dd className="font-medium text-white">{t.aim}</dd>
                </dl>
              </GlassCard>
            ))}
          </div>
          <GlassCard glow={TIER_COLORS.warning} className="p-4 sm:p-5">
            <p className="font-display text-lg text-warning">
              <Rich text={gre.notNeededLabel} />
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              {gre.notNeeded.map((n) => (
                <li key={n.code}>
                  {flagOf(n.code)} {n.colleges}
                </li>
              ))}
            </ul>
          </GlassCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-4 sm:p-5">
              <h4 className="font-display font-semibold text-white">When to submit:</h4>
              <ul className="mt-2 space-y-1.5 text-sm">
                {gre.whenToSubmit.map((w) => (
                  <li key={w.rule} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TIER_COLORS[w.tier] }} />
                    <span className="text-slate-100">{w.rule}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard className="p-4 sm:p-5">
              <h4 className="font-display font-semibold text-white">Timeline:</h4>
              <ol className="mt-2 space-y-1.5 border-l border-range/40 pl-3 text-sm text-slate-100">
                {gre.timeline.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </GlassCard>
          </div>
          <ul className="space-y-2">
            {gre.notes.map((n) => (
              <li key={n}>
                <Callout tone={n.startsWith('⚠️') ? 'warn' : 'info'}>{n}</Callout>
              </li>
            ))}
          </ul>
        </Split>

        {/* CGPA */}
        <Split
          scene={
            <SceneCanvas label="3D CGPA gauge showing 9.36 against each tier's minimum-to-aim band, and a converter from 9.36 to German grade 1.3–1.4" icon="🎓">
              <CgpaScene />
            </SceneCanvas>
          }
        >
          <SubHeading>{cgpa.title}</SubHeading>
          <GlassCard glow={TIER_COLORS.dream} className="p-5 text-xl text-slate-100">
            <Rich text={cgpa.mine} />
          </GlassCard>
          <div className="space-y-3">
            {cgpa.tiers.map((t) => (
              <GlassCard key={t.tier} glow={TIER_COLORS[t.tier]} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg" style={{ color: TIER_COLORS[t.tier] }}>
                    <Rich text={t.label} />
                  </span>
                  <span className="text-sm text-slate-300">– {t.colleges}</span>
                </div>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-slate-400">Minimum:</dt>
                  <dd className="text-slate-100">{t.minimum}</dd>
                  <dt className="text-slate-400">Aim:</dt>
                  <dd className="text-slate-100">{t.aim}</dd>
                  <dt className="text-slate-400">Status:</dt>
                  <dd className="font-medium text-safety">{t.status}</dd>
                </dl>
              </GlassCard>
            ))}
          </div>
          <Callout>{cgpa.germanyNote}</Callout>
          <GlassCard className="p-5">
            <h4 className="font-display text-lg font-semibold text-white">{cgpa.whatMattersTitle}</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-100">
              {cgpa.whatMatters.map((w) => (
                <li key={w} className="flex gap-2">
                  {!w.startsWith('💡') && (
                    <span aria-hidden className="text-range">
                      ›
                    </span>
                  )}
                  <span className={w.startsWith('💡') ? 'font-medium text-dream' : ''}>{w}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </Split>
      </div>
    </Section>
  )
}

