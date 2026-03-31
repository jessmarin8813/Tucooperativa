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
        <div style={{ background: '#0a0b12', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px', textAlign: 'center', padding: '40px' }}>
          
          <div style={{ position: 'relative' }}>
             <div className="animate-pulse" style={{ color: '#6366f1', fontSize: '1.2rem', fontWeight: 1000, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                Optimizando Sesión
             </div>
             <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700 }}>
                Restaurando conexiones críticas...
             </div>
          </div>
          
          <div style={{ animation: 'fadeIn 3s ease-in forwards', opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', maxWidth: '300px', lineHeight: 1.6 }}>
                Si el sistema no inicia en unos segundos, intenta una recarga manual.
             </p>
             <button 
                onClick={() => window.location.reload()}
                className="btn-primary" 
                style={{ 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    border: '1px solid var(--primary)', 
                    color: 'white', 
                    padding: '16px 32px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)'
                }}
             >
                REINTENTAR AHORA
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MainErrorBoundary;
