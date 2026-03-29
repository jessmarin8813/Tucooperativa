import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { AlertTriangle, Plus, Activity, Car, Clock, Settings, CheckCircle2, DollarSign, Pencil, RefreshCw, X, Wrench, History } from 'lucide-react'
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
  const [showHistory, setShowHistory] = useState(false)
  const [repairHistory, setRepairHistory] = useState([])

  const fetchHealth = useCallback(async () => {
    try {
      const res = await callApi('mantenimiento.php')
      const rawData = res?.data || res
      setFleetHealth(Array.isArray(rawData) ? rawData : [])
    } catch { /* Handled */ }
  }, [callApi])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await callApi('fleet/workshop.php?history=1')
      setRepairHistory(Array.isArray(res) ? res : [])
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    let ignore = false
    const init = async () => {
      const params = new URLSearchParams(window.location.search)
      if (params.get('history') === '1') setShowHistory(true)
      
      if (!ignore) await fetchHealth()
    }
    init()
    return () => { ignore = true }
  }, [fetchHealth])

  useEffect(() => {
    const url = new URL(window.location)
    if (showHistory) {
        url.searchParams.set('history', '1')
        fetchHistory()
    } else {
        url.searchParams.delete('history')
    }
    window.history.replaceState({}, '', url)
  }, [showHistory, fetchHistory])

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
    const val = window.prompt('Confirme el kilometraje actual para registrar este servicio:', currentOdo)
    if (val === null) return
    
    try {
      await callApi('mantenimiento.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'record_service', item_id: itemId, odometro_valor: val })
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary"
            style={{ height: '42px', padding: '0 20px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', border: showHistory ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)' }}
          >
            <History size={16} /> {showHistory ? 'VOLVER A FLOTA' : 'VER HISTORIAL'}
          </button>
          {totalCritical > 0 && !showHistory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }} className="animate-pulse">
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{totalCritical} ALERTAS</span>
            </div>
          )}
        </div>
      </header>

      {showHistory ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade">
            {repairHistory.length === 0 ? (
                <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
                    <History size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                    <p style={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>No hay registros de reparaciones finalizadas</p>
                </div>
            ) : (
                repairHistory.map((h, idx) => (
                    <Motion.div 
                        key={h.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass glass-hover"
                        style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '32px', alignItems: 'center' }}
                    >
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vehículo</span>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>{h.placa}</h3>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>{new Date(h.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Diagnóstico & Solución</span>
                            <p style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500, marginTop: '8px', lineHeight: 1.5 }}>
                                <span style={{ color: 'var(--warning)', fontWeight: 800 }}>D:</span> {h.diagnostico || 'Sin diagnóstico detallado'}<br/>
                                <span style={{ color: 'var(--success)', fontWeight: 800 }}>S:</span> {h.solucion || 'Finalizado'}
                            </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inversión Total</span>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>
                                ${formatNumber(h.total_gasto || 0)}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 900, textTransform: 'uppercase' }}>
                                {h.expenses?.length || 0} Repuestos vinculados
                            </div>
                        </div>
                    </Motion.div>
                ))
            )}
        </div>
      ) : (
        /* Fleet Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {safeFleet.map((v, i) => (
          <Motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass"
            style={{ padding: '24px', borderRadius: '32px', position: 'relative', overflow: 'hidden', border: v.active_incidents?.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* 1. VEHICLE HEADER (Mobile Optimized) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={20} className="text-primary" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{v.placa}</h3>
                  <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>{v.modelo} · {formatNumber(v.odometro_actual)} KM</p>
                </div>
              </div>
              <button 
                onClick={() => { setNewItem(prev => ({ ...prev, ultimo_odometro: v.odometro_actual })); setShowAddModal(v.id); }}
                className="btn-secondary" style={{ width: '36px', height: '36px', borderRadius: '10px', padding: 0 }}
              ><Plus size={18} /></button>
            </div>

            {/* 2. EMERGENCY INCIDENTS (High Visibility) */}
            {v.active_incidents?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {v.active_incidents.map(inc => (
                  <Motion.div 
                    key={inc.id} 
                    animate={{ scale: [1, 1.02, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="glass"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertTriangle size={24} color="var(--danger)" />
                      <div>
                         <p style={{ color: 'var(--danger)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Acción Requerida - {inc.tipo}</p>
                         <p style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{inc.descripcion}</p>
                      </div>
                    </div>
                    <button onClick={() => handleOpenWorkshop(v)} className="btn-primary" style={{ height: '48px', background: 'var(--danger)', borderRadius: '12px', fontSize: '11px', fontWeight: 900 }}>
                      <Wrench size={16} /> GESTIONAR EN TALLER
                    </button>
                  </Motion.div>
                ))}
              </div>
            )}

            {/* 3. PREVENTIVE TASKS (Action-Oriented) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {(v?.items || []).map((item) => (
                <div key={item.id} className="glass" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 950, color: 'white' }}>{item.nombre}</h4>
                      <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800 }}>Cada {formatNumber(item.frecuencia)} km</p>
                    </div>
                    <div style={{ 
                      padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
                      background: item.estado === 'critico' ? 'var(--danger)' : item.estado === 'advertencia' ? 'var(--warning)' : 'rgba(16, 185, 129, 0.1)',
                      color: item.estado === 'critico' || item.estado === 'advertencia' ? 'black' : 'var(--success)'
                    }}>
                      {item.estado === 'critico' ? 'VENCIDO' : item.estado === 'advertencia' ? 'PRÓXIMO' : 'OK'}
                    </div>
                  </div>

                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                    <Motion.div initial={{ width: 0 }} animate={{ width: `${item.progreso}%` }} style={{ height: '100%', background: item.estado === 'critico' ? 'var(--danger)' : item.estado === 'advertencia' ? 'var(--warning)' : 'var(--success)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 800 }}>Remanente</span>
                    <span style={{ color: item.estado === 'critico' ? 'var(--danger)' : 'white', fontWeight: 900 }}>{formatNumber(item.km_restantes)} KM</span>
                  </div>

                  <button 
                    onClick={() => handleReset(item.id, v.odometro_actual)}
                    className={item.estado === 'critico' ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: '100%', height: '52px', borderRadius: '16px', fontSize: '11px', fontWeight: 950, textTransform: 'uppercase', background: item.estado === 'critico' ? '#fff' : 'rgba(255,255,255,0.05)', color: item.estado === 'critico' ? '#000' : '#fff', border: item.estado === 'critico' ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Activity size={16} /> REGISTRAR SERVICIO
                  </button>
                </div>
              ))}
              {(v?.items || []).length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '11px', padding: '20px', fontWeight: 800, textTransform: 'uppercase' }}>Sin tareas preventivas configuradas</p>
              )}
            </div>
          </Motion.div>
        ))}
      </div>
      )}

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
