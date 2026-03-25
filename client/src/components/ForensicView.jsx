import React, { useState, useEffect, useCallback } from 'react'
import { ShieldAlert, Activity, Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from './LoadingSpinner'

const ForensicView = () => {
    const { callApi, loading } = useApi()
    const [auditLog, setAuditLog] = useState([])
    const [filter, setFilter] = useState('all')

    const fetchAudit = useCallback(async () => {
        try {
            const res = await callApi('admin/audit_forensic.php')
            setAuditLog(res)
        } catch { /* Handled */ }
    }, [callApi])

    useEffect(() => {
        fetchAudit()
    }, [fetchAudit])

    if (loading && auditLog.length === 0) return <LoadingSpinner />

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

            <div className="p-grid p-grid-cols-4" style={{ marginBottom: '32px' }}>
                <div className="glass" style={{ padding: '24px' }}>
                    <p className="text-label">Eventos Totales</p>
                    <h3 className="text-value">{auditLog.length}</h3>
                </div>
                <div className="glass" style={{ padding: '24px' }}>
                    <p className="text-label" style={{ color: 'var(--danger)' }}>Riesgos Detectados</p>
                    <h3 className="text-value" style={{ color: 'var(--danger)' }}>{auditLog.filter(l => l.nivel === 'alto').length}</h3>
                </div>
                <div className="glass" style={{ padding: '24px' }}>
                    <p className="text-label" style={{ color: 'var(--warning)' }}>Advertencias</p>
                    <h3 className="text-value" style={{ color: 'var(--warning)' }}>{auditLog.filter(l => l.nivel === 'medio').length}</h3>
                </div>
                <div className="glass" style={{ padding: '24px' }}>
                    <p className="text-label" style={{ color: 'var(--success)' }}>Integridad</p>
                    <h3 className="text-value" style={{ color: 'var(--success)' }}>100%</h3>
                </div>
            </div>

            <div className="glass" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'white' }}>Log Forense de Actividad</h3>
                    <div className="p-flex p-gap-4">
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="glass"
                            style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 800 }}
                        >
                            <option value="all">TODOS LOS NIVELES</option>
                            <option value="alto">NIVEL ALTO</option>
                            <option value="medio">NIVEL MEDIO</option>
                            <option value="bajo">NIVEL BAJO</option>
                        </select>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '20px 24px' }}>Timestamp</th>
                                <th style={{ padding: '20px 24px' }}>Evento / Módulo</th>
                                <th style={{ padding: '20px 24px' }}>Usuario / IP</th>
                                <th style={{ padding: '20px 24px' }}>Detalles</th>
                                <th style={{ padding: '20px 24px', textAlign: 'right' }}>Riesgo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLog.filter(l => filter === 'all' || l.nivel === filter).map((log, i) => (
                                <tr key={i} className="glass-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                            <Clock size={12} />
                                            {new Date(log.fecha).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>{log.evento}</p>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 900 }}>{log.modulo}</p>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.usuario}</p>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{log.ip}</p>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'white', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {log.descripcion}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <span style={{ 
                                            padding: '4px 12px', borderRadius: '100px', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase',
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
            </div>
        </div>
    )
}

export default ForensicView
