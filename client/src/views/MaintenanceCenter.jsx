import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { AlertTriangle, Plus, Activity, Car, Clock, Settings, CheckCircle2, DollarSign, Pencil, RefreshCw, X, Wrench } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '../utils/DashboardConstants'

const MaintenanceCenter = () => {
  const { callApi } = useApi()
  const [fleetHealth, setFleetHealth] = useState([])
  const [showAddModal, setShowAddModal] = useState(null)
  const [showWorkshopModal, setShowWorkshopModal] = useState(null) // holds vehicle object
  const [workshopIncident, setWorkshopIncident] = useState(null)
  const [newExpense, setNewExpense] = useState({ monto: '', descripcion: '' })
  const [diagnosis, setDiagnosis] = useState('')
  const [solution, setSolution] = useState('')
  const [newItem, setNewItem] = useState({ nombre: '', frecuencia: 5000, ultimo_odometro: 0 })

  const fetchHealth = useCallback(async () => {
    try {
      const res = await callApi('mantenimiento.php')
      const rawData = res?.data || res
      setFleetHealth(Array.isArray(rawData) ? rawData : [])
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    let ignore = false
    const init = async () => {
      if (!ignore) await fetchHealth()
    }
    init()
    return () => { ignore = true }
  }, [fetchHealth])

  const fetchWorkshopIncident = async (vId) => {
    try {
      const res = await callApi(`fleet/workshop.php?vehiculo_id=${vId}`)
      setWorkshopIncident(res)
      setDiagnosis(res.diagnostico || '')
      setSolution(res.solucion || '')
    } catch { /* Handled */ }
  }

  const handleOpenWorkshop = (vehicle) => {
    setShowWorkshopModal(vehicle)
    fetchWorkshopIncident(vehicle.id)
  }

  const handleUpdateDiagnosis = async () => {
    if (!workshopIncident) return
    try {
      await callApi('fleet/workshop.php', {
        method: 'PUT',
        body: JSON.stringify({ id: workshopIncident.id, diagnostico: diagnosis })
      })
      fetchWorkshopIncident(showWorkshopModal.id)
    } catch { /* Handled */ }
  }

  const handleAddSparePart = async () => {
    if (!workshopIncident || !newExpense.monto) return
    try {
      await callApi('fleet/workshop.php', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'add_expense', 
          incidencia_id: workshopIncident.id,
          vehiculo_id: showWorkshopModal.id,
          monto: newExpense.monto,
          descripcion: newExpense.descripcion || 'Repuesto/Servicio'
        })
      })
      setNewExpense({ monto: '', descripcion: '' })
      fetchWorkshopIncident(showWorkshopModal.id)
    } catch { /* Handled */ }
  }

  const handleFinalizeRepair = async () => {
    if (!workshopIncident) return
    if (!window.confirm('¿Confirmas que la unidad está 100% operativa para volver a ruta?')) return
    try {
      await callApi('fleet/workshop.php', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'finalize_repair', 
          incidencia_id: workshopIncident.id,
          vehiculo_id: showWorkshopModal.id,
          solucion: solution || 'Reparación completada'
        })
      })
      setShowWorkshopModal(null)
      fetchHealth()
    } catch { /* Handled */ }
  }

  const handleReset = async (itemId, currentOdo) => {
    if (!window.confirm('¿Confirmas que se ha realizado este servicio?')) return
    try {
      await callApi('mantenimiento.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'record_service', item_id: itemId, odometro_valor: currentOdo })
      })
      fetchHealth()
    } catch { /* Handled */ }
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
    } catch { /* Handled */ }
  }

  const safeFleet = Array.isArray(fleetHealth) ? fleetHealth : []
  const totalCritical = safeFleet.reduce((acc, v) => acc + (v?.items || []).filter(i => i.estado === 'critico').length, 0)

  return (
    <div>
      {/* Header */}
      <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '24px' }}>
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
        {safeFleet.map((v, i) => (
          <Motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass"
            style={{ padding: '32px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Workshop Badge if in maintenance */}
            {v.estado === 'mantenimiento' && (
                <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 20 }}>
                     <button 
                        onClick={() => handleOpenWorkshop(v)}
                        className="btn-status-pill maintenance" 
                        style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', fontWeight: 900, fontSize: '10px' }}
                     >
                         <Wrench size={14} /> GESTIONAR REPARACIÓN
                     </button>
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 10 }}>
              <div className="p-flex-responsive p-justify-between" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
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
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <Plus size={18} /> <span className="text-nowrap" style={{ fontSize: '10px' }}>AÑADIR RECORDATORIO</span>
                </button>
              </div>

              {/* Items Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {(v?.items || []).map((item) => (
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

      {/* Workshop Control Modal */}
      <AnimatePresence>
        {showWorkshopModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWorkshopModal(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            />
            <Motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="glass"
              style={{ position: 'relative', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '40px', padding: '0', background: '#0a0d14' }}
            >
              <div style={{ padding: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99, 102, 241, 0.03)' }}>
                  <div>
                    <h2 className="neon-text" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px' }}>Reparación Profesional</h2>
                    <p style={{ color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gestión de Unidad: <span style={{ color: 'white' }}>{showWorkshopModal.placa}</span></p>
                  </div>
                  <X size={24} onClick={() => setShowWorkshopModal(null)} style={{ cursor: 'pointer', color: 'var(--text-dim)' }} />
              </div>

              <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
                  {/* Left Column: Report & Diagnosis */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      <section>
                          <h4 style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertTriangle size={14} /> Reporte Original (Chofer)
                          </h4>
                          <div className="glass" style={{ padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)' }}>
                              <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.6 }}>{workshopIncident?.descripcion || 'Cargando reporte...'}</p>
                              {workshopIncident?.foto_path && workshopIncident.foto_path !== 'uploads/no-photo.jpg' && (
                                  <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                      <img src={workshopIncident.foto_path} alt="Evidencia" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                  </div>
                              )}
                          </div>
                      </section>

                      <section>
                          <h4 style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Pencil size={14} /> Diagnóstico Técnico (Taller)
                          </h4>
                          <textarea 
                             value={diagnosis}
                             onChange={(e) => setDiagnosis(e.target.value)}
                             placeholder="Escribe el diagnóstico identificado por los mecánicos..."
                             style={{ width: '100%', height: '120px', padding: '20px', background: '#121421', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', color: 'white', outline: 'none', fontSize: '0.9rem', marginBottom: '12px' }}
                          />
                          <button onClick={handleUpdateDiagnosis} className="btn-secondary" style={{ width: '100%', height: '48px', fontSize: '11px', fontWeight: 900 }}>
                              GUARDAR DIAGNÓSTICO
                          </button>
                      </section>
                  </div>

                  {/* Right Column: Spare Parts & Finalization */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      <section>
                          <h4 style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <DollarSign size={14} /> Gestión de Repuestos / Gastos
                          </h4>
                          <div className="glass" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 48px', gap: '12px' }}>
                                  <input 
                                     type="number" placeholder="USD" 
                                     value={newExpense.monto} onChange={(e) => setNewExpense({...newExpense, monto: e.target.value})}
                                     style={{ background: '#0a0d14', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: 'white', textAlign: 'center', fontWeight: 'bold' }}
                                  />
                                  <input 
                                     type="text" placeholder="¿Qué se compró?" 
                                     value={newExpense.descripcion} onChange={(e) => setNewExpense({...newExpense, descripcion: e.target.value})}
                                     style={{ background: '#0a0d14', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: 'white' }}
                                  />
                                  <button onClick={handleAddSparePart} className="p-flex p-items-center p-justify-center" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px' }}><Plus size={20} /></button>
                              </div>

                              {/* Expense List */}
                              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 {workshopIncident?.expenses?.map(exp => (
                                     <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.8rem' }}>
                                         <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>{exp.descripcion}</span>
                                         <span style={{ color: 'white', fontWeight: 900 }}>${formatNumber(exp.monto)}</span>
                                     </div>
                                 ))}
                                 {(!workshopIncident?.expenses || workshopIncident.expenses.length === 0) && (
                                     <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Sin gastos registrados</p>
                                 )}
                              </div>
                          </div>
                      </section>

                      <section style={{ marginTop: 'auto' }}>
                          <h4 style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px' }}>Cierre y Entrega</h4>
                          <textarea 
                             value={solution}
                             onChange={(e) => setSolution(e.target.value)}
                             placeholder="Resumen de la solución aplicada..."
                             style={{ width: '100%', height: '80px', padding: '20px', background: '#121421', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', color: 'white', outline: 'none', fontSize: '0.9rem', marginBottom: '12px' }}
                          />
                          <button onClick={handleFinalizeRepair} className="btn-primary" style={{ width: '100%', height: '64px', fontSize: '14px', fontWeight: 900, borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)' }}>
                              <CheckCircle2 size={20} /> FINALIZAR Y REACTIVAR UNIDAD
                          </button>
                      </section>
                  </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

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
