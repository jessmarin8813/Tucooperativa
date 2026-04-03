import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History, Truck, Wrench, XCircle, UserMinus, Trash2 } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const FleetList = ({ vehicles = [], minimal = false, setActiveView, onEdit, onInvite, onUnlink, onDelete, config }) => {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  if (safeVehicles.length === 0) {
    return (
      <div className="glass-premium p-16 text-center text-white/20 font-black uppercase tracking-widest text-xs border-dashed border-2 border-white/5 rounded-3xl m-8">
        No hay vehículos registrados en la flota.
      </div>
    )
  }

  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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
      <div className="p-fleet-container" style={{ marginTop: minimal ? '0' : (isMobile ? '24px' : '0px'), paddingBottom: '120px', paddingTop: minimal ? '0' : '20px' }}>
        {!isMobile && (
          <div className="p-fleet-grid p-fleet-header-pc" style={{ marginBottom: '20px', padding: '0 24px' }}>
            <div className="p-identity-col">UNIDAD / CHOFER</div>
            <div className="p-performance-col">RENDIMIENTO</div>
            <div className="p-fee-col p-flex p-items-center p-justify-center">CUOTA DIARIA</div>
            <div className="p-status-col p-flex p-items-center p-justify-center">ESTADO</div>
            <div className="p-actions-col">ACCIONES</div>
          </div>
        )}

        <div className={!isMobile ? "divide-y divide-white/2" : ""} style={{ overflow: 'visible' }}>
          {safeVehicles.map((v, i) => {
            if (!v || typeof v !== 'object') return null;
            const statusRaw = (v?.estado || v?.status_label || 'inactivo').toString().toLowerCase();
            const status = statusRaw === 'en ruta' ? 'activo' : statusRaw;
            const isNearBottom = i >= ((safeVehicles.length || 0) - 2);
            const statusDescription = status === 'activo'
              ? (v?.chofer_id ? 'Operación Normal' : 'Disponible / Sin Chofer')
              : status === 'mantenimiento' ? 'En Taller / Reparación'
                : 'Suspendido / Fuera de Servicio';

            return !isMobile ? (
              <Motion.div
                key={`PC_ROW_${v?.id || i}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.001, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
                className="p-fleet-grid p-fleet-row-pc"
                style={{
                  margin: '6px 12px', padding: '12px 24px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <div className="p-identity-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <div className="p-flex p-items-center p-gap-2">
                     <p className="text-white font-black uppercase italic" style={{ fontSize: '1.15rem', color: 'var(--primary)', lineHeight: 1 }}>{v.modelo || 'Unidad'}</p>
                     <span className="p-plate-badge">{v.placa}</span>
                     {v.maintenance_status !== 'ok' && (
                       <Wrench 
                         size={14} 
                         color={v.maintenance_status === 'critico' ? 'var(--danger)' : 'var(--warning)'} 
                         style={{ cursor: 'pointer' }}
                         onClick={(e) => { e.stopPropagation(); setActiveView && setActiveView('maintenance'); }}
                       />
                     )}
                   </div>
                   <div className="p-flex p-items-center p-gap-2" style={{ opacity: 0.9 }}>
                     <User size={14} className="text-primary" style={{ opacity: 0.5 }} />
                     <span style={{ fontSize: '1rem', fontWeight: 800, color: v.chofer_nombre ? 'white' : 'rgba(255,255,255,0.15)', fontStyle: v.chofer_nombre ? 'normal' : 'italic' }}>
                       {v.chofer_nombre || 'Sin Chofer'}
                     </span>
                   </div>
                </div>

                <div className="p-performance-col">
                  <p className="text-white font-black" style={{ fontSize: '1.2rem', lineHeight: 1 }}>{v.km_por_litro || '0'} <small style={{ fontSize: '10px', opacity: 0.5 }}>KM/L</small></p>
                </div>

                <div className="p-fee-col p-flex p-items-center p-justify-center">
                   <div className="p-flex-col p-items-center" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <p className="text-white font-black" style={{ fontSize: '1.3rem', color: 'var(--success)', lineHeight: 1 }}>${parseFloat(v.cuota_diaria || 0).toFixed(2)}</p>
                     <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', marginTop: '4px' }}>
                       ≈ Bs {(Number(v.cuota_diaria || 0) * (config?.bcv_rate || 36.5)).toFixed(2)}
                     </span>
                   </div>
                </div>

                <div className="p-status-col p-flex p-items-center p-justify-center">
                   <div className="p-flex-col p-items-center" style={{ gap: '6px' }}>
                     <div className="p-status-pill-v2" style={{ 
                        background: status === 'activo' ? (v?.chofer_id ? 'var(--success)' : 'var(--primary)') : status === 'mantenimiento' ? 'var(--warning)' : 'var(--danger)',
                        color: status === 'mantenimiento' ? '#000' : '#fff',
                        fontSize: '12px',
                        padding: '12px 24px',
                        minWidth: '140px'
                     }}>
                        {status === 'activo' ? (v?.chofer_id ? 'TRABAJANDO' : 'DISPONIBLE') : status === 'mantenimiento' ? 'EN TALLER' : 'DETENIDO'}
                     </div>
                     <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 800, color: 'white', marginTop: '4px' }}>{statusDescription}</span>
                   </div>
                </div>

                <div className="p-actions-col">
                   <div className="p-flex p-items-center p-justify-end p-gap-3" style={{ width: '100%' }}>
                     {!v.chofer_id && status === 'activo' && (
                       <button onClick={() => onInvite && onInvite(v)} className="btn-primary" style={{ fontSize: '10px', height: '42px', padding: '0 18px' }}>INVITAR</button>
                     )}
                     <div style={{ position: 'relative' }}>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }} 
                         className="btn-secondary dropdown-trigger-pc" 
                         style={{ 
                            width: '42px', height: '42px', borderRadius: '12px', 
                            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' 
                         }}
                       >
                         <MoreVertical size={20} className={activeDropdown === v.id ? 'text-primary' : 'text-white/40'} />
                       </button>
                       <AnimatePresence>
                         {activeDropdown === v.id && (
                           <Motion.div
                             key={`DROP_PC_${v.id}`}
                             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                             className={`p-dropdown-menu ${isNearBottom ? 'upward' : ''}`}
                           >
                              <button onClick={() => { onEdit && onEdit(v); setActiveDropdown(null); }} className="p-dropdown-item">Modificar Unidad</button>
                              <button onClick={() => { setActiveView && setActiveView('forensic'); setActiveDropdown(null); }} className="p-dropdown-item">Auditoría</button>
                              {v.chofer_id && <button onClick={() => { onUnlink && onUnlink(v); setActiveDropdown(null); }} className="p-dropdown-item text-danger">Desvincular Chofer</button>}
                              <div className="p-dropdown-divider"></div>
                              <button className="p-dropdown-item text-danger" onClick={() => { onDelete && onDelete(v); setActiveDropdown(null); }}>Eliminar</button>
                           </Motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   </div>
                </div>
              </Motion.div>
            ) : (
              <Motion.div
                key={`MOBILE_${v?.id || i}`}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className="glass"
                style={{ padding: '24px', borderRadius: '24px', marginBottom: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <p className="text-white font-black uppercase italic" style={{ fontSize: '1.4rem' }}>{v.modelo || 'Unidad'}</p>
                    <span className="p-plate-badge" style={{ marginTop: '8px', display: 'inline-block' }}>{v.placa}</span>
                  </div>
                  <div className="p-status-pill-v2" style={{ 
                    background: status === 'activo' ? (v?.chofer_id ? 'var(--success)' : 'var(--primary)') : status === 'mantenimiento' ? 'var(--warning)' : 'var(--danger)',
                    color: status === 'mantenimiento' ? '#000' : '#fff',
                    fontSize: '12px',
                    padding: '10px 20px'
                  }}>
                    {status === 'activo' ? (v?.chofer_id ? 'TRABAJANDO' : 'DISPONIBLE') : status === 'mantenimiento' ? 'EN TALLER' : 'DETENIDO'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', marginBottom: '24px' }}>
                   <div style={{ textAlign: 'center' }}>
                     <p className="text-dim uppercase font-black" style={{ fontSize: '9px' }}>Tarifa</p>
                     <p className="text-white font-black" style={{ fontSize: isMobile ? '1.2rem' : '1.4rem' }}>${parseFloat(v.cuota_diaria || 0).toFixed(2)}</p>
                     <p className="font-bold" style={{ fontSize: '11px', color: 'white', marginTop: '2px' }}>≈ Bs {(Number(v.cuota_diaria || 0) * (config?.bcv_rate || 36.5)).toFixed(2)}</p>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <p className="text-dim uppercase font-black" style={{ fontSize: '9px' }}>Rendimiento</p>
                     <p className="text-white font-black" style={{ fontSize: isMobile ? '1.2rem' : '1.4rem' }}>{v.km_por_litro || '0'} KM/L</p>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                   <button 
                      onClick={() => v.chofer_id ? onUnlink(v) : onInvite(v)} 
                      className="btn-primary p-flex-col p-items-center p-justify-center" 
                      style={{ height: '68px', padding: '8px 16px', gap: '2px' }}
                   >
                     <span style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>
                        {v.chofer_id ? 'Chofer:' : 'Acción:'}
                     </span>
                     <span style={{ fontSize: '0.95rem', fontWeight: 900, lineHeight: 1.1, textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.chofer_id ? v.chofer_nombre : 'INVITAR CHOFER'}
                     </span>
                   </button>
                   <div style={{ position: 'relative', display: 'flex' }}>
                     <button 
                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }} 
                        className="glass-hover" 
                        style={{ 
                          width: '68px', 
                          height: '68px', 
                          borderRadius: '18px', 
                          padding: 0, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          flexShrink: 0
                        }}>
                       <MoreVertical size={24} color={activeDropdown === v.id ? 'var(--primary)' : '#ffffff'} />
                     </button>
                     <AnimatePresence>
                        {activeDropdown === v.id && (
                          <Motion.div key={`DROP_MOB_${v.id}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-dropdown-menu upward" style={{ right: 0, bottom: '65px' }}>
                             <button onClick={() => { onEdit && onEdit(v); setActiveDropdown(null); }} className="p-dropdown-item">Modificar Unidad</button>
                             <button onClick={() => { setActiveView && setActiveView('forensic'); setActiveDropdown(null); }} className="p-dropdown-item">Auditoría</button>
                             {v.chofer_id && <button onClick={() => { onUnlink && onUnlink(v); setActiveDropdown(null); }} className="p-dropdown-item text-danger">Desvincular Chofer</button>}
                             <div className="p-dropdown-divider"></div>
                             <button className="p-dropdown-item text-danger" onClick={() => { onDelete && onDelete(v); setActiveDropdown(null); }}>Eliminar</button>
                          </Motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                </div>
              </Motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FleetList
