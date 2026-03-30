import React, { useState, useEffect, useCallback } from 'react'
import { motion as Motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Target, Activity, Printer, AlertTriangle, ShieldCheck } from 'lucide-react'
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatMoney, UI_CHART_HEIGHT } from '../utils/DashboardConstants'

const BIView = () => {
  const [data, setData] = useState(null)
  const [isChartReady, setIsChartReady] = useState(false)
  const { callApi, loading } = useApi()

  const fetchBI = useCallback(async () => {
    try {
        const res = await callApi('admin/rentabilidad.php')
        setData(res)
    } catch { /* Handled */ }
  }, [callApi])

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    
    // DELAYED CHART MOUNT: Prevents ResponsiveContainer from rendering with 0-width during transitions
    const timer = setTimeout(() => setIsChartReady(true), 400);

    return () => {
        window.removeEventListener('resize', handleResize)
        clearTimeout(timer);
    }
  }, [])

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
    <div className="animate-fade">
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
                <AlertTriangle size={14} style={{ color: 'var(--danger)', opacity: 0.5 }} /> Mantenimiento + Operativos
             </div>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass" style={{ padding: '32px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--accent)' }}>
             <p className="text-label" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Utilidad Neta</p>
             <h2 className="text-value neon-text">{formatMoney(global.utilidad_neta)}</h2>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.75rem', color: global.utilidad_neta >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                {global.utilidad_neta >= 0 ? (
                  <>
                    <TrendingUp size={14} className="animate-bounce" /> RENDIMIENTO POSITIVO
                  </>
                ) : (
                  <>
                    <TrendingDown size={14} className="animate-pulse" /> DÉFICIT OPERATIVO
                  </>
                )}
             </div>
        </Motion.div>
      </div>

      <div className="p-flex-responsive" style={{ marginTop: '32px', gap: isMobile ? '16px' : '24px', alignItems: 'stretch' }}>
        {/* Fleet Profitability Table */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass"
          style={{ overflow: 'hidden', flex: 1.6 }}
        >
          <div style={{ padding: '32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h3 className="neon-text brand" style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <Activity size={24} style={{ color: 'var(--accent)' }} /> Salud de Rentabilidad
                </h3>
             </div>
          </div>
          {!isMobile ? (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px' }}>Unidad</th>
                            <th style={{ padding: '16px 24px' }}>Recaudado</th>
                            <th style={{ padding: '16px 24px' }} className="print:hidden">Egresos</th>
                            <th style={{ padding: '16px 24px' }}>Utilidad</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Estatus</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: 'var(--text-main)' }}>
                        {unidades.map((u) => (
                            <tr key={u.id} className="glass-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '12px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>
                                            {u.placa.slice(-2)}
                                        </div>
                                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{u.placa}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 24px', fontWeight: 700, color: 'var(--success)' }}>{formatMoney(u.abonos)}</td>
                                <td style={{ padding: '12px 24px', fontWeight: 700, color: 'var(--danger)', opacity: 0.6 }} className="print:hidden">{formatMoney(u.costos_mante)}</td>
                                <td style={{ padding: '12px 24px', fontWeight: 900 }}>{formatMoney(u.utilidad)}</td>
                                <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', 
                                        background: u.alerta_salud ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                        color: u.alerta_salud ? 'var(--danger)' : 'var(--success)', 
                                        borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' 
                                    }}>
                                        {u.alerta_salud ? <AlertTriangle size={10} /> : <Target size={10} />}
                                        {u.alerta_salud ? 'Baja Rentabilidad' : 'Al día'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div style={{ padding: isMobile ? '12px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {unidades.map((u) => (
                    <div key={u.id} className="glass" style={{ padding: '20px', borderRadius: '18px', border: u.alerta_salud ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)', background: u.alerta_salud ? 'rgba(239, 68, 68, 0.02)' : 'rgba(16, 185, 129, 0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                               <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '0.9rem', color: 'var(--accent)' }}>
                                   {u.placa.slice(-2)}
                               </div>
                               <div>
                                   <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', lineHeight: '1' }}>{u.placa}</h4>
                                   <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>Unidad Operativa</p>
                               </div>
                           </div>
                           <div style={{ 
                                padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 950, textTransform: 'uppercase',
                                background: u.alerta_salud ? 'var(--danger)' : 'var(--success)', color: 'black'
                            }}>
                                {u.alerta_salud ? 'Revisar' : 'Óptima'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <div>
                                <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Recaudado</p>
                                <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--success)' }}>{formatMoney(u.abonos)}</p>
                             </div>
                             <div>
                                <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Inversión Taller</p>
                                <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--danger)', opacity: 0.8 }}>{formatMoney(u.costos_mante)}</p>
                             </div>
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div>
                                <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Utilidad Neta</p>
                                <p style={{ fontSize: '1.35rem', fontWeight: 950, color: 'white', letterSpacing: '-0.03em' }}>{formatMoney(u.utilidad)}</p>
                             </div>
                             <div style={{ textAlign: 'right' }}>
                                 <p style={{ fontSize: '9px', fontWeight: 900, color: u.alerta_salud ? 'var(--danger)' : 'var(--success)', textTransform: 'uppercase' }}>
                                     {u.alerta_salud ? 'Bajo Rendimiento' : 'Rendimiento OK'}
                                 </p>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </Motion.div>

        {/* Charts Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
             {isChartReady && (
               <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass" style={{ padding: '32px' }}>
                <h3 className="neon-text brand" style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BarChart3 size={18} style={{ color: 'var(--accent)' }} /> Proyectado vs Real
                </h3>
                <div style={{ height: 180, width: '100%', minHeight: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="glass" style={{ padding: '12px', background: '#0a0b12', border: '1px solid rgba(255,255,255,0.1)' }}>
                                      <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 900, textTransform: 'uppercase' }}>{payload[0].payload.name}</p>
                                      <p style={{ fontSize: '1.1rem', color: 'white', fontWeight: 950 }}>{formatMoney(payload[0].value)}</p>
                                    </div>
                                  );
                                }
                                return null;
                            }}
                        />
                        <Bar 
                            dataKey="total" 
                            radius={[6, 6, 6, 6]} 
                            barSize={32}
                            label={{ position: 'top', fill: 'white', fontSize: 10, fontWeight: 950, formatter: (val) => `$${Math.round(val)}` }}
                        >
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
             )}

             {isChartReady && (
                <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass neon-border" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 className="neon-text brand" style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <TrendingUp size={18} style={{ color: 'var(--accent)' }} /> Histórico de Recaudación
                        </h3>
                        <span style={{ fontSize: '8px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Últimos 7 días</span>
                    </div>
                    <div style={{ height: '220px', width: '100%', minHeight: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={data.grafico_historico || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis 
                                        dataKey="fecha" 
                                        stroke="rgba(255,255,255,0.4)" 
                                        fontSize={9} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
                                        }}
                                    />
                                    <YAxis hide />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              return (
                                                <div className="glass" style={{ padding: '12px', background: '#0a0b12', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                   <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 900, marginBottom: '8px' }}>{new Date(payload[0].payload.fecha).toLocaleDateString()}</p>
                                                   {payload.map((p, idx) => (
                                                       <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'center', marginBottom: '4px' }}>
                                                           <span style={{ fontSize: '9px', fontWeight: 900, color: p.color, textTransform: 'uppercase' }}>{p.dataKey}</span>
                                                           <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 950 }}>${formatMoney(p.value).replace('$', '')}</span>
                                                       </div>
                                                   ))}
                                                </div>
                                              );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="efectivo" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={20} />
                                    <Bar dataKey="pagomovil" stackId="a" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '2px' }} />
                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)' }}>EFECTIVO</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '2px' }} />
                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)' }}>P. MÓVIL</span>
                        </div>
                    </div>
                </Motion.div>
             )}
        </div>
      </div>
    </div>
  )
}

export default BIView
