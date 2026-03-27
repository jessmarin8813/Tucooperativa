import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import { Wrench, Plus, DollarSign, Calendar, FileText, Truck, Search, Trash2, Settings } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { formatMoney } from '../utils/DashboardConstants'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ExpensesView = () => {
  const { callApi, loading } = useApi()
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    mantenimiento_item_id: '',
    categoria: 'otros',
    monto: '',
    moneda: 'USD',
    tasa_cambio: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  })
  const [maintItems, setMaintItems] = useState([])
  const [bcvRate, setBcvRate] = useState(1)

  const fetchMaintAlerts = useCallback(async (vid) => {
    if (!vid) {
        setMaintItems([])
        return
    }
    try {
        const res = await callApi('fleet/mantenimiento.php')
        const vehicle = res.find(v => v.id == vid)
        setMaintItems(vehicle?.items || [])
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    if (formData.vehiculo_id) {
        fetchMaintAlerts(formData.vehiculo_id)
    } else {
        setMaintItems([])
    }
  }, [formData.vehiculo_id, fetchMaintAlerts])

  const fetchData = useCallback(async () => {
    try {
      const expRes = await callApi('admin/expenses.php')
      const fleetRes = await callApi('vehiculos.php')
      const rateRes = await callApi('admin/get_rate.php')
      
      setExpenses(expRes.expenses || [])
      setVehicles(fleetRes || [])
      if (rateRes.rate) {
          setBcvRate(rateRes.rate)
          setFormData(prev => ({ ...prev, tasa_cambio: rateRes.rate }))
      }
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime update
  useRealtime((event) => {
    if (event.type === 'EXPENSES_UPDATE') {
      fetchData()
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await callApi('admin/expenses.php', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setShowForm(false)
      setFormData({
        vehiculo_id: '',
        mantenimiento_item_id: '',
        categoria: 'otros',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch { /* Handled */ } finally {
      setSaving(false)
    }
  }

  const categories = [
    { id: 'repuestos', label: 'Repuestos', color: '#3b82f6' },
    { id: 'mantenimiento', label: 'Mantenimiento', color: '#10b981' },
    { id: 'seguro', label: 'Seguro', color: '#f59e0b' },
    { id: 'otros', label: 'Otros', color: '#6b7280' }
  ]

  return (
    <div className="animate-fade">
      <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '40px' }}>
        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="h1-premium neon-text">Gastos Operativos</h1>
          <p className="p-subtitle">Control financiero de mantenimiento y activos</p>
        </Motion.div>

        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'CANCELAR' : <><Plus size={20} /> REGISTRAR GASTO</>}
        </button>
      </header>



      <AnimatePresence>
        {showForm && (
          <Motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass"
            style={{ padding: '48px', marginBottom: '40px', border: '1px solid var(--accent)' }}
          >
            <form onSubmit={handleSubmit} className="p-grid p-grid-cols-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Vehículo (Opcional)</label>
                <select 
                  value={formData.vehiculo_id} 
                  onChange={e => setFormData({...formData, vehiculo_id: e.target.value, mantenimiento_item_id: ''})}
                  className="glass"
                  style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 700, outline: 'none' }}
                >
                  <option value="" style={{ background: '#0a0b12' }}>Gasto General (Cooperativa)</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id} style={{ background: '#0a0b12' }}>{v.placa} - {v.modelo}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Categoría</label>
                <select 
                  value={formData.categoria} 
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                  className="glass"
                  style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 700, outline: 'none' }}
                >
                  {categories.map(c => <option key={c.id} value={c.id} style={{ background: '#0a0b12' }}>{c.label}</option>)}
                </select>
              </div>

              {/* Maintenance Item Link (Conditional) */}
              {(formData.categoria === 'repuestos' || formData.categoria === 'mantenimiento') && formData.vehiculo_id && maintItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em' }}>🔗 Vincular a Alerta de Mantenimiento</label>
                    <select 
                    value={formData.mantenimiento_item_id} 
                    onChange={e => {
                        const item = maintItems.find(i => i.id == e.target.value);
                        setFormData({
                            ...formData, 
                            mantenimiento_item_id: e.target.value,
                            descripcion: item ? `${item.nombre} - ${formData.descripcion}` : formData.descripcion
                        });
                    }}
                    className="glass"
                    style={{ padding: '16px', background: 'rgba(99,102,241,0.1)', border: '1px solid var(--accent)', color: 'white', fontWeight: 700, outline: 'none' }}
                    >
                    <option value="" style={{ background: '#0a0b12' }}>-- Seleccionar Alerta (Opcional) --</option>
                    {maintItems.map(item => (
                        <option key={item.id} value={item.id} style={{ background: '#0a0b12' }}>
                            {item.nombre} ({item.estado.toUpperCase()}) - {item.km_restantes} KM restantes
                        </option>
                    ))}
                    </select>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Monto</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                        value={formData.moneda} 
                        onChange={e => setFormData({...formData, moneda: e.target.value})}
                        className="glass"
                        style={{ padding: '16px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', fontWeight: 800, border: '1px solid var(--accent)' }}
                    >
                        <option value="USD">$ USD</option>
                        <option value="Bs">Bs. DIGITAL</option>
                    </select>
                    <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.monto} 
                    onChange={e => setFormData({...formData, monto: e.target.value})}
                    className="glass"
                    style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 800, outline: 'none', flex: 1 }}
                    placeholder="0.00"
                    />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Tasa BCV (1 USD = Bs)</label>
                <div style={{ position: 'relative' }}>
                    <input 
                    type="number" 
                    step="0.0001"
                    required
                    value={formData.tasa_cambio} 
                    onChange={e => setFormData({...formData, tasa_cambio: e.target.value})}
                    className="glass"
                    style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'var(--accent)', fontWeight: 800, outline: 'none', width: '100%' }}
                    />
                    {formData.monto && (
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                            {formData.moneda === 'USD' 
                                ? `≈ Bs ${(formData.monto * formData.tasa_cambio).toFixed(2)}`
                                : `≈ $ ${(formData.monto / formData.tasa_cambio).toFixed(2)}`
                            }
                        </div>
                    )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Fecha</label>
                <input 
                  type="date" 
                  required
                  value={formData.fecha} 
                  onChange={e => setFormData({...formData, fecha: e.target.value})}
                  className="glass"
                  style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 700, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: 'span 2' }}>
                <label className="text-label">Descripción / Concepto</label>
                <input 
                  type="text" 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="glass"
                  style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 700, outline: 'none' }}
                  placeholder="Ej: Cambio de pastillas de freno delanteras"
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '16px 48px', fontSize: '0.875rem', fontWeight: 800 }} disabled={saving}>
                  {saving ? 'PROCESANDO...' : 'GUARDAR REGISTRO'}
                </button>
              </div>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading && expenses.length === 0 ? (
          <LoadingSpinner />
        ) : expenses.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center' }} className="glass">
            <Search size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
            <p style={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>No se han registrado gastos aún</p>
          </div>
        ) : (
          expenses.map((exp, idx) => (
            <Motion.div 
              key={exp.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass glass-hover"
              style={{ padding: '24px 32px', position: 'relative', overflow: 'hidden' }}
            >
              <div className="p-flex-responsive p-justify-between p-items-center">
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: exp.categoria === 'repuestos' ? '#3b82f6' : exp.categoria === 'mantenimiento' ? '#10b981' : exp.categoria === 'seguro' ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                    <Wrench size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{exp.descripcion || 'Sin descripción'}</span>
                      {exp.item_nombre && <span style={{ padding: '4px 12px', background: 'rgba(99,102,241,0.2)', border: '1px solid var(--accent)', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>🔧 {exp.item_nombre}</span>}
                      <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{exp.categoria}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '32px', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: 'var(--accent)' }} /> {exp.fecha}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={14} style={{ color: 'var(--accent)' }} /> {exp.placa || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--danger)', letterSpacing: '-0.05em' }}>
                      -{exp.moneda === 'Bs' ? 'Bs' : '$'} {formatMoney(exp.monto).replace('$', '')}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                      {exp.moneda === 'Bs' 
                        ? `(≈ $ ${(exp.monto / (exp.tasa_cambio || bcvRate)).toFixed(2)}) @ ${exp.tasa_cambio || '-'}`
                        : `(≈ Bs ${(exp.monto * (exp.tasa_cambio || bcvRate)).toFixed(2)}) @ ${exp.tasa_cambio || '-'}`
                      }
                  </div>
                </div>
              </div>
            </Motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ExpensesView
