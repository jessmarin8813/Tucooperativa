import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

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
    <div className="glass shadow-2xl mt-8" style={{ borderRadius: '32px', overflow: 'hidden' }}>
      <div className="p-8 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/2" style={{ paddingLeft: '40px' }}>
        <div className="p-flex p-items-center p-gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary" style={{ background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', marginLeft: '10px' }}>
                <Car size={20} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Estado de la Flota</h3>
        </div>
        <button className="btn-secondary" style={{ height: '40px', padding: '0 20px', fontSize: '10px' }}>
            <History size={14} />
            <span style={{ marginLeft: '8px' }}>VER HISTORIAL</span>
        </button>
      </div>

      <div className="p-fleet-container custom-scrollbar">
        <div className="p-fleet-grid p-fleet-header">
          <div>Vehículo / Placa</div>
          <div>Dueño / Chofer</div>
          <div className="p-text-center">Cuota</div>
          <div className="p-text-center">Estado</div>
          <div className="p-text-right">Acciones</div>
        </div>

        <div className="divide-y divide-white/5">
          {safeVehicles.map((v, i) => (
            <Motion.div 
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-fleet-grid p-fleet-row"
            >
              {/* Vehículo */}
              <div className="p-flex p-items-center p-gap-4">
                <span className="p-mobile-label">Unidad</span>
                <div className="p-avatar-box">
                    <Car size={24} />
                </div>
                <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{v.modelo || 'Unidad de Flota'}</p>
                    <p style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{v.placa}</p>
                </div>
              </div>

              {/* Dueño / Chofer */}
              <div className="p-flex p-flex-col p-gap-2">
                <span className="p-mobile-label">Responsabilidad</span>
                <div className="p-flex p-items-center p-gap-2">
                  <User size={14} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{v.dueno_nombre}</span>
                </div>
                {v.chofer_nombre ? (
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '22px' }}>
                    Op: {v.chofer_nombre}
                  </div>
                ) : (
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.1)', fontWeight: 800, textTransform: 'uppercase', paddingLeft: '22px' }}>
                    Sin Chofer
                  </div>
                )}
              </div>

              {/* Cuota */}
              <div className="p-text-center">
                  <span className="p-mobile-label">Tarifa Diaria</span>
                  <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>${v.cuota_diaria}</span>
                  </div>
              </div>

              {/* Estado */}
              <div className="p-flex p-flex-col p-items-center p-gap-2">
                 <span className="p-mobile-label">Estado Actual</span>
                 <span style={{ 
                    padding: '6px 16px', 
                    borderRadius: '100px', 
                    fontSize: '9px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    background: v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: v.status_label === 'en ruta' ? 'var(--success)' : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${v.status_label === 'en ruta' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`
                 }}>
                   {v.status_label || 'Inactivo'}
                 </span>
                 {v.alerta_combustible == 1 && (
                  <div className="animate-pulse" style={{ fontSize: '8px', fontWeight: 900, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={10} />
                      COMBUSTIBLE BAJO
                  </div>
                  )}
              </div>

              {/* Acciones */}
              <div className="p-flex p-justify-end p-gap-3" style={{ position: 'relative' }}>
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
                      style={{ height: '40px', padding: '0 16px', fontSize: '10px' }}
                    >
                      INVITAR
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === v.id ? null : v.id)}
                    className="btn-secondary" 
                    style={{ width: '40px', height: '40px', padding: 0 }}
                  >
                      <MoreVertical size={18} style={{ opacity: 0.3 }} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === v.id && (
                      <Motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="glass"
                        style={{ position: 'absolute', top: '50px', right: 0, zIndex: 100, width: '180px', padding: '8px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      >
                         <button className="tab-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', fontSize: '11px' }}>Editar Unidad</button>
                         <button className="tab-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', fontSize: '11px', color: 'var(--danger)' }}>Dar de Baja</button>
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
