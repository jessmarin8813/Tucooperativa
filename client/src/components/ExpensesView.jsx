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
      <header className="p-flex p-flex-col md:p-flex-row p-justify-between p-items-start md:p-items-center p-gap-4 p-mb-6">
        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="p-text-3xl p-font-black p-text-white p-tracking-tighter p-neon-text">Gastos Operativos</h1>
          <p className="p-text-white-40 p-font-bold p-mt-2">Control financiero de mantenimiento y activos</p>
        </Motion.div>

        <button 
          className="btn-primary p-w-full md:p-w-auto p-flex p-items-center p-justify-center p-gap-4 p-px-8 p-py-4" 
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
            className="p-glass-premium p-p-5 md:p-p-8 p-mb-8 p-border p-border-accent-20 p-rounded-[2.5rem] p-shadow-premium"
          >
            <form onSubmit={handleSubmit} className="p-grid p-grid-cols-1 md:p-grid-cols-2 p-gap-6 md:p-gap-8">
              <div className="p-flex p-flex-col p-gap-3">
                <label className="p-text-[10px] p-font-black p-uppercase p-text-white-30 p-tracking-widest">Vehículo (Opcional)</label>
                <select 
                  value={formData.vehiculo_id} 
                  onChange={e => setFormData({...formData, vehiculo_id: e.target.value})}
                  className="p-p-4 p-bg-white-5 p-rounded-2xl p-text-white p-outline-none p-border p-border-white-10 focus:p-border-accent p-transition-all p-font-bold p-appearance-none"
                >
                  <option value="" className="p-bg-black">Gasto General (Cooperativa)</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id} className="p-bg-black">{v.placa} - {v.modelo}</option>
                  ))}
                </select>
              </div>

              <div className="p-flex p-flex-col p-gap-3">
                <label className="p-text-[10px] p-font-black p-uppercase p-text-white-30 p-tracking-widest">Categoría</label>
                <select 
                  value={formData.categoria} 
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                  className="p-p-4 p-bg-white-5 p-rounded-2xl p-text-white p-outline-none p-border p-border-white-10 focus:p-border-accent p-transition-all p-font-bold p-appearance-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id} className="p-bg-black">{c.label}</option>)}
                </select>
              </div>

              <div className="p-flex p-flex-col p-gap-3">
                <label className="p-text-[10px] p-font-black p-uppercase p-text-white-30 p-tracking-widest">Monto ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.monto} 
                  onChange={e => setFormData({...formData, monto: e.target.value})}
                  className="p-p-4 p-bg-white-5 p-rounded-2xl p-text-white p-outline-none p-border p-border-white-10 focus:p-border-accent p-transition-all p-font-bold"
                  placeholder="0.00"
                />
              </div>

              <div className="p-flex p-flex-col p-gap-3">
                <label className="p-text-[10px] p-font-black p-uppercase p-text-white-30 p-tracking-widest">Fecha</label>
                <input 
                  type="date" 
                  required
                  value={formData.fecha} 
                  onChange={e => setFormData({...formData, fecha: e.target.value})}
                  className="p-p-4 p-bg-white-5 p-rounded-2xl p-text-white p-outline-none p-border p-border-white-10 focus:p-border-accent p-transition-all p-font-bold"
                />
              </div>

              <div className="p-flex p-flex-col p-gap-3 md:p-col-span-2">
                <label className="p-text-[10px] p-font-black p-uppercase p-text-white-30 p-tracking-widest">Descripción / Concepto</label>
                <input 
                  type="text" 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="p-p-4 md:p-p-5 p-bg-white-5 p-rounded-2xl p-text-white p-outline-none p-border p-border-white-10 focus:p-border-accent p-transition-all p-font-bold"
                  placeholder="Ej: Cambio de pastillas de freno delanteras"
                />
              </div>

              <div className="md:p-col-span-2 p-flex p-justify-end p-pt-4">
                <button type="submit" className="btn-primary p-w-full md:p-w-auto p-px-12 p-py-5 p-text-xs p-tracking-widest" disabled={loading}>
                  {loading ? 'PROCESANDO...' : 'GUARDAR REGISTRO'}
                </button>
              </div>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>

      <div className="p-grid p-gap-6">
        {expenses.length === 0 ? (
          <div className="p-glass-premium p-p-20 p-text-center p-opacity-30 p-border-dashed p-border-white-10 p-rounded-[2rem]">
            <Search size={48} className="p-mx-auto p-mb-4" />
            <p className="p-text-xs p-font-black p-uppercase p-tracking-widest">No se han registrado gastos aún</p>
          </div>
        ) : (
          expenses.map((exp, idx) => (
            <Motion.div 
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-glass-premium p-p-4 md:p-p-5 p-rounded-[2rem] p-flex p-flex-col md:p-flex-row p-justify-between p-items-start md:p-items-center p-gap-4 p-group hover:p-bg-white-5 p-transition-all p-relative p-overflow-hidden"
            >
              <div className={`p-absolute p-left-0 p-top-0 p-bottom-0 p-w-1.5 p-rounded-pill ${
                  exp.categoria === 'repuestos' ? 'p-bg-blue-500' :
                  exp.categoria === 'mantenimiento' ? 'p-bg-emerald-500' :
                  exp.categoria === 'seguro' ? 'p-bg-amber-500' : 'p-bg-white-20'
              }`} />
              
              <div className="p-flex p-items-center p-gap-6 p-w-full">
                <div className={`p-w-14 p-h-14 p-shrink-0 p-rounded-2xl p-flex p-items-center p-justify-center ${
                    exp.categoria === 'repuestos' ? 'p-bg-blue-500/10 p-text-blue-500' :
                    exp.categoria === 'mantenimiento' ? 'p-bg-emerald-500/10 p-text-emerald-500' :
                    exp.categoria === 'seguro' ? 'p-bg-amber-500/10 p-text-amber-500' : 'p-bg-white-5 p-text-white-40'
                }`}>
                  <Wrench size={24} />
                </div>
                <div className="p-flex-1">
                  <div className="p-flex p-flex-col sm:p-flex-row p-items-start sm:p-items-center p-gap-3 p-mb-2">
                    <span className="p-text-base md:p-text-lg p-font-black p-text-white p-tracking-tight">{exp.descripcion || 'Sin descripción'}</span>
                    <span className="p-text-[10px] p-font-black p-text-white-30 p-px-3 p-py-1 p-bg-white-5 p-rounded-pill p-uppercase p-tracking-widest">{exp.categoria}</span>
                  </div>
                  <div className="p-flex p-flex-wrap p-gap-6 p-text-[10px] p-font-black p-text-white-30 p-uppercase p-tracking-widest">
                    <span className="p-flex p-items-center p-gap-2">
                      <Calendar size={12} className="p-text-accent" /> {exp.fecha}
                    </span>
                    <span className="p-flex p-items-center p-gap-2">
                      <Truck size={12} className="p-text-accent" /> {exp.placa || 'General'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-w-full md:p-w-auto p-text-left md:p-text-right p-pt-4 md:p-pt-0 p-border-t md:p-border-t-0 p-border-white-5">
                <div className="p-text-2xl p-font-black p-text-red-500 p-tracking-tighter">-{formatMoney(exp.monto)}</div>
                <div className="p-text-[10px] p-font-black p-text-white-20 p-uppercase p-tracking-widest p-mt-1">USD outflow</div>
              </div>
            </Motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ExpensesView
