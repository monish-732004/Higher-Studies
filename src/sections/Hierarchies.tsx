import { lazy, useState } from 'react'
import { certifications, internships, lor, sop } from '../data/content'
import { SceneCanvas } from '../components/SceneCanvas'
import { GlassCard, Section, Split, TierGroups } from '../components/ui'
import { TIER_COLORS } from '../lib/tiers'
import { Rich } from '../lib/rich'

const LorScene = lazy(() => import('../scenes/HierarchyScenes').then((m) => ({ default: m.LorScene })))
const SopScene = lazy(() => import('../scenes/HierarchyScenes').then((m) => ({ default: m.SopScene })))
const CertScene = lazy(() => import('../scenes/HierarchyScenes').then((m) => ({ default: m.CertScene })))
const InternScene = lazy(() => import('../scenes/InternScenes').then((m) => ({ default: m.InternScene })))
const RoadScene = lazy(() => import('../scenes/InternScenes').then((m) => ({ default: m.RoadScene })))

export function Lor() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <Section id="lor" index={5} kicker="LOR Hierarchy" title="Who should write your letters" intro={<p>Click a block in the podium or an item in the list to focus it.</p>}>
      <Split
        scene={
          <SceneCanvas label="3D podium of 9 metallic blocks: gold Tier 1 at the back and top, silver Tier 2, bronze Tier 3 at the front" icon="🏆">
            <LorScene selected={selected} onSelect={setSelected} />
          </SceneCanvas>
        }
      >
        <TierGroups groups={lor} selected={selected} onSelect={setSelected} />
      </Split>
    </Section>
  )
}

export function Sop() {
  const [selected, setSelected] = useState<number | null>(null)
  const [step, setStep] = useState(-1)
  return (
    <Section id="sop" index={6} kicker="SOP Hierarchy" title="What your SOP should spend its words on">
      <Split
        sceneRight
        scene={
          <SceneCanvas label="Stacked translucent tier layers (Tier 1 on top) and 5 floating stepping stones for the SOP structure; the camera walks across them as you scroll" icon="🪜">
            <SopScene selected={selected} onSelect={setSelected} step={step} onStep={setStep} />
          </SceneCanvas>
        }
      >
        <TierGroups groups={sop.tiers} selected={selected} onSelect={setSelected} />
        <GlassCard glow={TIER_COLORS.range} className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold text-white">{sop.structureTitle}</h3>
          <ol className="mt-4 space-y-2">
            {sop.structure.map((s, i) => {
              const on = step === i
              return (
                <li
                  key={s.n}
                  aria-current={on ? 'step' : undefined}
                  className="flex gap-3 rounded-xl border p-3 transition"
                  style={{ borderColor: on ? `${TIER_COLORS.dream}99` : 'transparent', background: on ? `${TIER_COLORS.dream}12` : 'rgba(255,255,255,0.02)' }}
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-ink"
                    style={{ background: on ? TIER_COLORS.dream : TIER_COLORS.range }}
                    aria-hidden
                  >
                    {s.n}
                  </span>
                  <p className="text-sm text-slate-200">
                    <span className="sr-only">{s.n}. </span>
                    <strong className="font-semibold text-white">{s.title}</strong> {s.body}
                  </p>
                </li>
              )
            })}
          </ol>
        </GlassCard>
      </Split>
    </Section>
  )
}

export function Internships() {
  const [selected, setSelected] = useState<number | null>(null)
  const [step, setStep] = useState(0)
  return (
    <Section id="internships" index={7} kicker="Internships" title="The internship that goes on the CV">
      <div role="region" aria-labelledby="alerts-title" className="glass alert-pulse mb-10 !border-warning/60 p-5 sm:p-6" style={{ background: 'linear-gradient(135deg, rgba(255,77,94,0.18), rgba(255,77,94,0.05))' }}>
        <h3 id="alerts-title" className="font-display text-xl font-bold text-warning">{internships.alertTitle}</h3>
        <ul className="mt-3 space-y-2 text-[15px] text-slate-100">
          {internships.alerts.map((a) => (
            <li key={a} className="flex gap-2">
              <span aria-hidden className="text-warning">
                ●
              </span>
              <span>
                <Rich text={a} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Split
        scene={
          <SceneCanvas label="Pulsing red 3D alert banner above 9 medals in gold, silver and bronze tiers" icon="🏅">
            <InternScene selected={selected} onSelect={setSelected} />
          </SceneCanvas>
        }
      >
        <TierGroups groups={internships.tiers} selected={selected} onSelect={setSelected} />
      </Split>

      <div className="mt-20">
        <Split
          sceneRight
          scene={
            <SceneCanvas label="Glowing 3D road with 6 milestone markers for the internship timeline; the camera drives along it as you scroll" icon="🛣️">
              <RoadScene step={step} onStep={setStep} />
            </SceneCanvas>
          }
        >
          <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">{internships.timelineTitle}</h3>
          <ol className="relative space-y-3 border-l-2 border-range/30 pl-5">
            {internships.timeline.map((t, i) => {
              const on = step === i
              const past = i < step
              const color = on ? TIER_COLORS.dream : past ? TIER_COLORS.safety : TIER_COLORS.range
              return (
                <li key={t.when} aria-current={on ? 'step' : undefined} className="relative">
                  <span aria-hidden className="absolute -left-[29px] top-5 h-3.5 w-3.5 rounded-full ring-4 ring-ink" style={{ background: color, boxShadow: on ? `0 0 16px ${color}` : undefined }} />
                  <GlassCard className="p-4" glow={on ? color : undefined}>
                    <p className="font-display text-sm font-semibold" style={{ color }}>
                      {t.when}
                    </p>
                    <p className="mt-1 text-sm text-slate-200">{t.what}</p>
                  </GlassCard>
                </li>
              )
            })}
          </ol>
        </Split>
      </div>
    </Section>
  )
}

export function Certifications() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <Section id="certifications" index={8} kicker="Certifications" title="10 certifications, ranked">
      <Split
        scene={
          <SceneCanvas label="10 rotating metallic coins grouped by tier: 3 gold, 4 silver, 3 bronze" icon="🪙">
            <CertScene selected={selected} onSelect={setSelected} />
          </SceneCanvas>
        }
      >
        <TierGroups groups={certifications.tiers} selected={selected} onSelect={setSelected} />
        <GlassCard glow={TIER_COLORS.safety} className="p-5 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-safety">{certifications.orderLabel}</h3>
          <ol className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {certifications.order.map((o, i) => (
              <li key={o} className="flex items-center gap-2">
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-100">{o}</span>
                {i < certifications.order.length - 1 && (
                  <span aria-hidden className="text-range">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-slate-300">{certifications.orderTail}</p>
        </GlassCard>
      </Split>
    </Section>
  )
}
