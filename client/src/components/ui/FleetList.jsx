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
      {/* 1. MINIMALIST HEADER - High Focus */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ padding: '24px 0 40px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0 }}>
            <div className="p-unit-avatar-wrapper" style={{ background: 'var(--primary-glow)', minWidth: '56px', height: '56px' }}>
                <Car size={28} className="text-white" />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <h3 className="text-white font-black uppercase italic truncate" style={{ fontSize: '1.4rem', letterSpacing: '0.05em' }}>MÓDULO DE FLOTA</h3>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px' }}>Gestión Operativa de Unidades</p>
            </div>
        </div>
        <button className="btn-secondary mobile-hide" style={{ height: '48px', padding: '0 24px', fontSize: '11px', borderRadius: '12px' }}>
            <History size={18} />
            <span style={{ marginLeft: '10px', fontWeight: 900 }}>HISTORIAL</span>
        </button>
      </div>

      <div className="p-fleet-container custom-scrollbar">
        {/* 2. PC HEADER - 4 Columns */}
        <div className="p-fleet-grid p-fleet-header">
          <div>IDENTIFICACIÓN / OPERADOR</div>
          <div className="p-text-center">TARIFA DIARIA</div>
          <div className="p-text-center">ESTATUS</div>
          <div className="p-text-right">ACCIONES</div>
        </div>

        {/* 3. CLINICAL ROWS */}
        <div className="divide-y divide-white/2">
          {safeVehicles.map((v, i) => (
            <Motion.div 
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-fleet-grid p-fleet-row"
            >
              {/* Col 1: Unit & Operator */}
              <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0 }}>
                <span className="p-mobile-label">IDENTIFICACIÓN</span>
                <div className="p-flex p-items-center p-gap-5" style={{ width: '100%' }}>
                    <div className="p-unit-avatar-wrapper">
                        <Car size={24} className="text-white/60" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p className="text-white font-black truncate" style={{ fontSize: '1.15rem', letterSpacing: '-0.02em' }}>{v.modelo || 'Unidad de Flota'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{v.placa}</span>
                            {v.chofer_nombre && (
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '3px', height: '3px', background: 'currentColor', borderRadius: '50%' }}></div>
                                {v.chofer_nombre}
                              </span>
                            )}
                        </div>
                    </div>
                </div>
              </div>

              {/* Col 2: Fee */}
              <div className="p-text-center">
                  <span className="p-mobile-label">TARIFA</span>
                  <div>
                      <p className="text-white font-black" style={{ fontSize: '1.6rem' }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>USD / DÍA</span>
                  </div>
              </div>

              {/* Col 3: Status */}
              <div className="p-flex p-flex-col p-items-center p-gap-2">
                <span className="p-mobile-label">ESTATUS</span>
                <div className="p-status-pill" style={{ 
                    background: v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: v.status_label === 'en ruta' ? 'var(--success)' : 'rgba(255, 255, 255, 0.3)',
                    border: `1px solid ${v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                }}>
                  {v.status_label || 'Inactivo'}
                </div>
              </div>

              {/* Col 4: Actions */}
              <div className="p-flex p-justify-end p-items-center p-gap-4" style={{ position: 'relative' }}>
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
                              alert('✅ Link copiado.');
                          }
                        } catch (e) { alert('❌ Error'); }
                      }}
                      className="btn-primary"
                      style={{ height: '44px', padding: '0 20px', fontSize: '11px', borderRadius: '10px' }}
                    >
                      INVITAR
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                    className="btn-secondary" 
                    style={{ width: '44px', height: '44px', padding: 0, borderRadius: '10px' }}
                  >
                      <MoreVertical size={20} className={activeDropdown === v.id ? 'text-primary' : 'text-white/20'} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === v.id && (
                      <Motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="glass shadow-2xl"
                        style={{ 
                          position: 'absolute', top: '55px', right: 0, zIndex: 100, 
                          width: '200px', padding: '12px', borderRadius: '16px', 
                          background: '#0f111a', border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                         <button className="tab-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px', fontSize: '11px' }}>Modificar</button>
                         <button className="tab-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px', fontSize: '11px' }}>Historial</button>
                         <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>
                         <button className="tab-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px', fontSize: '11px', color: 'var(--danger)' }}>Baja</button>
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
