import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, User, Car, ShieldCheck, CreditCard } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatMoney, formatBs, formatDate } from '../utils/DashboardConstants'

const CobranzaView = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [data, setData] = useState({ resumen: [], pendientes: [], cola_validacion: [] })
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(true)
    const [showAllSolventes, setShowAllSolventes] = useState(false)
    const { callApi, loading: apiLoading } = useApi()

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const fetchData = useCallback(async () => {
        try {
            const res = await callApi(`admin/cobranza.php?fecha=${date}`)
            setData(res)
        } catch { /* Handled */ }
        finally { setLoading(false) }
    }, [callApi, date])

    useEffect(() => {
        let ignore = false
        const init = async () => {
            await Promise.resolve()
            if (!ignore) await fetchData()
        }
        init()
        
        return () => { 
            ignore = true;
        }
    }, [fetchData])

    // REALTIME SYNC (Standardized)
    useRealtime((event) => {
        if (event.type === 'UPDATE_COBRANZA') {
            fetchData();
        }
    });

    const handleProcesar = async (id, accion) => {
        if (!window.confirm(`¿Seguro que deseas ${accion} este pago?`)) return
        try {
            await callApi('admin/procesar_pago.php', {
                method: 'POST',
                body: JSON.stringify({ id, accion })
            })
            fetchData()
        } catch { /* Handled */ }
    }

    if (loading || apiLoading) return <LoadingSpinner />

    const totalPendienteMonto = (data?.pendientes || []).reduce((acc, p) => {
        const normalizedMonto = p.moneda === 'Bs' ? (p.monto / (p.tasa_cambio || 1)) : p.monto;
        return acc + normalizedMonto;
    }, 0)
    const totalDeudaFlota = (data?.resumen || []).reduce((acc, v) => acc + Math.max(0, v?.saldo_pendiente || 0), 0)

    const visibleResumen = showAllSolventes 
        ? (data?.resumen || []) 
        : (data?.resumen || []).filter(v => v.estado_solvencia !== 'solvente')

    return (
        <div>
            <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="h1-premium neon-text">Gestión de Cobranza</h1>
                    <p className="p-subtitle">Control de solvencia y aprobación de abonos diarios</p>
                </div>
                <div className="p-flex p-items-center p-gap-4">
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass"
                        style={{ padding: '12px 20px', borderRadius: '12px', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>
            </header>

            {/* Header / Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-label" style={{ marginBottom: '16px' }}>Abonos por Aprobar</p>
                            <h2 className="text-value neon-text">{formatMoney(totalPendienteMonto)}</h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <Clock size={24} className="animate-pulse" />
                        </div>
                    </div>
                </Motion.div>

                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass" style={{ padding: '32px', position: 'relative', overflow: 'hidden', border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-label" style={{ color: 'var(--danger)', opacity: 0.8, marginBottom: '16px' }}>Deuda Global Flota</p>
                            <h2 className="text-value" style={{ color: 'var(--danger)' }}>{formatMoney(totalDeudaFlota)}</h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </Motion.div>

                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass neon-border" style={{ padding: '32px', background: 'rgba(6, 182, 212, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-label" style={{ color: 'var(--accent)', marginBottom: '16px' }}>Cuota Diaria Promedio</p>
                            <h2 className="text-value neon-text">$10.00</h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', borderRadius: '16px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                            <CreditCard size={24} />
                        </div>
                    </div>
                </Motion.div>
            </div>

            {/* Validation Queue Section (from RevenueManagement) */}
            {data.cola_validacion?.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--accent)', borderRadius: '100px' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: 'white', letterSpacing: '0.1em' }}>Cola de Validación de Caja</h3>
                    </div>
                    {isMobile ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(data?.cola_validacion || []).map((p) => (
                                <Motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '1.1rem', color: 'white' }}>{p.chofer}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.placa}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total</p>
                                            <p style={{ fontWeight: 900, fontSize: '1.2rem', color: 'white' }}>{formatMoney(parseFloat(p.monto_efectivo || 0) + parseFloat(p.monto_pagomovil || 0))}</p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Efectivo</p>
                                            <p style={{ fontWeight: 800, color: 'var(--success)' }}>{formatMoney(p.monto_efectivo)}</p>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pago Móvil</p>
                                            <p style={{ fontWeight: 800, color: 'var(--accent)' }}>{formatMoney(p.monto_pagomovil)}</p>
                                        </div>
                                    </div>

                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                         <button onClick={() => handleProcesar(p.id, 'aprobado')} className="btn-primary" style={{ height: '52px', fontSize: '0.9rem' }}>VALIDAR</button>
                                         <button onClick={() => handleProcesar(p.id, 'rechazado')} className="btn-secondary" style={{ height: '52px', fontSize: '0.9rem', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>RECHAZAR</button>
                                     </div>
                                </Motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass" style={{ overflow: 'hidden', padding: '0' }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <tr style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                                        <th style={{ padding: '16px 24px' }}>Chofer / Unidad</th>
                                        <th style={{ padding: '16px 24px' }}>Efectivo ($)</th>
                                        <th style={{ padding: '16px 24px' }}>Pago Móvil ($)</th>
                                        <th style={{ padding: '16px 24px' }}>Total</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(data?.cola_validacion || []).map((p) => (
                                        <tr key={p.id} className="glass-hover">
                                            <td style={{ padding: '16px 24px' }}>
                                                <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.chofer}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{p.placa}</p>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--success)' }}>{formatMoney(p.monto_efectivo)}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--accent)' }}>{formatMoney(p.monto_pagomovil)}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: 900 }}>{formatMoney(parseFloat(p.monto_efectivo) + parseFloat(p.monto_pagomovil))}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleProcesar(p.id, 'aprobado')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '10px' }}>VALIDAR</button>
                                                    <button onClick={() => handleProcesar(p.id, 'rechazado')} className="glass" style={{ padding: '8px 16px', fontSize: '10px', color: 'var(--danger)' }}>RECHAZAR</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Aprobaciones Pendientes Section (Driver Submissions) */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '4px', height: '24px', background: 'var(--warning)', borderRadius: '100px' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: 'white', letterSpacing: '0.1em' }}>Abonos Reportados (Bot)</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                    {(data?.pendientes || []).length === 0 ? (
                        <div style={{ gridColumn: 'span 2', padding: '64px', textAlign: 'center' }} className="glass">
                            <CheckCircle size={48} style={{ color: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>No hay abonos pendientes de revisión</p>
                        </div>
                    ) : (data?.pendientes || []).map((p, i) => (
                        <Motion.div 
                            key={p.id} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.05 }} 
                            className="glass glass-hover" 
                            style={{ 
                                padding: isMobile ? '20px' : '24px', 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row', 
                                gap: isMobile ? '20px' : '16px', 
                                alignItems: isMobile ? 'stretch' : 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                             <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                                 {/* Amount Pill */}
                                 <div style={{ 
                                     padding: '10px 16px', 
                                     minWidth: isMobile ? '100%' : '110px', 
                                     borderRadius: '18px', 
                                     background: p.moneda === 'Bs' ? 'var(--primary)' : 'var(--success)', 
                                     color: 'white', 
                                     display: 'flex', 
                                     flexDirection: isMobile ? 'row' : 'column', 
                                     alignItems: 'center', 
                                     justifyContent: isMobile ? 'space-between' : 'center',
                                     boxShadow: `0 8px 16px ${p.moneda === 'Bs' ? 'var(--primary-glow)' : 'var(--success-glow)'}` 
                                 }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8 }}>{p.moneda}</span>
                                    <span style={{ fontSize: isMobile ? '1.2rem' : '1.35rem', fontWeight: 950 }}>{p.moneda === 'Bs' ? formatBs(p.monto) : p.monto}</span>
                                 </div>

                                <div style={{ minWidth: 0, width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                        <p style={{ color: 'white', fontWeight: 900, fontSize: '1.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{p.chofer}</p>
                                        <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', flexShrink: 0 }}>{p.placa}</span>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em', margin: 0 }}>
                                        {formatDate(p.fecha_reportado)} • {p.moneda === 'Bs' ? `Tasa: ${p.tasa_cambio}` : `Ref: ${p.referencia || 'N/A'}`}
                                    </p>
                                </div>
                             </div>

                             {/* Action Buttons */}
                             <div style={{ 
                                 display: 'grid', 
                                 gridTemplateColumns: '1fr 1fr', 
                                 gap: '12px',
                                 width: isMobile ? '100%' : 'auto'
                             }}>
                                <button 
                                    onClick={() => handleProcesar(p.id, 'aprobado')} 
                                    style={{ 
                                        height: isMobile ? '58px' : '56px', 
                                        width: isMobile ? '100%' : '56px', 
                                        borderRadius: '18px', 
                                        background: 'rgba(16, 185, 129, 0.15)', 
                                        color: 'var(--success)', 
                                        border: '2px solid rgba(16, 185, 129, 0.3)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        transition: 'all 0.3s' 
                                    }}
                                    className="glass-hover flex-1"
                                >
                                    <CheckCircle size={isMobile ? 32 : 36} />
                                    {isMobile && <span style={{ marginLeft: '10px', fontWeight: 900, fontSize: '0.8rem' }}>APROBAR</span>}
                                </button>
                                <button 
                                    onClick={() => handleProcesar(p.id, 'rechazado')} 
                                    style={{ 
                                        height: isMobile ? '58px' : '56px', 
                                        width: isMobile ? '100%' : '56px', 
                                        borderRadius: '18px', 
                                        background: 'rgba(239, 68, 68, 0.15)', 
                                        color: 'var(--danger)', 
                                        border: '2px solid rgba(239, 68, 68, 0.3)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        transition: 'all 0.3s' 
                                    }}
                                    className="glass-hover flex-1"
                                >
                                    <XCircle size={isMobile ? 32 : 36} />
                                    {isMobile && <span style={{ marginLeft: '10px', fontWeight: 900, fontSize: '0.8rem' }}>DENEGAR</span>}
                                </button>
                             </div>
                        </Motion.div>
                    ))}
                </div>
            </div>

            {/* Solvencia Map */}
             <div className="glass" style={{ overflow: 'hidden', border: 'none', background: 'transparent' }}>
                 <div style={{ padding: isMobile ? '24px 22px' : '32px 40px', borderBottom: isMobile ? 'none' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h3 className="neon-text brand" style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ShieldCheck size={isMobile ? 24 : 28} style={{ color: 'var(--accent)' }} /> Mapa de Solvencia
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Auditoría de Deuda en Tiempo Real</p>
                    </div>
                    <button 
                        onClick={() => setShowAllSolventes(!showAllSolventes)}
                        className="glass-hover"
                        style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', background: showAllSolventes ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', color: showAllSolventes ? 'var(--success)' : 'white', border: `1px solid ${showAllSolventes ? 'var(--success)' : 'transparent'}`, transition: 'all 0.3s' }}
                    >
                        {showAllSolventes ? 'Ocultar Solventes' : '👀 Ver Todo'}
                    </button>
                </div>

                {isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {visibleResumen.length === 0 && <p style={{textAlign: 'center', padding: '24px', color: 'var(--text-dim)'}}>No hay unidades en esta vista.</p>}
                        {visibleResumen.map((v) => (
                            <Motion.div 
                                key={v.id} 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass"
                                style={{ 
                                    padding: '20px', 
                                    borderLeft: `4px solid ${v.estado_solvencia === 'solvente' ? 'var(--success)' : v.estado_solvencia === 'critico' ? 'var(--danger)' : 'var(--warning)'}`,
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>{v.placa}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>{v.chofer}</p>
                                    </div>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '100px', 
                                        fontSize: '0.6rem', 
                                        fontWeight: 900, 
                                        textTransform: 'uppercase',
                                        background: v.estado_solvencia === 'solvente' ? 'rgba(16, 185, 129, 0.1)' : v.estado_solvencia === 'critico' ? 'var(--danger)' : 'rgba(245, 158, 11, 0.1)',
                                        color: v.estado_solvencia === 'critico' ? 'white' : v.estado_solvencia === 'solvente' ? 'var(--success)' : 'var(--warning)',
                                    }}>
                                        {v.estado_solvencia}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ flex: 1 }}>
                                        <p className="text-label" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>Pagado</p>
                                        <p style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1rem' }}>{formatMoney(v.abonos_totales)}</p>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p className="text-label" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>Saldo</p>
                                        <p style={{ color: v.saldo_pendiente > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 900, fontSize: '1.1rem' }}>{formatMoney(v.saldo_pendiente)}</p>
                                    </div>
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                    <tr style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '24px 40px' }}>Unidad / Chofer</th>
                                        <th style={{ padding: '24px 40px', textAlign: 'center' }}>Cuota</th>
                                        <th style={{ padding: '24px 40px', textAlign: 'center' }}>Total Recaudado</th>
                                        <th style={{ padding: '24px 40px', textAlign: 'right' }}>Estatus</th>
                                    </tr>
                            </thead>
                            <tbody>
                                {visibleResumen.length === 0 && (
                                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: 'var(--text-dim)'}}>No hay unidades en esta vista.</td></tr>
                                )}
                                {visibleResumen.map((v) => (
                                    <tr key={v.id} className="glass-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '32px 40px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                                                    <Car size={24} />
                                                </div>
                                                <div>
                                                    <p style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>{v.placa}</p>
                                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>{v.chofer}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '32px 40px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 700, fontSize: '1.1rem' }}>{formatMoney(v.cuota_diaria)}</td>
                                        <td style={{ padding: '32px 40px', textAlign: 'center', color: 'var(--success)', fontWeight: 900, fontSize: '1.1rem' }}>{formatMoney(v.abonos_totales)}</td>
                                        <td style={{ padding: '32px 40px', textAlign: 'right' }}>
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                padding: '8px 24px', 
                                                borderRadius: '100px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 900, 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.1em',
                                                background: v.estado_solvencia === 'solvente' ? 'rgba(16, 185, 129, 0.1)' : v.estado_solvencia === 'critico' ? 'var(--danger)' : 'rgba(245, 158, 11, 0.1)',
                                                color: v.estado_solvencia === 'critico' ? 'white' : v.estado_solvencia === 'solvente' ? 'var(--success)' : 'var(--warning)',
                                                border: v.estado_solvencia === 'critico' ? 'none' : '1px solid currentColor'
                                            }}>
                                                {v.estado_solvencia}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CobranzaView
