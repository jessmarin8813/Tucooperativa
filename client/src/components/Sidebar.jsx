import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Truck, MapPin, CreditCard, Settings, LogOut, Trophy, BarChart3, DollarSign, Users, ShieldCheck } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const Sidebar = ({ onLogout, userRole, activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Centro de Mando' },
    { id: 'flota', icon: Truck, label: 'Flota de Vehículos' },
    { id: 'choferes', icon: Users, label: 'Gestión de Choferes' },
    { id: 'invitar', icon: MapPin, label: 'Invitar Chofer' },
    { id: 'ranking', icon: Trophy, label: 'Ranking de Honor' },
    { id: 'bi', icon: BarChart3, label: 'Inteligencia BI' },
    { id: 'gastos', icon: CreditCard, label: 'Gastos Operativos' },
    { id: 'cobranza', icon: DollarSign, label: 'Cobranza y Cuotas' },
    { id: 'config', icon: ShieldCheck, label: 'Finanzas' },
  ]

  return (
    <aside className="p-glass p-flex p-flex-col" style={{ width: '260px', minWidth: '260px', height: 'calc(100vh - 32px)', margin: '16px', padding: '24px 12px', borderRadius: '32px' }}>
      <div style={{ marginBottom: '32px', padding: '0 12px' }}>
        <div className="p-flex p-items-center p-gap-3">
            <div className="p-flex p-items-center p-justify-center" style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary)', boxShadow: '0 0 12px var(--primary-glow)' }}>
                <ShieldCheck size={18} color="white" />
            </div>
            <h2 className="brand p-neon-text" style={{ fontSize: '1.25rem', margin: 0 }}>TuCooperativa</h2>
        </div>
        <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.2, marginTop: '6px' }}>Control Inteligente v4.5</p>
      </div>

      <nav className="p-flex p-flex-col p-gap-1.5" style={{ flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item, idx) => {
          const isActive = activeView === item.id;
          return (
            <div 
              key={idx} 
              onClick={() => setActiveView(item.id)}
              className="p-flex p-items-center p-gap-3 transition-all"
              style={{ 
                padding: '10px 16px', 
                borderRadius: '100px', 
                cursor: 'pointer',
                background: isActive ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent',
                color: isActive ? 'white' : 'var(--text-dim)',
              }}
            >
              <item.icon size={18} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '16px 12px 0' }}>
        <button 
          onClick={onLogout}
          className="p-flex p-items-center p-justify-center p-gap-3"
          style={{ 
            width: '100%', padding: '12px', borderRadius: '100px', border: '1px solid rgba(239, 68, 68, 0.15)',
            background: 'rgba(239, 68, 68, 0.03)', color: 'var(--danger)', cursor: 'pointer', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.05em'
          }}
        >
          <LogOut size={16} />
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
