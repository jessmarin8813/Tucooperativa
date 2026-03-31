import React, { useState, useEffect, useCallback } from 'react'
import { ShieldAlert, Activity, Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/ui/LoadingSpinner'

import { formatDate } from '../utils/DashboardConstants'

const ForensicView = () => {
    const { callApi, loading } = useApi()
    const [auditLog, setAuditLog] = useState([])
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const fetchAudit = useCallback(async () => {
        try {
            const res = await callApi('admin/audit_forensic.php')
            setAuditLog(res) // res.incidencias and res.summary
        } catch { /* Handled */ }
    }, [callApi])

    useEffect(() => {
        let ignore = false
        const init = async () => {
            await Promise.resolve()
            if (!ignore) fetchAudit()
        }
        init()
        return () => { ignore = true }
    }, [fetchAudit])

    if (loading && (auditLog.incidencias || []).length === 0) return <LoadingSpinner />

    return (
        <div className="view-container animate-fade">
            <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="h1-premium neon-text">Hub Forense & Auditoría</h1>
                    <p className="p-subtitle">Rastreo profundo de anomalías y actividad crítica</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass" style={{ padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <div className="animate-pulse" style={{ width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '100px' }} />
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--danger)', textTransform: 'uppercase' }}>Escaneo Activo</span>
                    </div>
                </div>
            </header>


            <div className="glass" style={{ overflow: 'hidden', border: 'none', background: isMobile ? 'transparent' : 'var(--bg-card)' }}>
                <div style={{ padding: isMobile ? '0 0 16px 0' : '24px', borderBottom: isMobile ? 'none' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em' }}>Log Forense de Actividad</h3>
                </div>
                {!isMobile ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '20px 24px' }}>Timestamp</th>
                                    <th style={{ padding: '20px 24px' }}>Incidencia / Módulo</th>
                                    <th style={{ padding: '20px 24px' }}>Chofer</th>
                                    <th style={{ padding: '20px 24px' }}>Detalles del Hallazgo</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'right' }}>Riesgo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(auditLog.incidencias || []).map((log, i) => (
                                    <tr key={i} className="glass-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                                <Clock size={12} />
                                                {log.fecha ? formatDate(log.fecha) : 'Recién'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>{log.tipo}</p>
                                            <p style={{ fontSize: '0.6rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 900 }}>{log.evento || log.modulo}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.usuario}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'white', maxWidth: '350px', whiteSpace: 'normal' }}>
                                            {log.descripcion}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <span style={{ 
                                                padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
                                                background: log.nivel === 'alto' ? 'rgba(239, 68, 68, 0.1)' : log.nivel === 'medio' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: log.nivel === 'alto' ? 'var(--danger)' : log.nivel === 'medio' ? 'var(--warning)' : 'var(--success)',
                                                border: `1px solid ${log.nivel === 'alto' ? 'var(--danger)' : log.nivel === 'medio' ? 'var(--warning)' : 'var(--success)'}22`
                                            }}>
                                                {log.nivel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(auditLog.incidencias || []).map((log, i) => (
                            <div key={i} className="glass" style={{ padding: '20px', borderRadius: '18px', borderLeft: `4px solid ${log.nivel === 'alto' ? 'var(--danger)' : log.nivel === 'medio' ? 'var(--warning)' : 'var(--success)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        <Clock size={10} />
                                        {log.fecha ? formatDate(log.fecha) : 'Recién'}
                                    </div>
                                    <span style={{ 
                                        padding: '4px 10px', borderRadius: '100px', fontSize: '8px', fontWeight: 950, textTransform: 'uppercase',
                                        background: log.nivel === 'alto' ? 'var(--danger)' : log.nivel === 'medio' ? 'var(--warning)' : 'var(--success)',
                                        color: 'black'
                                    }}>
                                        Riesgo {log.nivel}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'white', marginBottom: '2px' }}>{log.tipo}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 950 }}>{log.evento || log.modulo}</span>
                                        <div style={{ width: '3px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>{log.usuario}</span>
                                    </div>
                                </div>

                                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4' }}>
                                    {log.descripcion}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ForensicView
