import { useEffect, useRef, useState } from 'react'
import './ComingSoon.css'

const LAUNCH = new Date('2026-04-08T13:00:00')

function getTimeLeft() {
  const diff = LAUNCH.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function ComingSoon() {
  const [time, setTime] = useState(getTimeLeft)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // countdown
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  // animated canvas background — same diagonal grid + drifting spotlight as LeftPanel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random(), y: Math.random(),
      size:  1 + Math.random() * 2.5,
      speed: 0.00006 + Math.random() * 0.0001,
      opacity: 0.1 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.00012,
    }))

    const draw = () => {
      const W = canvas.width, H = canvas.height
      t += 0.003

      ctx.clearRect(0, 0, W, H)

      // base
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#141414')
      bg.addColorStop(1, '#0a0a0a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // diagonal grid
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'
      ctx.lineWidth = 1
      const step = 60
      for (let x = -H; x < W + H; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - H, H); ctx.stroke()
      }
      ctx.restore()

      // lime spotlight
      const sx = W * (0.5 + Math.sin(t * 0.35) * 0.2)
      const sy = H * (0.45 + Math.cos(t * 0.28) * 0.15)
      const sp = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.55)
      sp.addColorStop(0,   'rgba(232,255,71,0.06)')
      sp.addColorStop(0.5, 'rgba(232,255,71,0.015)')
      sp.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = sp
      ctx.fillRect(0, 0, W, H)

      // floating squares
      for (const p of particles) {
        p.y -= p.speed; p.x += p.drift
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random() }
        if (p.x < -0.02) p.x = 1.02
        if (p.x >  1.02) p.x = -0.02
        ctx.save()
        ctx.translate(p.x * W, p.y * H)
        ctx.rotate(t * 0.25 + p.opacity * 8)
        ctx.strokeStyle = `rgba(232,255,71,${p.opacity * 0.45})`
        ctx.lineWidth = 0.7
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }

      // scan line
      const scanY = ((t * 55) % (H + 40)) - 20
      const scan = ctx.createLinearGradient(0, scanY - 16, 0, scanY + 16)
      scan.addColorStop(0,   'rgba(232,255,71,0)')
      scan.addColorStop(0.5, 'rgba(232,255,71,0.035)')
      scan.addColorStop(1,   'rgba(232,255,71,0)')
      ctx.fillStyle = scan
      ctx.fillRect(0, scanY - 16, W, 32)

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const launched = time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0

  return (
    <div className="cs">
      <canvas ref={canvasRef} className="cs-canvas" aria-hidden="true" />

      {/* scanlines + vignette */}
      <div className="cs-scanlines" aria-hidden="true" />
      <div className="cs-vignette"  aria-hidden="true" />

      <div className="cs-content">
        {/* brand */}
        <div className="cs-brand">
          <span className="cs-brand-mark">◈</span>
          <span className="cs-brand-name">AlgoArena</span>
        </div>

        {/* headline */}
        <h1 className="cs-headline">
          Something<br />
          <em>epic</em> is loading.
        </h1>

        <p className="cs-sub">
          The arena opens on{' '}
          <strong>April 8, 2026 at 1:00 PM</strong>.
          <br />
          Sharpen your algorithms. The clock is ticking.
        </p>

        {/* countdown */}
        {!launched ? (
          <div className="cs-countdown" aria-label="Time until launch">
            {[
              { label: 'Days',    value: time.days    },
              { label: 'Hours',   value: time.hours   },
              { label: 'Minutes', value: time.minutes },
              { label: 'Seconds', value: time.seconds },
            ].map(({ label, value }, i) => (
              <>
                <div key={label} className="cs-unit">
                  <div className="cs-unit-num">{pad(value)}</div>
                  <div className="cs-unit-label">{label}</div>
                </div>
                {i < 3 && (
                  <span key={`sep-${i}`} className="cs-sep" aria-hidden="true">:</span>
                )}
              </>
            ))}
          </div>
        ) : (
          <div className="cs-live">
            <span className="cs-live-dot" aria-hidden="true" />
            Arena is live — refresh to enter
          </div>
        )}

        {/* decorative rule */}
        <div className="cs-rule" aria-hidden="true" />

        <p className="cs-tagline">
          Competitive coding · Real-time leaderboard · Multi-language support
        </p>
      </div>
    </div>
  )
}
