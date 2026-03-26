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
  ShieldAlert
} from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const Sidebar = ({ onLogout, activeView, setActiveView, config }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Centro de Mando' },
    { id: 'flota', icon: Truck, label: 'Flota de Vehículos' },
    { id: 'choferes', icon: UserPlus, label: 'Gestión de Choferes' },
    { id: 'cobranza', icon: CreditCard, label: 'Cobranza & Pagos' },
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
      <div style={{ padding: '40px 32px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Generic Professional Logo */}
        <div style={{ 
            width: '64px', height: '64px', borderRadius: '22px', 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)'
        }}>
           <LayoutDashboard size={32} className="text-white" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '100px' }} className="animate-pulse" />
            <span style={{ fontSize: '0.9rem', fontWeight: 1000, textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em' }}>
                {config?.nombre_cooperativa || 'TU COOPERATIVA'}
            </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto', marginTop: '20px' }}>
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
                marginBottom: '10px',
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
