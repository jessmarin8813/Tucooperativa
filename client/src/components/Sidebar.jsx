import React from 'react'
import { 
  LayoutDashboard, 
  Truck, 
  UserPlus, 
  CreditCard, 
  Settings, 
  LogOut,
  BarChart3,
  Toolbox,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  Wrench
} from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const Sidebar = ({ onLogout, activeView, setActiveView, config }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Centro de Mando' },
    { id: 'flota', icon: Truck, label: 'Flota de Vehículos' },
    { id: 'maintenance', icon: Wrench, label: 'Mantenimiento' },
    { id: 'choferes', icon: UserPlus, label: 'Gestión de Choferes' },
    { id: 'cobranza', icon: CreditCard, label: 'Cobranza & Pagos' },
    { id: 'gastos', icon: Toolbox, label: 'Gastos Operativos' },
    { id: 'bi', icon: BarChart3, label: 'Inteligencia BI' },
    { id: 'forensic', icon: ShieldAlert, label: 'Hub Forense' },
    { id: 'config', icon: Settings, label: 'Configuración' },
  ]

  return (
    <aside className="glass" style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid var(--glass-border)',
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        borderRadius: '0px',
        position: 'relative',
        zIndex: 50
    }}>
      <div style={{ padding: '40px 32px 30px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* RESTORED BRAND LOGO TEXT */}
        <h2 
          onClick={() => setActiveView('dashboard')}
          className="neon-text brand" 
          style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-0.04em', lineHeight: '1', cursor: 'pointer', marginBottom: '12px' }}
        >
          TuCooperativa
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {config?.logo_path && (
                <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src={config.logo_path} 
                        alt="Logo" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} 
                    />
                </div>
            )}
            {!config?.logo_path && <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '100px' }} className="animate-pulse" />}
            <span style={{ fontSize: '0.8rem', fontWeight: 1000, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>
                {config?.nombre_cooperativa || 'SIN NOMBRE'}
            </span>
        </div>

        {/* BCV RATE BADGE */}
        {config?.bcv_rate && (
            <div style={{ 
                marginTop: '16px',
                padding: '6px 12px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '0.02em'
            }}>
                <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '100px' }} className="animate-pulse" />
                <span>BCV: Bs {config.bcv_rate.toFixed(2)}</span>
            </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto', marginTop: '10px' }}>
        {menuItems.map((item, idx) => {
          const isActive = activeView === item.id;
          return (
            <Motion.div 
              key={idx} 
              whileHover={{ x: 5 }}
              onClick={() => setActiveView(item.id)}
              className={`glass-hover ${isActive ? 'active-nav-item' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px 20px', 
                borderRadius: '16px', 
                marginBottom: '8px',
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-dim)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <item.icon size={20} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                <span style={{ fontWeight: isActive ? 800 : 600, fontSize: '0.9rem', letterSpacing: '0.02em' }}>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} style={{ color: 'var(--primary)' }} />}
            </Motion.div>
          )
        })}
      </nav>

      <div style={{ padding: '32px 24px' }}>
        <button 
          onClick={onLogout}
          className="glass-hover" 
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            color: 'var(--danger)',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            padding: '16px',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.1em'
          }}
        >
          <LogOut size={18} />
          <span>Finalizar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
