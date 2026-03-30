import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import { AlertTriangle, Plus, Activity, Car, Clock, Settings, CheckCircle2, DollarSign, Pencil, RefreshCw, X, Wrench, History, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '../utils/DashboardConstants'

const MaintenanceCenter = ({ setActiveView }) => {
  const { callApi } = useApi()
  const [fleetHealth, setFleetHealth] = useState([])
  const [serviceCatalog, setServiceCatalog] = useState([])
  const [showAddModal, setShowAddModal] = useState(null)
  const [showWorkshopModal, setShowWorkshopModal] = useState(null) // holds vehicle object
  const [workshopIncident, setWorkshopIncident] = useState(null)
  const [newExpense, setNewExpense] = useState({ monto: '', descripcion: '' })
  const [diagnosis, setDiagnosis] = useState('')
  const [solution, setSolution] = useState('')
  const [newItem, setNewItem] = useState({ nombre: '', frecuencia: 5000, ultimo_odometro: 0 })
  const [showHistory, setShowHistory] = useState(false)
  const [repairHistory, setRepairHistory] = useState([])
  const [filterMode, setFilterMode] = useState('issues') // 'issues', 'fallas', 'vencidos', 'all'
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  
  // History Expansion & Search (v39.2)
  const [historySearchTerm, setHistorySearchTerm] = useState('')
  const [expandedHistoryId, setExpandedHistoryId] = useState(null)

  const fetchHealth = useCallback(async () => {
    try {
      const res = await callApi('mantenimiento.php')
      const data = res?.data || res
      setFleetHealth(data?.health_report || [])
      setServiceCatalog(data?.catalog || [])
    } catch { /* Handled */ }
  }, [callApi])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await callApi(`workshop.php?history=1&t=${Date.now()}`)
      console.log('📦 [DEBUG] Respuesta Historial Recibida:', res);
      
      const rawItems = res?.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : [])
      
      // BLINDAJE v40.7: Deduplicación y Consolidación por Placa (Hard Fix)
      const uniqueMap = {}
      rawItems.forEach(item => {
          if (!item || !item.id) return
          const key = item.placa || `ID-${item.id}`
          
          if (!uniqueMap[key]) {
              uniqueMap[key] = { 
                  ...item, 
                  diagnostico: item.diagnostico || '',
                  expenses: Array.isArray(item.expenses) ? [...item.expenses] : []
              }
          } else {
              // Si ya existe (fantasma), buscamos el más completo o sumamos
              uniqueMap[key].total_gasto = (parseFloat(uniqueMap[key].total_gasto) || 0) + (parseFloat(item.total_gasto) || 0)
              
              const newExpenses = Array.isArray(item.expenses) ? item.expenses : []
              uniqueMap[key].expenses = [...uniqueMap[key].expenses, ...newExpenses]
              
              const currentDiag = uniqueMap[key].diagnostico || ''
              const itemDiag = item.diagnostico || ''
              
              if (itemDiag && !currentDiag.includes(itemDiag)) {
                  uniqueMap[key].diagnostico = currentDiag ? `${currentDiag} | ${itemDiag}` : itemDiag
              }
          }
      })

      const items = Object.values(uniqueMap)
      console.log('📜 [DEBUG] Registros Consolidados:', items.length);
      setRepairHistory(items)
    } catch (err) { 
      console.error('❌ [DEBUG] Fallo al cargar historial:', err);
    }
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

  useRealtime((event) => {
    if (event.type === 'UPDATE_FLEET' || event.type === 'REFRESH_FLEET') {
      console.log('🔄 Sincronización en tiempo real: Actualizando Salud de Flota e Historial...');
      fetchHealth();
      fetchHistory();
    }
  })

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
    if (!vId) return
    try {
      const res = await callApi(`workshop.php?vehiculo_id=${vId}`)
      if (!res) return
      setWorkshopIncident(res)
      // Extraemos diagnóstico/solución del incidente más reciente para visualización
      setDiagnosis(res?.latest?.diagnostico || '')
      setSolution(res?.latest?.solucion || '')
    } catch { /* Handled */ }
  }

  const handleOpenWorkshop = (vehicle) => {
    setShowWorkshopModal(vehicle)
    fetchWorkshopIncident(vehicle.id)
  }

  const handleUpdateDiagnosis = async () => {
    const latestIncId = workshopIncident?.latest?.id
    if (!latestIncId) {
        console.warn("⚠️ No se puede guardar diagnóstico: No hay incidente activo seleccionado.");
        return
    }
    
    try {
      await callApi('workshop.php', {
        method: 'PUT',
        body: JSON.stringify({ id: latestIncId, diagnostico: diagnosis })
      })
      fetchWorkshopIncident(showWorkshopModal.id)
    } catch { /* Handled */ }
  }

  const handleAddSparePart = async () => {
    // We link expenses to the LATEST incident for tracking, 
    // but in Option 1 they are all 'merged' in the owner's view.
    const latestIncId = workshopIncident?.incidents?.[0]?.id || workshopIncident?.latest?.id
    if (!latestIncId || !newExpense.monto) return
    
    try {
      await callApi('fleet/workshop.php', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'add_expense', 
          incidencia_id: latestIncId,
          vehiculo_id: showWorkshopModal.id,
          monto: newExpense.monto,
          descripcion: newExpense.descripcion || 'Repuesto/Servicio'
        })
      })
      setNewExpense({ monto: '', descripcion: '' })
      fetchWorkshopIncident(showWorkshopModal.id)
    } catch { /* Handled */ }
  }

  const handleAddObservation = async (desc) => {
    if (!desc) return
    try {
      await callApi('fleet/workshop.php', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'add_incident_from_workshop', 
          vehiculo_id: showWorkshopModal.id,
          descripcion: desc
        })
      })
      fetchWorkshopIncident(showWorkshopModal.id)
    } catch { /* Handled */ }
  }

  const handleFinalizeRepair = async () => {
    if (!showWorkshopModal) return
    if (!window.confirm('¿Confirmas que la unidad está 100% operativa para volver a ruta?')) return
    try {
      await callApi('fleet/workshop.php', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'finalize_repair', 
          vehiculo_id: showWorkshopModal.id,
          solucion: solution || 'Reparación integral completada'
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
      const res = await callApi('mantenimiento.php', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'add_item', 
          vehiculo_id: showAddModal,
          ...newItem
        })
      })
      
      if (res?.error) {
        alert(res.error)
        return
      }

      setShowAddModal(null)
      setNewItem({ nombre: '', frecuencia: 5000, ultimo_odometro: 0 })
      fetchHealth()
    } catch (err) {
      if (err.data?.error) alert(err.data.error)
    }
  }

  const safeFleet = Array.isArray(fleetHealth) ? fleetHealth : []
  
  const stats = (safeFleet || []).reduce((acc, v) => {
      if (!v) return acc
      const hasIncidents = (v.active_incidents || []).length > 0
      const hasExpired = (v.items || []).some(i => i?.estado === 'critico')
      const isAtWorkshop = v.estado === 'mantenimiento'
      
      if (hasIncidents) acc.incidents++
      if (hasExpired) acc.expired++
      if (!hasIncidents && !hasExpired && !isAtWorkshop) acc.ok++
      
      return acc
  }, { incidents: 0, expired: 0, ok: 0 })

  const filteredFleet = (safeFleet || []).filter(v => {
      if (!v) return false
      const placa = v?.placa || ''
      const modelo = v?.modelo || ''
      const matchesSearch = placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            modelo.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) return false

      const hasIncidents = (v.active_incidents || []).length > 0
      const hasExpired = (v.items || []).some(i => i?.estado === 'critico')
      const isAtWorkshop = v.estado === 'mantenimiento'
      const isHealthy = !(hasIncidents || hasExpired || isAtWorkshop)

      if (filterMode === 'fallas') return hasIncidents || isAtWorkshop
      if (filterMode === 'vencidos') return hasExpired
      if (filterMode === 'all') return isHealthy
      
      return hasIncidents || hasExpired || isAtWorkshop
  })

  return (
    <div>
      {/* Header */}
      <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => setActiveView && setActiveView('dashboard')}
            className="p-glass-premium clickable-hover"
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.5)" />
          </button>
          <div>
            <h1 className="h1-premium neon-text">Centro de Mantenimiento</h1>
            <p className="p-subtitle">Control por excepción de la operatividad</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary"
            style={{ height: '42px', padding: '0 20px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', border: showHistory ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)' }}
          >
            <History size={16} /> {showHistory ? 'VOLVER A FLOTA' : 'VER HISTORIAL'}
          </button>
        </div>
      </header>

      {/* Summary Dashboard (Mobile Thumb-Friendly) */}
      {!showHistory && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={() => setFilterMode('fallas')}
            className={`glass ${filterMode === 'fallas' ? 'border-primary' : ''}`}
            style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none', border: filterMode === 'fallas' ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.05)', background: filterMode === 'fallas' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)' }}
          >
            <AlertTriangle size={20} color={stats.incidents > 0 ? 'var(--danger)' : 'var(--text-dim)'} />
            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Fallas</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>{stats.incidents}</span>
          </button>
          
          <button 
            onClick={() => setFilterMode('vencidos')}
            className={`glass ${filterMode === 'vencidos' ? 'border-primary' : ''}`}
            style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none', border: filterMode === 'vencidos' ? '1px solid var(--warning)' : '1px solid rgba(255,255,255,0.05)', background: filterMode === 'vencidos' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)' }}
          >
            <Wrench size={20} color={stats.expired > 0 ? 'var(--warning)' : 'var(--text-dim)'} />
            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Vencidos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>{stats.expired}</span>
          </button>
          
          <button 
            onClick={() => setFilterMode('all')}
            className={`glass ${filterMode === 'all' ? 'border-primary' : ''}`}
            style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none', border: filterMode === 'all' ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.05)', background: filterMode === 'all' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)' }}
          >
            <CheckCircle2 size={20} color={stats.ok > 0 ? 'var(--success)' : 'var(--text-dim)'} />
            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Al día</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>{stats.ok}</span>
          </button>
        </div>
      )}

      {!showHistory && (
        <div style={{ marginBottom: '24px' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
             <Activity size={18} className="text-primary" style={{ opacity: 0.5 }} />
             <input 
                type="text" 
                placeholder="Buscar por placa o modelo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem', fontWeight: 600 }}
             />
             {searchTerm && <X size={18} onClick={() => setSearchTerm('')} style={{ cursor: 'pointer', opacity: 0.5 }} />}
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{ marginBottom: '24px' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
             <History size={18} className="text-primary" style={{ opacity: 0.5 }} />
             <input 
                type="text" 
                placeholder="Buscar en el historial (placa, diagnóstico...)" 
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem', fontWeight: 600 }}
             />
             {historySearchTerm && <X size={18} onClick={() => setHistorySearchTerm('')} style={{ cursor: 'pointer', opacity: 0.5 }} />}
          </div>
        </div>
      )}

      {showHistory ? (
        /* History Case (v39.2 Optimized) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade">
            {(() => {
                const filteredHistory = (repairHistory || []).filter(h => {
                    const term = (historySearchTerm || '').toLowerCase()
                    return (h.placa || '').toLowerCase().includes(term) || 
                           (h.diagnostico || '').toLowerCase().includes(term) || 
                           (h.solucion || '').toLowerCase().includes(term)
                })

                if (filteredHistory.length === 0) {
                    return (
                        <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
                            <History size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                            <p style={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>No hay registros que coincidan</p>
                        </div>
                    )
                }

                return filteredHistory.map((h, idx) => (
                    <div key={h?.id || `hist-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <Motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`glass ${expandedHistoryId === h.id ? 'active' : 'glass-hover'}`}
                            onClick={() => setExpandedHistoryId(expandedHistoryId === h.id ? null : h.id)}
                            style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '32px', alignItems: 'center', cursor: 'pointer', border: expandedHistoryId === h.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', background: expandedHistoryId === h.id ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)' }}
                        >
                            <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vehículo</span>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>{h?.placa || '---'}</h3>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>{h?.created_at ? new Date(h.created_at).toLocaleDateString() : 'Fecha N/A'}</p>
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
                                <div style={{ fontSize: '1.75rem', fontWeight: 950, color: 'white', marginTop: '4px' }}>
                                    ${formatNumber(h.total_gasto || 0)}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 900, textTransform: 'uppercase' }}>
                                    {h.expenses?.length || 0} Repuestos vinculados
                                </div>
                            </div>
                        </Motion.div>

                        <AnimatePresence>
                            {expandedHistoryId === h.id && (
                                <Motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="glass"
                                    style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.01)', overflow: 'hidden', borderTop: 'none', borderRadius: '0 0 24px 24px' }}
                                >
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <History size={14} className="text-primary" /> Desglose de Gastos
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {(h.expenses && h.expenses.length > 0) ? (
                                            h.expenses.map((exp, eidx) => (
                                                <div key={exp.id || eidx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <span style={{ color: 'white', fontWeight: 600 }}>{exp.descripcion}</span>
                                                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>${formatNumber(exp.monto)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>No hay repuestos registrados para esta incidencia.</p>
                                        )}
                                    </div>
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))
            })()}
        </div>
      ) : (
        /* Priority Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredFleet.length === 0 && (
             <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ opacity: 0.1, marginBottom: '24px' }} />
                <p style={{ color: 'white', fontWeight: 950, fontSize: '1.5rem', textTransform: 'uppercase' }}>¡Todo en orden!</p>
                <p style={{ color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.9rem', marginTop: '4px' }}>No hay unidades que requieran atención inmediata.</p>
                <button 
                   onClick={() => setFilterMode('all')}
                   className="btn-secondary" style={{ marginTop: '24px', height: '48px', padding: '0 32px' }}
                >MOSTRAR TODA LA FLOTA</button>
             </div>
          )}
          {filteredFleet.map((v, i) => {
            if (!v) return null
            const hasIncidents = (v.active_incidents || []).length > 0
            const hasExpired = (v.items || []).some(i => i?.estado === 'critico')
            const isAtWorkshop = v.estado === 'mantenimiento'
            const isExpanded = expandedId === v.id
            
            // Status Logic
            let statusColor = 'var(--success)'
            let statusLabel = 'Operativo'
            if (hasIncidents || isAtWorkshop) { statusColor = 'var(--danger)'; statusLabel = 'Falla / Auditoría'; }
            else if (hasExpired) { statusColor = 'var(--warning)'; statusLabel = 'Mantenimiento'; }

            return (
              <Motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass"
                style={{ 
                    padding: '0', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    border: isExpanded ? `1px solid ${statusColor}` : '1px solid rgba(255,255,255,0.05)',
                    background: isExpanded ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    marginBottom: '12px'
                }}
              >
                {/* COMPACT ROW HEADER */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  style={{ 
                    padding: '20px 24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    cursor: 'pointer' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: statusColor, 
                        boxShadow: `0 0 12px ${statusColor}`,
                        flexShrink: 0
                    }} className="animate-pulse" />
                    
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{v?.placa || '---'}</h3>
                      <p style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>
                        {v?.modelo || 'Generic'} <span style={{ opacity: 0.3, margin: '0 6px' }}>|</span> {formatNumber(v?.odometro_actual || 0)} KM
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="mobile-hide" style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{statusLabel}</span>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                            {hasIncidents ? `${v?.active_incidents?.length || 0} Falla(s)` : hasExpired ? 'Servicio Vencido' : 'Al día'}
                        </p>
                    </div>
                    <ChevronRight 
                      size={20} 
                      style={{ 
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.3s ease',
                        color: 'rgba(255,255,255,0.2)' 
                      }} 
                    />
                  </div>
                </div>

                {/* EXPANDABLE BODY */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <Motion.div
                      key={`expanded-content-${v.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 24px 32px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                        
                        {/* Actions Bar inside expanded unit */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setNewItem(prev => ({ ...prev, ultimo_odometro: v.odometro_actual })); setShowAddModal(v.id); }}
                                className="btn-secondary" style={{ flex: 1, height: '44px', fontSize: '10px', fontWeight: 900 }}
                            >
                                <Plus size={16} /> AÑADIR RECORDATORIO
                            </button>
                        </div>

                        {/* 2. CONSOLIDATED INCIDENT CARD (Option 1) */}
                        {v.active_incidents?.length > 0 && (
                          <div style={{ marginBottom: '24px' }}>
                              <div 
                                className="glass"
                                style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px', isolation: 'isolate' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                  <AlertTriangle size={28} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                  <div style={{ flex: 1 }}>
                                     <p style={{ color: 'var(--danger)', fontWeight: 950, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                                        ACCIÓN REQUERIDA — {v.active_incidents.length} REPORTE(S) ACTIVO(S)
                                     </p>
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {v.active_incidents.map((inc, idx) => (
                                          <div key={inc.id || idx}>
                                              <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', opacity: 0.9 }}>
                                                • {inc.descripcion}
                                              </p>
                                              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginLeft: '12px', marginTop: '2px' }}>
                                                REPORTADO POR: <span style={{ color: 'var(--accent)' }}>{inc.reportero_nombre || 'SISTEMA'}</span>
                                              </p>
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                                </div>
                                <button onClick={() => handleOpenWorkshop(v)} className="btn-primary" style={{ height: '56px', background: 'var(--danger)', borderRadius: '14px', fontSize: '12px', fontWeight: 950, letterSpacing: '0.05em', boxShadow: '0 15px 30px -5px rgba(239, 68, 68, 0.4)' }}>
                                  <Activity size={18} /> AUDITAR Y GESTIONAR GASTOS
                                </button>
                              </div>
                          </div>
                        )}

                        {/* 3. PREVENTIVE TASKS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                          {(v?.items || []).map((item, itIdx) => (
                            <div key={item?.id || `item-${v.id}-${itIdx}`} className="glass" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                  <h4 style={{ fontSize: '0.95rem', fontWeight: 950, color: 'white' }}>{item.nombre}</h4>
                                  <p style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 800 }}>Cada {formatNumber(item.frecuencia)} km</p>
                                </div>
                                <div style={{ 
                                  padding: '4px 10px', borderRadius: '100px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase',
                                  background: item.estado === 'critico' ? 'var(--danger)' : item.estado === 'advertencia' ? 'var(--warning)' : 'rgba(16, 185, 129, 0.1)',
                                  color: item.estado === 'critico' || item.estado === 'advertencia' ? 'black' : 'var(--success)'
                                }}>
                                  {item.estado === 'critico' ? 'VENCIDO' : item.estado === 'advertencia' ? 'PRÓXIMO' : 'OK'}
                                </div>
                              </div>

                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                                <Motion.div initial={{ width: 0 }} animate={{ width: `${item.progreso}%` }} style={{ height: '100%', background: item.estado === 'critico' ? 'var(--danger)' : item.estado === 'advertencia' ? 'var(--warning)' : 'var(--success)' }} />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>REMANENTE</span>
                                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: item.estado === 'critico' ? '#ff4d4d' : '#00f2ff' }}>
                                    {formatNumber(item.km_restantes)} <small style={{ fontSize: '0.6rem' }}>KM</small>
                                  </span>
                                </div>
                                <button 
                                  onClick={() => handleReset(item.id, v.odometro_actual)}
                                  className="btn-secondary"
                                  style={{ height: '36px', width: '36px', padding: 0, borderRadius: '10px' }}
                                >
                                  <Activity size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {(v?.items || []).length === 0 && !hasIncidents && (
                            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '10px', padding: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Sin tareas configuradas</p>
                          )}
                        </div>

                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </Motion.div>
            )})}
        </div>
      )}

      {/* Workshop Control Modal */}
      <AnimatePresence>
        {showWorkshopModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWorkshopModal(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}
            />
            <Motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 40, opacity: 0 }}
              className="glass"
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '900px', 
                maxHeight: '92vh', 
                overflowY: 'auto', 
                borderRadius: '32px', 
                padding: '0', 
                background: '#070a0f',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)'
              }}
            >
              {/* MODAL HEADER */}
              <div style={{ padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), transparent)' }}>
                  <div>
                    <h2 className="neon-text" style={{ fontSize: '1.75rem', fontWeight: 950, marginBottom: '4px', letterSpacing: '-0.03em' }}>Auditoría y Control</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '10px', fontWeight: 900, color: 'var(--accent)' }}>{showWorkshopModal?.placa || '---'}</div>
                        <p style={{ color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{showWorkshopModal?.modelo || ''}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowWorkshopModal(null)} 
                    style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => { 
                        e.currentTarget.style.background = '#ef4444'; 
                        e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
                        e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => { 
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; 
                        e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                  >
                    <span style={{ 
                        color: 'white', 
                        fontSize: '24px', 
                        fontWeight: '900', 
                        lineHeight: 1, 
                        display: 'block',
                        fontFamily: 'Arial, sans-serif'
                    }}>✕</span>
                  </button>
              </div>

              <div style={{ padding: '24px 40px 40px 40px' }} className="p-flex-responsive p-gap-40">
                  {/* COLUMNA IZQUIERDA: REPORTES Y DIAGNÓSTICO */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      
                      <section>
                          <h4 style={{ color: '#6366f1', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.1em' }}>
                              <AlertTriangle size={14} /> REPORTES ACTIVOS ({workshopIncident?.incidents?.length || 0})
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {(workshopIncident?.incidents || []).map((inc, incIdx) => (
                                  <div key={inc.id || incIdx} className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                          <span style={{ fontSize: '9px', fontWeight: 950, color: 'var(--accent)', textTransform: 'uppercase' }}>{inc.tipo}</span>
                                          <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)' }}>{inc.created_at ? new Date(inc.created_at).toLocaleDateString() : 'Pendiente'}</span>
                                      </div>
                                      <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>{inc.descripcion}</p>
                                      {inc.foto_path && inc.foto_path !== 'uploads/no-photo.jpg' && (
                                          <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                              <img src={inc.foto_path} alt="Evidencia" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                                          </div>
                                      )}
                                  </div>
                              ))}
                              
                              {/* Botón para que el dueño agregue observaciones */}
                              <button 
                                onClick={() => {
                                    const val = window.prompt('Escriba el hallazgo técnico encontrado (ej: Fuga en manguera de retorno):');
                                    if (val) handleAddObservation(val);
                                }}
                                style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed rgba(99, 102, 241, 0.3)', borderRadius: '12px', color: 'var(--primary)', fontSize: '10px', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              >
                                  <Plus size={14} /> AÑADIR HALLAZGO ADICIONAL
                              </button>
                          </div>
                      </section>

                      <section>
                          <h4 style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.1em' }}>
                              <Pencil size={14} /> DIAGNÓSTICO TÉCNICO
                          </h4>
                          <textarea 
                             value={diagnosis}
                             onChange={(e) => setDiagnosis(e.target.value)}
                             placeholder="Escriba aquí los hallazgos mecánicos detallados..."
                             style={{ width: '100%', minHeight: '140px', padding: '24px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', color: 'white', outline: 'none', fontSize: '0.95rem', marginBottom: '16px', resize: 'none', transition: 'border-color 0.3s' }}
                             onFocus={(e) => e.target.style.borderColor = 'var(--success)'}
                             onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                          />
                          <button onClick={handleUpdateDiagnosis} className="btn-secondary" style={{ width: '100%', height: '52px', fontSize: '11px', fontWeight: 950, letterSpacing: '0.05em', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <CheckCircle2 size={16} /> GUARDAR AVANCE DEL DIAGNÓSTICO
                          </button>
                      </section>
                  </div>

                  {/* COLUMNA DERECHA: GASTOS Y CIERRE */}
                  <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      
                      <section>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h4 style={{ color: 'var(--warning)', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.1em' }}>
                                  <DollarSign size={14} /> LISTA DE REPUESTOS Y GASTOS
                              </h4>
                              <div style={{ fontSize: '0.75rem', fontWeight: 950, color: 'white', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '100px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                  TOTAL: ${formatNumber((workshopIncident?.expenses || []).reduce((acc, e) => acc + parseFloat(e.monto || 0), 0))}
                              </div>
                          </div>

                          <div className="glass" style={{ padding: '24px', borderRadius: '28px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box' }}>
                              {/* Formulario de Entrada Modernizado */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.03)', alignItems: 'center' }}>
                                  <div style={{ position: 'relative', width: '85px', flexShrink: 0 }}>
                                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>$</span>
                                      <input 
                                         type="number" placeholder="0.00" 
                                         value={newExpense.monto} onChange={(e) => setNewExpense({...newExpense, monto: e.target.value})}
                                         style={{ width: '100%', background: '#05070a', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '12px 10px 12px 24px', borderRadius: '10px', color: 'white', fontWeight: 900, outline: 'none', fontSize: '0.9rem' }}
                                      />
                                  </div>
                                  <div style={{ flex: '1', minWidth: '150px' }}>
                                      <input 
                                         type="text" placeholder="Repuesto / Labor..." 
                                         value={newExpense.descripcion} onChange={(e) => setNewExpense({...newExpense, descripcion: e.target.value})}
                                         style={{ width: '100%', background: '#05070a', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: '10px', color: 'white', fontWeight: 600, outline: 'none', fontSize: '0.85rem' }}
                                      />
                                  </div>
                                  <button 
                                    onClick={handleAddSparePart} 
                                    className="btn-primary"
                                    style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        borderRadius: '10px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        padding: 0,
                                        background: 'var(--primary)',
                                        border: 'none',
                                        boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
                                    }}
                                  >
                                    <Plus size={20} strokeWidth={3} />
                                  </button>
                              </div>

                              {/* Lista de Gastos Acumulados */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                                 <AnimatePresence mode="popLayout">
                                  {(workshopIncident?.expenses || []).map((exp, eIdx) => (
                                      <Motion.div 
                                         key={exp?.id ? `exp-obj-${exp.id}` : `exp-idx-${eIdx}`} 
                                         initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                         style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}
                                      >
                                          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>{exp?.descripcion || 'Gasto'}</span>
                                          <span style={{ color: 'white', fontWeight: 950, fontSize: '0.9rem' }}>${formatNumber(exp?.monto || 0)}</span>
                                      </Motion.div>
                                  ))}
                                 </AnimatePresence>
                                 {(!workshopIncident?.expenses || workshopIncident.expenses.length === 0) && (
                                     <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.2 }}>
                                         <DollarSign size={32} style={{ margin: '0 auto 12px' }} />
                                         <p style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Ingresa los gastos para totalizar</p>
                                     </div>
                                 )}
                              </div>
                          </div>
                      </section>

                      <section style={{ marginTop: 'auto' }}>
                          <h4 style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>RETIRO DE UNIDAD</h4>
                          <textarea 
                             value={solution}
                             onChange={(e) => setSolution(e.target.value)}
                             placeholder="Explicación final de la solución aplicada..."
                             style={{ width: '100%', height: '90px', padding: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', color: 'white', outline: 'none', fontSize: '0.9rem', marginBottom: '16px', resize: 'none' }}
                          />
                          <button onClick={handleFinalizeRepair} className="btn-primary" style={{ width: '100%', height: '68px', fontSize: '0.85rem', fontWeight: 950, borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.5)', background: 'linear-gradient(135deg, var(--primary), #4f46e5)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={20} /> FINALIZAR Y ACTIVAR UNIDAD
                              </div>
                              <span style={{ fontSize: '9px', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>La unidad volverá a estar disponible para rutas</span>
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
                    list="services-list"
                    type="text" 
                    placeholder="Seleccione o escriba un servicio..."
                    value={newItem.nombre}
                    onChange={(e) => setNewItem({...newItem, nombre: e.target.value})}
                    className="glass"
                    style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%', fontWeight: 800, outline: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <datalist id="services-list">
                    {serviceCatalog.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Frecuencia (KM)</label>
                    <input 
                      type="number" 
                      value={newItem.frecuencia}
                      onChange={(e) => setNewItem({...newItem, frecuencia: e.target.value})}
                      className="glass"
                      style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%', fontWeight: 800, outline: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Último Servicio (KM)</label>
                    <input 
                      type="number" 
                      value={newItem.ultimo_odometro}
                      onChange={(e) => setNewItem({...newItem, ultimo_odometro: e.target.value})}
                      className="glass"
                      style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%', fontWeight: 800, outline: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
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
