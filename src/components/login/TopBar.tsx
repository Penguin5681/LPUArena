import './TopBar.css'

interface Props {
  page: 'login' | 'signup'
  onNavigate: (p: 'login' | 'signup') => void
}

export default function TopBar({ page, onNavigate }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-logo">
        <span className="topbar-mark">◈</span>
        <span className="topbar-name">AlgoArena</span>
      </div>
      <nav className="topbar-nav">
        <a href="#" className="topbar-help">Help</a>
        {page === 'login'
          ? <button className="topbar-switch" onClick={() => onNavigate('signup')}>Create account</button>
          : <button className="topbar-switch" onClick={() => onNavigate('login')}>Sign in</button>
        }
      </nav>
    </header>
  )
}
