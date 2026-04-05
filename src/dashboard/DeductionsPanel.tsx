import { useEffect, useState } from 'react'
import { getMyDeductions, type Deduction } from '../lib/leaderboard'
import './DeductionsPanel.css'

const REASON_LABEL: Record<string, string> = {
  copy_paste:       'Paste detected',
  out_of_focus:     'Tab switch',
  fullscreen_exit:  'Fullscreen exit',
  wrong_submission: 'Wrong answer',
  illegal_injection:'Code injection',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function DeductionsPanel({ onClose }: { onClose: () => void }) {
  const [data, setData]       = useState<Deduction[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    getMyDeductions(100).then(res => {
      if (res) { setData(res.data); setTotal(res.total) }
      else setError(true)
    }).finally(() => setLoading(false))
  }, [])

  const totalPts = data.reduce((s, d) => s + d.pointsDeducted, 0)

  return (
    <div className="dp">
      <div className="dp-header">
        <div>
          <div className="dp-title">Point Deductions</div>
          {!loading && !error && (
            <div className="dp-summary">
              {total} event{total !== 1 ? 's' : ''} · <span className="dp-total-pts">−{totalPts} pts</span>
            </div>
          )}
        </div>
        <button className="dp-close" onClick={onClose} aria-label="Close">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="dp-body">
        {loading && <div className="dp-state"><span className="dp-spinner" /></div>}

        {error && !loading && (
          <div className="dp-state dp-state--error">Failed to load deductions.</div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="dp-state dp-state--empty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            No deductions yet. Keep it clean!
          </div>
        )}

        {!loading && !error && data.map((d, i) => (
          <div key={i} className={`dp-row dp-row--${d.source}`}>
            <div className="dp-row-left">
              <span className={`dp-badge dp-badge--${d.source}`}>
                {d.source === 'event' ? 'Event' : 'Submit'}
              </span>
              <div>
                <div className="dp-reason">
                  {REASON_LABEL[d.reason] ?? d.reason}
                </div>
                {d.verdict && (
                  <div className="dp-verdict">{d.verdict}</div>
                )}
              </div>
            </div>
            <div className="dp-row-right">
              <span className="dp-pts">−{d.pointsDeducted}</span>
              <span className="dp-time">{formatTime(d.occurredAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
