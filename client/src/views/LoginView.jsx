import React, { useState } from 'react'

const LoginView = ({ onLogin }) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const username = e.target.elements[0].value
    const password = e.target.elements[1].value

    try {
      await onLogin(username, password)
    } catch (err) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'radial-gradient(circle at top right, #1e1b4b, #0a0b12)'
    }}>
      <div className="glass animate-fade" style={{ padding: '48px', width: '100%', maxWidth: '400px' }}>
        <h1 className="neon-text brand" style={{ fontSize: '2.5rem', marginBottom: '8px', textAlign: 'center', fontWeight: 900 }}>TuCooperativa</h1>
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '32px', fontSize: '0.875rem' }}>Ecosistema de Control para Dueños</p>
        
        {error && (
          <div className="glass" style={{ padding: '12px', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Usuario Administrativo</label>
            <input type="text" placeholder="dueño_cooperativa" name="username" autoComplete="off" className="glass" style={{ 
              width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' 
            }} required />
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Clave de Seguridad</label>
            <input type="password" placeholder="••••••••" name="password" autoComplete="off" className="glass" style={{ 
              width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' 
            }} required />
          </div>
          
          <button className="btn-primary" disabled={loading} style={{ width: '100%', letterSpacing: '0.05em' }}>
            {loading ? 'AUTENTICANDO...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>
        
        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Protección de Datos Administrativa Activa
        </p>
      </div>
    </div>
  )
}

export default LoginView
