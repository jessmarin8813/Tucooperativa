import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History } from 'lucide-react'
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
        if (!event.target.closest('.dropdown-trigger-pc') && !event.target.closest('.dropdown-menu')) {
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
      {/* 1. HEADER - Only show if not minimal */}
      {!minimal && (
        <div className="p-flex-responsive p-justify-between p-items-center" style={{ padding: '0 32px 40px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-flex p-items-center" style={{ minWidth: 0, gap: '24px' }}>
                <div style={{ 
                    width: '64px', height: '64px', borderRadius: '20px', 
                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Car size={32} className="text-primary" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <h3 className="text-white font-black uppercase italic" style={{ fontSize: '1.8rem', letterSpacing: '0.04em', lineHeight: 1 }}>Módulo de Flota <span style={{ color: 'var(--accent)', fontSize: '10px', verticalAlign: 'middle', marginLeft: '10px', opacity: 0.5 }}>(v22.3-FIX)</span></h3>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>Gestión Operativa Senior</p>
                </div>
            </div>
            <button className="btn-secondary mobile-hide" style={{ height: '52px', padding: '0 28px', fontSize: '11px', fontWeight: 1000 }}>
                <History size={18} />
                <span style={{ marginLeft: '12px' }}>HISTORIAL CLÍNICO</span>
            </button>
        </div>
      )}

      <div className="p-fleet-container" style={{ marginTop: minimal ? '0' : '40px', paddingBottom: '120px' }}>
        {/* 2. PC GRID HEADER - Strict Mirror Alignment (v22.3-ULTIMATUM) */}
        {!isMobile && (
          <div className="p-fleet-grid p-fleet-header-pc">
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
            // Smart Gravity: Last row or rows near bottom open UPWARDS
            const isNearBottom = i >= (safeVehicles.length - 1); 
            
            return (
              <React.Fragment key={v.id}>
                {!isMobile ? (
                  /* --- DESKTOP ROW (True Grid) --- */
                  <Motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-fleet-grid p-fleet-row-pc"
                  >
                      <div className="p-identity-col">
                          <p className="text-white font-black" style={{ fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{v.modelo || 'Unidad Activa'}</p>
                          <div className="p-flex p-items-center p-gap-3" style={{ marginTop: '4px' }}>
                              <span className="p-plate-badge">{v.placa}</span>
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
                                {v.motivo_estado || 'Operación Normal'}
                            </span>
                          </div>
                      </div>

                      <div className="p-actions-col">
                          {!v.chofer_id && (
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
                  </Motion.div>
                ) : (
                  /* --- MOBILE CARD (Tactical Flow) --- */
                  <Motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                    className="p-fleet-card-mobile"
                  >
                      <div className="p-flex p-justify-between p-items-start">
                          <div className="p-flex p-gap-4">
                              <div className="p-unit-avatar-mobile">
                                  <Car size={20} className="text-white/30" />
                              </div>
                              <div>
                                  <p className="text-white font-black">{v.modelo}</p>
                                  <span className="p-plate-badge-mobile">{v.placa}</span>
                              </div>
                          </div>
                          <div className={`p-status-pill-v2 pill-sm ${status}`}>
                              {status.toUpperCase()}
                          </div>
                      </div>
                      {v.motivo_estado && <p className="p-status-reason-mobile">{v.motivo_estado}</p>}
                      <div className="p-card-divider"></div>
                      <div className="p-flex p-justify-between p-items-center">
                          <div>
                              <p className="p-fee-label-mobile">Cuota Diaria</p>
                              <p className="text-white font-black" style={{ fontSize: '1.2rem' }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                          </div>
                          <div className="p-flex p-gap-2">
                             {!v.chofer_id && <button className="btn-primary invite-btn-mobile">INVITAR</button>}
                             <button onClick={() => onEdit && onEdit(v)} className="btn-secondary icon-btn-mobile"><MoreVertical size={18} /></button>
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
