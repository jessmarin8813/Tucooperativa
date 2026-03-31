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
    // Reportar internamente para auditoría pero mantener silencio visual
    console.warn('%c🛡️ Saneamiento Silencioso v5.2.0', 'background: #1e1e2e; color: #f5c2e7; padding: 4px; border-radius: 4px;', error);
    
    // Si ocurre un error, simplemente limpiamos el rastro de reinicios para permitir carga fresca la próxima vez
    sessionStorage.removeItem('last_error_reload');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0a0b12', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', textAlign: 'center', padding: '40px' }}>
          <div className="animate-pulse" style={{ color: '#6366f1', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
             Optimizando tu Sesión...
          </div>
          
          <div style={{ animation: 'fadeIn 2s ease-in forwards', opacity: 0 }}>
             <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '24px' }}>
                Estamos ajustando los últimos detalles para ti.
             </p>
             <button 
                onClick={() => window.location.reload()}
                className="btn-secondary" 
                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontSize: '11px', fontWeight: 900 }}
             >
                FORCEAR RECARGA
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MainErrorBoundary;
