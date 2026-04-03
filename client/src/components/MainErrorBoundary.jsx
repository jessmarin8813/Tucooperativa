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
    // Saneamiento Silencioso (v61.2) - Solicitado por el usuario
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0a0b12', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', textAlign: 'center', padding: '40px' }}>
          
          <div>
             <div style={{ color: '#6366f1', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sistema en Espera
             </div>
             <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', maxWidth: '320px', lineHeight: 1.6 }}>
                Ha ocurrido un detalle visual. Presiona el botón para continuar operando normalmente.
             </p>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary" 
            style={{ 
                padding: '16px 32px', 
                borderRadius: '16px', 
                fontSize: '11px', 
                fontWeight: 900,
                cursor: 'pointer'
            }}
          >
            VOLVER A CARGAR
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MainErrorBoundary;
