import { useEffect, useMemo } from 'react'
import type { Question } from '../lib/questions'
import './SolvedQuestionModal.css'

interface Props {
  question: Question | null
  onClose: () => void
}

export default function SolvedQuestionModal({ question, onClose }: Props) {
  const opened = Boolean(question)

  useEffect(() => {
    if (!opened) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [opened, onClose])

  const sortedConstraints = useMemo(() => {
    if (!question?.constraints) return []
    return question.constraints.filter(Boolean)
  }, [question])

  if (!question) return null

  return (
    <div className="sqm-overlay" onClick={onClose} role="presentation">
      <div
        className="sqm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Solved question statement: ${question.title}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sqm-header">
          <div className="sqm-header-left">
            <span className="sqm-kicker">Solved Problem Statement</span>
            <h2 className="sqm-title">{question.title}</h2>
            <div className="sqm-meta">
              <span className={`sqm-chip sqm-chip--${question.difficulty}`}>{question.difficulty}</span>
              <span className="sqm-chip sqm-chip--topic">{question.topic}</span>
              <span className="sqm-chip sqm-chip--points">⬡ {question.points}</span>
            </div>
          </div>
          <button className="sqm-close" onClick={onClose} aria-label="Close statement modal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="sqm-body">
          <section className="sqm-section">
            <h3 className="sqm-section-title">Description</h3>
            <p className="sqm-text">{question.description}</p>
          </section>

          {question.examples.length > 0 && (
            <section className="sqm-section">
              <h3 className="sqm-section-title">Examples</h3>
              <div className="sqm-examples">
                {question.examples.map((ex, idx) => (
                  <div className="sqm-example" key={`${question.id}-ex-${idx}`}>
                    <div className="sqm-example-row">
                      <span className="sqm-example-label">Input</span>
                      <code className="sqm-code">{ex.input || '—'}</code>
                    </div>
                    <div className="sqm-example-row">
                      <span className="sqm-example-label">Output</span>
                      <code className="sqm-code">{ex.output || '—'}</code>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sortedConstraints.length > 0 && (
            <section className="sqm-section">
              <h3 className="sqm-section-title">Constraints</h3>
              <ul className="sqm-constraints">
                {sortedConstraints.map((constraint, idx) => (
                  <li className="sqm-constraint" key={`${question.id}-constraint-${idx}`}>
                    {constraint}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="sqm-section sqm-section--complexity">
            <div className="sqm-complexity">
              <span className="sqm-complexity-label">Time</span>
              <code className="sqm-complexity-value">{question.time_complexity}</code>
            </div>
            <div className="sqm-complexity">
              <span className="sqm-complexity-label">Space</span>
              <code className="sqm-complexity-value">{question.space_complexity}</code>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
