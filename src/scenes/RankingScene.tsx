import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { ranking } from '../data/content'
import { levelHex, TIER_COLORS } from '../lib/tiers'
import { CameraRig, Flag, MetalEnv, useSmoothedProgress } from '../components/three-kit'

const N = ranking.levels.length
const STEP_Y = 0.5
const RADIUS = 2.15

const levelColor = (i: number) => new THREE.Color(levelHex(i, N))

function levelPose(i: number) {
  const a = i * 0.62
  const y = (N - 1 - i) * STEP_Y - 3
  return { a, y, pos: new THREE.Vector3(Math.sin(a) * RADIUS, y, Math.cos(a) * RADIUS) }
}

function Level({ i, selected, onSelect }: { i: number; selected: boolean; onSelect: (i: number) => void }) {
  const [hover, setHover] = useState(false)
  const { a, pos } = levelPose(i)
  const color = useMemo(() => '#' + levelColor(i).getHexString(), [i])
  const colleges = ranking.levels[i]
  const glow = selected ? 1.6 : hover ? 1 : 0.35
  return (
    <group position={pos} rotation-y={a}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(i)
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
        <boxGeometry args={[1.9, 0.16, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} metalness={0.6} roughness={0.35} toneMapped={selected ? false : true} />
      </mesh>
      {colleges.map((c, k) => {
        const x = (k - (colleges.length - 1) / 2) * 0.46
        return (
          <group key={c.name} position={[x, 0.08, 0.1]}>
            <group scale={0.22} position={[-0.16, 0.34, 0]}>
              <Flag code={c.country} pole={false} />
            </group>
            <mesh position={[-0.16, 0.2, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.4, 5]} />
              <meshStandardMaterial color="#c8d2e8" metalness={0.8} />
            </mesh>
            {c.warn && (
              <mesh position={[0.22, 0.52, 0]}>
                <octahedronGeometry args={[0.055]} />
                <meshStandardMaterial color={TIER_COLORS.warning} emissive={TIER_COLORS.warning} emissiveIntensity={2} toneMapped={false} />
              </mesh>
            )}
          </group>
        )
      })}
      <Html position={[1.2, 0, 0.3]} center zIndexRange={[10, 0]} aria-hidden>
        <span className="rank-num" style={{ borderColor: color, color }}>
          {i + 1}
        </span>
      </Html>
    </group>
  )
}

export default function RankingScene({ selected, onSelect }: { selected: number | null; onSelect: (i: number | null) => void }) {
  const progress = useSmoothedProgress()
  const camPos = useRef(new THREE.Vector3(0, 3, 9))
  const look = useRef(new THREE.Vector3(0, 1, 0))

  useFrame(() => {
    if (selected !== null) {
      const { a, pos } = levelPose(selected)
      const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a))
      camPos.current.copy(pos).addScaledVector(out, 3.4).add(new THREE.Vector3(0, 1.1, 0))
      look.current.copy(pos).add(new THREE.Vector3(0, 0.25, 0))
      return
    }
    // scroll walks the camera down the tower while slowly orbiting it
    const p = THREE.MathUtils.smoothstep(progress.current, 0.15, 0.85)
    const th = 0.2 + p * 2.6
    const y = THREE.MathUtils.lerp(3.6, -1.6, p)
    camPos.current.set(Math.sin(th) * 8.5, y + 1.2, Math.cos(th) * 8.5)
    look.current.set(0, y - 0.3, 0)
  })

  return (
    <>
      <MetalEnv />
      <CameraRig position={camPos} lookAt={look} speed={2.5} />
      <group onPointerMissed={() => onSelect(null)}>
        {/* glowing spine */}
        <mesh position-y={0}>
          <cylinderGeometry args={[0.12, 0.2, (N - 1) * STEP_Y + 1.4, 20]} />
          <meshStandardMaterial color="#12203f" emissive={TIER_COLORS.range} emissiveIntensity={0.35} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position-y={3.55}>
          <octahedronGeometry args={[0.28]} />
          <meshStandardMaterial color={TIER_COLORS.dream} emissive={TIER_COLORS.dream} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {ranking.levels.map((_, i) => (
          <Level key={i} i={i} selected={selected === i} onSelect={onSelect} />
        ))}
      </group>
    </>
  )
}
