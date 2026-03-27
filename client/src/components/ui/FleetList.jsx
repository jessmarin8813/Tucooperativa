import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History, Truck } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const FleetList = ({ vehicles = [], minimal = false, setActiveView, onEdit }) => {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  
  if (safeVehicles.length === 0) {
    return (
      <div className="glass-premium p-16 text-center text-white/20 font-black uppercase tracking-widest text-xs border-dashed border-2 border-white/5 rounded-3xl m-8">
        No hay vehículos registrados en la flota.
      </div>
    )
  }
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        if (!event.target.closest('.dropdown-trigger-pc') && !event.target.closest('.glass-hover')) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  return (
    <div className="p-fleet-card-root" style={{ width: '100%' }}>
      {/* 1. HEADER REMOVED (Moved to View level per user request) */}

      <div className="p-fleet-container" style={{ marginTop: minimal ? '0' : (isMobile ? '24px' : '0px'), paddingBottom: '120px', paddingTop: minimal ? '0' : '20px' }}>
        {/* 2. PC GRID HEADER */}
        {!isMobile && (
          <div className="p-fleet-grid p-fleet-header-pc" style={{ marginBottom: '20px' }}>
            <div className="p-identity-col">
                <div className="p-flex p-items-center">UNIDAD / CHOFER</div>
            </div>
            <div className="p-fee-col p-flex p-items-center p-justify-center">CUOTA DIARIA</div>
            <div className="p-status-col p-flex p-items-center p-justify-center">
                <div className="p-flex-col p-items-center" style={{ width: '100%', textAlign: 'center' }}>
                    ESTADO
                </div>
            </div>
            <div className="p-actions-col">
               <div className="p-flex p-items-center p-justify-center" style={{ width: '100%', whiteSpace: 'nowrap' }}>ACCIONES</div>
            </div>
          </div>
        )}

        {/* 3. SENIOR ROWS (Atomic Conditional Delivery) */}
        <div className={!isMobile ? "divide-y divide-white/2" : ""} style={{ overflow: 'visible' }}>
          {safeVehicles.map((v, i) => {
            const statusRaw = (v.estado || v.status_label || 'inactivo').toLowerCase();
            const status = statusRaw === 'en ruta' ? 'activo' : statusRaw;
            const isNearBottom = i >= (safeVehicles.length - 2); 
            
            return (
              <React.Fragment key={v.id}>
                {!isMobile ? (
                  /* --- DESKTOP ROW --- */
                  <Motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-fleet-grid p-fleet-row-pc"
                  >
                      <div className="p-identity-col">
                          <p className="text-white font-black" style={{ fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{v.modelo || 'Unidad Activa'}</p>
                          <div className="p-flex p-items-center p-gap-3" style={{ marginTop: '4px' }}>
                              <span className="p-plate-badge" style={{ fontSize: '9px', color: '#06b6d4', fontWeight: 950, background: 'rgba(6, 182, 212, 0.1)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)' }}>{v.placa}</span>
                              {v.chofer_nombre && <span className="p-driver-tag">{v.chofer_nombre}</span>}
                          </div>
                      </div>

                      <div className="p-fee-col p-flex p-items-center p-justify-center">
                          <div className="p-flex-col p-items-center">
                              <p className="text-white font-black" style={{ fontSize: '1.4rem' }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                              <span className="p-fee-label">USD / DÍA</span>
                          </div>
                      </div>

                      <div className="p-status-col p-flex p-items-center p-justify-center">
                          <div className="p-flex-col p-items-center" style={{ width: '100%' }}>
                            <div className={`p-status-pill-v2 ${status}`}>
                                {status.toUpperCase()}
                            </div>
                            <span className="p-status-reason" style={{ width: '100%', textAlign: 'center' }}>
                                {status === 'activo' 
                                  ? (v.chofer_id ? 'Operación Normal' : 'Disponible / Sin Chofer')
                                  : status === 'mantenimiento' ? 'En Taller / Reparación'
                                  : 'Suspendido / Fuera de Servicio'}
                            </span>
                          </div>
                      </div>

                      <div className="p-actions-col">
                          <div className="p-flex p-items-center p-justify-center p-gap-4" style={{ width: '100%' }}>
                              {!v.chofer_id && status === 'activo' && (
                                  <button className="btn-primary invite-btn-pc" style={{ fontSize: '10px', height: '44px', fontWeight: 1000 }}>INVITAR</button>
                              )}
                              <div style={{ position: 'relative' }}>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }} 
                                    className="btn-secondary dropdown-trigger-pc"
                                    style={{ width: '44px', height: '44px', borderRadius: '12px', padding: 0 }}
                                  >
                                      <MoreVertical size={20} className={activeDropdown === v.id ? 'text-primary' : 'text-white/30'} />
                                  </button>
                                  <AnimatePresence>
                                      {activeDropdown === v.id && (
                                          <Motion.div 
                                            initial={{ opacity: 0, y: isNearBottom ? -10 : 10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            exit={{ opacity: 0, y: isNearBottom ? -10 : 10 }} 
                                            className={`p-dropdown-menu ${isNearBottom ? 'upward' : ''}`}
                                          >
                                              <button onClick={() => onEdit && onEdit(v)} className="p-dropdown-item">Modificar Unidad</button>
                                              <button onClick={() => setActiveView && setActiveView('forensic')} className="p-dropdown-item">Ver Auditoría</button>
                                              <div className="p-dropdown-divider"></div>
                                              <button className="p-dropdown-item text-danger">Eliminar</button>
                                          </Motion.div>
                                      )}
                                  </AnimatePresence>
                              </div>
                          </div>
                      </div>
                  </Motion.div>
                ) : (
                  /* --- MOBILE CARD (Premium horizontal hierarchy) --- */
                  <Motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                    className="glass" 
                    style={{ padding: '24px', borderRadius: '24px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                          <div className="p-flex p-gap-4">
                              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Truck size={20} className="text-white/40" />
                              </div>
                              <div>
                                  <p className="text-white font-black uppercase italic" style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{v.modelo}</p>
                                  <span className="p-plate-badge" style={{ fontSize: '9px', color: '#06b6d4', fontWeight: 950, background: 'rgba(6, 182, 212, 0.1)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)', marginTop: '4px', display: 'inline-block' }}>{v.placa}</span>
                              </div>
                          </div>
                          <div className={`p-status-pill-v2 pill-sm ${status}`} style={{ padding: '6px 12px', fontSize: '9px' }}>
                              {status.toUpperCase()}
                          </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', marginBottom: '20px' }}>
                          <div>
                              <p className="text-dim uppercase font-black" style={{ fontSize: '8px', letterSpacing: '0.05em' }}>Tarifa Diaria</p>
                              <p className="text-white font-black" style={{ fontSize: '1.2rem', marginTop: '2px' }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                          </div>
                          <div>
                              <p className="text-dim uppercase font-black" style={{ fontSize: '8px', letterSpacing: '0.05em' }}>Rendimiento</p>
                              <p className="text-white font-black" style={{ fontSize: '1.2rem', marginTop: '2px' }}>{v.km_por_litro || '0'} <small style={{ fontSize: '8px' }}>KM/L</small></p>
                          </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                          {!v.chofer_id && status === 'activo' ? (
                            <button className="btn-primary" style={{ flex: 1, height: '52px', fontSize: '11px', fontWeight: 1000 }}>INVITAR CHOFER</button>
                          ) : (
                            <div style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800 }}>
                                {v.chofer_id ? 'CHOFER ASIGNADO' : status.toUpperCase()}
                            </div>
                          )}
                          <div style={{ position: 'relative' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }} 
                                className="glass-hover" 
                                style={{ width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <MoreVertical size={20} className="text-white/40" />
                            </button>
                            <AnimatePresence>
                                {activeDropdown === v.id && (
                                    <Motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="p-dropdown-menu upward"
                                        style={{ right: 0, bottom: '65px' }}
                                    >
                                        <button onClick={() => onEdit && onEdit(v)} className="p-dropdown-item">Modificar Unidad</button>
                                        <button onClick={() => setActiveView && setActiveView('forensic')} className="p-dropdown-item">Ver Auditoría</button>
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                      </div>
                  </Motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default FleetList
