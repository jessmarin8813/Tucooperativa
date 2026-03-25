import React, { useState, useEffect, useCallback } from 'react'
import './index.css'
import LoginView from './components/LoginView'
import MainLayout from './components/MainLayout'
import { useApi } from './hooks/useApi'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [initializing, setInitializing] = useState(true)
  const { callApi } = useApi()

  useEffect(() => {
    console.log("%c TuCooperativa v5.0.7-ULTRA FIXED %c", "background: #6366f1; color: white; font-weight: bold; padding: 4px; border-radius: 4px;", "");
  }, [])
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    if (view && ['dashboard', 'choferes', 'bi', 'gastos', 'cobranza', 'config', 'flota', 'mantenimiento', 'ranking'].includes(view)) {
      setActiveView(view)
    }
  }, [])

  // Update URL when view changes
  useEffect(() => {
    if (isLoggedIn) {
      const url = new URL(window.location)
      url.searchParams.set('view', activeView)
      window.history.replaceState({}, '', url)
    }
  }, [activeView, isLoggedIn])

  const checkSession = useCallback(async () => {
    try {
      const data = await callApi('session.php')
      if (data.isLoggedIn) {
        setIsLoggedIn(true)
        setUser(data.user)
      }
    } catch {
      // Not logged in, stay on LoginView
    } finally {
      setInitializing(false)
    }
  }, [callApi])

  // Verify session on mount
  useEffect(() => {
    let ignore = false
    const init = async () => {
      await Promise.resolve()
      if (!ignore) checkSession()
    }
    init()
    return () => { ignore = true }
  }, [checkSession])

  const handleLogin = async (username, password) => {
    const data = await callApi('login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    setIsLoggedIn(true)
    setUser(data.user)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    // Optional: call logout.php on backend
  }

  if (initializing) {
    return (
      <div style={{ background: '#0a0b12', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="neon-text animate-pulse" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          SISTEMA TUCOOPERATIVA - INICIALIZANDO...
        </div>
      </div>
    )
  }

  return isLoggedIn ? (
    <MainLayout 
      user={user} 
      activeView={activeView} 
      setActiveView={setActiveView} 
      onLogout={handleLogout} 
    />
  ) : (
    <LoginView onLogin={handleLogin} />
  )
}

export default App
