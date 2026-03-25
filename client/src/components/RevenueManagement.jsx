import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { DollarSign, CheckCircle, Clock, Search, Calendar, Filter } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const RevenueManagement = () => {
  const { callApi } = useApi()
  const [payments, setPayments] = useState([])
  const [pendingPayments, setPendingPayments] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [filter] = useState('')

  const fetchPayments = useCallback(async () => {
    try {
      const res = await callApi(`recaudacion.php?fecha=${date}`)
      setPayments(res)
      
      const pendingRes = await callApi('admin/pending_payments.php')
      setPendingPayments(pendingRes)
    } catch {
      // Handled by useApi
    }
  }, [callApi, date])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments()
  }, [fetchPayments])

  const handleValidate = async (id, status) => {
    try {
      await callApi('admin/validate_payment.php', {
        method: 'POST',
        body: JSON.stringify({ pago_id: id, status })
      })
      fetchPayments()
    } catch {
      // Handled by useApi
    }
  }

  const handleConfirm = async (id) => {
    try {
      await callApi('recaudacion.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirm_payment', pago_id: id })
      })
      fetchPayments()
    } catch {
      // Handled by useApi
    }
  }

  const totals = payments.reduce((acc, p) => ({
    expected: acc.expected + parseFloat(p.monto),
    received: acc.received + parseFloat(p.total_recibido),
    pending: acc.pending + (p.estado === 'pendiente' ? 1 : 0)
  }), { expected: 0, received: 0, pending: 0 })

  const filteredPayments = payments.filter(p => 
    p.placa.toLowerCase().includes(filter.toLowerCase()) || 
    p.chofer_nombre.toLowerCase().includes(filter.toLowerCase())
  )

  const handleExport = () => {
    window.open(`${import.meta.env.VITE_API_URL || '/api'}/reportes_exportacion.php`, '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Caja y Recaudación</h2>
          <p className="text-white/50 text-base">Control de flujo de caja y validación operativa</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <Search size={16} />
            Exportar Reporte
          </button>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* Validation Queue Section (Phase 27) */}
      {pendingPayments.length > 0 && (
        <Motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass neon-border overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)' }}
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Cola de Validación de Caja</h3>
            </div>
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full">{pendingPayments.length} PENDIENTES</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">Chofer / Unidad</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">Monto Reportado</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">Efectivo vs P.Móvil</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Acciones de Caja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingPayments.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{p.chofer_nombre}</p>
                      <p className="text-[10px] text-white/50">{p.placa}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-emerald-400">${parseFloat(p.monto_efectivo) + parseFloat(p.monto_pagomovil)}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-white/60">
                      ${p.monto_efectivo} (Cash) / ${p.monto_pagomovil} (PM)
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleValidate(p.id, 'validado')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                      >
                        VALIDAR
                      </button>
                      <button 
                        onClick={() => handleValidate(p.id, 'rechazado')}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        RECHAZAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Caja Esperada', val: `$${totals.expected.toFixed(2)}`, icon: DollarSign, color: 'emerald' },
          { label: 'Ingreso Reportado', val: `$${totals.received.toFixed(2)}`, icon: CheckCircle, color: 'blue' },
          { label: 'Hojas por Conciliar', val: totals.pending, icon: Clock, color: 'orange' }
        ].map((s, i) => (
          <Motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-7 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                <h3 className="text-3xl font-bold text-white">{s.val}</h3>
              </div>
              <div className={`p-4 rounded-2xl bg-${s.color}-500/20 text-${s.color}-400`}>
                <s.icon size={28} />
              </div>
            </div>
          </Motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Unidad / Chofer</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Cuota Teórica</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-center">Efectivo / P.Móvil</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Saldo</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPayments.length > 0 ? filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      {p.placa.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{p.placa}</p>
                      <p className="text-[10px] text-white/50">{p.chofer_nombre}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-mono text-white/70">${parseFloat(p.monto).toFixed(2)}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-white/30 mb-1">Cash</p>
                      <p className="font-bold text-white">${parseFloat(p.monto_efectivo).toFixed(2)}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-white/30 mb-1">Móvil</p>
                      <p className="font-bold text-white">${parseFloat(p.monto_pagomovil).toFixed(2)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-sm font-bold ${parseFloat(p.saldo) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    ${Math.abs(parseFloat(p.saldo)).toFixed(2)}
                    {parseFloat(p.saldo) > 0 ? ' (Debiendo)' : ' (OK)'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    p.estado === 'pagado' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  {p.estado === 'pendiente' ? (
                    <button 
                      onClick={() => handleConfirm(p.id)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-emerald-500/20"
                    >
                      CONCILIAR PAGO
                    </button>
                  ) : (
                    <CheckCircle size={18} className="text-emerald-500 ml-auto opacity-50" />
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <Filter size={48} />
                    <p className="text-lg">No hay registros para esta fecha</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RevenueManagement
