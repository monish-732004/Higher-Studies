import type { Medal, Tier } from '../data/content'

export const TIER_COLORS: Record<Tier, string> = {
  dream: '#F5C542',
  highReach: '#FF7A3D',
  range: '#3DA5FF',
  target: '#FFB020',
  safety: '#2FD47A',
  warning: '#FF4D5E',
}

export const TIER_LABELS: { tier: Tier; label: string }[] = [
  { tier: 'dream', label: '🌟 Dream' },
  { tier: 'highReach', label: '🔥 High Reach' },
  { tier: 'range', label: '🎯 Range / Reach' },
  { tier: 'target', label: '🟡 Target' },
  { tier: 'safety', label: '✅ Safety' },
  { tier: 'warning', label: '⚠️ Warning' },
]

export const MEDAL_COLORS: Record<Medal, string> = {
  gold: '#E8B84A',
  silver: '#C9D1DE',
  bronze: '#C8804A',
}

export const MEDAL_LABEL: Record<Medal, string> = {
  gold: '🥇 Tier 1',
  silver: '🥈 Tier 2',
  bronze: '🥉 Tier 3',
}

export const BG = '#070B18'

/** Ranking level colour: gold at level 1 fading through to green at level 13. */
export function levelHex(i: number, count = 13) {
  const t = i / (count - 1)
  const hue = 45 + (146 - 45) * t
  const sat = 90 - 24 * t
  const light = 61 - 10 * t
  return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`
}
