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
    <div className="login-container p-flex p-items-center p-justify-center" style={{ 
      height: '100vh',
      background: 'radial-gradient(circle at top right, #1e1b4b, #03040b)'
    }}>
      <div className="p-glass-premium animate-fade" style={{ padding: '32px', width: '90%', maxWidth: '360px' }}>
        <h1 className="p-neon-text p-text-center p-mb-2" style={{ fontWeight: 900 }}>TuCooperativa</h1>
        <p className="p-text-white-40 p-text-center p-mb-8 p-text-xs p-font-black p-uppercase p-tracking-widest">Terminal de Acceso</p>
        
        {error && (
          <div className="p-glass p-p-3 p-mb-6 p-bg-red-10 p-text-red-500 p-text-xs p-text-center p-rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="p-space-y-4">
          <div>
            <label className="p-text-[10px] p-font-black p-text-white-30 p-uppercase p-tracking-widest p-mb-2 p-block">USUARIO</label>
            <input type="text" placeholder="admin" name="username" autoComplete="off" className="p-p-4 p-bg-white-5 p-rounded-xl p-border p-border-white-10 p-text-white p-w-full p-text-sm focus:p-border-accent p-outline-none p-transition-colors" required />
          </div>
          
          <div className="p-mb-8">
            <label className="p-text-[10px] p-font-black p-text-white-30 p-uppercase p-tracking-widest p-mb-2 p-block">CLAVE</label>
            <input type="password" placeholder="••••••••" name="password" autoComplete="off" className="p-p-4 p-bg-white-5 p-rounded-xl p-border p-border-white-10 p-text-white p-w-full p-text-sm focus:p-border-accent p-outline-none p-transition-colors" required />
          </div>
          
          <button className="btn-primary p-w-full p-py-4 p-text-xs p-tracking-widest p-font-black" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'INGRESAR'}
          </button>
        </form>
        
        <p className="p-mt-8 p-text-center p-text-[9px] p-font-black p-text-white-20 p-uppercase p-tracking-widest">
          SISTEMA DE SEGURIDAD ACTIVO
        </p>
      </div>
    </div>
  )
}

export default LoginView
