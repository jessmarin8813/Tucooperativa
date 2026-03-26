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
    <div className="glass shadow-2xl mt-8" style={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Table Header Section */}
      <div className="p-8 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center" style={{ background: 'rgba(255,255,255,0.01)', paddingLeft: '40px' }}>
        <div className="p-flex p-items-center p-gap-6">
            <div className="p-avatar-box" style={{ background: 'var(--primary-glow)', borderColor: 'rgba(99, 102, 241, 0.3)', width: '48px', height: '48px' }}>
                <Car size={22} className="text-white" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white tracking-tighter uppercase italic" style={{ fontSize: '1.2rem' }}>Estado de la Flota</h3>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Control Forense de Unidades y Operadores</p>
            </div>
        </div>
        <button className="btn-secondary" style={{ height: '44px', padding: '0 24px', fontSize: '11px', borderRadius: '16px' }}>
            <History size={16} />
            <span style={{ marginLeft: '10px', fontWeight: 900 }}>VER HISTORIAL</span>
        </button>
      </div>

      <div className="p-fleet-container custom-scrollbar">
        {/* Table Column Headers */}
        <div className="p-fleet-grid p-fleet-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>Vehículo / Placa</div>
          <div>Responsabilidad</div>
          <div className="p-text-center">Cuota diaria</div>
          <div className="p-text-center">Estado Operativo</div>
          <div className="p-text-right" style={{ paddingRight: '20px' }}>Acciones</div>
        </div>

        <div className="divide-y divide-white/5">
          {safeVehicles.map((v, i) => (
            <Motion.div 
              key={v.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-fleet-grid p-fleet-row"
              style={{ padding: '24px 40px' }}
            >
              {/* Col 1: Vehículo */}
              <div className="p-flex p-items-center p-gap-5">
                <span className="p-mobile-label">Unidad</span>
                <div className="p-avatar-box" style={{ width: '64px', height: '64px' }}>
                    <Car size={28} />
                </div>
                <div>
                    <p style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{v.modelo || 'Unidad de Flota'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{v.placa}</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '100%', background: 'rgba(255,255,255,0.2)' }}></span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>#{v.id}</span>
                    </div>
                </div>
              </div>

              {/* Col 2: Responsabilidad */}
              <div className="p-flex p-flex-col p-gap-1">
                <span className="p-mobile-label">Responsable</span>
                <div className="p-flex p-items-center p-gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} className="text-white/60" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{v.dueno_nombre}</p>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Propietario</p>
                  </div>
                </div>
                {v.chofer_nombre ? (
                  <div style={{ marginTop: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '4px', height: '4px', background: 'var(--success)', borderRadius: '100%' }}></div>
                    Operador: {v.chofer_nombre}
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.15)', fontWeight: 800, textTransform: 'uppercase', paddingLeft: '44px' }}>
                    Sin Chofer Asignado
                  </div>
                )}
              </div>

              {/* Col 3: Cuota */}
              <div className="p-text-center">
                  <span className="p-mobile-label">Tarifa</span>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ fontSize: '1.4rem', fontWeight: 950, color: 'white', lineHeight: 1 }}>${v.cuota_diaria}</p>
                      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900, textTransform: 'uppercase', marginTop: '4px' }}>Dólares / Día</span>
                  </div>
              </div>

              {/* Col 4: Estado */}
              <div className="p-flex p-flex-col p-items-center p-gap-3">
                 <span className="p-mobile-label">Estado</span>
                 <div style={{ 
                    padding: '8px 20px', 
                    borderRadius: '100px', 
                    fontSize: '9px', 
                    fontWeight: 950, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.12em',
                    background: v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.06)',
                    color: v.status_label === 'en ruta' ? 'var(--success)' : 'rgba(255,255,255,0.4)',
                    border: `1px solid ${v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: v.status_label === 'en ruta' ? '0 0 20px rgba(16, 185, 129, 0.1)' : 'none'
                 }}>
                   {v.status_label || 'Inactivo'}
                 </div>
                 {v.alerta_combustible == 1 && (
                  <div className="animate-pulse" style={{ fontSize: '8px', fontWeight: 900, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={12} />
                      FORENSIC ALERT: FUEL
                  </div>
                  )}
              </div>

              {/* Col 5: Acciones */}
              <div className="p-flex p-justify-end p-items-center p-gap-3" style={{ position: 'relative' }}>
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
                      style={{ height: '44px', padding: '0 24px', fontSize: '11px', fontWeight: 950, borderRadius: '16px' }}
                    >
                      INVITAR
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                    className="btn-secondary" 
                    style={{ width: '44px', height: '44px', padding: 0, borderRadius: '16px' }}
                  >
                      <MoreVertical size={20} className={activeDropdown === v.id ? 'text-primary' : 'text-white/30'} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === v.id && (
                      <Motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                        className="glass shadow-premium"
                        style={{ 
                          position: 'absolute', top: '55px', right: 0, zIndex: 100, 
                          width: '200px', padding: '12px', borderRadius: '24px', 
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(15, 15, 15, 0.95)',
                          backdropFilter: 'blur(20px)'
                        }}
                      >
                         <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                            <p style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Opciones de Unidad</p>
                         </div>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 16px', fontSize: '11px', borderRadius: '12px' }}>Modificar Datos</button>
                         <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 16px', fontSize: '11px', borderRadius: '12px' }}>Ver Historial</button>
                         <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>
                         <button className="tab-item dropdown-item p-delete-action" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 16px', fontSize: '11px', borderRadius: '12px', color: 'var(--danger)' }}>Dar de Baja</button>
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
