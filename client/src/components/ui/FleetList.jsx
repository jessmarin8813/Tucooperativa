import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const FleetList = ({ vehicles = [], config }) => {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  
  // Use company name from config or fall back to vehicle data
  const companyName = config?.nombre_cooperativa || 'Cooperativa';

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
      {/* 1. Header Section - Balanced & Airy */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ padding: '40px 48px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0 }}>
            <div className="p-avatar-box" style={{ background: 'var(--primary-glow)', minWidth: '64px', height: '64px', borderRadius: '18px' }}>
                <Car size={32} className="text-white" />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase italic truncate" style={{ fontSize: '1.5rem', lineHeight: 1 }}>Estado de la Flota</h3>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '10px' }}>Sistema de Gestión Forense</p>
            </div>
        </div>
        <button className="btn-secondary mobile-hide" style={{ height: '56px', padding: '0 32px', fontSize: '12px', borderRadius: '14px', fontWeight: 950, whiteSpace: 'nowrap' }}>
            <History size={20} />
            <span style={{ marginLeft: '12px' }}>EXPLORAR HISTORIAL</span>
        </button>
      </div>

      <div className="p-fleet-container custom-scrollbar">
        {/* 2. Table Column Headers - PC Only */}
        <div className="p-fleet-grid p-fleet-header">
          <div>Unidades Operativas</div>
          <div>Titular de Concesión</div>
          <div className="p-text-center">Tarifa Diaria</div>
          <div className="p-text-center">Estatus Forense</div>
          <div className="p-text-right">Acciones</div>
        </div>

        {/* 3. The List of Items */}
        <div className="divide-y divide-white/2">
          {safeVehicles.map((v, i) => (
            <Motion.div 
              key={v.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 25 }}
              className="p-fleet-grid p-fleet-row"
            >
              {/* Col 1: Unit Info */}
              <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0 }}>
                <span className="p-mobile-label">Unidad Operativa</span>
                <div className="p-flex p-items-center p-gap-6" style={{ width: '100%' }}>
                    <div className="p-avatar-box" style={{ minWidth: '72px', height: '72px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                        <Car size={32} style={{ opacity: 0.9 }} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }} className="truncate">{v.modelo || 'Unidad de Flota'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
                                <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 950, textTransform: 'uppercase' }}>{v.placa}</span>
                            </div>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', fontWeight: 900 }}>#{v.id}</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Col 2: Ownership */}
              <div className="p-flex p-flex-col p-gap-1" style={{ minWidth: 0 }}>
                <span className="p-mobile-label">Titular de Concesión</span>
                <div className="p-flex p-items-center p-gap-5">
                  <div style={{ minWidth: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} className="text-white/40" />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '1.05rem', fontWeight: 950, color: 'white', lineHeight: 1 }} className="truncate">
                      {v.dueno_nombre === 'Dueño Cooperativa' ? companyName : v.dueno_nombre}
                    </p>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: 950, textTransform: 'uppercase', marginTop: '5px' }}>Administrador de Activo</p>
                  </div>
                </div>
                {v.chofer_nombre && (
                  <div style={{ marginTop: '12px', fontSize: '9px', color: 'rgba(16, 185, 129, 0.6)', fontWeight: 950, textTransform: 'uppercase', paddingLeft: '55px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '4px', height: '4px', background: 'currentColor', borderRadius: '50%' }}></div>
                    Operador: {v.chofer_nombre}
                  </div>
                )}
              </div>

              {/* Secondary Details Grouping */}
              <div style={{ display: 'contents' }}>
                  {/* Col 3: Income */}
                  <div className="p-text-center">
                      <span className="p-mobile-label">Tarifa</span>
                      <div>
                          <p style={{ fontSize: '2rem', fontWeight: 1000, color: 'white', lineHeight: 1 }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 950, textTransform: 'uppercase', marginTop: '8px', display: 'block' }}>USD / DIARIO</span>
                      </div>
                  </div>

                  {/* Col 4: Status */}
                  <div className="p-flex p-flex-col p-items-center p-gap-4">
                    <span className="p-mobile-label">Estado</span>
                    <div style={{ 
                        padding: '12px 28px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: 1000, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.2em',
                        background: v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: v.status_label === 'en ruta' ? '#10b981' : 'rgba(255, 255, 255, 0.35)',
                        border: `1px solid ${v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
                        boxShadow: v.status_label === 'en ruta' ? '0 0 50px rgba(16, 185, 129, 0.15)' : 'none'
                    }}>
                      {v.status_label || 'Sin Datos'}
                    </div>
                  </div>
              </div>

              {/* Col 5: Actions */}
              <div className="p-flex p-justify-end p-items-center p-gap-5" style={{ position: 'relative' }}>
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
                              alert('✅ Link de Invitación copiado al portapapeles.');
                          }
                        } catch (e) {
                          alert('❌ Error al generar invitación');
                        }
                      }}
                      className="btn-primary"
                      style={{ height: '56px', padding: '0 36px', fontSize: '13px', fontWeight: 1000, borderRadius: '18px', boxShadow: '0 15px 40px rgba(99, 102, 241, 0.35)' }}
                    >
                      INVITAR
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                    className="btn-secondary" 
                    style={{ width: '56px', height: '56px', padding: 0, borderRadius: '18px' }}
                  >
                      <MoreVertical size={28} className={activeDropdown === v.id ? 'text-primary' : 'text-white/20'} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === v.id && (
                      <Motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 15, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, y: 15, filter: 'blur(20px)' }}
                        className="p-glass-premium shadow-2xl"
                        style={{ 
                          position: 'absolute', top: '75px', right: 0, zIndex: 100, 
                          width: '260px', padding: '18px', borderRadius: '28px', 
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(10, 11, 18, 0.98)',
                          backdropFilter: 'blur(50px)'
                        }}
                      >
                         <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 1000, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Acciones Especiales</p>
                         </div>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '18px 22px', fontSize: '13px', borderRadius: '16px', fontWeight: 900 }}>Modificar Parámetros</button>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '18px 22px', fontSize: '13px', borderRadius: '16px', fontWeight: 900 }}>Ver Historial Forense</button>
                         <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '14px 0' }}></div>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '18px 22px', fontSize: '13px', borderRadius: '16px', fontWeight: 1000, color: 'var(--danger)' }}>Baja de Sistema</button>
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
