import { Suspense, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEnv } from '../lib/env'
import { BG, TIER_COLORS } from '../lib/tiers'
import { windTime } from '../lib/flags'

function WindTicker() {
  useFrame((_, dt) => {
    windTime.value += Math.min(dt, 0.05)
  })
  return null
}

function Backdrop({ grid }: { grid: boolean }) {
  const { mobile } = useEnv()
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 9, 26]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-6, 2, -3]} intensity={25} color={TIER_COLORS.range} />
      <pointLight position={[6, 1, -4]} intensity={18} color={TIER_COLORS.dream} />
      <Stars radius={40} depth={20} count={mobile ? 500 : 1800} factor={3} saturation={0} fade speed={0.4} />
      {grid && (
        <Grid
          position={[0, -2.2, 0]}
          args={[40, 40]}
          infiniteGrid
          cellSize={0.6}
          cellThickness={0.5}
          cellColor="#16264a"
          sectionSize={3}
          sectionThickness={1}
          sectionColor="#2a6fc0"
          fadeDistance={24}
          fadeStrength={1.6}
        />
      )}
    </>
  )
}

export default function CanvasInner({
  children,
  camera,
  fov,
  grid,
  active,
}: {
  children: ReactNode
  camera: [number, number, number]
  fov: number
  grid: boolean
  active: boolean
}) {
  const { reduced, mobile } = useEnv()
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
      camera={{ position: camera, fov, near: 0.1, far: 80 }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance', alpha: false }}
    >
      <Backdrop grid={grid} />
      <WindTicker />
      <Suspense fallback={null}>{children}</Suspense>
      {!mobile && !reduced && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.25} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
