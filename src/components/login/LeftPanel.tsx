import { useEffect, useRef } from 'react'
import './LeftPanel.css'

const TICKER = 'ACCESS GRANTED ◆ SECURE SESSION ◆ ENCRYPTED ◆ VERIFIED ◆ '

export default function LeftPanel({ page }: { page: 'login' | 'signup' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // particles
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 2.5,
      speed: 0.00008 + Math.random() * 0.00012,
      opacity: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.00015,
    }))

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      t += 0.004

      ctx.clearRect(0, 0, W, H)

      // ── base gradient ──
      const bg = ctx.createLinearGradient(0, 0, W * 0.6, H)
      bg.addColorStop(0,   '#1a1a1a')
      bg.addColorStop(0.5, '#141414')
      bg.addColorStop(1,   '#0e0e0e')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // ── diagonal grid lines ──
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.028)'
      ctx.lineWidth = 1
      const step = 52
      // going ↘
      for (let x = -H; x < W + H; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + H, H)
        ctx.stroke()
      }
      // going ↙
      for (let x = -H; x < W + H; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x - H, H)
        ctx.stroke()
      }
      ctx.restore()

      // ── drifting spotlight ──
      const sx = W * (0.35 + Math.sin(t * 0.4) * 0.18)
      const sy = H * (0.45 + Math.cos(t * 0.3) * 0.15)
      const spot = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.65)
      spot.addColorStop(0,   'rgba(232,255,71,0.055)')
      spot.addColorStop(0.4, 'rgba(232,255,71,0.018)')
      spot.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = spot
      ctx.fillRect(0, 0, W, H)

      // ── second cooler-toned spotlight ──
      const sx2 = W * (0.7 + Math.cos(t * 0.25) * 0.2)
      const sy2 = H * (0.7 + Math.sin(t * 0.35) * 0.2)
      const spot2 = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, W * 0.5)
      spot2.addColorStop(0,   'rgba(180,200,255,0.03)')
      spot2.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = spot2
      ctx.fillRect(0, 0, W, H)

      // ── floating accent squares ──
      for (const p of particles) {
        p.y -= p.speed
        p.x += p.drift
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random() }
        if (p.x < -0.02) p.x = 1.02
        if (p.x >  1.02) p.x = -0.02

        const px = p.x * W
        const py = p.y * H
        const s  = p.size

        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(t * 0.3 + p.opacity * 10)
        ctx.strokeStyle = `rgba(232,255,71,${p.opacity * 0.5})`
        ctx.lineWidth = 0.8
        ctx.strokeRect(-s / 2, -s / 2, s, s)
        ctx.restore()
      }

      // ── horizontal scan line ──
      const scanY = (((t * 60) % (H + 40)) - 20)
      const scan = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18)
      scan.addColorStop(0,   'rgba(232,255,71,0)')
      scan.addColorStop(0.5, 'rgba(232,255,71,0.04)')
      scan.addColorStop(1,   'rgba(232,255,71,0)')
      ctx.fillStyle = scan
      ctx.fillRect(0, scanY - 18, W, 36)

      // ── bottom-left corner accent ──
      ctx.save()
      ctx.strokeStyle = 'rgba(232,255,71,0.12)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, H - 80); ctx.lineTo(80, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, H - 50); ctx.lineTo(50, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, H - 20); ctx.lineTo(20, H); ctx.stroke()
      ctx.restore()

      // ── top-right corner accent ──
      ctx.save()
      ctx.strokeStyle = 'rgba(232,255,71,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(W, 80);  ctx.lineTo(W - 80, 0);  ctx.stroke()
      ctx.beginPath(); ctx.moveTo(W, 50);  ctx.lineTo(W - 50, 0);  ctx.stroke()
      ctx.beginPath(); ctx.moveTo(W, 20);  ctx.lineTo(W - 20, 0);  ctx.stroke()
      ctx.restore()

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <aside className="lp" aria-hidden="true">
      <canvas ref={canvasRef} className="lp-canvas" />
      <div className="lp-noise" />

      {/* brand mark */}
      <div className="lp-brand">◈ AlgoArena</div>

      {/* hero type */}
      <div className="lp-hero">
        {page === 'login' ? (
          <>
            <div className="lp-word">
              <span className="lp-letter">S</span>
              <span className="lp-letter">I</span>
              <span className="lp-letter">G</span>
              <span className="lp-letter lp-letter--accent">N</span>
            </div>
            <div className="lp-divider" />
            <div className="lp-word">
              <span className="lp-letter">I</span>
              <span className="lp-letter">N</span>
            </div>
          </>
        ) : (
          <>
            <div className="lp-word">
              <span className="lp-letter">S</span>
              <span className="lp-letter">I</span>
              <span className="lp-letter">G</span>
              <span className="lp-letter lp-letter--accent">N</span>
            </div>
            <div className="lp-divider" />
            <div className="lp-word">
              <span className="lp-letter">U</span>
              <span className="lp-letter lp-letter--accent">P</span>
            </div>
          </>
        )}
        <p className="lp-tagline">{page === 'login' ? 'Secure access portal' : 'Join the arena'}</p>
      </div>

      {/* bottom meta + ticker */}
      <div className="lp-footer">
        <div className="lp-meta">
          <span>EST. 2025</span>
          <span className="lp-meta-dot" />
          <span>v1.0.0</span>
          <span className="lp-meta-dot" />
          <span>256-bit enc.</span>
        </div>
        <div className="lp-ticker-wrap">
          <div className="lp-ticker">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="lp-ticker-item">{TICKER}</span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
