import { useEffect, useState, useCallback, useMemo } from 'react'
import { apiGetAllQuestions, clearQuestionsCache, type Question } from '../lib/questions'
import './QuestionList.css'

interface Props { onSelect: (q: Question) => void }

type Diff   = 'all' | 'easy' | 'medium' | 'hard'
type SortBy = 'default' | 'title' | 'difficulty'

const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 }

export default function QuestionList({ onSelect }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const [search, setSearch]   = useState('')
  const [diff, setDiff]       = useState<Diff>('all')
  const [topic, setTopic]     = useState('all')
  const [sortBy, setSortBy]   = useState<SortBy>('default')

  const load = useCallback(async (bust = false) => {
    if (bust) clearQuestionsCache()
    setLoading(true); setError(null)
    const before = Date.now()
    try {
      const data = await apiGetAllQuestions()
      setFromCache(Date.now() - before < 30) // near-instant = cache hit
      setQuestions(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const topics = useMemo(() =>
    ['all', ...Array.from(new Set(questions.map(q => q.topic))).sort()],
    [questions]
  )

  const stats = useMemo(() => ({
    easy:   questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard:   questions.filter(q => q.difficulty === 'hard').length,
  }), [questions])

  const filtered = useMemo(() => {
    let list = questions.filter(q => {
      const s = search.toLowerCase()
      const matchSearch = !s || q.title.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s)
      const matchDiff   = diff  === 'all' || q.difficulty === diff
      const matchTopic  = topic === 'all' || q.topic === topic
      return matchSearch && matchDiff && matchTopic
    })
    if (sortBy === 'title')      list = [...list].sort((a,b) => a.title.localeCompare(b.title))
    if (sortBy === 'difficulty') list = [...list].sort((a,b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])
    return list
  }, [questions, search, diff, topic, sortBy])

  return (
    <div className="ql">
      {/* ── header ── */}
      <div className="ql-header">
        <div className="ql-header-top">
          <div>
            <h2 className="ql-title">Problems</h2>
            <p className="ql-subtitle">
              {loading ? 'Loading…' : `${questions.length} problems`}
              {fromCache && !loading && <span className="ql-cache-badge">cached</span>}
            </p>
          </div>

          {/* stats pills */}
          {!loading && !error && (
            <div className="ql-stats">
              <button className={`ql-stat ql-stat--easy   ${diff==='easy'   ? 'ql-stat--on':''}`} onClick={() => setDiff(d => d==='easy'   ? 'all':'easy')}>
                <span className="ql-stat-num">{stats.easy}</span>
                <span className="ql-stat-lbl">Easy</span>
              </button>
              <button className={`ql-stat ql-stat--medium ${diff==='medium' ? 'ql-stat--on':''}`} onClick={() => setDiff(d => d==='medium' ? 'all':'medium')}>
                <span className="ql-stat-num">{stats.medium}</span>
                <span className="ql-stat-lbl">Medium</span>
              </button>
              <button className={`ql-stat ql-stat--hard   ${diff==='hard'   ? 'ql-stat--on':''}`} onClick={() => setDiff(d => d==='hard'   ? 'all':'hard')}>
                <span className="ql-stat-num">{stats.hard}</span>
                <span className="ql-stat-lbl">Hard</span>
              </button>
            </div>
          )}
        </div>

        {/* controls row */}
        <div className="ql-controls">
          {/* search */}
          <div className="ql-search-wrap">
            <svg className="ql-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="ql-search"
              type="text"
              placeholder="Search title or topic…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search questions"
            />
            {search && (
              <button className="ql-search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
            )}
          </div>

          {/* topic filter */}
          <select
            className="ql-select"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            aria-label="Filter by topic"
          >
            {topics.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'All Topics' : t}</option>
            ))}
          </select>

          {/* sort */}
          <select
            className="ql-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            aria-label="Sort by"
          >
            <option value="default">Default order</option>
            <option value="title">A → Z</option>
            <option value="difficulty">By difficulty</option>
          </select>

          {/* refresh */}
          <button
            className="ql-refresh"
            onClick={() => load(true)}
            title="Refresh (clears cache)"
            aria-label="Refresh questions"
            disabled={loading}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── body ── */}
      <div className="ql-body">
        {loading && (
          <div className="ql-state">
            <span className="ql-spinner" aria-label="Loading" />
            <span className="ql-state-text">Fetching problems…</span>
          </div>
        )}

        {error && !loading && (
          <div className="ql-state ql-state--error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
            <button className="ql-retry" onClick={() => load()}>Try again</button>
          </div>
        )}

        {!loading && !error && (
          <table className="ql-table" aria-label="Coding problems">
            <thead>
              <tr>
                <th className="ql-th ql-th--num">#</th>
                <th className="ql-th">Title</th>
                <th className="ql-th ql-th--topic">Topic</th>
                <th className="ql-th ql-th--diff">Difficulty</th>
                <th className="ql-th ql-th--cx">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="ql-empty">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    No problems match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((q, i) => (
                <tr
                  key={q.id}
                  className="ql-row"
                  onClick={() => onSelect(q)}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onSelect(q)}
                  role="button"
                  aria-label={`Open ${q.title}`}
                >
                  <td className="ql-td ql-td--num">{i + 1}</td>
                  <td className="ql-td ql-td--title">
                    <span className="ql-row-title">{q.title}</span>
                  </td>
                  <td className="ql-td ql-td--topic">
                    <span className="ql-topic">{q.topic}</span>
                  </td>
                  <td className="ql-td ql-td--diff">
                    <span className={`ql-diff ql-diff--${q.difficulty}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="ql-td ql-td--cx">
                    <code className="ql-cx">{q.time_complexity}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── footer ── */}
      {!loading && !error && (
        <div className="ql-footer">
          <span className="ql-footer-text">
            Showing <strong>{filtered.length}</strong> of <strong>{questions.length}</strong> problems
          </span>
        </div>
      )}
    </div>
  )
}
