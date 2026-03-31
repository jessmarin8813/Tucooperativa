import React, { useState, useEffect, useCallback } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Target, Activity, AlertTriangle, ShieldCheck } from 'lucide-react'
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatMoney, UI_CHART_HEIGHT } from '../utils/DashboardConstants'

const BIView = () => {
  const [data, setData] = useState(null)
  const [isChartReady, setIsChartReady] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
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



  return (
    <div className="animate-fade">
      <header className="p-flex-responsive p-justify-between print:hidden" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="h1-premium neon-text">Inteligencia Financiera</h1>
          <p className="p-subtitle">Control de rentabilidad y rentas diarias de la flota</p>
        </div>

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
        {/* Charts Section (Top in Mobile, Right in PC context) */}
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
                </Motion.div>
             )}
        </div>
      </div>

      {/* NEW COMPACT PROFITABILITY SECTION (Full Width Bottom) */}
      <Motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ marginTop: '32px', overflow: 'hidden' }}
      >
        <div style={{ padding: isMobile ? '24px' : '32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="neon-text brand" style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={24} style={{ color: 'var(--accent)' }} /> Salud de Rentabilidad
            </h3>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{unidades.length} UNIDADES ACTIVAS</span>
        </div>

        <div style={{ padding: isMobile ? '12px' : '20px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {unidades.map((u, idx) => {
                const isExpanded = expandedId === u.id;
                return (
                    <div key={u.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Motion.div 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.03 }}
                           onClick={() => setExpandedId(isExpanded ? null : u.id)}
                           className="glass-hover"
                           style={{ 
                               padding: isMobile ? '16px 12px' : '20px 32px', 
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'space-between', 
                               cursor: 'pointer',
                               borderBottom: '1px solid rgba(255,255,255,0.03)',
                               background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                           }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.alerta_salud ? 'var(--danger)' : 'var(--success)', boxShadow: `0 0 10px ${u.alerta_salud ? 'var(--danger)' : 'var(--success)'}` }} />
                                <div>
                                    <h4 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 950, color: 'white', lineHeight: 1 }}>{u.placa}</h4>
                                    <p style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>{u.modelo}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '20px' : '64px', flex: isMobile ? 'initial' : 2, justifyContent: 'flex-end' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Utilidad</p>
                                    <p style={{ fontSize: isMobile ? '1rem' : '1.4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.03em' }}>{formatMoney(u.utilidad)}</p>
                                </div>
                                <div className="mobile-hide" style={{ textAlign: 'right', minWidth: '120px' }}>
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', 
                                        background: u.alerta_salud ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                        color: u.alerta_salud ? 'var(--danger)' : 'var(--success)', 
                                        borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' 
                                    }}>
                                        {u.alerta_salud ? 'Baja Rentabilidad' : 'Rentabilidad OK'}
                                    </div>
                                </div>
                            </div>
                        </Motion.div>

                        <AnimatePresence>
                            {isExpanded && (
                                <Motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="glass"
                                    style={{ background: 'rgba(255,255,255,0.01)', overflow: 'hidden', borderTop: 'none', borderRadius: '0', margin: '0 8px' }}
                                >
                                    <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
                                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Recaudado Total</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--success)' }}>{formatMoney(u.abonos)}</p>
                                        </div>
                                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Inversión Taller</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--danger)', opacity: 0.8 }}>{formatMoney(u.costos_mante)}</p>
                                        </div>
                                        <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '14px', border: '1px solid var(--accent)' }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Estatus Forense</p>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white' }}>{u.alerta_salud ? '⚠️ Requiere Auditoría de Gastos' : '✅ Rendimiento Óptimo'}</p>
                                        </div>
                                    </div>
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
      </Motion.div>
    </div>
  )
}

export default BIView
