import { useEffect, useState } from 'react'
import {
  getMyPoints, getMySolvedByDifficulty,
  type PointsData, type SolvedByDifficultyData,
} from '../lib/leaderboard'
import './SidebarStats.css'

interface Props { collapsed: boolean }

export default function SidebarStats({ collapsed }: Props) {
  const [points, setPoints]   = useState<PointsData | null>(null)
  const [solved, setSolved]   = useState<SolvedByDifficultyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyPoints(), getMySolvedByDifficulty()])
      .then(([p, s]) => {
        if (p) setPoints(p.data)
        if (s) setSolved(s.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (collapsed) {
    // icon-only: just show the score
    return (
      <div className="ss ss--collapsed" title={points ? `Score: ${points.score}` : 'Loading…'}>
        <span className="ss-score-icon">⬡</span>
        {!loading && points && (
          <span className="ss-score-mini">{points.score}</span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="ss">
        <div className="ss-loading">
          <span className="ss-spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="ss">
      {/* score row */}
      {points && (
        <div className="ss-score-row">
          <div className="ss-score-block">
            <span className="ss-score-num">{points.score}</span>
            <span className="ss-score-lbl">Score</span>
          </div>
          <div className="ss-divider-v" />
          <div className="ss-score-block">
            <span className="ss-score-num ss-score-num--red">−{points.totalDeductions}</span>
            <span className="ss-score-lbl">Deducted</span>
          </div>
        </div>
      )}

      {/* solved breakdown */}
      {solved && (
        <div className="ss-solved">
          <div className="ss-solved-total">
            <span className="ss-solved-num">{solved.totalSolved}</span>
            <span className="ss-solved-lbl">Solved</span>
          </div>
          <div className="ss-diff-bars">
            {(['easy', 'medium', 'hard'] as const).map(d => {
              const bucket = solved.byDifficulty[d]
              return (
                <div key={d} className="ss-diff-row" title={`${bucket.solvedCount} ${d}`}>
                  <span className={`ss-diff-dot ss-diff-dot--${d}`} />
                  <div className="ss-diff-bar-wrap">
                    <div
                      className={`ss-diff-bar ss-diff-bar--${d}`}
                      style={{ width: bucket.solvedCount > 0 ? `${Math.min(100, bucket.solvedCount * 10)}%` : '4px' }}
                    />
                  </div>
                  <span className="ss-diff-count">{bucket.solvedCount}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
