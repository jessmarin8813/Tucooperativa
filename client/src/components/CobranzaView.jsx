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
            <header className="p-mb-6">
                <h1 className="p-font-black p-text-white p-tracking-tighter p-neon-text">Gestión de Cobranza</h1>
                <p className="p-text-white-40 p-font-bold p-mt-2">Control de solvencia y aprobación de abonos diarios</p>
            </header>

            {/* Header / Stats Grid */}
            <div className="p-grid p-grid-cols-1 md:p-grid-cols-2 lg:p-grid-cols-3 p-gap-4 p-mb-8">
                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-glass-premium p-p-5 md:p-p-6 p-relative p-overflow-hidden p-group">
                    <div className="p-absolute p-top-0 p-right-0 p-w-24 p-h-24 p-bg-amber-500 p-opacity-10 p-rounded-pill p-blur-3xl p--mr-12 p--mt-12" />
                    <div className="p-flex p-justify-between p-items-start">
                        <div>
                            <p className="p-text-xs p-font-black p-uppercase p-text-white-30 p-tracking-widest p-mb-3">Abonos por Aprobar</p>
                            <h3 className="p-font-black p-text-white p-tracking-tighter">{formatMoney(totalPendienteMonto)}</h3>
                        </div>
                        <div className="p-p-4 p-bg-amber-500 p-bg-opacity-10 p-text-amber-500 p-rounded-2xl p-border p-border-amber-500 p-border-opacity-20">
                            <Clock size={20} className="animate-pulse" />
                        </div>
                    </div>
                </Motion.div>

                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-glass-premium p-p-5 md:p-p-6 p-border-red-500 p-border-opacity-20 p-bg-red-10 p-relative p-overflow-hidden p-group">
                    <div className="p-absolute p-top-0 p-right-0 p-w-24 p-h-24 p-bg-red-500 p-opacity-10 p-rounded-pill p-blur-3xl p--mr-12 p--mt-12" />
                    <div className="p-flex p-justify-between p-items-start">
                        <div>
                            <p className="p-text-xs p-font-black p-uppercase p-text-red-500 p-opacity-60 p-tracking-widest p-mb-3">Deuda Global Flota</p>
                            <h3 className="p-font-black p-text-red-400 p-tracking-tighter">{formatMoney(totalDeudaFlota)}</h3>
                        </div>
                        <div className="p-p-4 p-bg-red-10 p-text-red-500 p-rounded-2xl p-border p-border-red-500 p-border-opacity-20">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </Motion.div>

                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-glass-premium p-p-5 md:p-p-6 p-border-neon p-bg-accent-5 p-overflow-hidden p-group">
                    <div className="p-flex p-justify-between p-items-start">
                        <div>
                            <p className="p-text-xs p-font-black p-uppercase p-text-accent p-tracking-widest p-mb-3">Cuota Diaria Promedio</p>
                            <h3 className="p-font-black p-text-white p-tracking-tighter">$10.00</h3>
                        </div>
                        <div className="p-p-4 p-bg-accent-10 p-text-accent p-rounded-2xl p-border p-border-accent-20">
                            <CreditCard size={20} />
                        </div>
                    </div>
                </Motion.div>
            </div>

            {/* Aprobaciones Pendientes Section */}
            <div className="p-space-y-6 p-mb-12">
                <div className="p-flex p-items-center p-gap-4">
                    <span className="p-w-1 p-h-6 p-bg-amber-500 p-rounded-pill" />
                    <h3 className="p-text-sm md:p-text-lg p-font-black p-uppercase p-text-white p-tracking-widest">Bandeja de Aprobaciones</h3>
                </div>
                <div className="p-grid p-grid-cols-1 md:p-grid-cols-2 p-gap-6">
                    {data.pendientes.length === 0 ? (
                        <div className="md:p-col-span-2 p-p-10 md:p-p-16 p-text-center p-glass p-rounded-3xl p-border p-border-dashed p-border-white-5 p-flex p-flex-col p-items-center p-gap-4">
                            <CheckCircle size={48} className="p-text-white-5" />
                            <p className="p-text-white-20 p-font-black p-uppercase p-tracking-widest p-text-xs">No hay abonos pendientes de revisión</p>
                        </div>
                    ) : data.pendientes.map((p, i) => (
                        <Motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="p-glass-premium p-p-4 md:p-p-6 p-rounded-3xl p-flex p-items-center p-justify-between p-group hover:p-bg-white-5 p-transition-all">
                             <div className="p-flex p-items-center p-gap-4 md:p-gap-6">
                                <div className="p-w-16 p-h-16 md:p-w-20 md:p-h-20 p-rounded-2xl md:p-rounded-3xl p-bg-accent p-text-white p-flex p-flex-col p-items-center p-justify-center p-shadow-premium">
                                    <span className="p-text-[10px] p-font-black p-uppercase p-opacity-60">Bs</span>
                                    <span className="p-text-xl md:p-text-2xl p-font-black p-tracking-tighter">{formatBs(p.monto * 60)}</span>
                                </div>
                                <div>
                                    <div className="p-flex p-items-center p-gap-3">
                                        <p className="p-text-white p-font-black p-text-lg md:p-text-xl p-tracking-tight">{p.chofer}</p>
                                        <span className="p-px-2 p-py-0.5 p-bg-white-5 p-rounded-pill p-text-[10px] p-font-black p-text-white-40 p-uppercase">{p.placa}</span>
                                    </div>
                                    <p className="p-text-[10px] p-text-white-30 p-uppercase p-font-black p-tracking-widest p-mt-1.5">Reportado: {formatDate(p.fecha_reportado)}</p>
                                </div>
                             </div>
                             <div className="p-flex p-items-center p-gap-3 md:p-gap-4">
                                <button 
                                    onClick={() => handleProcesar(p.id, 'aprobado')} 
                                    className="p-w-12 p-h-12 md:p-w-14 md:p-h-14 p-rounded-2xl md:p-rounded-3xl p-bg-emerald-10 p-text-emerald-400 p-border p-border-emerald-500/20 p-flex p-items-center p-justify-center hover:p-bg-emerald-500 hover:p-text-white p-transition-all transform active:scale-95"
                                >
                                    <CheckCircle size={24} />
                                </button>
                                <button 
                                    onClick={() => handleProcesar(p.id, 'rechazado')} 
                                    className="p-w-12 p-h-12 md:p-w-14 md:p-h-14 p-rounded-2xl md:p-rounded-3xl p-bg-red-10 p-text-red-500 p-border p-border-red-500/20 p-flex p-items-center p-justify-center hover:p-bg-red-500 hover:p-text-white p-transition-all transform active:scale-95"
                                >
                                    <XCircle size={24} />
                                </button>
                             </div>
                        </Motion.div>
                    ))}
                </div>
            </div>

            {/* Solvencia Map */}
            <div className="p-glass-premium p-rounded-3xl p-overflow-hidden p-shadow-premium">
                <div className="p-p-6 md:p-p-10 p-border-b p-border-white-5 p-bg-white-5 p-flex p-justify-between p-items-center">
                    <div>
                        <h3 className="p-font-black p-text-white p-tracking-tight p-flex p-items-center p-gap-4">
                            <ShieldCheck size={28} className="p-text-accent" /> Mapa Maestro de Solvencia
                        </h3>
                        <p className="p-text-xs p-text-white-30 p-font-bold p-uppercase p-tracking-widest p-mt-2">Monitoreo de Deuda en Tiempo Real</p>
                    </div>
                </div>
                <div className="p-overflow-x-auto">
                    <table className="p-w-full p-text-left">
                        <thead>
                            <tr className="p-text-xs p-font-black p-uppercase p-text-white-20 p-tracking-widest p-border-b p-border-white-5">
                                <th className="p-p-4 md:p-p-6">Unidad / Chofer</th>
                                <th className="p-p-4 md:p-p-6 p-text-center p-hidden md:p-table-cell">Cuota</th>
                                <th className="p-p-4 md:p-p-6 p-text-center">Recaudado</th>
                                <th className="p-p-4 md:p-p-6 p-text-center">Saldo Actual</th>
                                <th className="p-p-4 md:p-p-6 p-text-right">Estatus</th>
                            </tr>
                        </thead>
                        <tbody className="p-divide-y p-divide-white-5">
                            {data.resumen.map((v) => (
                                <tr key={v.id} className="p-glass-hover p-group">
                                    <td className="p-p-6 md:p-p-10">
                                        <div className="p-flex p-items-center p-gap-4 md:p-gap-5">
                                            <div className="p-w-10 p-h-10 md:p-w-12 md:p-h-12 p-bg-white-5 p-rounded-2xl md:p-rounded-3xl p-flex p-items-center p-justify-center p-text-white-20 group-hover:p-bg-accent-10 group-hover:p-text-accent transition-colors">
                                                <Car size={20} />
                                            </div>
                                            <div>
                                                <p className="p-text-white p-font-black p-text-lg md:p-text-xl group-hover:p-translate-x-1 transition-transform">{v.placa}</p>
                                                <p className="p-text-[10px] p-text-white-30 p-font-black p-uppercase p-mt-1">{v.chofer}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-p-6 md:p-p-10 p-text-center p-text-white-40 p-font-bold p-text-lg p-hidden md:p-table-cell">{formatMoney(v.cuota_diaria)}</td>
                                    <td className="p-p-6 md:p-p-10 p-text-center p-text-emerald-400 p-font-bold p-text-lg">{formatMoney(v.abonos_totales)}</td>
                                    <td className="p-p-6 md:p-p-10 p-text-center">
                                        <span className={`p-font-black p-text-xl md:p-text-2xl p-tracking-tighter ${v.saldo_pendiente > 0 ? 'p-text-red-500 p-neon-text' : 'p-text-emerald-400'}`}>
                                            {formatMoney(v.saldo_pendiente)}
                                        </span>
                                    </td>
                                    <td className="p-p-6 md:p-p-10 p-text-right">
                                        <span className={`p-px-3 md:p-px-6 p-py-2 md:p-py-3 p-rounded-pill p-text-[10px] md:p-text-xs p-font-black p-uppercase p-tracking-widest p-border ${
                                            v.estado_solvencia === 'solvente' ? 'p-bg-emerald-10 p-text-emerald-400 p-border-emerald-500/20' :
                                            v.estado_solvencia === 'critico' ? 'p-bg-red-500 p-text-white p-shadow-premium' :
                                            'p-bg-amber-10 p-text-amber-500 p-border-amber-500/20'
                                        }`}>
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
