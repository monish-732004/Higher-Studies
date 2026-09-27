import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { internships, type Medal } from '../data/content'
import { useEnv } from '../lib/env'
import { MEDAL_COLORS, TIER_COLORS } from '../lib/tiers'
import { Bob, CameraRig, MetalEnv, medalMaterialProps, useSmoothedProgress } from '../components/three-kit'

/* ───────────── Pulsing alert banner + 9 medals ───────────── */

function AlertBanner() {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const light = useRef<THREE.PointLight>(null)
  const { reduced } = useEnv()
  useFrame((s) => {
    const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 3)
    if (mat.current) mat.current.emissiveIntensity = 0.35 + pulse * 0.65
    if (light.current) light.current.intensity = 6 + pulse * 18
  })
  const red = TIER_COLORS.warning
  return (
    <Bob amp={0.05}>
      <group position={[0, 2.05, 0]}>
        <mesh>
          <boxGeometry args={[4.4, 0.8, 0.16]} />
          <meshStandardMaterial ref={mat} color="#3a0a12" emissive={red} />
        </mesh>
        {/* warning triangles */}
        {[-1.75, 1.75].map((x) => (
          <group key={x} position={[x, 0, 0.12]}>
            <mesh rotation-z={Math.PI / 2} rotation-y={Math.PI / 2}>
              <cylinderGeometry args={[0.3, 0.3, 0.06, 3]} />
              <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.03, 0.04]}>
              <boxGeometry args={[0.05, 0.16, 0.02]} />
              <meshBasicMaterial color="#1a0508" />
            </mesh>
            <mesh position={[0, -0.1, 0.04]}>
              <boxGeometry args={[0.05, 0.05, 0.02]} />
              <meshBasicMaterial color="#1a0508" />
            </mesh>
          </group>
        ))}
        <pointLight ref={light} position={[0, 0, 1.2]} color={red} distance={8} />
        <Html center position={[0, 0, 0.1]} zIndexRange={[10, 0]} aria-hidden>
          <span className="scene-label !text-sm !font-bold tracking-widest" style={{ color: '#fff' }}>
            ⏰ URGENT
          </span>
        </Html>
      </group>
    </Bob>
  )
}

function Medal3D({ n, medal, position, on, onSelect, offset }: { n: number; medal: Medal; position: [number, number, number]; on: boolean; onSelect: (n: number | null) => void; offset: number }) {
  const ref = useRef<THREE.Group>(null)
  const { reduced } = useEnv()
  useFrame((s, dt) => {
    const g = ref.current
    if (!g) return
    g.rotation.y = reduced ? 0.3 : on ? THREE.MathUtils.lerp(g.rotation.y, 0, 1 - Math.exp(-dt * 5)) : Math.sin(s.clock.elapsedTime * 0.9 + offset) * 0.7
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, on ? 1.2 : 1, reduced ? 1 : 1 - Math.exp(-dt * 6)))
  })
  const mat = medalMaterialProps(medal)
  const ribbon = medal === 'gold' ? TIER_COLORS.warning : medal === 'silver' ? TIER_COLORS.range : TIER_COLORS.safety
  return (
    <group position={position}>
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(n)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.1, 0.42, -0.02]} rotation-z={s * 0.3}>
            <boxGeometry args={[0.16, 0.5, 0.02]} />
            <meshStandardMaterial color={ribbon} emissive={ribbon} emissiveIntensity={0.3} />
          </mesh>
        ))}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.32, 0.32, 0.07, 32]} />
          <meshStandardMaterial {...mat} emissive={MEDAL_COLORS[medal]} emissiveIntensity={on ? 0.6 : 0.03} />
        </mesh>
        <mesh position-z={0.04}>
          <ringGeometry args={[0.18, 0.24, 8]} />
          <meshStandardMaterial {...mat} roughness={0.5} />
        </mesh>
      </group>
      <Html center position={[0, -0.52, 0]} zIndexRange={[10, 0]} aria-hidden>
        <span className="rank-num" style={{ borderColor: MEDAL_COLORS[medal], color: MEDAL_COLORS[medal] }}>
          {n}
        </span>
      </Html>
    </group>
  )
}

export function InternScene({ selected, onSelect }: { selected: number | null; onSelect: (n: number | null) => void }) {
  const progress = useSmoothedProgress()
  const camPos = useRef(new THREE.Vector3(0, 0.6, 7.6))
  const look = useRef(new THREE.Vector3(0, 0.4, 0))
  useFrame(() => {
    camPos.current.set(THREE.MathUtils.lerp(-1, 1, progress.current), 0.8, 7.6)
  })
  return (
    <>
      <MetalEnv />
      <CameraRig position={camPos} lookAt={look} />
      <AlertBanner />
      <group onPointerMissed={() => onSelect(null)}>
        {internships.tiers.map((g, r) =>
          g.items.map((it, i) => (
            <Medal3D key={it.n} n={it.n} medal={g.medal} position={[(i - 1) * 1.3, 0.75 - r * 1.2, -r * 0.3]} on={selected === it.n} onSelect={onSelect} offset={it.n} />
          )),
        )}
      </group>
    </>
  )
}

/* ───────────── Timeline as a glowing road with milestones ───────────── */

export function RoadScene({ step, onStep }: { step: number; onStep: (i: number) => void }) {
  const progress = useSmoothedProgress()
  const { reduced } = useEnv()
  const last = useRef(-2)
  const pulse = useRef<THREE.Mesh>(null)
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4, -1.6, 4),
        new THREE.Vector3(-1.5, -1.6, 2),
        new THREE.Vector3(1.5, -1.6, 1.2),
        new THREE.Vector3(2.8, -1.6, -1.5),
        new THREE.Vector3(0.5, -1.6, -4),
        new THREE.Vector3(-2.5, -1.6, -6),
        new THREE.Vector3(-1, -1.6, -9.5),
        new THREE.Vector3(2.5, -1.6, -12),
      ]),
    [],
  )
  const road = useMemo(() => {
    // flat ribbon along the curve
    const segs = 200
    const pos: number[] = []
    const idx: number[] = []
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      const p = curve.getPointAt(u)
      const t = curve.getTangentAt(u)
      const side = new THREE.Vector3().crossVectors(t, up).normalize().multiplyScalar(0.55)
      pos.push(p.x - side.x, p.y, p.z - side.z, p.x + side.x, p.y, p.z + side.z)
      if (i < segs) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [curve])
  const centre = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.035, 6, false), [curve])
  const n = internships.timeline.length
  const stops = useMemo(() => internships.timeline.map((_, i) => 0.06 + (i / (n - 1)) * 0.88), [n])

  const camPos = useRef(new THREE.Vector3())
  const look = useRef(new THREE.Vector3())
  useFrame((s) => {
    const w = reduced ? 0.02 : THREE.MathUtils.smoothstep(progress.current, 0.2, 0.8)
    const u = THREE.MathUtils.lerp(0.0, 0.9, w)
    const p = curve.getPointAt(u)
    const ahead = curve.getPointAt(Math.min(u + 0.1, 1))
    const back = new THREE.Vector3().subVectors(p, ahead).setY(0).normalize()
    camPos.current.copy(p).addScaledVector(back, 3.2).add(new THREE.Vector3(0, 2.4, 0))
    look.current.copy(ahead).add(new THREE.Vector3(0, 0.2, 0))
    let active = 0
    stops.forEach((st, i) => {
      if (u + 0.06 >= st) active = i
    })
    if (active !== last.current) {
      last.current = active
      onStep(active)
    }
    if (pulse.current && !reduced) pulse.current.position.copy(curve.getPointAt((s.clock.elapsedTime * 0.06) % 1)).add(new THREE.Vector3(0, 0.08, 0))
  })

  return (
    <>
      <CameraRig position={camPos} lookAt={look} parallax={0.25} speed={2.5} />
      <mesh geometry={road}>
        <meshStandardMaterial color="#0f1c3c" emissive={TIER_COLORS.range} emissiveIntensity={0.18} side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
      <mesh geometry={centre} position-y={0.01}>
        <meshBasicMaterial color={TIER_COLORS.range} toneMapped={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {stops.map((u, i) => {
        const p = curve.getPointAt(u)
        const on = i === step
        const past = i < step
        const c = on ? TIER_COLORS.dream : past ? TIER_COLORS.safety : TIER_COLORS.range
        const last = i === n - 1
        return (
          <group key={i} position={p}>
            <mesh position-y={0.5}>
              <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
              <meshStandardMaterial color="#1b2a4d" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position-y={1.1} scale={on ? 1.5 : 1}>
              {last ? <octahedronGeometry args={[0.2]} /> : <sphereGeometry args={[0.16, 16, 16]} />}
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={on ? 2.4 : 1} toneMapped={false} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
              <ringGeometry args={[0.3, 0.4, 32]} />
              <meshBasicMaterial color={c} toneMapped={false} transparent opacity={0.8} />
            </mesh>
            <Html center position={[0, 1.55, 0]} zIndexRange={[10, 0]} aria-hidden>
              <span className="scene-label" style={{ color: c }}>
                {internships.timeline[i].when}
              </span>
            </Html>
          </group>
        )
      })}
    </>
  )
}
