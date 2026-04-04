import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import QuestionList from './QuestionList'
import QuestionEditor from './QuestionEditor'
import type { Question } from '../lib/questions'
import './Dashboard.css'

type View = 'questions'

export default function Dashboard() {
  const { user, logout }  = useAuth()
  const [view]            = useState<View>('questions')
  const [activeQ, setActiveQ]   = useState<Question | null>(null)
  const [collapsed, setCollapsed] = useState(false)

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
            className={`db-nav-item ${view === 'questions' ? 'db-nav-item--active' : ''}`}
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
        </nav>

        {/* user */}
        <div className="db-user">
          <div className="db-user-avatar" title={user?.name}>
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
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
        {!activeQ && <QuestionList onSelect={setActiveQ} />}
        {activeQ  && <QuestionEditor question={activeQ} onBack={() => setActiveQ(null)} />}
      </div>
    </div>
  )
}
