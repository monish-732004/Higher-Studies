import { EnvProvider } from './lib/env'
import { Nav } from './components/Nav'
import { Documents, Hero } from './sections/HeroDocs'
import { Ranking, Targets } from './sections/RankingTargets'
import { Certifications, Internships, Lor, Sop } from './sections/Hierarchies'
import { Faculty, Footer } from './sections/FacultyFooter'

export default function App() {
  return (
    <EnvProvider>
      <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-16 focus:z-[60] focus:rounded-lg focus:bg-range focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Documents />
        <Ranking />
        <Targets />
        <Lor />
        <Sop />
        <Internships />
        <Certifications />
        <Faculty />
      </main>
      <Footer />
    </EnvProvider>
  )
}
