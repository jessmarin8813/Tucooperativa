import React, { useState, useEffect, useCallback } from 'react'
import { motion as Motion } from 'framer-motion'
import { TrendingUp, BarChart3, Target, Activity, Printer, AlertTriangle, ShieldCheck } from 'lucide-react'
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
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
    let ignore = false
    const init = async () => {
      await Promise.resolve()
      if (!ignore) fetchBI()
    }
    init()
    return () => { ignore = true }
  }, [fetchBI])

  if (loading || !data) return <LoadingSpinner />

  const { global, unidades } = data

  const handlePrint = () => {
      window.print()
  }

  return (
    <div>
      <header className="p-flex-responsive p-justify-between print:hidden" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="h1-premium neon-text">Inteligencia Financiera</h1>
          <p className="p-subtitle">Control de rentabilidad y rentas diarias de la flota</p>
        </div>
        <button 
            onClick={handlePrint}
            className="btn-primary"
        >
            <Printer size={20} /> GENERAR CIERRE (PDF)
        </button>
      </header>

      {/* Main Stats Grid */}
      <div className="p-grid p-grid-cols-4" style={{ marginBottom: '32px' }}>
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

      <div className="p-flex-responsive" style={{ marginTop: '32px', gap: '24px' }}>
        {/* Fleet Profitability Table */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass"
          style={{ overflow: 'hidden', flex: 1.5 }}
        >
          <div style={{ padding: '32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
             <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass" style={{ padding: '32px' }}>
                <h3 className="neon-text brand" style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BarChart3 style={{ color: 'var(--accent)' }} /> Flujo Regional
                </h3>
                <div style={{ height: UI_CHART_HEIGHT, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { name: 'Proyectado', total: global.proyectado, color: '#818cf8' },
                        { name: 'Real', total: global.recaudado, color: '#34d399' }
                    ]}>
                        <XAxis 
                            dataKey="name" 
                            stroke="rgba(255,255,255,0.4)" 
                            fontSize={10} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
                        />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                            contentStyle={{ background: '#0a0b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white' }} 
                        />
                        <Bar dataKey="total" radius={[8, 8, 8, 8]} barSize={44}>
                             {
                                [
                                    { name: 'Proyectado', total: global.proyectado, color: '#818cf8' },
                                    { name: 'Real', total: global.recaudado, color: '#34d399' }
                                ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))
                             }
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
             </Motion.div>

             <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass neon-border" style={{ padding: '32px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="neon-text brand" style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <TrendingUp size={18} style={{ color: 'var(--accent)' }} /> Histórico de Recaudación
                    </h3>
                    <span style={{ fontSize: '8px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Últimos 7 días</span>
                 </div>
                 <div style={{ height: '260px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.grafico_historico || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                    contentStyle={{ background: '#0a0b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                />
                                <Bar dataKey="efectivo" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={30} />
                                <Bar dataKey="pagomovil" stackId="a" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                 </div>
                 <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)' }}>CASH</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)' }}>P. MÓVIL</span>
                    </div>
                 </div>
             </Motion.div>
        </div>
      </div>
    </div>
  )
}

export default BIView
