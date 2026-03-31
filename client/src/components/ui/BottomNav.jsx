import React from 'react'
import { LayoutDashboard, Truck, DollarSign, ShieldAlert } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const BottomNav = ({ activeView, setActiveView, stats = {} }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio', color: 'var(--primary)' },
    { id: 'flota', icon: Truck, label: 'Flota', color: 'var(--accent)' },
    { id: 'cobranza', icon: DollarSign, label: 'Pagos', color: 'var(--success)' },
    { id: 'forensic', icon: ShieldAlert, label: 'Alertas', color: 'var(--danger)', badge: stats.alertas_criticas },
    { id: 'logout', icon: () => (
        <div style={{ transform: 'rotate(180deg)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </div>
      ), label: 'Salir', color: '#ff4444' }
  ]

  return (
    <nav className="mobile-only glass" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px env(safe-area-inset-bottom, 12px)',
        zIndex: 900,
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(40px)',
        background: 'rgba(10, 11, 18, 0.95)'
    }}>
      {items.map((item) => {
        const isActive = activeView === item.id;
        return (
          <div 
            key={item.id} 
            onClick={() => setActiveView(item.id)}
            style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '4px',
                cursor: 'pointer',
                position: 'relative'
            }}
          >
            <Motion.div 
              animate={{ 
                scale: isActive ? 1.2 : 1,
                color: isActive ? item.color : 'rgba(255,255,255,0.4)'
              }}
              style={{ display: 'flex', position: 'relative' }}
            >
              {typeof item.icon === 'function' ? <item.icon /> : <item.icon size={28} strokeWidth={isActive ? 3 : 2} />}
              {item.badge > 0 && (
                <span style={{ 
                    position: 'absolute', 
                    top: '-6px', 
                    right: '-8px', 
                    background: 'var(--danger)', 
                    color: 'white', 
                    fontSize: '10px', 
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: '100px',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                }}>
                  {item.badge}
                </span>
              )}
            </Motion.div>
            <span style={{ 
                fontSize: '11px', 
                fontWeight: isActive ? 900 : 700, 
                color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
            }}>
              {item.label}
            </span>
            {isActive && (
                <Motion.div 
                    layoutId="active-dot"
                    style={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '100px', 
                        background: item.color,
                        marginTop: '2px',
                        boxShadow: `0 0 8px ${item.color}`
                    }}
                />
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default BottomNav
