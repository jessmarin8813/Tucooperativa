import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { Wrench, Plus, DollarSign, Calendar, FileText, Truck, Search, Trash2 } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { formatMoney } from '../utils/DashboardConstants'

const ExpensesView = () => {
  const { callApi, loading } = useApi()
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    categoria: 'otros',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  })

  const fetchData = useCallback(async () => {
    try {
      const expRes = await callApi('admin/expenses.php')
      const fleetRes = await callApi('vehiculos.php')
      setExpenses(expRes.expenses || [])
      setVehicles(fleetRes || [])
    } catch (e) { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await callApi('admin/expenses.php', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setShowForm(false)
      setFormData({
        vehiculo_id: '',
        categoria: 'otros',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch (e) { /* Handled */ }
  }

  const categories = [
    { id: 'repuestos', label: 'Repuestos', color: '#3b82f6' },
    { id: 'mantenimiento', label: 'Mantenimiento', color: '#10b981' },
    { id: 'seguro', label: 'Seguro', color: '#f59e0b' },
    { id: 'otros', label: 'Otros', color: '#6b7280' }
  ]

  return (
    <div className="view-container animate-fade">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="h1-premium neon-text">Gastos Operativos</h1>
          <p className="p-subtitle">Control financiero de mantenimiento y activos</p>
        </Motion.div>

        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px' }}
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
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Vehículo (Opcional)</label>
                <select 
                  value={formData.vehiculo_id} 
                  onChange={e => setFormData({...formData, vehiculo_id: e.target.value})}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Monto ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.monto} 
                  onChange={e => setFormData({...formData, monto: e.target.value})}
                  className="glass"
                  style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 800, outline: 'none' }}
                  placeholder="0.00"
                />
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
                <button type="submit" className="btn-primary" style={{ padding: '16px 48px', fontSize: '0.875rem', fontWeight: 800 }} disabled={loading}>
                  {loading ? 'PROCESANDO...' : 'GUARDAR REGISTRO'}
                </button>
              </div>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {expenses.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center' }} className="glass">
            <Search size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
            <p style={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>No se han registrado gastos aún</p>
          </div>
        ) : (
          expenses.map((exp, idx) => (
            <Motion.div 
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass glass-hover"
              style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: exp.categoria === 'repuestos' ? '#3b82f6' : exp.categoria === 'mantenimiento' ? '#10b981' : exp.categoria === 'seguro' ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                  <Wrench size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{exp.descripcion || 'Sin descripción'}</span>
                    <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{exp.categoria}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '32px', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} style={{ color: 'var(--accent)' }} /> {exp.fecha}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={14} style={{ color: 'var(--accent)' }} /> {exp.placa || 'General'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--danger)', letterSpacing: '-0.05em' }}>-{formatMoney(exp.monto)}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>USD outflow</div>
              </div>
            </Motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ExpensesView
