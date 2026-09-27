import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line, QuadraticBezierLine } from '@react-three/drei'
import { countries, india, type CountryCode } from '../data/content'
import { useEnv } from '../lib/env'
import { TIER_COLORS } from '../lib/tiers'
import { CameraRig, useSmoothedProgress } from '../components/three-kit'

const R = 2
const DEG = Math.PI / 180

function latLon(lat: number, lon: number, r = R) {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

// Very rough continent outlines as [lon, lat] rings, only used to place land dots.
const LAND: number[][][] = [
  [[-168,66],[-140,70],[-110,72],[-85,70],[-62,58],[-55,50],[-66,44],[-76,35],[-81,27],[-81,25],[-90,29],[-97,26],[-97,20],[-90,21],[-87,16],[-83,10],[-78,8],[-85,11],[-92,15],[-105,20],[-110,24],[-117,32],[-124,40],[-125,49],[-133,56],[-146,60],[-158,57],[-165,60]],
  [[-55,60],[-43,60],[-20,70],[-20,80],[-60,82],[-72,77],[-58,70]],
  [[-78,8],[-60,10],[-50,0],[-35,-6],[-40,-22],[-48,-28],[-58,-38],[-65,-42],[-68,-55],[-74,-50],[-72,-30],[-71,-18],[-81,-6],[-80,1]],
  [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[8,57],[5,62],[14,68],[25,71],[40,68],[50,68],[60,60],[60,45],[50,45],[40,42],[28,41],[26,38],[22,37],[16,38],[12,44],[8,44],[3,43],[-1,37]],
  [[-6,50],[1,51],[2,53],[-2,56],[-3,58.6],[-6,58],[-5,55],[-3,54],[-5,52]],
  [[-10,51.5],[-6,52],[-6,55],[-8,55.3],[-10,54]],
  [[-17,21],[-10,30],[-6,36],[10,37],[20,31],[32,31],[35,28],[43,12],[51,12],[40,-2],[40,-15],[35,-25],[20,-35],[17,-29],[12,-17],[13,-5],[9,4],[-8,4],[-17,14]],
  [[60,45],[60,68],[80,73],[100,77],[140,72],[180,68],[180,62],[160,60],[155,50],[140,52],[130,42],[122,40],[121,31],[117,24],[108,21],[106,10],[100,13],[103,1],[98,8],[97,17],[92,21],[88,22],[80,15],[77,8],[72,20],[67,25],[57,25],[52,17],[44,12],[35,28],[36,36],[40,42],[50,45]],
  [[130,31],[141,36],[142,44],[140,41],[136,35],[130,34]],
  [[95,5],[106,-6],[104,-5],[98,2]],
  [[109,1],[117,7],[119,1],[116,-4],[110,-3]],
  [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[131,-31],[116,-35],[114,-26]],
  [[44,-25],[50,-15],[49,-12],[44,-17]],
]

function inRing(lon: number, lat: number, ring: number[][]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function LandDots({ count }: { count: number }) {
  const geo = useMemo(() => {
    const pts: number[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const lat = Math.asin(y) / DEG
      const lon = ((((i * golden) / DEG) % 360) + 360) % 360 - 180
      if (LAND.some((ring) => inRing(lon, lat, ring))) {
        const v = latLon(lat, lon, R * 1.004)
        pts.push(v.x, v.y, v.z)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [count])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#5fb8ff" size={0.035} sizeAttenuation transparent opacity={0.9} />
    </points>
  )
}

function Graticule() {
  const lines = useMemo(() => {
    const out: THREE.Vector3[][] = []
    for (let lat = -60; lat <= 60; lat += 30) out.push(Array.from({ length: 73 }, (_, i) => latLon(lat, i * 5 - 180, R * 1.002)))
    for (let lon = -180; lon < 180; lon += 30) out.push(Array.from({ length: 37 }, (_, i) => latLon(i * 5 - 90, lon, R * 1.002)))
    return out
  }, [])
  return (
    <>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#1f3d73" lineWidth={0.6} transparent opacity={0.55} />
      ))}
    </>
  )
}

function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { color: { value: new THREE.Color('#3DA5FF') } },
        vertexShader: `varying vec3 vN; varying vec3 vV;
          void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 color; varying vec3 vN; varying vec3 vV;
          void main(){ float f = pow(clamp(-dot(vN, vV), 0.0, 1.0), 2.2); gl_FragColor = vec4(color, f * 1.1); }`,
      }),
    [],
  )
  return (
    <mesh material={mat} scale={1.14}>
      <sphereGeometry args={[R, 48, 48]} />
    </mesh>
  )
}

function Pin({ code, active, onHover }: { code: CountryCode; active: boolean; onHover: (c: CountryCode | null) => void }) {
  const c = countries.find((x) => x.code === code)!
  const { pos, quat } = useMemo(() => {
    const pos = latLon(c.lat, c.lon)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize())
    return { pos, quat }
  }, [c])
  const ring = useRef<THREE.Mesh>(null)
  const { reduced } = useEnv()
  useFrame((s) => {
    if (!ring.current || reduced) return
    const t = (s.clock.elapsedTime * 0.8 + c.lon * 0.01) % 1
    ring.current.scale.setScalar(1 + t * 2.2)
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8
  })
  const color = active ? TIER_COLORS.dream : TIER_COLORS.range
  return (
    <group position={pos} quaternion={quat}>
      <mesh position-y={0.14}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position-y={0.3} scale={active ? 1.5 : 1}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.005}>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* generous invisible hit target */}
      <mesh
        position-y={0.25}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(code)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = ''
        }}
      >
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

function Arcs({ active }: { active: CountryCode | null }) {
  const refs = useRef<(THREE.Object3D | null)[]>([])
  const { reduced } = useEnv()
  const arcs = useMemo(() => {
    const start = latLon(india.lat, india.lon, R * 1.01)
    return countries.map((c) => {
      const end = latLon(c.lat, c.lon, R * 1.01)
      const dist = start.distanceTo(end)
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.45)
      return { code: c.code, start, end, mid }
    })
  }, [])
  useFrame((_, dt) => {
    if (reduced) return
    refs.current.forEach((l) => {
      const m = (l as unknown as { material?: { dashOffset: number } })?.material
      if (m) m.dashOffset -= dt * 0.5
    })
  })
  return (
    <>
      {arcs.map((a, i) => {
        const on = active === a.code
        return (
          <QuadraticBezierLine
            key={a.code}
            ref={(el) => {
              refs.current[i] = el as unknown as THREE.Object3D
            }}
            start={a.start}
            end={a.end}
            mid={a.mid}
            color={on ? TIER_COLORS.dream : '#7cc4ff'}
            lineWidth={on ? 2.6 : 1.4}
            dashed
            dashSize={0.25}
            gapSize={0.12}
            transparent
            opacity={active && !on ? 0.3 : 0.95}
          />
        )
      })}
    </>
  )
}

export default function GlobeScene({
  active,
  focusFromList,
  onHover,
}: {
  active: CountryCode | null
  focusFromList: boolean
  onHover: (c: CountryCode | null) => void
}) {
  const globe = useRef<THREE.Group>(null)
  const { reduced, mobile } = useEnv()
  const progress = useSmoothedProgress()
  const camPos = useRef(new THREE.Vector3(0, 0.6, 7))
  const look = useRef(new THREE.Vector3(0, 0, 0))
  const india3 = useMemo(() => latLon(india.lat, india.lon), [])

  useFrame((_, dt) => {
    // scroll: pull the camera back and up as the hero scrolls away
    const p = THREE.MathUtils.clamp((progress.current - 0.5) * 2, 0, 1)
    camPos.current.set(0, 0.6 + p * 1.5, 6.6 + p * 3)
    const g = globe.current
    if (!g) return
    if (reduced) {
      g.rotation.y = -Math.atan2(india3.x, india3.z) - 0.4
      return
    }
    if (active && focusFromList) {
      const c = countries.find((x) => x.code === active)!
      const v = latLon(c.lat, c.lon)
      let target = -Math.atan2(v.x, v.z)
      const cur = g.rotation.y
      target = cur + Math.atan2(Math.sin(target - cur), Math.cos(target - cur))
      g.rotation.y = THREE.MathUtils.lerp(cur, target, 1 - Math.exp(-dt * 3))
    } else if (!active) {
      g.rotation.y += dt * 0.12
    }
  })

  return (
    <>
      <CameraRig position={camPos} lookAt={look} parallax={0.3} />
      <group ref={globe} rotation={[0.35, -Math.atan2(india3.x, india3.z) - 0.4, 0]}>
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial color="#0a1733" emissive="#061233" emissiveIntensity={0.6} roughness={0.85} metalness={0.1} />
        </mesh>
        <Graticule />
        <LandDots count={mobile ? 9000 : 16000} />
        <Atmosphere />
        {/* India: origin pin */}
        <group position={india3} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), india3.clone().normalize())}>
          <mesh position-y={0.08}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        </group>
        <Arcs active={active} />
        {countries.map((c) => (
          <Pin key={c.code} code={c.code} active={active === c.code} onHover={onHover} />
        ))}
      </group>
    </>
  )
}
