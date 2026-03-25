import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { AlertTriangle, Plus, Activity, Car, Clock, Settings } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '../utils/DashboardConstants'

const MaintenanceCenter = () => {
  const { callApi } = useApi()
  const [fleetHealth, setFleetHealth] = useState([])
  const [showAddModal, setShowAddModal] = useState(null) // holds vehiculo_id
  const [newItem, setNewItem] = useState({ nombre: '', frecuencia: 5000, ultimo_odometro: 0 })

  const fetchHealth = useCallback(async () => {
    try {
      const res = await callApi('mantenimiento.php')
      setFleetHealth(res)
    } catch {
      // Handled by useApi
    }
  }, [callApi])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  const handleReset = async (itemId, currentOdo) => {
    if (!window.confirm('¿Confirmas que se ha realizado este servicio?')) return
    try {
      await callApi('mantenimiento.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'record_service', item_id: itemId, odometro_valor: currentOdo })
      })
      fetchHealth()
    } catch {
      // Handled by useApi
    }
  }

  const handleAddItem = async () => {
    if (!newItem.nombre) return
    try {
      await callApi('mantenimiento.php', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'add_item', 
          vehiculo_id: showAddModal,
          ...newItem
        })
      })
      setShowAddModal(null)
      setNewItem({ nombre: '', frecuencia: 5000, ultimo_odometro: 0 })
      fetchHealth()
    } catch {
      // Handled by useApi
    }
  }

  const totalCritical = fleetHealth.reduce((acc, v) => acc + v.items.filter(i => i.estado === 'critico').length, 0)

  return (
    <div>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="h1-premium neon-text">Centro de Mantenimiento</h1>
          <p className="p-subtitle">Control detallado de componentes por telemetría</p>
        </div>
        {totalCritical > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }} className="animate-pulse">
            <AlertTriangle size={16} />
            <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{totalCritical} ALERTAS</span>
          </div>
        )}
      </header>

      {/* Fleet Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {fleetHealth.map((v, i) => (
          <Motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass"
            style={{ padding: '32px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Background Decoration */}
            <div style={{ 
                position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px',
                background: v.items.some(it => it.estado === 'critico') ? 'var(--danger)' : 'var(--success)',
                filter: 'blur(80px)', opacity: 0.05, borderRadius: '100%'
            }} />

            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                    <Car size={28} />
                  </div>
                  <div>
                    <h3 className="neon-text" style={{ fontSize: '1.75rem', fontWeight: 900 }}>{v.placa}</h3>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                        Odómetro: <span style={{ color: 'white' }}>{formatNumber(v.odometro_actual)} KM</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setNewItem(prev => ({ ...prev, ultimo_odometro: v.odometro_actual }));
                    setShowAddModal(v.id);
                  }}
                  className="btn-primary"
                  style={{ height: '52px', padding: '0 24px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={18} /> <span className="desktop-only text-nowrap">AÑADIR RECORDATORIO</span>
                </button>
              </div>

              {/* Items Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {v.items.map((item) => (
                  <div key={item.id} className="glass-hover" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', marginBottom: '4px' }}>{item.nombre}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>
                           <Clock size={12} /> Cada {formatNumber(item.frecuencia)} KM
                        </div>
                      </div>
                      <div style={{ 
                        padding: '4px 12px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase',
                        background: item.estado === 'critico' ? 'var(--danger)' : item.estado === 'advertencia' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: item.estado === 'critico' ? 'white' : item.estado === 'advertencia' ? 'var(--warning)' : 'var(--success)'
                      }}>
                        {item.estado === 'critico' ? 'Vencido' : item.estado === 'advertencia' ? 'Próximo' : 'En Orden'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                          <Motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progreso}%` }}
                            style={{ 
                                height: '100%', background: item.estado === 'critico' ? 'var(--danger)' : item.estado === 'advertencia' ? 'var(--warning)' : 'var(--success)',
                                boxShadow: item.estado === 'critico' ? '0 0 10px var(--danger)' : 'none'
                            }}
                          />
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                             Remanente: <span style={{ color: item.estado === 'critico' ? 'var(--danger)' : 'white' }}>{formatNumber(item.km_restantes)} KM</span>
                          </div>
                          <button 
                            onClick={() => handleReset(item.id, v.odometro_actual)}
                            style={{ padding: '8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            className="glass-hover"
                          >
                             <Activity size={16} />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Motion.div>
        ))}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            />
            <Motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass"
              style={{ position: 'relative', width: '100%', maxWidth: '560px', padding: '48px', overflow: 'hidden' }}
            >
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '32px' }}>Nuevo Recordatorio</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Nombre del Servicio</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Cambio de Aceite, Frenos..."
                    value={newItem.nombre}
                    onChange={(e) => setNewItem({...newItem, nombre: e.target.value})}
                    className="glass"
                    style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', width: '100%', fontWeight: 800, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Frecuencia (KM)</label>
                    <input 
                      type="number" 
                      value={newItem.frecuencia}
                      onChange={(e) => setNewItem({...newItem, frecuencia: e.target.value})}
                      className="glass"
                      style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', width: '100%', fontWeight: 800, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Último Servicio (KM)</label>
                    <input 
                      type="number" 
                      value={newItem.ultimo_odometro}
                      onChange={(e) => setNewItem({...newItem, ultimo_odometro: e.target.value})}
                      className="glass"
                      style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', width: '100%', fontWeight: 800, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', paddingTop: '24px' }}>
                  <button onClick={() => setShowAddModal(null)} className="glass" style={{ flex: 1, padding: '16px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>CANCELAR</button>
                  <button onClick={handleAddItem} className="btn-primary" style={{ flex: 1, padding: '16px', fontWeight: 800, textTransform: 'uppercase' }}>GUARDAR RECORDATORIO</button>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MaintenanceCenter
