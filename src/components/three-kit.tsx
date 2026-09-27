// Small 3D building blocks shared by the scenes.
import { useMemo, useRef, type ComponentProps, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import type { CountryCode, Medal } from '../data/content'
import { flagMaterial } from '../lib/flags'
import { MEDAL_COLORS } from '../lib/tiers'
import { useEnv } from '../lib/env'
import { useSectionProgress } from '../lib/scroll'

const flagGeo = new THREE.PlaneGeometry(1.5, 1, 24, 12)
flagGeo.translate(0.75, 0, 0)

/** A waving flag, anchored at its left edge (the pole side). */
export function Flag({ code, pole = true, ...props }: { code: CountryCode | 'IN'; pole?: boolean } & ComponentProps<'group'>) {
  return (
    <group {...props}>
      <mesh geometry={flagGeo} material={flagMaterial(code)} />
      {pole && (
        <mesh position={[-0.03, -0.35, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.8, 6]} />
          <meshStandardMaterial color="#c8d2e8" metalness={0.8} roughness={0.3} />
        </mesh>
      )}
    </group>
  )
}

/** Procedural studio reflections so metallic gold/silver/bronze read well, with no network fetch. */
export function MetalEnv() {
  return (
    <Environment resolution={64} frames={1}>
      <Lightformer intensity={2.5} position={[0, 5, -5]} scale={[10, 3, 1]} />
      <Lightformer intensity={1.5} position={[0, 2, 6]} scale={[10, 4, 1]} />
      <Lightformer intensity={1.4} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
      <Lightformer intensity={1.4} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      <Lightformer intensity={0.6} position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
    </Environment>
  )
}

export function medalMaterialProps(medal: Medal) {
  return { color: MEDAL_COLORS[medal], metalness: 0.85, roughness: medal === 'silver' ? 0.25 : 0.32, envMapIntensity: 1.6 }
}

/** Camera that eases toward a target position and look-at point, with light mouse parallax. */
export function CameraRig({
  position,
  lookAt,
  parallax = 0.4,
  speed = 3,
}: {
  position: { current: THREE.Vector3 }
  lookAt: { current: THREE.Vector3 }
  parallax?: number
  speed?: number
}) {
  const { reduced } = useEnv()
  const look = useRef(new THREE.Vector3())
  const tmp = useRef(new THREE.Vector3())
  const first = useRef(true)
  useFrame((state, dt) => {
    const p = position.current
    const l = lookAt.current
    const k = reduced || first.current ? 1 : 1 - Math.exp(-dt * speed)
    if (first.current) look.current.copy(l)
    first.current = false
    tmp.current.set(p.x + (reduced ? 0 : state.pointer.x * parallax), p.y + (reduced ? 0 : state.pointer.y * parallax * 0.6), p.z)
    state.camera.position.lerp(tmp.current, k)
    look.current.lerp(l, k)
    state.camera.lookAt(look.current)
  })
  return null
}

/** Scroll progress through the current section (0..1), eased toward the live value. */
export function useSmoothedProgress() {
  const progress = useSectionProgress()
  const smooth = useRef(progress.current)
  const { reduced } = useEnv()
  useFrame((_, dt) => {
    smooth.current = reduced ? 0.5 : THREE.MathUtils.lerp(smooth.current, progress.current, 1 - Math.exp(-dt * 4))
  })
  return smooth
}

/** Gentle idle bobbing, disabled for reduced motion. */
export function Bob({ children, speed = 1, amp = 0.12, offset = 0 }: { children: ReactNode; speed?: number; amp?: number; offset?: number }) {
  const ref = useRef<THREE.Group>(null)
  const { reduced } = useEnv()
  useFrame((s) => {
    if (!ref.current || reduced) return
    ref.current.position.y = Math.sin(s.clock.elapsedTime * speed + offset) * amp
  })
  return <group ref={ref}>{children}</group>
}

/** A cylinder stretched between two points (graph edges, gauge needles). */
export function Beam({
  from,
  to,
  radius = 0.03,
  color,
  opacity = 1,
  emissive = 0.6,
}: {
  from: THREE.Vector3
  to: THREE.Vector3
  radius?: number
  color: string
  opacity?: number
  emissive?: number
}) {
  const { pos, quat, len } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from)
    const len = dir.length()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    return { pos: from.clone().add(dir.multiplyScalar(0.5)), quat, len }
  }, [from, to])
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, len, 8, 1, true]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  )
}

/** A 3D arc gauge: dim track, coloured bands, and a needle. Values are mapped from [min,max] onto a 240° sweep. */
export function Gauge({
  min,
  max,
  bands,
  needle,
  needleColor = '#ffffff',
  radius = 1,
  ticks = 5,
}: {
  min: number
  max: number
  bands: { from: number; to: number; color: string; width?: number; r?: number }[]
  needle: number
  needleColor?: string
  radius?: number
  ticks?: number
}) {
  const sweep = (Math.PI * 4) / 3
  const start = Math.PI / 2 + sweep / 2
  const angleOf = (v: number) => start - ((THREE.MathUtils.clamp(v, min, max) - min) / (max - min)) * sweep
  const needleRef = useRef<THREE.Group>(null)
  const { reduced } = useEnv()
  const target = angleOf(needle) - Math.PI / 2
  useFrame((_, dt) => {
    if (!needleRef.current) return
    const r = needleRef.current.rotation
    r.z = reduced ? target : THREE.MathUtils.lerp(r.z, target, 1 - Math.exp(-dt * 2.2))
  })
  return (
    <group>
      {/* track: torus arc rotated so theta=0 sits at the sweep end */}
      <mesh rotation-z={start - sweep}>
        <torusGeometry args={[radius, 0.045, 8, 64, sweep]} />
        <meshStandardMaterial color="#1c2745" metalness={0.4} roughness={0.6} />
      </mesh>
      {bands.map((b, i) => {
        const a0 = angleOf(b.to)
        const a1 = angleOf(b.from)
        return (
          <mesh key={i} rotation-z={a0}>
            <torusGeometry args={[b.r ?? radius, b.width ?? 0.08, 10, 48, Math.max(a1 - a0, 0.02)]} />
            <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={1.1} toneMapped={false} />
          </mesh>
        )
      })}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const a = start - (i / ticks) * sweep
        return (
          <mesh key={i} position={[Math.cos(a) * (radius - 0.16), Math.sin(a) * (radius - 0.16), 0]} rotation-z={a}>
            <boxGeometry args={[0.1, 0.018, 0.02]} />
            <meshBasicMaterial color="#7b8bb0" />
          </mesh>
        )
      })}
      <group ref={needleRef} rotation-z={reduced ? target : start - Math.PI / 2}>
        <mesh position={[0, radius * 0.42, 0.04]}>
          <coneGeometry args={[0.05, radius * 0.84, 8]} />
          <meshStandardMaterial color={needleColor} emissive={needleColor} emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      </group>
      <mesh position-z={0.03} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.09, 0.09, 0.08, 20]} />
        <meshStandardMaterial color="#dfe6f5" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  )
}
