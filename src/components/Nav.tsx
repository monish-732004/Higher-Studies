import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { sections } from '../data/content'

export function Nav() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav aria-label="Sections" className="glass-nav mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#hero" className="shrink-0 font-display text-sm font-bold tracking-wide text-white">
          MS Abroad <span className="text-dream">2028</span>
        </a>
        <ul className="hidden items-center gap-0.5 xl:flex">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'location' : undefined}
                className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                  active === s.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Sections'}
        </button>
      </nav>
      {open && (
        <ul id="mobile-nav" className="glass-nav grid grid-cols-2 gap-1 border-t border-white/5 p-3 xl:hidden">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm ${active === s.id ? 'bg-white/10 text-white' : 'text-slate-300'}`}
              >
                <span className="mr-2 text-slate-500">{String(i + 1).padStart(2, '0')}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <motion.div
        aria-hidden
        className="h-[2px] origin-left"
        style={{ scaleX, background: 'linear-gradient(90deg,#2FD47A,#3DA5FF,#F5C542,#FF7A3D)' }}
      />
    </header>
  )
}
