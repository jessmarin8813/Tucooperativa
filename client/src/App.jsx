import React, { useState, useEffect } from 'react'
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

  // Verify session on mount
  useEffect(() => {
    const checkSession = async () => {
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
    }
    checkSession()
  }, [callApi])

  const handleLogin = async (email, password) => {
    const data = await callApi('login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password })
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
        <div className="neon-text animate-pulse">SISTEMA TUCOOPERATIVA - INICIALIZANDO...</div>
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
