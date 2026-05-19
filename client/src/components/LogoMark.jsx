import { useId } from 'react'

/**
 * SVG recreation of the PropLink geometric diamond-frame mark.
 * Two interlocking chevron pieces that form a diamond outline.
 * variant: 'gold' | 'white' | 'forest'
 */
export default function LogoMark({ size = 36, variant = 'gold', className = '' }) {
  const uid = useId().replace(/:/g, 'x')

  const cfg = {
    gold:   { a: ['#E2C87A', '#B08830'], b: ['#C9A24D', '#7A5B1E'] },
    white:  { a: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.50)'], b: ['rgba(255,255,255,0.80)', 'rgba(255,255,255,0.30)'] },
    forest: { a: ['#2d8a5e', '#0F3D2E'], b: ['#1a6644', '#08281F'] },
  }
  const c = cfg[variant] || cfg.gold

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}a`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.a[0]} />
          <stop offset="100%" stopColor={c.a[1]} />
        </linearGradient>
        <linearGradient id={`${uid}b`} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={c.b[0]} />
          <stop offset="100%" stopColor={c.b[1]} />
        </linearGradient>
      </defs>

      {/* Top-left arm — upper half of the diamond frame */}
      <path
        d="M50 5 L93 50 L68 50 L50 32 L32 50 L7 50 Z"
        fill={`url(#${uid}a)`}
      />

      {/* Bottom-right arm — lower half of the diamond frame */}
      <path
        d="M50 95 L7 50 L32 50 L50 68 L68 50 L93 50 Z"
        fill={`url(#${uid}b)`}
      />
    </svg>
  )
}
