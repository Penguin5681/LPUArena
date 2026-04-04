import './App.css'
import LeftPanel  from './components/login/LeftPanel'
import TopBar     from './components/login/TopBar'
import LoginForm  from './components/login/LoginForm'
import BottomBar  from './components/login/BottomBar'

export default function App() {
  return (
    <div className="page">
      <LeftPanel />

      <main className="panel-right">
        <TopBar />
        <LoginForm />
        <BottomBar />
      </main>
    </div>
  )
}
