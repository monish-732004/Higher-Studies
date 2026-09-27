import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { faculty } from '../data/content'
import { useEnv } from '../lib/env'
import { TIER_COLORS } from '../lib/tiers'
import { Beam, CameraRig, useSmoothedProgress } from '../components/three-kit'

type Kind = 'you' | 'faculty' | 'warn' | 'visiting' | 'path'
interface Node {
  id: string
  label: string
  kind: Kind
  pos: THREE.Vector3
  stars?: number
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const POS: Record<string, THREE.Vector3> = {
  you: V(0, 0, 0),
  amutha: V(2.1, 0.9, 0.6),
  nambiar: V(-2.2, 1.2, 0.2),
  rubia: V(-2.3, -1.1, -0.9),
  chittoor: V(-0.2, -2.1, -0.8),
  selvin: V(2.2, -1.2, -0.4),
  jansi: V(-0.3, 2.3, -0.9),
  bagdasar: V(-3.4, 0.1, -2.4),
  pecorella: V(3.5, 0.2, -2.6),
  abroad: V(-1.5, -0.6, 2.4),
  honours: V(1.1, -1.4, 2.3),
  lab: V(3.4, 2.1, 1.2),
}

const NODES: Node[] = [
  { id: 'you', label: 'You', kind: 'you', pos: POS.you },
  ...faculty.people.map((p) => ({ id: p.id, label: p.short, kind: 'faculty' as Kind, pos: POS[p.id], stars: p.stars })),
  { id: 'jansi', label: 'Dr. K.R. Jansi ⚠️', kind: 'warn', pos: POS.jansi },
  ...faculty.visitingPeople.map((p) => ({ id: p.id, label: p.short, kind: 'visiting' as Kind, pos: POS[p.id] })),
  ...faculty.paths.map((p, i) => ({ id: p.id, label: `Path ${i + 1}: ${p.short}`, kind: 'path' as Kind, pos: POS[p.id] })),
]

/** Highlighted routes for the 3 paths. */
export const ROUTES: Record<string, string[]> = {
  abroad: ['you', 'abroad'],
  honours: ['you', 'honours'],
  lab: ['you', 'amutha', 'lab'],
}

function colorOf(n: Node) {
  switch (n.kind) {
    case 'you':
      return '#ffffff'
    case 'warn':
      return TIER_COLORS.warning
    case 'visiting':
      return TIER_COLORS.highReach
    case 'path':
      return TIER_COLORS.dream
    default:
      return n.stars === 3 ? TIER_COLORS.safety : n.stars === 2 ? TIER_COLORS.range : '#8796b8'
  }
}

function RoutePulse({ ids, active }: { ids: string[]; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const { reduced } = useEnv()
  const curve = useMemo(() => new THREE.CatmullRomCurve3(ids.map((id) => POS[id]), false, 'catmullrom', 0.1), [ids])
  useFrame((s) => {
    if (!ref.current) return
    ref.current.visible = !reduced
    ref.current.position.copy(curve.getPointAt((s.clock.elapsedTime * (active ? 0.45 : 0.22)) % 1))
  })
  return (
    <mesh ref={ref} scale={active ? 1.6 : 1}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={TIER_COLORS.dream} toneMapped={false} />
    </mesh>
  )
}

export default function FacultyScene({ activePath, onNode }: { activePath: string | null; onNode: (id: string | null) => void }) {
  const [hover, setHover] = useState<string | null>(null)
  const group = useRef<THREE.Group>(null)
  const progress = useSmoothedProgress()
  const { reduced } = useEnv()
  const camPos = useRef(new THREE.Vector3(0, 1, 9))
  const look = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, dt) => {
    const th = THREE.MathUtils.lerp(-0.45, 0.45, progress.current)
    camPos.current.set(Math.sin(th) * 8.6, 0.9, Math.cos(th) * 8.6)
    if (group.current && !reduced && !hover) group.current.rotation.y += dt * 0.04
  })

  const edges = useMemo(() => {
    const e: { a: string; b: string; r: number; color: string; dashed?: boolean }[] = []
    faculty.people.forEach((p) => e.push({ a: 'you', b: p.id, r: 0.012 + p.stars * 0.02, color: colorOf({ kind: 'faculty', stars: p.stars } as Node) }))
    faculty.visitingPeople.forEach((p) => e.push({ a: 'you', b: p.id, r: 0.012, color: TIER_COLORS.highReach }))
    e.push({ a: 'you', b: 'jansi', r: 0.02, color: TIER_COLORS.warning, dashed: true })
    return e
  }, [])

  return (
    <>
      <CameraRig position={camPos} lookAt={look} parallax={0.5} />
      <group ref={group} scale={0.8}>
        {edges.map((e) =>
          e.dashed ? (
            <Line key={e.b} points={[POS[e.a], POS[e.b]]} color={e.color} lineWidth={2} dashed dashSize={0.15} gapSize={0.1} />
          ) : (
            <Beam key={e.b} from={POS[e.a]} to={POS[e.b]} radius={e.r} color={e.color} opacity={0.75} emissive={0.5} />
          ),
        )}
        {/* the 3 paths: glowing routes */}
        {Object.entries(ROUTES).map(([id, ids]) => {
          const on = activePath === id
          return (
            <group key={id}>
              {ids.slice(1).map((b, i) => (
                <Beam key={b} from={POS[ids[i]]} to={POS[b]} radius={on ? 0.07 : 0.045} color={TIER_COLORS.dream} emissive={on ? 2.5 : 1.1} opacity={activePath && !on ? 0.35 : 1} />
              ))}
              <RoutePulse ids={ids} active={on} />
            </group>
          )
        })}
        {NODES.map((n) => {
          const c = colorOf(n)
          const size = n.kind === 'you' ? 0.38 : n.kind === 'path' ? 0.26 : n.kind === 'faculty' ? 0.16 + (n.stars ?? 1) * 0.04 : 0.17
          const lit = hover === n.id || (activePath && ROUTES[activePath]?.includes(n.id))
          return (
            <group key={n.id} position={n.pos}>
              <mesh
                scale={lit ? 1.25 : 1}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  setHover(n.id)
                  onNode(n.id)
                  document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                  setHover(null)
                  onNode(null)
                  document.body.style.cursor = ''
                }}
              >
                {n.kind === 'path' ? <octahedronGeometry args={[size]} /> : n.kind === 'you' ? <icosahedronGeometry args={[size, 1]} /> : <sphereGeometry args={[size, 20, 20]} />}
                <meshStandardMaterial color={c} emissive={c} emissiveIntensity={lit ? 2.2 : n.kind === 'you' ? 0.9 : 0.7} toneMapped={!lit} flatShading={n.kind === 'you'} />
              </mesh>
              <Html center position={[0, -size - 0.22, 0]} zIndexRange={[10, 0]} aria-hidden>
                <span className={`scene-label ${lit ? '!opacity-100' : ''}`} style={{ color: c }}>
                  {n.label}
                  {n.stars ? ` ${'⭐'.repeat(n.stars)}` : ''}
                </span>
              </Html>
            </group>
          )
        })}
      </group>
    </>
  )
}
