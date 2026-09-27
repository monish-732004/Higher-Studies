import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges, Html } from '@react-three/drei'
import { certifications, lor, sop, type Medal } from '../data/content'
import { useEnv } from '../lib/env'
import { MEDAL_COLORS, TIER_COLORS } from '../lib/tiers'
import { CameraRig, MetalEnv, medalMaterialProps, useSmoothedProgress } from '../components/three-kit'

interface SelectProps {
  selected: number | null
  onSelect: (n: number | null) => void
}

const Num = ({ n, color, position }: { n: number; color: string; position: [number, number, number] }) => (
  <Html position={position} center zIndexRange={[10, 0]} aria-hidden>
    <span className="rank-num" style={{ borderColor: color, color }}>
      {n}
    </span>
  </Html>
)

function hoverHandlers(n: number, onSelect: (n: number | null) => void) {
  return {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onSelect(n)
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  }
}

/** Smoothly animates a group's position/scale toward targets each frame. */
function useEase(ref: React.RefObject<THREE.Group | null>, y: number, scale = 1) {
  const { reduced } = useEnv()
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const k = reduced ? 1 : 1 - Math.exp(-dt * 6)
    g.position.y = THREE.MathUtils.lerp(g.position.y, y, k)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, scale, k))
  })
}

/* ───────────── LOR: 9-block podium (gold back/top, bronze front/low) ───────────── */

const ROW: Record<Medal, { h: number; z: number }> = {
  gold: { h: 2.1, z: -1.3 },
  silver: { h: 1.35, z: 0 },
  bronze: { h: 0.7, z: 1.3 },
}

function PodiumBlock({ n, medal, x, selected, onSelect }: { n: number; medal: Medal; x: number } & SelectProps) {
  const ref = useRef<THREE.Group>(null)
  const { h, z } = ROW[medal]
  const on = selected === n
  useEase(ref, on ? 0.35 : 0)
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh position-y={-2.2 + h / 2} {...hoverHandlers(n, onSelect)}>
        <boxGeometry args={[1.15, h, 1.15]} />
        <meshStandardMaterial {...medalMaterialProps(medal)} emissive={MEDAL_COLORS[medal]} emissiveIntensity={on ? 0.55 : 0.04} />
        {on && <Edges color="#ffffff" />}
      </mesh>
      <Num n={n} color={MEDAL_COLORS[medal]} position={[0, -2.2 + h + 0.25, 0]} />
    </group>
  )
}

export function LorScene({ selected, onSelect }: SelectProps) {
  const progress = useSmoothedProgress()
  const camPos = useRef(new THREE.Vector3(4, 2.5, 7.5))
  const look = useRef(new THREE.Vector3(0, -0.6, 0))
  useFrame(() => {
    const th = THREE.MathUtils.lerp(0.55, -0.45, progress.current)
    camPos.current.set(Math.sin(th) * 8, 2.6, Math.cos(th) * 8)
    if (selected) {
      const g = lor.find((t) => t.items.some((i) => i.n === selected))!
      const idx = g.items.findIndex((i) => i.n === selected)
      look.current.set((idx - 1) * 1.3 * 0.5, -0.4, ROW[g.medal].z * 0.5)
    } else look.current.set(0, -0.6, 0)
  })
  return (
    <>
      <MetalEnv />
      <CameraRig position={camPos} lookAt={look} />
      <group onPointerMissed={() => onSelect(null)}>
        {lor.map((g) => g.items.map((it, i) => <PodiumBlock key={it.n} n={it.n} medal={g.medal} x={(i - 1) * 1.3} selected={selected} onSelect={onSelect} />))}
      </group>
    </>
  )
}

/* ───────────── SOP: translucent tier layers + 5 stepping stones ───────────── */

const STONES = [
  new THREE.Vector3(-1.4, -1.9, 2.6),
  new THREE.Vector3(0.2, -1.75, 1.6),
  new THREE.Vector3(1.6, -1.6, 0.4),
  new THREE.Vector3(2.6, -1.45, -1.0),
  new THREE.Vector3(3.2, -1.3, -2.6),
]

export function SopScene({ selected, onSelect, step, onStep }: SelectProps & { step: number; onStep: (s: number) => void }) {
  const progress = useSmoothedProgress()
  const camPos = useRef(new THREE.Vector3(-1, 2, 9))
  const look = useRef(new THREE.Vector3(0, 0, 0))
  const lastStep = useRef(-1)
  const { reduced } = useEnv()
  useFrame(() => {
    // overview first, then walk the camera across stones 1 → 5
    const p = reduced ? 0 : progress.current
    const w = THREE.MathUtils.smoothstep(p, 0.45, 0.85)
    const k = w * 4
    const i0 = Math.min(3, Math.floor(k))
    const cur = STONES[i0].clone().lerp(STONES[i0 + 1], k - i0)
    // stay high and wide enough that the tier layers remain in frame while walking
    const walkPos = cur.clone().add(new THREE.Vector3(-3, 3.6, 5.4))
    const overview = new THREE.Vector3(-0.6, 2.4, 9.5)
    const blend = THREE.MathUtils.smoothstep(p, 0.35, 0.5)
    camPos.current.copy(overview.lerp(walkPos, blend))
    look.current.copy(new THREE.Vector3(0.4, 0, -0.5).lerp(cur.clone().add(new THREE.Vector3(-0.8, 1, -0.8)), blend))
    const active = p < 0.42 ? -1 : Math.round(k)
    if (active !== lastStep.current) {
      lastStep.current = active
      onStep(active)
    }
  })
  const layerY: Record<Medal, number> = { gold: 1.6, silver: 0.6, bronze: -0.4 }
  return (
    <>
      <MetalEnv />
      <CameraRig position={camPos} lookAt={look} speed={2.5} />
      <group position={[-1.2, 0, -1]} onPointerMissed={() => onSelect(null)}>
        {sop.tiers.map((g) => (
          <group key={g.medal} position-y={layerY[g.medal]}>
            <mesh>
              <boxGeometry args={[3.2, 0.1, 2]} />
              <meshStandardMaterial color={MEDAL_COLORS[g.medal]} emissive={MEDAL_COLORS[g.medal]} emissiveIntensity={0.25} transparent opacity={0.28} depthWrite={false} />
              <Edges color={MEDAL_COLORS[g.medal]} />
            </mesh>
            {g.items.map((it, i) => {
              const on = selected === it.n
              return (
                <group key={it.n} position={[(i - 1) * 1, 0.25, 0]}>
                  <mesh {...hoverHandlers(it.n, onSelect)} scale={on ? 1.25 : 1}>
                    <boxGeometry args={[0.55, 0.3, 0.55]} />
                    <meshStandardMaterial {...medalMaterialProps(g.medal)} emissive={MEDAL_COLORS[g.medal]} emissiveIntensity={on ? 0.7 : 0.05} />
                  </mesh>
                  <Num n={it.n} color={MEDAL_COLORS[g.medal]} position={[0, 0.45, 0]} />
                </group>
              )
            })}
          </group>
        ))}
      </group>
      {STONES.map((p, i) => {
        const on = step === i
        const c = on ? TIER_COLORS.dream : TIER_COLORS.range
        return (
          <group key={i} position={p}>
            <mesh>
              <cylinderGeometry args={[0.62, 0.72, 0.22, 7]} />
              <meshStandardMaterial color="#1a2748" emissive={c} emissiveIntensity={on ? 0.9 : 0.25} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position-y={0.12} rotation-x={-Math.PI / 2}>
              <ringGeometry args={[0.5, 0.58, 7]} />
              <meshBasicMaterial color={c} toneMapped={false} />
            </mesh>
            <Num n={i + 1} color={c} position={[0, 0.5, 0]} />
          </group>
        )
      })}
    </>
  )
}

/* ───────────── Certifications: rotating coins grouped by tier ───────────── */

function Coin({ n, medal, position, selected, onSelect, offset }: { n: number; medal: Medal; position: [number, number, number]; offset: number } & SelectProps) {
  const ref = useRef<THREE.Group>(null)
  const { reduced } = useEnv()
  const on = selected === n
  const [hover, setHover] = useState(false)
  useFrame((s, dt) => {
    const g = ref.current
    if (!g) return
    if (reduced) {
      g.rotation.y = 0.35
      return
    }
    if (on || hover) g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, Math.round(g.rotation.y / Math.PI) * Math.PI, 1 - Math.exp(-dt * 5))
    else g.rotation.y = s.clock.elapsedTime * 0.8 + offset
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, on ? 1.25 : 1, 1 - Math.exp(-dt * 6)))
  })
  const mat = medalMaterialProps(medal)
  return (
    <group position={position}>
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(n)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = ''
        }}
      >
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 40]} />
          <meshStandardMaterial {...mat} emissive={MEDAL_COLORS[medal]} emissiveIntensity={on ? 0.5 : 0.03} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.5, 0.045, 10, 40]} />
          <meshStandardMaterial {...mat} roughness={0.15} />
        </mesh>
        {[1, -1].map((side) => (
          <mesh key={side} position-z={side * 0.055} rotation-y={side < 0 ? Math.PI : 0}>
            <ringGeometry args={[0.28, 0.36, 5]} />
            <meshStandardMaterial {...mat} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <Num n={n} color={MEDAL_COLORS[medal]} position={[0, -0.78, 0]} />
    </group>
  )
}

export function CertScene({ selected, onSelect }: SelectProps) {
  const progress = useSmoothedProgress()
  const camPos = useRef(new THREE.Vector3(0, 0.4, 7.5))
  const look = useRef(new THREE.Vector3(0, 0.2, 0))
  const layout = useMemo(() => {
    const rows: { n: number; medal: Medal; pos: [number, number, number] }[] = []
    certifications.tiers.forEach((g, r) => {
      g.items.forEach((it, i) => {
        rows.push({ n: it.n, medal: g.medal, pos: [(i - (g.items.length - 1) / 2) * 1.45, 1.9 - r * 1.85, -r * 0.4] })
      })
    })
    return rows
  }, [])
  useFrame(() => {
    camPos.current.set(0, THREE.MathUtils.lerp(1.4, -0.6, progress.current), 7.5)
  })
  return (
    <>
      <MetalEnv />
      <CameraRig position={camPos} lookAt={look} />
      <group onPointerMissed={() => onSelect(null)}>
        {layout.map((c, i) => (
          <Coin key={c.n} n={c.n} medal={c.medal} position={c.pos} selected={selected} onSelect={onSelect} offset={i * 0.7} />
        ))}
      </group>
    </>
  )
}
