import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, User, Car, ShieldCheck, CreditCard } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'
import { formatMoney, formatBs, formatDate } from '../utils/DashboardConstants'

const CobranzaView = () => {
    const { callApi, loading: apiLoading } = useApi()
    const [data, setData] = useState({ resumen: [], pendientes: [] })
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const res = await callApi('admin/cobranza.php')
            setData(res)
        } catch { /* Handled */ }
        finally { setLoading(false) }
    }, [callApi])

    useEffect(() => {
        fetchData()
    }, [fetchData])

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

    const totalPendienteMonto = data.pendientes.reduce((acc, p) => acc + p.monto, 0)
    const totalDeudaFlota = data.resumen.reduce((acc, v) => acc + Math.max(0, v.saldo_pendiente), 0)

    return (
        <div className="view-container animate-fade">
            <header style={{ marginBottom: '32px' }}>
                <h1 className="h1-premium neon-text">Gestión de Cobranza</h1>
                <p className="p-subtitle">Control de solvencia y aprobación de abonos diarios</p>
            </header>

            {/* Header / Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
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

            {/* Aprobaciones Pendientes Section */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '4px', height: '24px', background: 'var(--warning)', borderRadius: '100px' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: 'white', letterSpacing: '0.1em' }}>Bandeja de Aprobaciones</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {data.pendientes.length === 0 ? (
                        <div style={{ gridColumn: 'span 2', padding: '64px', textAlign: 'center' }} className="glass">
                            <CheckCircle size={48} style={{ color: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>No hay abonos pendientes de revisión</p>
                        </div>
                    ) : data.pendientes.map((p, i) => (
                        <Motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass glass-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.7 }}>Bs</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{formatBs(p.monto * 60)}</span>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <p style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>{p.chofer}</p>
                                        <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)' }}>{p.placa}</span>
                                    </div>
                                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', marginTop: '4px' }}>Reportado: {formatDate(p.fecha_reportado)}</p>
                                </div>
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button 
                                    onClick={() => handleProcesar(p.id, 'aprobado')} 
                                    style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    className="glass-hover"
                                >
                                    <CheckCircle size={28} />
                                </button>
                                <button 
                                    onClick={() => handleProcesar(p.id, 'rechazado')} 
                                    style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    className="glass-hover"
                                >
                                    <XCircle size={28} />
                                </button>
                             </div>
                        </Motion.div>
                    ))}
                </div>
            </div>

            {/* Solvencia Map */}
            <div className="glass" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 className="neon-text brand" style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <ShieldCheck size={28} style={{ color: 'var(--accent)' }} /> Mapa Maestro de Solvencia
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>Monitoreo de Deuda en Tiempo Real</p>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '24px 40px' }}>Unidad / Chofer</th>
                                <th style={{ padding: '24px 40px', textAlign: 'center' }} className="print:hidden">Cuota</th>
                                <th style={{ padding: '24px 40px', textAlign: 'center' }}>Recaudado</th>
                                <th style={{ padding: '24px 40px', textAlign: 'center' }}>Saldo Actual</th>
                                <th style={{ padding: '24px 40px', textAlign: 'right' }}>Estatus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.resumen.map((v) => (
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
                                    <td style={{ padding: '32px 40px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 700, fontSize: '1.1rem' }} className="print:hidden">{formatMoney(v.cuota_diaria)}</td>
                                    <td style={{ padding: '32px 40px', textAlign: 'center', color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>{formatMoney(v.abonos_totales)}</td>
                                    <td style={{ padding: '32px 40px', textAlign: 'center' }}>
                                        <span className="neon-text" style={{ fontWeight: 900, fontSize: '1.5rem', color: v.saldo_pendiente > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            {formatMoney(v.saldo_pendiente)}
                                        </span>
                                    </td>
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
            </div>
        </div>
    )
}

export default CobranzaView
