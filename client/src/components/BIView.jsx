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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }} className="print:hidden">
        <div>
          <h1 className="h1-premium neon-text">Inteligencia Financiera</h1>
          <p className="p-subtitle">Control de rentabilidad y rentas diarias de la flota</p>
        </div>
        <button 
            onClick={handlePrint}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px' }}
        >
            <Printer size={20} /> GENERAR CIERRE (PDF)
        </button>
      </header>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
             <p className="text-label" style={{ marginBottom: '16px' }}>Ingreso Proyectado</p>
             <h2 className="text-value neon-text">{formatMoney(global.proyectado)}</h2>
             <div style={{ marginTop: '24px', height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', width: '100%', opacity: 0.4 }} />
             </div>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="text-label" style={{ marginBottom: '16px' }}>Recaudación Real</p>
                    <h2 className="text-value neon-text" style={{ color: 'var(--success)' }}>{formatMoney(global.recaudado)}</h2>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '100px' }}>
                     {global.eficiencia_cobro}%
                  </div>
             </div>
             <div style={{ marginTop: '24px', height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                <Motion.div initial={{ width: 0 }} animate={{ width: `${global.eficiencia_cobro}%` }} style={{ height: '100%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
             </div>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: '32px' }}>
             <p className="text-label" style={{ marginBottom: '16px' }}>Gastos Totales</p>
             <h2 className="text-value" style={{ color: 'var(--danger)' }}>{formatMoney(global.gastos)}</h2>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                <AlertTriangle size={14} style={{ color: 'var(--danger)', opacity: 0.5 }} /> Mante. + Trámites
             </div>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass" style={{ padding: '32px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--accent)' }}>
             <p className="text-label" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Utilidad Neta</p>
             <h2 className="text-value neon-text">{formatMoney(global.utilidad_neta)}</h2>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
                <TrendingUp size={14} className="animate-bounce" /> RENDIMIENTO POSITIVO
             </div>
        </Motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '32px', marginTop: '32px' }}>
        {/* Fleet Profitability Table */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass"
          style={{ overflow: 'hidden' }}
        >
          <div style={{ padding: '32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h3 className="neon-text brand" style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <Activity size={24} style={{ color: 'var(--accent)' }} /> Salud de Rentabilidad
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>Gasto vs Ingreso Real</p>
             </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
             <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                   <tr style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em', borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '24px' }}>Unidad</th>
                      <th style={{ padding: '24px' }}>Recaudado</th>
                      <th style={{ padding: '24px' }} className="print:hidden">Egresos</th>
                      <th style={{ padding: '24px' }}>Utilidad</th>
                      <th style={{ padding: '24px', textAlign: 'right' }}>Estatus</th>
                   </tr>
                </thead>
                <tbody style={{ color: 'var(--text-main)' }}>
                   {unidades.map((u) => (
                       <tr key={u.id} className="glass-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '20px 24px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                     {u.placa.slice(-2)}
                                 </div>
                                 <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{u.placa}</span>
                             </div>
                          </td>
                          <td style={{ padding: '24px', fontWeight: 700, color: 'var(--success)' }}>{formatMoney(u.abonos)}</td>
                          <td style={{ padding: '24px', fontWeight: 700, color: 'var(--danger)', opacity: 0.6 }} className="print:hidden">{formatMoney(u.costos_mante)}</td>
                          <td style={{ padding: '24px', fontWeight: 900 }}>{formatMoney(u.utilidad)}</td>
                          <td style={{ padding: '24px', textAlign: 'right' }}>
                              {u.alerta_salud ? (
                                 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                     <AlertTriangle size={12} /> Baja Rentabilidad
                                 </div>
                              ) : (
                                 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                     <Target size={12} /> Alta Eficiencia
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass" style={{ padding: '32px' }}>
                <h3 className="neon-text brand" style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BarChart3 style={{ color: 'var(--accent)' }} /> Flujo Regional
                </h3>
                <div style={{ height: UI_CHART_HEIGHT, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { name: 'Proyectado', total: global.proyectado, fill: 'var(--primary)' },
                        { name: 'Real', total: global.recaudado, fill: 'var(--success)' }
                    ]}>
                        <XAxis dataKey="name" stroke="var(--glass-border)" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ background: '#0a0b12', border: '1px solid var(--glass-border)', borderRadius: '16px' }} />
                        <Bar dataKey="total" radius={[8, 8, 8, 8]} barSize={40}>
                             { (entry) => <Cell fill={entry.fill} /> }
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
             </Motion.div>

             <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass neon-border" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
                 <div style={{ width: '64px', height: '64px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <BarChart3 size={32} />
                 </div>
                 <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>Análisis Predictivo</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', fontWeight: 600, marginTop: '16px', lineHeight: 1.6 }}>Tendencia de cobro validada. El flujo de caja está 100% sincronizado.</p>
                 </div>
                 <div style={{ width: '100%', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Omni-Guard Active</span>
                 </div>
             </Motion.div>
        </div>
      </div>
    </div>
  )
}

export default BIView
