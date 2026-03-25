import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { AlertTriangle, Plus, Activity, Car, Clock } from 'lucide-react'
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
    <div className="p-space-y-8 animate-fade">
      {/* Header */}
      <div className="p-flex p-flex-col md:p-flex-row p-justify-between p-items-start md:p-items-end p-gap-4 p-mb-8">
        <div>
          <h2 className="p-text-white p-tracking-tight p-mb-2">Centro de Mantenimiento</h2>
          <p className="p-text-white-40 p-font-bold p-uppercase p-tracking-widest p-text-xs">Control detallado de componentes por telemetría</p>
        </div>
        {totalCritical > 0 && (
          <div className="p-flex p-items-center p-gap-3 p-bg-red-500/10 p-text-red-400 p-border p-border-red-500/20 p-px-6 p-py-3 p-rounded-pill animate-pulse">
            <AlertTriangle size={16} />
            <span className="p-text-[10px] md:p-text-xs p-font-black p-uppercase p-tracking-widest">{totalCritical} ALERTAS CRÍTICAS</span>
          </div>
        )}
      </div>

      {/* Fleet Grid */}
      <div className="p-grid p-grid-cols-1 p-gap-8">
        {fleetHealth.map((v, i) => (
          <Motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-glass-premium p-p-5 md:p-p-8 p-rounded-[2.5rem] p-overflow-hidden p-relative p-shadow-premium"
          >
            {/* Background Decoration */}
            <div className={`p-absolute p--right-20 p--top-20 p-w-64 p-h-64 p-blur-3xl p-opacity-10 p-rounded-pill ${
                v.items.some(it => it.estado === 'critico') ? 'p-bg-red-500' : 'p-bg-emerald-500'
            }`} />

            <div className="p-relative p-z-10">
              <div className="p-flex p-flex-col lg:p-flex-row p-justify-between p-items-start lg:p-items-center p-gap-4 p-mb-6">
                <div className="p-flex p-items-center p-gap-5">
                  <div className="p-w-14 p-h-14 md:p-w-16 md:p-h-16 p-bg-white-5 p-rounded-3xl p-border p-border-white-10 p-flex p-items-center p-justify-center p-text-white-40">
                    <Car size={28} />
                  </div>
                  <div>
                    <h3 className="p-text-2xl p-font-black p-text-white p-tracking-tighter">{v.placa}</h3>
                    <p className="p-text-[10px] md:p-text-xs p-uppercase p-font-black p-text-white-30 p-tracking-widest p-mt-1">
                        Odómetro: <span className="p-text-white-60">{formatNumber(v.odometro_actual)} KM</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setNewItem(prev => ({ ...prev, ultimo_odometro: v.odometro_actual }));
                    setShowAddModal(v.id);
                  }}
                  className="btn-primary p-w-full lg:p-w-auto p-flex p-items-center p-justify-center p-gap-3 p-px-8 p-py-4 p-text-xs"
                >
                  <Plus size={16} /> AÑADIR RECORDATORIO
                </button>
              </div>

              {/* Items Grid */}
              <div className="p-grid p-grid-cols-1 md:p-grid-cols-2 lg:p-grid-cols-3 p-gap-6">
                {v.items.map((item) => (
                  <div key={item.id} className="p-p-4 p-rounded-3xl p-bg-white-[0.03] p-border p-border-white-5 hover:p-bg-white-5 p-transition-all p-group">
                    <div className="p-flex p-justify-between p-items-start p-mb-4">
                      <div>
                        <h4 className="p-text-base p-font-black p-text-white p-mb-1 group-hover:p-text-accent p-transition-colors">{item.nombre}</h4>
                        <div className="p-flex p-items-center p-gap-2 p-text-[10px] p-text-white-30 p-uppercase p-font-black p-tracking-widest">
                           <Clock size={12} /> Cada {formatNumber(item.frecuencia)} KM
                        </div>
                      </div>
                      <div className={`p-px-3 p-py-1 p-rounded-pill p-text-[10px] p-font-black p-uppercase ${
                        item.estado === 'critico' ? 'p-bg-red-500 p-text-white p-shadow-premium' : 
                        item.estado === 'advertencia' ? 'p-bg-amber-10 p-text-amber-500 p-border p-border-amber-500/20' : 'p-bg-emerald-10 p-text-emerald-400 p-border p-border-emerald-500/20'
                      }`}>
                        {item.estado === 'critico' ? 'Vencido' : item.estado === 'advertencia' ? 'Próximo' : 'En Orden'}
                      </div>
                    </div>

                    <div className="p-space-y-4">
                       <div className="p-h-2 p-w-full p-bg-white-5 p-rounded-pill p-overflow-hidden">
                          <Motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progreso}%` }}
                            className={`p-h-full p-rounded-pill ${
                              item.estado === 'critico' ? 'p-bg-red-500 p-neon-glow' : 
                              item.estado === 'advertencia' ? 'p-bg-amber-500' : 'p-bg-emerald-500 p-neon-glow'
                            }`}
                          />
                       </div>
                       <div className="p-flex p-justify-between p-items-center">
                          <div className="p-text-[10px] p-text-white-30 p-font-black p-uppercase p-tracking-widest">
                             Remanente: <span className={item.estado === 'critico' ? 'p-text-red-500' : 'p-text-white-70'}>{formatNumber(item.km_restantes)} KM</span>
                          </div>
                          <button 
                            onClick={() => handleReset(item.id, v.odometro_actual)}
                            className={`p-3 p-rounded-2xl p-transition-all ${
                                item.estado === 'critico' ? 'p-bg-white p-text-red-600 hover:p-scale-110' : 'p-bg-white-5 p-text-white-40 hover:p-text-white hover:p-bg-white-10'
                            }`}
                            title="Registrar Mantenimiento"
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
          <div className="p-fixed p-inset-0 p-z-50 p-flex p-items-center p-justify-center p-p-6">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(null)}
              className="p-absolute p-inset-0 p-bg-black/90 p-backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="p-relative p-w-full p-max-w-lg p-glass-premium p-rounded-[2.5rem] p-p-8 md:p-p-10 p-overflow-hidden p-shadow-premium"
            >
              <h3 className="p-text-2xl p-font-black p-text-white p-mb-8 p-tracking-tight">Nuevo Recordatorio</h3>
              <div className="p-space-y-6">
                <div>
                  <label className="p-text-[10px] p-font-black p-mb-2 p-block p-text-white-30 p-uppercase p-tracking-widest">Nombre del Servicio</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Cambio de Aceite, Frenos..."
                    value={newItem.nombre}
                    onChange={(e) => setNewItem({...newItem, nombre: e.target.value})}
                    className="p-p-4 md:p-p-5 p-bg-white-5 p-rounded-2xl p-border p-border-white-10 p-text-white p-w-full focus:p-border-accent p-transition-colors p-outline-none"
                  />
                </div>
                <div className="p-grid p-grid-cols-1 md:p-grid-cols-2 p-gap-6">
                  <div>
                    <label className="p-text-[10px] p-font-black p-mb-2 p-block p-text-white-30 p-uppercase p-tracking-widest">Frecuencia (KM)</label>
                    <input 
                      type="number" 
                      value={newItem.frecuencia}
                      onChange={(e) => setNewItem({...newItem, frecuencia: e.target.value})}
                      className="p-p-4 md:p-p-5 p-bg-white-5 p-rounded-2xl p-border p-border-white-10 p-text-white p-w-full focus:p-border-accent p-transition-colors p-outline-none"
                    />
                  </div>
                  <div>
                    <label className="p-text-[10px] p-font-black p-mb-2 p-block p-text-white-30 p-uppercase p-tracking-widest">Último Servicio (KM)</label>
                    <input 
                      type="number" 
                      value={newItem.ultimo_odometro}
                      onChange={(e) => setNewItem({...newItem, ultimo_odometro: e.target.value})}
                      className="p-p-4 md:p-p-5 p-bg-white-5 p-rounded-2xl p-border p-border-white-10 p-text-white p-w-full focus:p-border-accent p-transition-colors p-outline-none"
                    />
                  </div>
                </div>
                <div className="p-flex p-flex-col md:p-flex-row p-gap-4 p-pt-6">
                  <button onClick={() => setShowAddModal(null)} className="p-flex-1 p-p-4 md:p-p-5 p-bg-white-5 p-rounded-2xl p-font-black p-text-white-40 p-uppercase p-tracking-widest hover:p-bg-white-10 p-transition-all">CANCELAR</button>
                  <button onClick={handleAddItem} className="btn-primary p-flex-1 p-p-4 md:p-p-5 p-uppercase p-tracking-widest">GUARDAR</button>
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
