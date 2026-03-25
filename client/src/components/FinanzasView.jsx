import React, { useState, useEffect, useCallback } from 'react'
import { DollarSign, CreditCard, Download, TrendingUp, ArrowUpRight, ShieldCheck, PieChart, Activity } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from './LoadingSpinner'

const FinanzasView = () => {
    const { callApi, loading: apiLoading } = useApi()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const res = await callApi('reportes_financieros.php')
            setData(res)
        } catch { /* Handled */ }
        finally { setLoading(false) }
    }, [callApi])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading || apiLoading) return <LoadingSpinner />

    const stats = [
        { label: 'Efectivo en Caja', value: `$${data?.resumen?.total_efectivo || 0}`, icon: DollarSign, color: 'var(--success)', trend: '+12% hoy' },
        { label: 'Pago Móvil Recibido', value: `$${data?.resumen?.total_pagomovil || 0}`, icon: Activity, color: 'var(--accent)', trend: 'Real-time' },
        { label: 'Meta Diaria (Proyectado)', value: `$${data?.resumen?.total_esperado || 0}`, icon: TrendingUp, color: 'var(--primary)', trend: '85% Meta' },
    ]

    return (
        <div className="view-container animate-fade">
            <header className="mb-12">
                <h1 className="text-5xl font-black text-white tracking-tighter neon-text">Finanzas & Corte Diario</h1>
                <p className="text-white/40 font-bold mt-2">Auditoría de ingresos y flujo de caja (Estilo Maturín)</p>
            </header>

            {/* Stats Grid */}
            <div className="grid lg-grid-cols-3 gap-8 mb-12">
                {stats.map((s, i) => (
                    <Motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-premium p-8 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-6 text-white/5 opacity-50">
                            <s.icon size={80} strokeWidth={1} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-3xl" style={{ backgroundColor: `${s.color}22`, border: `1px solid ${s.color}44` }}>
                                    <s.icon size={24} style={{ color: s.color }} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest" style={{ color: s.color }}>{s.trend}</span>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">{s.label}</p>
                            <h2 className="text-4xl font-black text-white tracking-tighter">{s.value}</h2>
                        </div>
                    </Motion.div>
                ))}
            </div>

            <div className="grid md-grid-cols-2 gap-8 mb-12" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
                {/* Main Graph */}
                <div className="glass-premium p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                                <PieChart size={24} className="text-primary" /> Histórico de Recaudación
                            </h3>
                            <p className="text-xs text-white/30 font-bold uppercase mt-1">Sincronización de los últimos 7 días</p>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.grafico}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                    contentStyle={{ background: '#0a0b12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '16px' }}
                                />
                                <Bar dataKey="efectivo" stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} barSize={40} />
                                <Bar dataKey="pagomovil" stackId="a" fill="var(--accent)" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Audit List */}
                <div className="glass-premium p-10">
                    <h3 className="text-xl font-black text-white tracking-tight mb-8">Últimos Movimientos</h3>
                    <div className="space-y-4">
                        {data?.recientes?.slice(0, 5).map((p, i) => (
                            <div key={i} className="glass p-5 flex justify-between items-center group hover:border-accent/30">
                                <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                        <Activity size={18} />
                                     </div>
                                     <div>
                                        <p className="text-white font-black tracking-tight">{p.placa}</p>
                                        <p className="text-[10px] text-white/30 font-bold uppercase">{p.chofer_nombre}</p>
                                     </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-accent">${p.monto}</p>
                                    <p className="text-[10px] text-white/20 font-medium uppercase">{p.fecha}</p>
                                </div>
                            </div>
                        ))}
                        <button className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest mt-4">IR AL HISTORIAL COMPLETO</button>
                    </div>
                </div>
            </div>

            {/* Telegram Shield */}
            <Motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-premium p-10 border-accent/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-pill blur-3xl -mr-32 -mt-32" />
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                            <ShieldCheck size={32} className="text-accent" /> Control Biométrico de Caja
                        </h3>
                        <p className="text-white/40 font-medium mt-3 leading-relaxed max-w-lg">Vincula tu Telegram para recibir auditorías forenses de cada cierre de caja y detectar discrepancias al instante.</p>
                    </div>
                    <button 
                        onClick={async () => {
                            const res = await fetch(getApiUrl('admin/generate_link_token.php'));
                            const data = await res.json();
                            if(data.success && data.link) window.open(data.link, '_blank');
                        }}
                        className="btn-primary bg-accent px-10 py-5 text-xs font-black"
                    >
                        VINCULAR MI TOKEN AHORA
                    </button>
                </div>
            </Motion.div>
        </div>
    )
}

export default FinanzasView
