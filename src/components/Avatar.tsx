import { useEffect, useState } from 'react'
import { getAvatar } from '../lib/avatar'
import './Avatar.css'

interface Props {
  seed:      string        // registration number or any unique string
  name:      string        // fallback initial
  size?:     number        // px, default 28
  className?: string
}

export default function Avatar({ seed, name, size = 28, className = '' }: Props) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!seed) return
    getAvatar(seed).then(setSrc)
  }, [seed])

  const initial = name?.[0]?.toUpperCase() ?? '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`av av--img ${className}`}
        style={{ width: size, height: size }}
        draggable={false}
      />
    )
  }

  // fallback while loading or on error
  return (
    <div
      className={`av av--fallback ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-label={name}
    >
      {initial}
    </div>
  )
}
