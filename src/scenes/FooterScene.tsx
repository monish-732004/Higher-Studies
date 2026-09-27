import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useEnv } from '../lib/env'
import { TIER_COLORS } from '../lib/tiers'
import { MetalEnv } from '../components/three-kit'

/** A slowly turning warning beacon: triangular sign with a pulsing light. */
export default function FooterScene() {
  const sign = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const halo = useRef<THREE.Mesh>(null)
  const { reduced } = useEnv()
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (reduced) return
    if (sign.current) {
      sign.current.rotation.y = Math.sin(t * 0.6) * 0.6
      sign.current.position.y = 0.3 + Math.sin(t * 1.2) * 0.08
    }
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6)
    if (light.current) light.current.intensity = 10 + pulse * 30
    if (halo.current) {
      halo.current.scale.setScalar(1 + pulse * 0.25)
      ;(halo.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + pulse * 0.12
    }
  })
  const red = TIER_COLORS.warning
  return (
    <>
      <MetalEnv />
      <group ref={sign} position-y={0.3}>
        {/* triangular prism sign */}
        <mesh rotation-x={Math.PI / 2} rotation-y={Math.PI}>
          <cylinderGeometry args={[1.35, 1.35, 0.22, 3]} />
          <meshStandardMaterial color="#2a0a10" emissive={red} emissiveIntensity={0.8} metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} rotation-y={Math.PI} position-z={0.02}>
          <cylinderGeometry args={[1.05, 1.05, 0.24, 3]} />
          <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={0.6} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.05, 0.16]}>
          <boxGeometry args={[0.14, 0.62, 0.06]} />
          <meshStandardMaterial color="#12060a" />
        </mesh>
        <mesh position={[0, -0.55, 0.16]}>
          <boxGeometry args={[0.15, 0.15, 0.06]} />
          <meshStandardMaterial color="#12060a" />
        </mesh>
      </group>
      <mesh ref={halo} position={[0, 0.2, -0.6]}>
        <circleGeometry args={[1.55, 48]} />
        <meshBasicMaterial color={red} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <pointLight ref={light} position={[0, 0.5, 2]} color={red} intensity={20} distance={10} />
      <mesh position-y={-1.6}>
        <cylinderGeometry args={[1.4, 1.7, 0.3, 48]} />
        <meshStandardMaterial color="#141d38" metalness={0.8} roughness={0.3} />
      </mesh>
    </>
  )
}
