import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const FleetList = ({ vehicles = [], config }) => {
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
    <div className="p-fleet-card-root" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
      {/* 1. Header Section - Balanced & Airy */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0 }}>
            <div className="p-avatar-box" style={{ background: 'var(--primary-glow)', minWidth: '64px', height: '64px', borderRadius: '16px' }}>
                <Car size={32} className="text-white" />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase italic truncate" style={{ fontSize: '1.6rem', lineHeight: 1 }}>Estado de la Flota</h3>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '10px' }}>Control de Unidades y Operadores</p>
            </div>
        </div>
        <button className="btn-secondary mobile-hide" style={{ height: '56px', padding: '0 32px', fontSize: '12px', borderRadius: '14px', fontWeight: 950, whiteSpace: 'nowrap' }}>
            <History size={20} />
            <span style={{ marginLeft: '12px' }}>VER HISTORIAL</span>
        </button>
      </div>

      <div className="p-fleet-container custom-scrollbar">
        {/* 2. Table Column Headers - PC Only (4 Columns) */}
        <div className="p-fleet-grid p-fleet-header" style={{ padding: '24px 0' }}>
          <div>Unidades Operativas / Operador</div>
          <div className="p-text-center">Tarifa Diaria</div>
          <div className="p-text-center">Estatus Forense</div>
          <div className="p-text-right">Acciones</div>
        </div>

        {/* 3. The List of Items */}
        <div className="divide-y divide-white/2">
          {safeVehicles.map((v, i) => (
            <Motion.div 
              key={v.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', damping: 30 }}
              className="p-fleet-grid p-fleet-row"
              style={{ padding: '24px 0' }}
            >
              {/* Col 1: Unit Info + Driver Integration (45%) */}
              <div className="p-flex p-items-center p-gap-6" style={{ minWidth: 0 }}>
                <span className="p-mobile-label">IDENTIFICACIÓN DE UNIDAD</span>
                <div className="p-flex p-items-center p-gap-6" style={{ width: '100%' }}>
                    <div className="p-avatar-box" style={{ minWidth: '72px', height: '72px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px' }}>
                        <Car size={32} style={{ opacity: 0.9 }} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '1.3rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }} className="truncate">{v.modelo || 'Unidad de Flota'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
                                <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 950, textTransform: 'uppercase' }}>{v.placa}</span>
                            </div>
                            {v.chofer_nombre ? (
                              <span style={{ fontSize: '10px', color: 'rgba(16, 185, 129, 0.65)', fontWeight: 950, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '5px', height: '5px', background: 'currentColor', borderRadius: '50%' }}></div>
                                {v.chofer_nombre}
                              </span>
                            ) : (
                                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.12)', fontWeight: 950, textTransform: 'uppercase' }}>Sin Operador</span>
                            )}
                        </div>
                    </div>
                </div>
              </div>

              {/* Responsive Container for Other Columns */}
              <div style={{ display: 'contents' }}>
                  {/* Col 2: Income (20%) */}
                  <div className="p-text-center">
                      <span className="p-mobile-label">TARIFA OPERATIVA</span>
                      <div>
                          <p style={{ fontSize: '1.9rem', fontWeight: 1000, color: 'white', lineHeight: 1 }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 950, textTransform: 'uppercase', marginTop: '8px', display: 'block' }}>USD / DIARIO</span>
                      </div>
                  </div>

                  {/* Col 3: Status (20%) */}
                  <div className="p-flex p-flex-col p-items-center p-gap-4">
                    <span className="p-mobile-label">ESTATUS OPERATIVO</span>
                    <div style={{ 
                        padding: '12px 28px', 
                        borderRadius: '14px', 
                        fontSize: '11px', 
                        fontWeight: 1000, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        background: v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: v.status_label === 'en ruta' ? '#10b981' : 'rgba(255, 255, 255, 0.25)',
                        border: `1px solid ${v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
                    }}>
                      {v.status_label || 'Inactivo'}
                    </div>
                  </div>
              </div>

              {/* Col 4: Actions (15%) */}
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
                      style={{ height: '56px', padding: '0 32px', fontSize: '13px', fontWeight: 1000, borderRadius: '16px', boxShadow: '0 15px 40px rgba(99, 102, 241, 0.25)' }}
                    >
                      INVITAR
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                    className="btn-secondary" 
                    style={{ width: '56px', height: '56px', padding: 0, borderRadius: '16px' }}
                  >
                      <MoreVertical size={24} className={activeDropdown === v.id ? 'text-primary' : 'text-white/20'} />
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
                          width: '240px', padding: '16px', borderRadius: '22px', 
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(10, 11, 18, 0.98)',
                          backdropFilter: 'blur(40px)'
                        }}
                      >
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '16px 20px', fontSize: '13px', borderRadius: '14px', fontWeight: 900 }}>Modificar Datos</button>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '16px 20px', fontSize: '13px', borderRadius: '14px', fontWeight: 900 }}>Ver Historial</button>
                         <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '12px 0' }}></div>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '16px 20px', fontSize: '13px', borderRadius: '14px', fontWeight: 1000, color: 'var(--danger)' }}>Baja de Unidad</button>
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
