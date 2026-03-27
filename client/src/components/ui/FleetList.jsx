import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History, Truck, Wrench, XCircle, UserMinus, Trash2 } from 'lucide-react'

import { motion as Motion, AnimatePresence } from 'framer-motion'

const FleetList = ({ vehicles = [], minimal = false, setActiveView, onEdit, onInvite, onUnlink }) => {
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

      <div className="p-fleet-container" style={{ marginTop: minimal ? '0' : (isMobile ? '24px' : '0px'), paddingBottom: '120px', paddingTop: minimal ? '0' : '20px' }}>        {/* 2. PC GRID HEADER */}
        {!isMobile && (
          <div className="p-fleet-grid p-fleet-header-pc" style={{ marginBottom: '20px', padding: '0 24px' }}>
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
          {(safeVehicles || []).map((v, i) => {
            if (!v) return null;
            const statusRaw = (v.estado || v.status_label || 'inactivo').toString().toLowerCase();
            const status = statusRaw === 'en ruta' ? 'activo' : statusRaw;
            const isNearBottom = i >= (safeVehicles.length - 2);

            const statusDescription = status === 'activo'
              ? (v.chofer_id ? 'Operación Normal' : 'Disponible / Sin Chofer')
              : status === 'mantenimiento' ? 'En Taller / Reparación'
                : 'Suspendido / Fuera de Servicio';

            return (
              <React.Fragment key={`F_ITEM_${v?.id || i}`}>
                {!isMobile ? (
                  /* --- DESKTOP ROW --- */
                  <Motion.div
                    key={`PC_ROW_${v?.id || i}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.001, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
                    className="p-fleet-grid p-fleet-row-pc"
                    style={{
                      margin: '6px 12px',
                      padding: '12px 24px',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease-out'
                    }}
                  >
                    <div className="p-identity-col" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                      <div className="p-flex p-items-center p-gap-2">
                        <p className="text-white font-black uppercase italic" style={{ fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--primary)', lineHeight: 1 }}>{v.modelo || 'Unidad'}</p>
                        <span className="p-plate-badge" style={{ fontSize: '8px', color: '#06b6d4', fontWeight: 950, background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.2)' }}>{v.placa}</span>
                        {v.maintenance_status !== 'ok' && (
                          <Wrench size={14} color={v.maintenance_status === 'critico' ? 'var(--danger)' : 'var(--warning)'} style={{ marginLeft: '4px' }} />
                        )}
                      </div>
                      <div className="p-flex p-items-center p-gap-2" style={{ opacity: 0.9 }}>
                        <User size={14} className="text-primary" style={{ opacity: 0.5 }} />
                        {v.chofer_nombre ? (
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em', lineHeight: 1 }}>
                            {v.chofer_nombre}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.15)', fontStyle: 'italic', textTransform: 'uppercase' }}>
                            Sin Chofer
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-fee-col p-flex p-items-center p-justify-center">
                      <div className="p-flex-col p-items-center" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content' }}>
                        <p className="text-white font-black" style={{ fontSize: '1.5rem', color: 'var(--success)', lineHeight: 1 }}>${parseFloat(v.cuota_diaria || 0).toFixed(2)}</p>
                        <span style={{ fontSize: '10px', fontWeight: 900, opacity: 0.75, marginTop: '5px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)' }}>USD / DIARIO</span>
                      </div>
                    </div>

                    <div className="p-status-col p-flex p-items-center p-justify-center">
                      <div className="p-flex-col p-items-center" style={{ width: '100%', gap: '6px' }}>
                        <div className={`p-status-pill-v2 ${status}`} style={{ padding: '8px 22px', fontSize: '11px', fontWeight: 1000 }}>
                          {status.toUpperCase()}
                        </div>
                        <span className="p-status-reason" style={{ fontSize: '10px', opacity: 0.75, textAlign: 'center', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                          {statusDescription}
                        </span>
                      </div>
                    </div>

                    <div className="p-actions-col">
                      <div className="p-flex p-items-center p-justify-center p-gap-3" style={{ width: '100%' }}>
                        {!v.chofer_id && status === 'activo' && (
                          <button
                            onClick={() => onInvite && onInvite(v)}
                            className="btn-primary invite-btn-pc"
                            style={{ fontSize: '10px', height: '42px', fontWeight: 1000, padding: '0 18px', letterSpacing: '0.05em' }}
                          >
                            INVITAR
                          </button>
                        )}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                            className="btn-secondary dropdown-trigger-pc"
                            style={{ width: '42px', height: '42px', borderRadius: '12px', padding: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            <MoreVertical size={20} className={activeDropdown === v.id ? 'text-primary' : 'text-white/40'} />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === v.id && (
                              <Motion.div
                                key={`DESKTOP_DROP_${v.id}`}
                                initial={{ opacity: 0, y: isNearBottom ? -10 : 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: isNearBottom ? -10 : 10, scale: 0.95 }}
                                className={`p-dropdown-menu ${isNearBottom ? 'upward' : ''}`}
                                style={{ zIndex: 100 }}
                              >
                                <button onClick={() => onEdit && onEdit(v)} className="p-dropdown-item">Modificar Unidad</button>
                                <button onClick={() => setActiveView && setActiveView('forensic')} className="p-dropdown-item">Ver Auditoría</button>
                                {v.chofer_id && (
                                   <button onClick={() => { setActiveDropdown(null); onUnlink && onUnlink(v); }} className="p-dropdown-item text-danger">Desvincular Chofer</button>
                                )}
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
                    key={`MOBILE_CARD_${v?.id || i}`}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                    className="glass"
                    style={{ padding: '24px', borderRadius: '24px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div>
                        <div className="p-flex p-items-center p-gap-2">
                          <p className="text-white font-black uppercase italic" style={{ fontSize: '1.4rem', lineHeight: 1 }}>{v.modelo || 'Unidad'}</p>
                          {v.maintenance_status !== 'ok' && (
                            <Wrench
                              size={18}
                              color={v.maintenance_status === 'critico' ? 'var(--danger)' : 'var(--warning)'}
                              onClick={(e) => { e.stopPropagation(); setActiveView && setActiveView('maintenance'); }}
                            />
                          )}
                        </div>
                        <span className="p-plate-badge" style={{ fontSize: '10px', color: '#06b6d4', fontWeight: 950, background: 'rgba(6, 182, 212, 0.1)', padding: '4px 12px', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.2)', marginTop: '8px', display: 'inline-block' }}>{v.placa}</span>
                      </div>

                      <div className="p-flex-col p-items-center" style={{ minWidth: '100px' }}>
                        <div className={`p-status-pill-v2 pill-sm ${status}`} style={{ padding: '8px 20px', fontSize: '10px', fontWeight: 1000 }}>
                           {status.toUpperCase()}
                        </div>
                        <span className="p-status-reason" style={{ fontSize: '10px', marginTop: '6px', fontWeight: 700, opacity: 0.75, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
                           {statusDescription}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', marginBottom: '24px' }}>
                       <div style={{ textAlign: 'center' }}>
                         <p className="text-dim uppercase font-black" style={{ fontSize: '9px', letterSpacing: '0.1em', opacity: 0.75, color: 'rgba(255,255,255,0.85)' }}>Tarifa Diaria</p>
                         <p className="text-white font-black" style={{ fontSize: '1.4rem', marginTop: '4px' }}>${parseFloat(v.cuota_diaria || 0).toFixed(2)}</p>
                       </div>
                       <div style={{ textAlign: 'center' }}>
                         <p className="text-dim uppercase font-black" style={{ fontSize: '9px', letterSpacing: '0.1em', opacity: 0.75, color: 'rgba(255,255,255,0.85)' }}>Rendimiento</p>
                         <p className="text-white font-black" style={{ fontSize: '1.4rem', marginTop: '4px' }}>{v.km_por_litro || '0'} <small style={{ fontSize: '10px', opacity: 0.5 }}>KM/L</small></p>
                       </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {v.chofer_id ? (
                        <div key={`LINKED_${v.id}`} className="glass-hover" style={{ flex: 1, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <div className="p-flex p-items-center p-gap-3">
                               <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                   <User size={18} className="text-primary" />
                               </div>
                               <span style={{ fontSize: '12px', fontWeight: 1000, color: 'white', letterSpacing: '-0.01em' }}>{v.chofer_nombre}</span>
                           </div>
                           <button 
                               key={`UNLINK_BTN_${v.id}`}
                               onClick={(e) => { e.stopPropagation(); onUnlink && onUnlink(v); }}
                               className="p-flex p-items-center p-justify-center glass-hover"
                               style={{ 
                                 width: '40px', 
                                 height: '40px', 
                                 borderRadius: '12px', 
                                 background: 'rgba(239, 68, 68, 0.4)', 
                                 border: '1px solid rgba(239, 68, 68, 0.6)', 
                                 cursor: 'pointer', 
                                 transition: 'all 0.2s',
                                 boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '4px'
                               }}
                               title="Desvincular Chofer"
                           >
                               <span style={{ color: 'white', fontWeight: 900, fontSize: '14px' }}>X</span>
                               <Trash2 size={18} color="#ffffff" strokeWidth={3} style={{ display: 'block' }} />
                           </button>
                        </div>
                      ) : (
                        <button
                          key={`UNLINKED_${v.id}`}
                          onClick={() => onInvite && onInvite(v)}
                          className="btn-primary"
                          style={{ flex: 1, height: '56px', fontSize: '11px', fontWeight: 1000 }}
                        >
                          INVITAR CHOFER
                        </button>
                      )}
                      
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                          className="glass-hover"
                          style={{
                            width: '56px', height: '56px', borderRadius: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            padding: 0
                          }}
                        >
                          <MoreVertical size={24} style={{ color: '#ffffff', opacity: 0.6 }} />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === v?.id && (
                            <Motion.div
                              key={`DROP_${v?.id || i}`}
                              className="p-dropdown-menu upward"
                              style={{ right: 0, bottom: '65px' }}
                            >
                              <button onClick={() => onEdit && onEdit(v)} className="p-dropdown-item">Modificar Unidad</button>
                              <button onClick={() => setActiveView && setActiveView('forensic')} className="p-dropdown-item">Ver Auditoría</button>
                              {v.chofer_id && (
                                  <button onClick={() => { setActiveDropdown(null); onUnlink && onUnlink(v); }} className="p-dropdown-item text-danger">Desvincular Chofer</button>
                              )}
                              <div className="p-dropdown-divider"></div>
                              <button className="p-dropdown-item text-danger">Eliminar</button>
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
