import './TopBar.css'

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-logo">
        <span className="topbar-mark">◈</span>
        <span className="topbar-name">CORP</span>
      </div>
      <a href="#" className="topbar-help">Help</a>
    </header>
  )
}
