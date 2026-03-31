import React from 'react'
import { LayoutDashboard, Truck, DollarSign, ShieldAlert } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const BottomNav = ({ activeView, setActiveView, stats = {} }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio', color: 'var(--primary)' },
    { id: 'flota', icon: Truck, label: 'Mi Flota', color: 'var(--accent)' },
    { id: 'cobranza', icon: DollarSign, label: 'Pagos', color: 'var(--success)' },
    { id: 'forensic', icon: ShieldAlert, label: 'Alertas', color: 'var(--danger)', badge: stats.alertas_criticas }
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
              <item.icon size={28} strokeWidth={isActive ? 3 : 2} />
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
