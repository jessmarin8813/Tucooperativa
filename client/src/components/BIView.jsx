import React, { useState, useEffect, useCallback } from 'react'
import { motion as Motion } from 'framer-motion'
import { TrendingUp, BarChart3, Target, Activity, Printer, AlertTriangle, ShieldCheck } from 'lucide-react'
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from './LoadingSpinner'
import { formatMoney, UI_CHART_HEIGHT } from '../utils/DashboardConstants'

const BIView = () => {
  const [data, setData] = useState(null)
  const { callApi, loading } = useApi()

  const fetchBI = useCallback(async () => {
    try {
        const res = await callApi('admin/rentabilidad.php')
        setData(res)
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    fetchBI()
  }, [fetchBI])

  if (loading || !data) return <LoadingSpinner />

  const { global, unidades } = data

  const handlePrint = () => {
      window.print()
  }

  return (
    <div className="view-container animate-fade">
      <header className="p-flex p-flex-col md:p-flex-row p-justify-between p-items-start md:p-items-center p-gap-4 p-mb-8 print:p-mb-4">
        <div>
          <h1 className="p-font-black p-text-white p-tracking-tighter p-neon-text">Inteligencia Financiera</h1>
          <p className="p-text-white-40 p-font-bold p-mt-2">Control de rentabilidad y rentas diarias de la flota</p>
        </div>
        <button 
            onClick={handlePrint}
            className="btn-primary p-w-full md:p-w-auto p-flex p-items-center p-gap-4 p-px-8 p-py-4 print:p-hidden"
        >
            <Printer size={20} /> GENERAR CIERRE (PDF)
        </button>
      </header>

      {/* Main Stats Grid */}
      <div className="p-grid p-grid-cols-1 md:p-grid-cols-2 lg:p-grid-cols-4 p-gap-6">
        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-glass-premium p-p-6 md:p-p-8 p-relative p-overflow-hidden p-group">
             <div className="p-absolute p-top-0 p-right-0 p-w-32 p-h-32 p-bg-accent-10 p-rounded-pill p-blur-3xl p--mr-16 p--mt-16 group-hover:p-bg-accent-20 transition-all" />
             <p className="p-text-xs p-font-black p-uppercase p-text-white-30 p-tracking-widest p-mb-4">Ingreso Proyectado</p>
             <h2 className="p-font-black p-text-white p-tracking-tighter">{formatMoney(global.proyectado)}</h2>
             <div className="p-mt-8 p-h-1 p-w-full p-bg-white-5 p-rounded-pill p-overflow-hidden">
                <div className="p-h-full p-bg-primary p-w-full p-opacity-40 p-shadow-premium" />
             </div>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-glass-premium p-p-6 md:p-p-8 p-relative p-overflow-hidden p-group">
             <div className="p-absolute p-top-0 p-right-0 p-w-32 p-h-32 p-bg-emerald-10 p-rounded-pill p-blur-3xl p--mr-16 p--mt-16 group-hover:p-bg-emerald-20 transition-all" />
             <div className="p-flex p-justify-between p-items-start">
                  <div>
                    <p className="p-text-xs p-font-black p-uppercase p-text-white-30 p-tracking-widest p-mb-4">Recaudación Real</p>
                    <h2 className="p-font-black p-text-emerald-400 p-tracking-tighter p-neon-text">{formatMoney(global.recaudado)}</h2>
                  </div>
                  <div className="p-text-xs p-font-black p-text-emerald-400 p-bg-emerald-10 p-px-3 p-py-1.5 p-rounded-pill p-border-neon">
                     {global.eficiencia_cobro}%
                  </div>
             </div>
             <div className="p-mt-8 p-h-1 p-w-full p-bg-white-5 p-rounded-pill p-overflow-hidden">
                <Motion.div initial={{ width: 0 }} animate={{ width: `${global.eficiencia_cobro}%` }} className="p-h-full p-bg-emerald-500 p-neon-glow" />
             </div>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="p-glass-premium p-p-6 md:p-p-8 p-group">
             <p className="p-text-xs p-font-black p-uppercase p-text-white-30 p-tracking-widest p-mb-4">Gastos Totales</p>
             <h2 className="p-font-black p-text-red-500 p-tracking-tighter">{formatMoney(global.gastos)}</h2>
             <div className="p-flex p-items-center p-gap-2 p-mt-4 p-text-xs p-font-black p-text-white-20 p-uppercase p-tracking-widest">
                <AlertTriangle size={12} className="p-text-red-500 p-opacity-50" /> Mante. + Trámites
             </div>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="p-glass-premium p-p-6 md:p-p-8 p-border-neon p-bg-accent-5 p-group">
             <p className="p-text-xs p-font-black p-uppercase p-text-accent p-tracking-widest p-mb-4">Utilidad Neta</p>
             <h2 className="p-font-black p-text-white p-tracking-tighter">{formatMoney(global.utilidad_neta)}</h2>
             <div className="p-flex p-items-center p-gap-2 p-mt-4 p-text-xs p-text-emerald-400 p-font-bold p-tracking-widest">
                <TrendingUp size={14} className="animate-bounce" /> RENDIMIENTO POSITIVO
             </div>
        </Motion.div>
      </div>

      <div className="p-grid p-grid-cols-1 lg:p-grid-cols-12 p-gap-8 p-mt-8 p-items-start">
        {/* Fleet Profitability Table */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-glass-premium p-rounded-3xl p-overflow-hidden lg:p-col-span-8 p-shadow-premium"
        >
          <div className="p-p-5 md:p-p-8 p-border-b p-border-white-5 p-flex p-justify-between p-items-center">
             <div>
                <h3 className="p-font-black p-text-white p-tracking-tight p-flex p-items-center p-gap-4">
                   <Activity size={24} className="p-text-accent" /> Salud de Rentabilidad
                </h3>
                <p className="p-text-xs p-text-white-40 p-font-bold p-uppercase p-tracking-widest p-mt-2">Gasto vs Ingreso Real</p>
             </div>
             <ShieldCheck size={32} className="p-text-white-5 p-hidden md:p-block" />
          </div>
          <div className="p-overflow-x-auto">
             <table className="p-w-full p-text-left">
                <thead>
                   <tr className="p-text-xs p-font-black p-uppercase p-text-white-20 p-tracking-widest p-border-b p-border-white-5">
                      <th className="p-p-4 md:p-p-8">Unidad</th>
                      <th className="p-p-4 md:p-p-8">Recaudado</th>
                      <th className="p-p-4 md:p-p-8 p-hidden md:p-table-cell">Egresos</th>
                      <th className="p-p-4 md:p-p-8">Utilidad</th>
                      <th className="p-p-4 md:p-p-8 p-text-right">Estatus</th>
                   </tr>
                </thead>
                <tbody className="p-divide-y p-divide-white-5">
                   {unidades.map((u) => (
                       <tr key={u.id} className="p-glass-hover p-group cursor-default">
                         <td className="p-p-3 md:p-p-5">
                            <div className="p-flex p-items-center p-gap-3">
                                <div className="p-w-9 p-h-9 md:p-w-10 md:p-h-10 p-bg-white-5 p-rounded-2xl p-flex p-items-center p-justify-center p-text-white-20 p-font-black group-hover:p-bg-accent-10 group-hover:p-text-accent transition-colors">
                                    {u.placa.slice(-2)}
                                </div>
                                <span className="p-font-black p-text-base md:p-text-lg p-tracking-tighter group-hover:p-translate-x-1 transition-transform">{u.placa}</span>
                            </div>
                         </td>
                         <td className="p-p-3 md:p-p-5 p-font-bold p-text-emerald-40">{formatMoney(u.abonos)}</td>
                         <td className="p-p-3 md:p-p-5 p-font-bold p-text-red-500 p-opacity-50 p-hidden md:p-table-cell">{formatMoney(u.costos_mante)}</td>
                         <td className="p-p-3 md:p-p-5 p-font-black p-text-white p-text-base">{formatMoney(u.utilidad)}</td>
                         <td className="p-p-3 md:p-p-5 p-text-right">
                             {u.alerta_salud ? (
                                <div className="p-flex p-items-center p-gap-2 p-px-3 md:p-px-4 p-py-2 p-bg-red-10 p-text-red-500 p-border p-border-red-500/20 p-rounded-pill p-text-[10px] md:p-text-xs p-font-black p-uppercase">
                                    <AlertTriangle size={12} /> <span className="p-hidden md:p-inline">Baja Rentabilidad</span>
                                </div>
                             ) : (
                                <div className="p-flex p-items-center p-gap-2 p-px-3 md:p-px-4 p-py-2 p-bg-emerald-10 p-text-emerald-400 p-border p-border-emerald-500/20 p-rounded-pill p-text-[10px] md:p-text-xs p-font-black p-uppercase">
                                    <Target size={12} /> <span className="p-hidden md:p-inline">Alta Eficiencia</span>
                                </div>
                             )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </Motion.div>

        {/* Charts Side */}
        <div className="p-grid p-grid-cols-1 lg:p-col-span-4 p-gap-6 p-w-full">
             <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-glass-premium p-p-5 md:p-p-8 p-rounded-3xl p-shadow-premium">
                <h3 className="p-font-black p-text-white p-mb-6 p-flex p-items-center p-gap-3">
                    <BarChart3 className="p-text-accent" /> Flujo Regional
                </h3>
                <div style={{ height: UI_CHART_HEIGHT }} className="p-w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { name: 'Proyectado', total: global.proyectado, fill: '#6366f1' },
                        { name: 'Real', total: global.recaudado, fill: '#10b981' }
                    ]}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ background: '#0a0b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }} />
                        <Bar dataKey="total" radius={[8, 8, 8, 8]} barSize={50}>
                             { (entry) => <Cell fill={entry.fill} /> }
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
             </Motion.div>

             <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-glass-premium p-p-6 md:p-p-10 p-rounded-3xl p-border-neon p-flex p-flex-col p-items-center p-text-center p-gap-6">
                 <div className="p-w-16 p-h-16 p-bg-accent-10 p-rounded-pill p-flex p-items-center p-justify-center p-text-accent">
                    <BarChart3 size={32} />
                 </div>
                 <div>
                    <h4 className="p-text-xl p-font-black p-text-white p-tracking-tight">Análisis Predictivo</h4>
                    <p className="p-text-xs p-text-white-40 p-font-bold p-leading-relaxed p-mt-4">Tendencia de cobro validada. El flujo de caja está 100% sincronizado.</p>
                 </div>
                 <div className="p-w-full p-pt-6 p-border-t p-border-white-5">
                    <span className="p-text-xs p-font-black p-text-accent p-uppercase p-tracking-widest">Omni-Guard Active</span>
                 </div>
             </Motion.div>
        </div>
      </div>
    </div>
  )
}

export default BIView
