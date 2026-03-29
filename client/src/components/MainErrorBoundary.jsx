import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class MainErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // También puedes enviar el error a un servicio de reporte (ej. Sentry, LogRocket, base de datos local)
    console.error('🚨 Error Crítico Detectado en UI:', error, errorInfo)
  }

  handleRestart = () => {
    // Intenta recargar solo el estado pero lo más seguro es refrescar la página
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="p-flex p-items-center p-justify-center" 
          style={{ 
            height: '100vh', 
            background: '#0a0b12', 
            color: 'white',
            padding: '24px',
            textAlign: 'center'
          }}
        >
          <div className="p-glass-premium" style={{ maxWidth: '500px', padding: '48px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '24px' }} />
            <h1 className="h1-premium neon-text" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Escudo de Protección Activado</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '32px' }}>
              Se ha detectado una anomalía en el renderizado del módulo. El sistema ha bloqueado el error para evitar la corrupción de datos.
            </p>
            
            <button 
              onClick={this.handleRestart}
              className="btn-primary" 
              style={{ padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}
            >
              <RefreshCw size={18} />
              REINICIAR MÓDULO SEGURO
            </button>
            
            <div style={{ marginTop: '24px', fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
              Error: {this.state.error?.message || 'Unknown Failure'}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children 
  }
}

export default MainErrorBoundary
