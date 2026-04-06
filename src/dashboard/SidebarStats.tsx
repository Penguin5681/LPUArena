import { useEffect, useState } from 'react'
import {
  getMyPoints, getMySolvedByDifficulty,
  type PointsData, type SolvedByDifficultyData,
} from '../lib/leaderboard'
import type { SolvedQuestion } from '../lib/questions'
import './SidebarStats.css'

interface Props {
  collapsed: boolean
  solvedQuestions?: SolvedQuestion[]
  onOpenSolvedQuestion?: (questionId: number) => void
}

function formatSolvedDate(iso: string) {
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function SidebarStats({ collapsed, solvedQuestions = [], onOpenSolvedQuestion }: Props) {
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
        {!loading && solvedQuestions.length > 0 && (
          <span className="ss-solved-mini">✓{solvedQuestions.length}</span>
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

      <div className="ss-solved-list">
        <div className="ss-solved-list-header">
          <span className="ss-solved-list-title">Solved Questions</span>
          <span className="ss-solved-list-count">{solvedQuestions.length}</span>
        </div>

        {solvedQuestions.length === 0 ? (
          <div className="ss-solved-empty">No solved questions yet</div>
        ) : (
          <div className="ss-solved-items">
            {solvedQuestions.map(q => (
              <button
                key={q.id}
                className="ss-solved-item"
                onClick={() => onOpenSolvedQuestion?.(q.id)}
                title={`Open statement: ${q.title}`}
              >
                <span className={`ss-solved-pill ss-solved-pill--${q.difficulty}`}>{q.difficulty}</span>
                <span className="ss-solved-item-title">{q.title}</span>
                <span className="ss-solved-item-date">{formatSolvedDate(q.first_solved_at)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
