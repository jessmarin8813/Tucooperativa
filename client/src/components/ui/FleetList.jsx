import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const FleetList = ({ vehicles = [] }) => {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  
  if (safeVehicles.length === 0) {
    return (
      <div className="glass-premium p-16 text-center text-white/20 font-black uppercase tracking-widest text-xs border-dashed border-2 border-white/5 rounded-3xl m-8">
        No hay vehículos registrados en la flota.
      </div>
    )
  }
  const [activeDropdown, setActiveDropdown] = React.useState(null);

  return (
    <div className="p-fleet-card-root">
      {/* 1. SENIOR HEADER - Clean & Spacious */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0 }}>
            <div style={{ 
                width: '56px', height: '56px', borderRadius: '18px', 
                background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Car size={28} className="text-primary" />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <h3 className="text-white font-black uppercase italic" style={{ fontSize: '1.6rem', letterSpacing: '0.08em', lineHeight: 1 }}>Módulo de Flota</h3>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '10px' }}>Gestión Operativa Senior</p>
            </div>
        </div>
        <button className="btn-secondary mobile-hide" style={{ height: '52px', padding: '0 28px', fontSize: '11px', fontWeight: 1000 }}>
            <History size={18} />
            <span style={{ marginLeft: '12px' }}>HISTORIAL CLÍNICO</span>
        </button>
      </div>

      <div className="p-fleet-container custom-scrollbar">
        {/* 2. PC GRID HEADER - Strict Alignment */}
        <div className="p-fleet-grid p-fleet-header">
          <div style={{ paddingLeft: '20px' }}>UNIDAD / OPERADOR</div>
          <div className="p-text-center">CUOTA DIARIA</div>
          <div className="p-text-center">ESTADO</div>
          <div className="p-text-right" style={{ paddingRight: '20px' }}>ACCIONES</div>
        </div>

        {/* 3. SENIOR ROWS */}
        <div className="divide-y divide-white/2">
          {safeVehicles.map((v, i) => (
            <Motion.div 
              key={v.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-fleet-grid p-fleet-row"
            >
              {/* Col 1: Identity (PC: 35%) */}
              <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0, paddingLeft: '20px' }}>
                <span className="p-mobile-label">IDENTIFICACIÓN DE ACTIVOS</span>
                <div className="p-flex p-items-center p-gap-6" style={{ width: '100%' }}>
                    <div className="p-unit-avatar">
                        <Car size={26} className="text-white/40" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p className="text-white font-black truncate" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{v.modelo || 'Unidad Activa'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 1000, textTransform: 'uppercase', background: 'rgba(6, 182, 212, 0.1)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)' }}>{v.placa}</span>
                            {v.chofer_nombre && (
                              <span style={{ fontSize: '9px', color: 'rgba(16, 185, 129, 0.7)', fontWeight: 1000, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '4px', height: '4px', background: 'currentColor', borderRadius: '50%' }}></div>
                                {v.chofer_nombre}
                              </span>
                            )}
                        </div>
                    </div>
                </div>
              </div>

              {/* Col 2: Fee (PC: 20%) */}
              <div className="p-text-center">
                  <span className="p-mobile-label">TARIFA DE OPERACIÓN</span>
                  <div style={{ marginTop: '4px' }}>
                      <p className="text-white font-black" style={{ fontSize: '1.8rem', lineHeight: 1 }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', fontWeight: 1000, textTransform: 'uppercase', marginTop: '8px', display: 'block' }}>DÓLARES / DÍA</span>
                  </div>
              </div>

              {/* Col 3: Status (PC: 20%) */}
              <div className="p-flex p-flex-col p-items-center p-gap-2">
                <span className="p-mobile-label">ESTADO DEL SISTEMA</span>
                <div className="p-status-pill" style={{ 
                    background: v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    color: v.status_label === 'en ruta' ? 'var(--success)' : 'rgba(255, 255, 255, 0.25)',
                    border: `1px solid ${v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                }}>
                  {v.status_label || 'Inactivo'}
                </div>
              </div>

              {/* Col 4: Actions (PC: 25%) */}
              <div className="p-flex p-justify-end p-items-center p-gap-5" style={{ position: 'relative', paddingRight: '20px' }}>
                  {!v.chofer_id && (
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/invitaciones.php', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ vehiculo_id: v.id })
                          });
                          const data = await res.json();
                          if (data.status === 'success') {
                              navigator.clipboard.writeText(data.link);
                              alert('✅ Link de Invitación copiado.');
                          }
                        } catch (e) { alert('❌ Error'); }
                      }}
                      className="btn-primary"
                      style={{ height: '48px', padding: '0 24px', fontSize: '12px', fontWeight: 1000, borderRadius: '14px' }}
                    >
                      INVITAR
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                    className="btn-secondary" 
                    style={{ width: '48px', height: '48px', padding: 0, borderRadius: '14px' }}
                  >
                      <MoreVertical size={22} className={activeDropdown === v.id ? 'text-primary' : 'text-white/30'} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === v.id && (
                      <Motion.div 
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                        className="glass shadow-2xl"
                        style={{ 
                          position: 'absolute', top: '65px', right: '20px', zIndex: 100, 
                          width: '220px', padding: '15px', borderRadius: '20px', 
                          background: '#0a0b12', border: '1px solid rgba(255,255,255,0.12)',
                          backdropFilter: 'blur(60px)'
                        }}
                      >
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 18px', fontSize: '12px', borderRadius: '12px' }}>Modificar Unidad</button>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 18px', fontSize: '12px', borderRadius: '12px' }}>Ver Auditoría</button>
                         <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '10px 0' }}></div>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 18px', fontSize: '12px', borderRadius: '12px', color: 'var(--danger)', fontWeight: 1000 }}>Baja Permanente</button>
                      </Motion.div>
                    )}
                  </AnimatePresence>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FleetList
