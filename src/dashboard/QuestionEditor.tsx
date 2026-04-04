import { useState } from 'react'
import Editor from '@monaco-editor/react'
import type { Question } from '../lib/questions'
import { apiSubmit, JUDGE0_LANG_ID, prepareCode, type Judge0Result } from '../lib/judge0'
import SubmitResult from './SubmitResult'
import './QuestionEditor.css'

type Lang = 'cpp' | 'java' | 'python'

const LANG_LABELS: Record<Lang, string> = { cpp: 'C++', java: 'Java', python: 'Python' }
const MONACO_LANG: Record<Lang, string> = { cpp: 'cpp', java: 'java', python: 'python' }

const STARTERS: Record<Lang, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution here

    return 0;
}`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
  python: `import sys
input = sys.stdin.readline

def solve():
    # Write your solution here
    pass

solve()`,
}

interface Props { question: Question; onBack: () => void }

export default function QuestionEditor({ question, onBack }: Props) {
  const [lang, setLang]           = useState<Lang>('cpp')
  const [code, setCode]           = useState<Record<Lang, string>>({ ...STARTERS })
  const [activeTab, setActiveTab] = useState<'description' | 'hints'>('description')
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set())

  // submission state
  const [stdin, setStdin]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]       = useState<Judge0Result | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showStdin, setShowStdin] = useState(false)

  const toggleHint = (i: number) =>
    setRevealedHints(s => {
      const n = new Set(s)
      if (n.has(i)) { n.delete(i) } else { n.add(i) }
      return n
    })

  // Build expected output from first example
  const expectedOutput = question.examples[0]?.output ?? ''
  const exampleStdin   = question.examples[0]?.input  ?? ''

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitError(null)
    setResult(null)
    setSubmitting(true)

    try {
      const prepared = prepareCode(code[lang], lang)
      const res = await apiSubmit({
        source_code:     prepared,
        language_id:     JUDGE0_LANG_ID[lang],
        stdin:           stdin || exampleStdin,
        expected_output: expectedOutput,
        cpu_time_limit:  2,
        memory_limit:    128000,
      })
      setResult(res.result)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="qe">
      {/* ── top bar ── */}
      <div className="qe-topbar">
        <button className="qe-back" onClick={onBack} aria-label="Back to problems">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Problems
        </button>

        <div className="qe-meta">
          <span className="qe-title">{question.title}</span>
          <span className={`qe-diff qe-diff--${question.difficulty}`}>{question.difficulty}</span>
          <span className="qe-topic">{question.topic}</span>
          <span className="qe-points" title="Points">⬡ {question.points}</span>
        </div>

        <div className="qe-lang-switcher">
          {(Object.keys(LANG_LABELS) as Lang[]).map(l => (
            <button
              key={l}
              className={`qe-lang-btn ${lang === l ? 'qe-lang-btn--active' : ''}`}
              onClick={() => setLang(l)}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      {/* ── split pane ── */}
      <div className="qe-split">
        {/* problem panel */}
        <div className="qe-panel">
          <div className="qe-panel-tabs">
            <button
              className={`qe-tab ${activeTab === 'description' ? 'qe-tab--active' : ''}`}
              onClick={() => setActiveTab('description')}
            >Description</button>
            <button
              className={`qe-tab ${activeTab === 'hints' ? 'qe-tab--active' : ''}`}
              onClick={() => setActiveTab('hints')}
            >
              Hints
              {question.hints.length > 0 && (
                <span className="qe-tab-badge">{question.hints.length}</span>
              )}
            </button>
          </div>

          <div className="qe-panel-body">
            {activeTab === 'description' && (
              <>
                <p className="qe-description">{question.description}</p>

                <div className="qe-section-label">Examples</div>
                {question.examples.map((ex, i) => (
                  <div key={i} className="qe-example">
                    <div className="qe-example-row">
                      <span className="qe-example-key">Input</span>
                      <code className="qe-example-val">{ex.input || '—'}</code>
                    </div>
                    <div className="qe-example-row">
                      <span className="qe-example-key">Output</span>
                      <code className="qe-example-val">{ex.output || '—'}</code>
                    </div>
                  </div>
                ))}

                {question.constraints.length > 0 && (
                  <>
                    <div className="qe-section-label">Constraints</div>
                    <ul className="qe-constraints">
                      {question.constraints.map((c, i) => (
                        <li key={i} className="qe-constraint">{c}</li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="qe-complexity-row">
                  <div className="qe-complexity-chip">
                    <span className="qe-complexity-label">Time</span>
                    <code className="qe-complexity-val">{question.time_complexity}</code>
                  </div>
                  <div className="qe-complexity-chip">
                    <span className="qe-complexity-label">Space</span>
                    <code className="qe-complexity-val">{question.space_complexity}</code>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'hints' && (
              <div className="qe-hints">
                {question.hints.length === 0 && (
                  <p className="qe-no-hints">No hints available.</p>
                )}
                {question.hints.map((h, i) => {
                  const revealed = revealedHints.has(i)
                  return (
                    <div key={i} className={`qe-hint ${revealed ? 'qe-hint--open' : ''}`}>
                      <button
                        className="qe-hint-toggle"
                        onClick={() => toggleHint(i)}
                        aria-expanded={revealed}
                      >
                        <span className="qe-hint-num">Hint {i + 1}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          aria-hidden="true"
                          style={{ transform: revealed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      {revealed && <p className="qe-hint-text">{h}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* editor column */}
        <div className="qe-editor-col">
          {/* editor header */}
          <div className="qe-editor-header">
            <span className="qe-editor-lang">{LANG_LABELS[lang]}</span>
            <div className="qe-editor-actions">
              <button
                className={`qe-stdin-toggle ${showStdin ? 'qe-stdin-toggle--active' : ''}`}
                onClick={() => setShowStdin(s => !s)}
                title="Custom stdin"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                stdin
              </button>
              <button
                className="qe-reset"
                onClick={() => setCode(c => ({ ...c, [lang]: STARTERS[lang] }))}
                title="Reset to starter code"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                </svg>
                Reset
              </button>
            </div>
          </div>

          {/* monaco */}
          <div className="qe-editor-wrap">
            <Editor
              height="100%"
              language={MONACO_LANG[lang]}
              value={code[lang]}
              onChange={val => setCode(c => ({ ...c, [lang]: val ?? '' }))}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                tabSize: 4,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* stdin panel */}
          {showStdin && (
            <div className="qe-stdin-panel">
              <div className="qe-stdin-label">
                Custom stdin
                <span className="qe-stdin-hint">
                  (leave empty to use example input)
                </span>
              </div>
              <textarea
                className="qe-stdin-area"
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder={exampleStdin || 'Enter input…'}
                spellCheck={false}
                rows={3}
              />
            </div>
          )}

          {/* submit bar */}
          <div className="qe-submit-bar">
            {submitError && (
              <span className="qe-submit-error" role="alert">{submitError}</span>
            )}
            <button
              className="qe-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
              aria-label="Run and submit code"
            >
              {submitting ? (
                <>
                  <span className="qe-submit-spinner" aria-hidden="true" />
                  Running…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Run &amp; Submit
                </>
              )}
            </button>
          </div>

          {/* result panel */}
          {result && (
            <SubmitResult result={result} onClose={() => setResult(null)} />
          )}
        </div>
      </div>
    </div>
  )
}
