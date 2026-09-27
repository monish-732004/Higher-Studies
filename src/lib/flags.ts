import * as THREE from 'three'
import type { CountryCode } from '../data/content'

type FlagCode = CountryCode | 'IN'
const W = 192
const H = 128

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points = 5) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const a = (i * Math.PI) / points - Math.PI / 2
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
  ctx.fill()
}

function stripes(ctx: CanvasRenderingContext2D, colors: string[], vertical = false) {
  colors.forEach((col, i) => {
    ctx.fillStyle = col
    if (vertical) ctx.fillRect((W / colors.length) * i, 0, W / colors.length + 1, H)
    else ctx.fillRect(0, (H / colors.length) * i, W, H / colors.length + 1)
  })
}

const draw: Record<FlagCode, (ctx: CanvasRenderingContext2D) => void> = {
  US: (ctx) => {
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = i % 2 ? '#FFFFFF' : '#B22234'
      ctx.fillRect(0, (H / 13) * i, W, H / 13 + 1)
    }
    ctx.fillStyle = '#3C3B6E'
    ctx.fillRect(0, 0, W * 0.4, (H / 13) * 7)
    ctx.fillStyle = '#FFFFFF'
    for (let r = 0; r < 5; r++) for (let col = 0; col < 6; col++) star(ctx, 8 + col * 12.5, 8 + r * 12.5, 3.2)
  },
  CA: (ctx) => {
    stripes(ctx, ['#D52B1E', '#FFFFFF', '#FFFFFF', '#D52B1E'], true)
    ctx.fillStyle = '#D52B1E'
    const cx = W / 2
    const cy = H / 2
    const s = 1.35
    const leaf = [
      [0, -34], [7, -20], [14, -24], [11, -4], [24, -16], [26, -9], [36, -11], [30, 3], [34, 6],
      [14, 18], [16, 26], [2, 23], [2, 38], [-2, 38], [-2, 23], [-16, 26], [-14, 18], [-34, 6],
      [-30, 3], [-36, -11], [-26, -9], [-24, -16], [-11, -4], [-14, -24], [-7, -20],
    ]
    ctx.beginPath()
    leaf.forEach(([x, y]) => ctx.lineTo(cx + (x * s) / 1.6, cy + (y * s) / 1.6))
    ctx.closePath()
    ctx.fill()
  },
  DE: (ctx) => stripes(ctx, ['#000000', '#DD0000', '#FFCE00']),
  GB: (ctx) => {
    ctx.fillStyle = '#012169'
    ctx.fillRect(0, 0, W, H)
    ctx.lineCap = 'butt'
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 26
    ctx.beginPath()
    ctx.moveTo(0, 0); ctx.lineTo(W, H); ctx.moveTo(W, 0); ctx.lineTo(0, H)
    ctx.stroke()
    ctx.strokeStyle = '#C8102E'
    ctx.lineWidth = 9
    ctx.stroke()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(W / 2 - 21, 0, 42, H)
    ctx.fillRect(0, H / 2 - 21, W, 42)
    ctx.fillStyle = '#C8102E'
    ctx.fillRect(W / 2 - 12, 0, 24, H)
    ctx.fillRect(0, H / 2 - 12, W, 24)
  },
  SG: (ctx) => {
    stripes(ctx, ['#EF3340', '#FFFFFF'])
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath(); ctx.arc(40, 32, 20, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#EF3340'
    ctx.beginPath(); ctx.arc(48, 32, 19, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ;[[64, 18], [74, 26], [70, 39], [58, 39], [54, 26]].forEach(([x, y]) => star(ctx, x, y, 4.5))
  },
  NL: (ctx) => stripes(ctx, ['#AE1C28', '#FFFFFF', '#21468B']),
  IE: (ctx) => stripes(ctx, ['#169B62', '#FFFFFF', '#FF883E'], true),
  IN: (ctx) => {
    stripes(ctx, ['#FF9933', '#FFFFFF', '#138808'])
    ctx.strokeStyle = '#000080'
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 17, 0, Math.PI * 2); ctx.stroke()
    ctx.lineWidth = 1
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(W / 2 + Math.cos(a) * 17, H / 2 + Math.sin(a) * 17); ctx.stroke()
    }
  },
}

const textures = new Map<FlagCode, THREE.CanvasTexture>()

export function flagTexture(code: FlagCode) {
  let t = textures.get(code)
  if (!t) {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    draw[code](canvas.getContext('2d')!)
    t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    textures.set(code, t)
  }
  return t
}

/** One time uniform shared by every waving flag, advanced once per frame. */
export const windTime = { value: 0 }

const materials = new Map<FlagCode, THREE.ShaderMaterial>()

export function flagMaterial(code: FlagCode) {
  let m = materials.get(code)
  if (!m) {
    m = new THREE.ShaderMaterial({
      uniforms: { map: { value: flagTexture(code) }, uTime: windTime },
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        varying float vShade;
        void main() {
          vUv = uv;
          vec3 p = position;
          float wave = sin(uv.x * 7.0 - uTime * 3.2 + uv.y * 1.5) * 0.09 + sin(uv.x * 13.0 - uTime * 5.0) * 0.025;
          p.z += wave * uv.x;
          vShade = 0.78 + 0.22 * cos(uv.x * 7.0 - uTime * 3.2 + uv.y * 1.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map;
        varying vec2 vUv;
        varying float vShade;
        void main() {
          vec4 c = texture2D(map, vUv);
          gl_FragColor = vec4(c.rgb * vShade, 1.0);
          #include <colorspace_fragment>
        }`,
    })
    materials.set(code, m)
  }
  return m
}
