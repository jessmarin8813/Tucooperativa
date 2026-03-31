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
    // Reportar el error antes de reiniciar
    console.error('🚨 Error Crítico Detectado en UI:', error, errorInfo);
    
    // Auto-reinicio tras 2 segundos para dar tiempo al usuario a ver el estado de rescate
    setTimeout(() => {
        window.location.reload();
    }, 2000);
  }

  handleRestart = () => {
    window.location.reload();
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
            <div className="animate-spin" style={{ marginBottom: '24px' }}>
              <RefreshCw size={48} color="var(--primary)" />
            </div>
            <h1 className="h1-premium neon-text" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Auto-Recuperación Activa</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '32px' }}>
              Estamos ajustando el sistema para ti. La aplicación se reiniciará en un segundo para asegurar tu estabilidad.
            </p>
            
            <div style={{ marginTop: '24px', fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
              REINCIANDO... {this.state.error?.message || 'Protecting Session'}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children 
  }
}

export default MainErrorBoundary
