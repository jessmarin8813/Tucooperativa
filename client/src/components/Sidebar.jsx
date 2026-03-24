import React from 'react'
import { LayoutDashboard, Truck, MapPin, CreditCard, Settings, LogOut } from 'lucide-react'

const Sidebar = ({ onLogout, userRole, activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Centro de Mando' },
    { id: 'flota', icon: Truck, label: 'Flota de Vehículos' },
    { id: 'choferes', icon: Truck, label: 'Gestión de Choferes' },
    { id: 'invitar', icon: MapPin, label: 'Invitar Chofer' },
    { id: 'config', icon: Settings, label: 'Pagos & Config' },
  ]

  return (
    <aside className="glass" style={{ width: '280px', margin: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '32px' }}>
        <h2 className="neon-text brand" style={{ fontSize: '1.5rem' }}>TuCooperativa</h2>
        {userRole === 'superadmin' && (
          <div style={{ 
            marginTop: '8px', 
            background: 'var(--accent)', 
            color: 'white', 
            fontSize: '0.65rem', 
            padding: '2px 8px', 
            borderRadius: '100px',
            display: 'inline-block',
            fontWeight: 800,
            letterSpacing: '0.05em'
          }}>SUPER ADMIN</div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '0 16px' }}>
        {menuItems.map((item, idx) => {
          const isActive = activeView === item.id;
          return (
            <div 
              key={idx} 
              onClick={() => setActiveView(item.id)}
              className={`glass-hover ${isActive ? 'neon-border' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '14px 20px', 
                borderRadius: '12px', 
                marginBottom: '8px',
                cursor: 'pointer',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-dim)'
              }}
            >
              <item.icon size={20} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '24px' }}>
        <button 
          onClick={onLogout}
          className="glass-hover" 
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            color: 'var(--danger)',
            background: 'rgba(239, 68, 68, 0.1)'
          }}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
