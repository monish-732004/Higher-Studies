import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { countries, type CountryCode } from '../data/content'
import { useEnv } from '../lib/env'
import { TIER_COLORS } from '../lib/tiers'
import { CameraRig, Flag, useSmoothedProgress } from '../components/three-kit'

function Paper({ w = 1.1, h = 1.45, color = '#eef2fb', children }: { w?: number; h?: number; color?: string; children?: ReactNode }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[w, h, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <group position-z={0.012}>{children}</group>
    </group>
  )
}

const Lines = ({ n, y0, w, gap = 0.12, x = 0 }: { n: number; y0: number; w: number; gap?: number; x?: number }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <mesh key={i} position={[x, y0 - i * gap, 0]}>
        <planeGeometry args={[w * (i % 3 === 2 ? 0.7 : 1), 0.035]} />
        <meshBasicMaterial color="#9aa7c2" />
      </mesh>
    ))}
  </>
)

const DOCS: { key: string; node: ReactNode }[] = [
  {
    key: 'passport',
    node: (
      <group>
        <mesh>
          <boxGeometry args={[0.9, 1.25, 0.08]} />
          <meshStandardMaterial color="#17295a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.12, 0.045]}>
          <torusGeometry args={[0.17, 0.025, 8, 32]} />
          <meshStandardMaterial color={TIER_COLORS.dream} emissive={TIER_COLORS.dream} emissiveIntensity={0.9} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.3, 0.045]}>
          <planeGeometry args={[0.5, 0.05]} />
          <meshBasicMaterial color={TIER_COLORS.dream} />
        </mesh>
      </group>
    ),
  },
  {
    key: 'transcript',
    node: (
      <Paper>
        <mesh position={[0, 0.58, 0]}>
          <planeGeometry args={[1.1, 0.2]} />
          <meshBasicMaterial color="#1f5fb0" />
        </mesh>
        <Lines n={8} y0={0.35} w={0.85} />
      </Paper>
    ),
  },
  {
    key: 'cv',
    node: (
      <Paper>
        <mesh position={[-0.3, 0.45, 0]}>
          <circleGeometry args={[0.14, 24]} />
          <meshBasicMaterial color="#3DA5FF" />
        </mesh>
        <Lines n={2} y0={0.5} w={0.4} x={0.15} />
        <Lines n={7} y0={0.15} w={0.85} />
      </Paper>
    ),
  },
  {
    key: 'certificate',
    node: (
      <group>
        <mesh position-z={-0.005}>
          <boxGeometry args={[1.5, 1.08, 0.015]} />
          <meshStandardMaterial color={TIER_COLORS.dream} metalness={0.7} roughness={0.35} />
        </mesh>
        <Paper w={1.4} h={0.98} color="#f7f0dc">
          <Lines n={4} y0={0.25} w={0.9} gap={0.13} />
          <mesh position={[0.45, -0.28, 0.01]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
            <meshStandardMaterial color={TIER_COLORS.warning} emissive={TIER_COLORS.warning} emissiveIntensity={0.4} />
          </mesh>
        </Paper>
      </group>
    ),
  },
  {
    key: 'score',
    node: (
      <Paper>
        <Lines n={2} y0={0.55} w={0.7} />
        {[0.55, 0.8, 0.7, 0.95].map((h, i) => (
          <mesh key={i} position={[-0.33 + i * 0.22, -0.55 + h / 2, 0]}>
            <planeGeometry args={[0.14, h]} />
            <meshBasicMaterial color={[TIER_COLORS.safety, TIER_COLORS.range, TIER_COLORS.target, TIER_COLORS.dream][i]} />
          </mesh>
        ))}
      </Paper>
    ),
  },
]

function DocStack() {
  const refs = useRef<(THREE.Group | null)[]>([])
  const progress = useSmoothedProgress()
  const { reduced } = useEnv()
  const pivot = new THREE.Vector3(0, -3.2, 0)
  useFrame((s) => {
    // fan out between 20% and 45% of the section's scroll
    const f = reduced ? 1 : THREE.MathUtils.smoothstep(progress.current, 0.18, 0.42)
    const t = s.clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      const a = (i - 2) * 0.32
      const fx = pivot.x + Math.sin(a) * 3.4
      const fy = pivot.y + Math.cos(a) * 3.4
      const sx = 0
      const sy = i * 0.06 - 0.1
      g.position.set(THREE.MathUtils.lerp(sx, fx, f), THREE.MathUtils.lerp(sy, fy, f) + (reduced ? 0 : Math.sin(t * 1.2 + i) * 0.05), i * 0.03 + f * 0.1)
      g.rotation.set(THREE.MathUtils.lerp(-1.1, -0.15, f), THREE.MathUtils.lerp(0, 0, f), THREE.MathUtils.lerp(i * 0.08, -a, f))
    })
  })
  return (
    <group position={[0, -0.2, 0]}>
      {DOCS.map((d, i) => (
        <group key={d.key} ref={(el) => void (refs.current[i] = el)}>
          {d.node}
        </group>
      ))}
    </group>
  )
}

function FlagRing({ active }: { active: CountryCode | null }) {
  const ring = useRef<THREE.Group>(null)
  const { reduced } = useEnv()
  const r = 3.3
  useFrame((_, dt) => {
    const g = ring.current
    if (!g) return
    const idx = countries.findIndex((c) => c.code === active)
    if (idx >= 0) {
      const target = -(idx / countries.length) * Math.PI * 2
      const cur = g.rotation.y
      const goal = cur + Math.atan2(Math.sin(target - cur), Math.cos(target - cur))
      g.rotation.y = reduced ? goal : THREE.MathUtils.lerp(cur, goal, 1 - Math.exp(-dt * 3))
    } else if (!reduced) g.rotation.y += dt * 0.15
  })
  return (
    <group ref={ring} position={[0, 2.1, -0.6]}>
      {countries.map((c, i) => {
        const th = (i / countries.length) * Math.PI * 2
        const on = c.code === active
        return (
          <group key={c.code} position={[Math.sin(th) * r, 0, Math.cos(th) * r]} rotation-y={th}>
            <group scale={on ? 0.8 : 0.6}>
              <Flag code={c.code} position={[-0.75, 0, 0]} />
            </group>
            {on && (
              <mesh position-y={-0.95} rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.35, 0.45, 40]} />
                <meshBasicMaterial color={TIER_COLORS.dream} toneMapped={false} transparent opacity={0.9} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default function DocsScene({ active }: { active: CountryCode | null }) {
  const camPos = useRef(new THREE.Vector3(0, 1.2, 8.5))
  const look = useRef(new THREE.Vector3(0, 0.7, 0))
  return (
    <>
      <CameraRig position={camPos} lookAt={look} />
      <DocStack />
      <FlagRing active={active} />
    </>
  )
}
