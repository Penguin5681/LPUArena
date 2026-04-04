import type { Judge0Result } from '../lib/judge0'
import { getVerdict } from '../lib/judge0'
import './SubmitResult.css'

interface Props {
  result: Judge0Result
  onClose: () => void
}

export default function SubmitResult({ result, onClose }: Props) {
  const verdict = getVerdict(result.status)

  const output   = result.stdout?.trimEnd()         ?? ''
  const stderr   = result.stderr?.trimEnd()         ?? ''
  const compile  = result.compile_output?.trimEnd() ?? ''
  const hasError = stderr || compile

  return (
    <div className={`sr sr--${verdict}`}>
      {/* header */}
      <div className="sr-header">
        <div className="sr-verdict-row">
          <span className={`sr-verdict-icon sr-verdict-icon--${verdict}`} aria-hidden="true">
            {verdict === 'accepted' && '✓'}
            {verdict === 'wrong'    && '✗'}
            {verdict === 'error'    && '⚠'}
            {verdict === 'running'  && '…'}
          </span>
          <div>
            <div className={`sr-verdict sr-verdict--${verdict}`}>
              {result.status.description}
            </div>
            <div className="sr-meta-row">
              {result.time   && <span className="sr-meta">Time: {result.time}s</span>}
              {result.memory && <span className="sr-meta">Memory: {(result.memory / 1024).toFixed(1)} MB</span>}
            </div>
          </div>
        </div>
        <button className="sr-close" onClick={onClose} aria-label="Close result">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* output */}
      <div className="sr-body">
        {output && (
          <div className="sr-section">
            <div className="sr-section-label">Output</div>
            <pre className="sr-pre sr-pre--output">{output}</pre>
          </div>
        )}

        {compile && (
          <div className="sr-section">
            <div className="sr-section-label sr-section-label--error">Compile Error</div>
            <pre className="sr-pre sr-pre--error">{compile}</pre>
          </div>
        )}

        {stderr && !compile && (
          <div className="sr-section">
            <div className="sr-section-label sr-section-label--error">Runtime Error</div>
            <pre className="sr-pre sr-pre--error">{stderr}</pre>
          </div>
        )}

        {!output && !hasError && (
          <p className="sr-empty">No output produced.</p>
        )}
      </div>
    </div>
  )
}
