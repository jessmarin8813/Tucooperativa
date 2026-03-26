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
  // Click-away logic to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        // If the click is not on a dropdown trigger or inside a dropdown, close it
        if (!event.target.closest('.dropdown-trigger') && !event.target.closest('.dropdown-menu')) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
                    <h3 className="text-white font-black uppercase italic" style={{ fontSize: '1.8rem', letterSpacing: '0.04em', lineHeight: 1 }}>Módulo de Flota</h3>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>Gestión Operativa Senior</p>
                </div>
            </div>
            <button className="btn-secondary mobile-hide" style={{ height: '52px', padding: '0 28px', fontSize: '11px', fontWeight: 1000 }}>
                <History size={18} />
                <span style={{ marginLeft: '12px' }}>HISTORIAL CLÍNICO</span>
            </button>
        </div>
      )}

      <div className="p-fleet-container custom-scrollbar" style={{ marginTop: minimal ? '0' : '40px', paddingBottom: '160px' }}>
        {/* 2. PC GRID HEADER - Strict Alignment */}
        <div className={`p-fleet-grid p-fleet-header ${minimal ? 'minimal-grid' : ''}`}>
          <div>UNIDAD / OPERADOR</div>
          {!minimal && <div className="p-flex p-items-center p-justify-center">CUOTA DIARIA</div>}
          <div className="p-flex p-items-center p-justify-center">ESTADO</div>
          {!minimal && <div className="p-flex p-items-center p-justify-end">ACCIONES</div>}
        </div>

        {/* 3. SENIOR ROWS */}
        <div className="divide-y divide-white/2">
          {safeVehicles.map((v, i) => (
            <Motion.div 
              key={v.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-fleet-grid p-fleet-row-content ${minimal ? 'minimal-grid' : ''}`}
              style={{ padding: minimal ? '20px 0' : '32px 0' }}
            >
                {/* 1. Identity (Desktop & Mobile) */}
                <div className="p-identity-col">
                  <div className="p-flex p-items-center p-gap-4" style={{ width: '100%' }}>
                      <div className="p-unit-avatar-wrapper" style={{ minWidth: minimal ? '48px' : '64px', height: minimal ? '48px' : '64px', borderRadius: minimal ? '14px' : '18px', flexShrink: 0 }}>
                          <Car size={minimal ? 20 : 24} className="text-white/40" />
                      </div>
                      <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <p className="text-white font-black truncate" style={{ fontSize: minimal ? '1rem' : '1.15rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{v.modelo || 'Unidad Activa'}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: minimal ? '4px' : '8px' }}>
                              <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 1000, textTransform: 'uppercase', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.15)' }}>{v.placa}</span>
                              {v.chofer_nombre && !minimal && (
                                <span className="mobile-hide" style={{ fontSize: '9px', color: 'rgba(16, 185, 129, 0.7)', fontWeight: 1000, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <div style={{ width: '4px', height: '4px', background: 'currentColor', borderRadius: '50%' }}></div>
                                  {v.chofer_nombre}
                                </span>
                              )}
                          </div>
                      </div>
                  </div>
                </div>

                {/* 2. Fee (Desktop Priority) */}
                {!minimal && (
                  <div className="p-fee-col p-flex p-items-center p-justify-center">
                      <div className="fee-container p-text-center">
                          <p className="text-white font-black" style={{ fontSize: '1.6rem', lineHeight: 1 }}>${parseFloat(v.cuota_diaria).toFixed(2)}</p>
                          <span className="fee-label">USD / DÍA</span>
                      </div>
                  </div>
                )}

                {/* 3. Status */}
                <div className="p-status-col p-flex p-items-center p-justify-center">
                  <div className="p-status-pill" style={{ 
                      background: v.estado === 'activo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      color: v.estado === 'activo' ? 'var(--success)' : 'rgba(255, 255, 255, 0.25)',
                      border: `1px solid ${v.estado === 'activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                      padding: minimal ? '6px 14px' : '10px 24px',
                      fontSize: minimal ? '9px' : '10px'
                  }}>
                    {v.estado || 'Detenido'}
                  </div>
                </div>

                {/* 4. Actions (Desktop Priority) */}
                {!minimal && (
                  <div className="p-actions-col p-flex p-justify-end p-items-center p-gap-4">
                      <div style={{ position: 'relative' }}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === v.id ? null : v.id); }}
                            className="btn-secondary dropdown-trigger" 
                            style={{ width: '48px', height: '48px', padding: 0, borderRadius: '14px', flexShrink: 0 }}
                        >
                            <MoreVertical size={22} className={activeDropdown === v.id ? 'text-primary' : 'text-white/30'} />
                        </button>
                        
                        <AnimatePresence>
                            {activeDropdown === v.id && (
                            <Motion.div 
                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                                className="glass shadow-2xl dropdown-menu"
                                style={{ 
                                position: 'absolute', top: '65px', right: 0, zIndex: 100, 
                                width: '220px', padding: '15px', borderRadius: '20px', 
                                background: '#0a0b12', border: '1px solid rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(60px)'
                                }}
                            >
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); onEdit && onEdit(v); }}
                                  className="tab-item dropdown-item" 
                                  style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 18px', fontSize: '12px', borderRadius: '12px' }}
                                >
                                  Modificar Unidad
                                </button>
                                <button 
                                  onClick={() => setActiveView && setActiveView('forensic')}
                                  className="tab-item dropdown-item" 
                                  style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 18px', fontSize: '12px', borderRadius: '12px' }}
                                >
                                  Ver Auditoría
                                </button>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '10px 0' }}></div>
                                <button className="tab-item dropdown-item" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 18px', fontSize: '12px', borderRadius: '12px', color: 'var(--danger)', fontWeight: 1000 }}>Eliminar</button>
                            </Motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                  </div>
                )}

                {/* Invite Button (Direct Grid Child for Mobile Spanning) */}
                {!minimal && !v.chofer_id && (
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
                    className="btn-primary invite-btn"
                  >
                    INVITAR
                  </button>
                )}
            </Motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FleetList
