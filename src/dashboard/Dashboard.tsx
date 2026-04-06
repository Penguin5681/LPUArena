import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHeartbeat } from '../hooks/useHeartbeat'
import QuestionList from './QuestionList'
import QuestionEditor from './QuestionEditor'
import DeductionsPanel from './DeductionsPanel'
import SidebarStats from './SidebarStats'
import SolvedQuestionModal from './SolvedQuestionModal.tsx'
import Avatar from '../components/Avatar'
import { apiGetAllQuestions, apiGetMySolvedQuestions, type Question, type SolvedQuestion } from '../lib/questions'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout }    = useAuth()
  const [activeQ, setActiveQ]         = useState<Question | null>(null)
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null)
  const [solvedQuestions, setSolvedQuestions] = useState<SolvedQuestion[]>([])
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [collapsed, setCollapsed]     = useState(false)
  const [showDeductions, setShowDeductions] = useState(false)

  // keep a ref to the full question list so random pick is instant
  const allQuestionsRef = useRef<Question[]>([])
  const prevActiveQRef = useRef<Question | null>(null)

  const refreshSolved = useCallback(async () => {
    try {
      const res = await apiGetMySolvedQuestions()
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.first_solved_at).getTime() - new Date(a.first_solved_at).getTime(),
      )
      setSolvedQuestions(sorted)
    } catch {
      setSolvedQuestions([])
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => refreshSolved())
  }, [refreshSolved])

  const triggerRefresh = useCallback((forceQuestionReload = true) => {
    refreshSolved()
    if (forceQuestionReload) {
      setRefreshNonce(n => n + 1)
    }
  }, [refreshSolved])

  // Auto-refresh dashboard data periodically when user is on the problems list.
  useEffect(() => {
    if (activeQ) return
    const id = window.setInterval(() => {
      triggerRefresh(true)
    }, 45000)
    return () => window.clearInterval(id)
  }, [activeQ, triggerRefresh])

  // Refresh solved/question data when returning from editor to list.
  useEffect(() => {
    const wasInEditor = prevActiveQRef.current !== null
    const nowInList = activeQ === null
    if (wasInEditor && nowInList) {
      Promise.resolve().then(() => triggerRefresh(true))
    }
    prevActiveQRef.current = activeQ
  }, [activeQ, triggerRefresh])

  const solvedQuestionIds = useMemo(
    () => new Set(solvedQuestions.map(q => q.id)),
    [solvedQuestions],
  )

  const solvedQuestionSlugs = useMemo(
    () => new Set(solvedQuestions.map(q => q.slug.trim().toLowerCase())),
    [solvedQuestions],
  )

  const handleOpenSolvedModal = useCallback(async (questionId: number) => {
    const fromState = allQuestions.find(q => Number(q.id) === questionId)
    const fromRef = allQuestionsRef.current.find(q => Number(q.id) === questionId)
    const target = fromState ?? fromRef
    if (target) {
      setModalQuestion(target)
      return
    }

    try {
      const loaded = await apiGetAllQuestions()
      allQuestionsRef.current = loaded
      setAllQuestions(loaded)
      const lateTarget = loaded.find(q => Number(q.id) === questionId)
      if (lateTarget) setModalQuestion(lateTarget)
    } catch {
      // no-op: modal open is best-effort when full question data is unavailable
    }
  }, [allQuestions])

  const handleSolvedRowClick = useCallback((q: Question) => {
    setModalQuestion(q)
  }, [])

  const handleNext = () => {
    const list = allQuestionsRef.current
    if (list.length === 0) return
    // pick a random question that isn't the current one
    const pool = activeQ ? list.filter(q => q.id !== activeQ.id) : list
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (pick) setActiveQ(pick)
  }

  // silent heartbeat — fire-and-forget every 30s
  useHeartbeat(activeQ ? `/problem/${activeQ.slug}` : '/dashboard')

  return (
    <div className={`db ${collapsed ? 'db--collapsed' : ''}`}>

      {/* ── sidebar ── */}
      <aside className="db-sidebar">
        {/* brand */}
        <div className="db-brand">
          <span className="db-brand-mark">◈</span>
          {!collapsed && <span className="db-brand-name">AlgoArena</span>}
        </div>

        {/* collapse toggle */}
        <button
          className="db-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            {collapsed
              ? <polyline points="9 18 15 12 9 6" />
              : <polyline points="15 18 9 12 15 6" />
            }
          </svg>
        </button>

        {/* nav */}
        <nav className="db-nav">
          <button
            className={`db-nav-item ${!activeQ ? 'db-nav-item--active' : ''}`}
            onClick={() => setActiveQ(null)}
            title="Problems"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            {!collapsed && <span>Problems</span>}
          </button>

          <button
            className={`db-nav-item ${showDeductions ? 'db-nav-item--active' : ''}`}
            onClick={() => setShowDeductions(s => !s)}
            title="My Deductions"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {!collapsed && <span>Deductions</span>}
          </button>
        </nav>

        {/* stats */}
        <SidebarStats
          collapsed={collapsed}
          solvedQuestions={solvedQuestions}
          onOpenSolvedQuestion={handleOpenSolvedModal}
        />

        {/* user */}
        <div className="db-user">
          <Avatar
            seed={user?.registrationNumber ?? user?.email ?? ''}
            name={user?.name ?? ''}
            size={28}
          />
          {!collapsed && (
            <div className="db-user-info">
              <span className="db-user-name">{user?.name}</span>
              <span className="db-user-reg">{user?.registrationNumber}</span>
            </div>
          )}
          <button
            className="db-logout"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── main ── */}
      <div className="db-main">
        <div className="db-content">
          {!activeQ && (
            <QuestionList
              onSelect={setActiveQ}
              onSelectSolved={handleSolvedRowClick}
              solvedQuestionIds={solvedQuestionIds}
              solvedQuestionSlugs={solvedQuestionSlugs}
              refreshNonce={refreshNonce}
              onLoaded={qs => {
                allQuestionsRef.current = qs
                setAllQuestions(qs)
              }}
            />
          )}
          {activeQ  && <QuestionEditor question={activeQ} onBack={() => setActiveQ(null)} onNext={handleNext} />}
        </div>

        {showDeductions && (
          <DeductionsPanel onClose={() => setShowDeductions(false)} />
        )}
      </div>

      <SolvedQuestionModal
        question={modalQuestion}
        onClose={() => setModalQuestion(null)}
      />
    </div>
  )
}
