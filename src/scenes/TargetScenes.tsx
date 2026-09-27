import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { cgpa, gre, ielts } from '../data/content'
import { useEnv } from '../lib/env'
import { TIER_COLORS } from '../lib/tiers'
import { Bob, CameraRig, Flag, Gauge, useSmoothedProgress } from '../components/three-kit'

const Label = ({ children, color = '#cbd5e1', position }: { children: React.ReactNode; color?: string; position: [number, number, number] }) => (
  <Html position={position} center zIndexRange={[10, 0]} aria-hidden>
    <span className="scene-label" style={{ color }}>
      {children}
    </span>
  </Html>
)

/* ───────────── IELTS: bar towers per tier (Minimum vs Aim for) ───────────── */

const BASE = -1.9
const h = (band: number) => (band - 5) * 1.25

function RangeBar({ x, range, color, dim, grow }: { x: number; range: number[]; color: string; dim: boolean; grow: { current: number } }) {
  const solid = useRef<THREE.Mesh>(null)
  const cap = useRef<THREE.Mesh>(null)
  const lo = h(range[0])
  const hi = Math.max(h(range[1]), lo + 0.06)
  useFrame(() => {
    const g = Math.max(grow.current, 0.001)
    if (solid.current) {
      solid.current.scale.y = lo * g
      solid.current.position.y = BASE + (lo * g) / 2
    }
    if (cap.current) {
      cap.current.scale.y = (hi - lo) * g
      cap.current.position.y = BASE + lo * g + ((hi - lo) * g) / 2
    }
  })
  return (
    <group position-x={x}>
      <mesh ref={solid}>
        <boxGeometry args={[0.55, 1, 0.55]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={dim ? 0.15 : 0.5} metalness={0.3} roughness={0.35} transparent={dim} opacity={dim ? 0.55 : 1} />
      </mesh>
      <mesh ref={cap}>
        <boxGeometry args={[0.58, 1, 0.58]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={dim ? 0.6 : 1.4} transparent opacity={0.45} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function IeltsScene() {
  const progress = useSmoothedProgress()
  const { reduced } = useEnv()
  const grow = useRef(reduced ? 1 : 0)
  const camPos = useRef(new THREE.Vector3(1.2, 1.8, 9))
  const look = useRef(new THREE.Vector3(0, 0.1, 0))
  useFrame((_, dt) => {
    const want = reduced ? 1 : THREE.MathUtils.smoothstep(progress.current, 0.12, 0.35)
    grow.current = THREE.MathUtils.lerp(grow.current, want, 1 - Math.exp(-dt * 3))
    if (reduced) grow.current = 1
    camPos.current.set(THREE.MathUtils.lerp(2, -1, progress.current), 1.8, 9)
  })
  return (
    <>
      <CameraRig position={camPos} lookAt={look} />
      {ielts.rows.map((r, i) => {
        const x = (i - 1) * 2.15
        const color = TIER_COLORS[r.tier]
        return (
          <group key={r.tier} position-x={x}>
            <RangeBar x={-0.38} range={r.minRange} color={color} dim grow={grow} />
            <RangeBar x={0.38} range={r.aimRange} color={color} dim={false} grow={grow} />
            <mesh position-y={BASE - 0.05}>
              <boxGeometry args={[1.7, 0.1, 1]} />
              <meshStandardMaterial color="#141d38" metalness={0.5} roughness={0.4} />
            </mesh>
            <Label position={[0, BASE - 0.45, 0.5]} color={color}>
              {r.label}
            </Label>
            <Label position={[-0.38, BASE + 0.25, 0.45]}>Min</Label>
            <Label position={[0.38, BASE + 0.25, 0.45]}>Aim</Label>
          </group>
        )
      })}
      {/* single target plane: IELTS 7.5 */}
      <mesh position={[0, BASE + h(7.5), 0]}>
        <boxGeometry args={[6.6, 0.025, 1.4]} />
        <meshBasicMaterial color={TIER_COLORS.dream} toneMapped={false} transparent opacity={0.85} />
      </mesh>
      <Label position={[-2.6, BASE + h(7.5) + 0.25, 0.7]} color={TIER_COLORS.dream}>
        7.5 target
      </Label>
    </>
  )
}

/* ───────────── GRE: Quant gauges + "not needed" flag wall ───────────── */

export function GreScene() {
  const camPos = useRef(new THREE.Vector3(0, 0.6, 9.4))
  const look = useRef(new THREE.Vector3(0, 0.1, 0))
  const progress = useSmoothedProgress()
  useFrame(() => {
    camPos.current.set(0, THREE.MathUtils.lerp(1.4, -0.2, progress.current), 9.4)
  })
  return (
    <>
      <CameraRig position={camPos} lookAt={look} />
      {gre.tiers.map((t, i) => {
        const color = TIER_COLORS[t.tier]
        return (
          <group key={t.tier} position={[(i - 1) * 2.35, 1.1, 0]}>
            <Bob offset={i} amp={0.06}>
              <Gauge min={130} max={170} bands={[{ from: t.quant[0], to: t.quant[1], color }]} needle={t.quant[0]} needleColor={color} radius={0.95} ticks={4} />
            </Bob>
            <Label position={[0, -1.05, 0]} color={color}>
              Quant {t.quant[0]}
              {t.tier === 'dream' ? '–170' : '+'}
            </Label>
          </group>
        )
      })}
      {/* wall of countries where GRE is not needed */}
      <group position={[0, -1.35, -1.2]}>
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[7.2, 1.3, 0.1]} />
          <meshStandardMaterial color="#0e1630" metalness={0.4} roughness={0.5} />
        </mesh>
        {gre.notNeeded.map((n, i) => (
          <group key={n.code} position={[(i - 2) * 1.4 - 0.45, 0, 0]}>
            <group scale={0.56}>
              <Flag code={n.code} pole={false} />
            </group>
            <group position={[0.95, 0.26, 0.1]}>
              <mesh rotation-z={Math.PI / 4}>
                <boxGeometry args={[0.28, 0.05, 0.03]} />
                <meshBasicMaterial color={TIER_COLORS.warning} toneMapped={false} />
              </mesh>
              <mesh rotation-z={-Math.PI / 4}>
                <boxGeometry args={[0.28, 0.05, 0.03]} />
                <meshBasicMaterial color={TIER_COLORS.warning} toneMapped={false} />
              </mesh>
            </group>
          </group>
        ))}
        <Label position={[0, -0.9, 0.2]} color={TIER_COLORS.warning}>
          ❌ GRE not needed
        </Label>
      </group>
    </>
  )
}

/* ───────────── CGPA: gauge with tier bands + India → Germany converter ───────────── */

function Converter() {
  const COUNT = 36
  const inst = useRef<THREE.InstancedMesh>(null)
  const { reduced } = useEnv()
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(0.6, 1.1, 0), new THREE.Vector3(1.4, 0.2, 0.6), new THREE.Vector3(0.6, -0.9, 0)]),
    [],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  useFrame((s) => {
    const m = inst.current
    if (!m) return
    const t = reduced ? 0 : s.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const u = (i / COUNT + t * 0.18) % 1
      dummy.position.copy(curve.getPointAt(u))
      dummy.scale.setScalar(0.5 + Math.sin(u * Math.PI) * 0.8)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, color.set('#FF9933').lerp(new THREE.Color('#FFCE00'), u))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })
  return (
    <group position={[1.9, 0, 0]}>
      <group position={[0, 1.2, 0]} scale={0.55}>
        <Flag code="IN" pole={false} />
      </group>
      <group position={[0, -0.95, 0]} scale={0.55}>
        <Flag code="DE" pole={false} />
      </group>
      <instancedMesh ref={inst} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <Label position={[0.42, 1.95, 0]} color="#FF9933">
        9.36 / 10
      </Label>
      <Label position={[0.42, -1.75, 0]} color="#FFCE00">
        ≈ 1.3–1.4
      </Label>
    </group>
  )
}

export function CgpaScene() {
  const camPos = useRef(new THREE.Vector3(0.4, 0.3, 7))
  const look = useRef(new THREE.Vector3(0.4, 0, 0))
  const radii = [1.62, 1.44, 1.26]
  return (
    <>
      <CameraRig position={camPos} lookAt={look} />
      <group position={[-1.3, 0, 0]}>
        <Gauge
          min={6}
          max={10}
          radius={1.8}
          ticks={8}
          needle={cgpa.value}
          needleColor={TIER_COLORS.dream}
          bands={cgpa.tiers.map((t, i) => ({ from: t.minValue, to: t.aimValue, color: TIER_COLORS[t.tier], r: radii[i], width: 0.06 }))}
        />
        <Label position={[0, -0.75, 0]} color={TIER_COLORS.dream}>
          9.36 ✅
        </Label>
        <Label position={[0, -2.05, 0]}>bands: minimum → aim per tier</Label>
      </group>
      <Converter />
    </>
  )
}
