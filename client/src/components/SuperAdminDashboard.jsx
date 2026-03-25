import React, { useState, useEffect, useCallback } from 'react'
import { LayoutGrid, Truck, DollarSign, Activity, AlertOctagon, ShieldAlert, History, User, MapPin } from 'lucide-react'
import StatCard from './StatCard'
import { useApi } from '../hooks/useApi'
import { formatMoney, formatDate } from '../utils/DashboardConstants'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const SuperAdminDashboard = () => {
  const { callApi, loading } = useApi()
  const [data, setData] = useState({
    stats: {
      total_cooperativas: 0,
      total_vehiculos: 0,
      total_rutas_activas: 0,
      recaudacion_total: '0.00',
      proyeccion_saas: '0.00'
    },
    cooperativas: []
  })
  
  const [activeTab, setActiveTab] = useState('cooperativas')
  const [forensicData, setForensicData] = useState({ incidencias: [], summary: { total_alerts: 0, critical_count: 0 } })
  const [loadingForense, setLoadingForense] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [newCoop, setNewCoop] = useState({ nombre: '', rif: '' })

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await callApi('admin/cooperativas.php', {
        method: 'POST',
        body: JSON.stringify(newCoop)
      })
      setShowModal(false)
      setNewCoop({ nombre: '', rif: '' })
      // Refresh
      const result = await callApi('admin/master_stats.php')
      setData(result)
    } catch {
      alert("Error registrando cooperativa")
    }
  }

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const result = await callApi('admin/master_stats.php')
        setData(result)
      } catch {
        console.error("Master Dashboard error")
      }
    }
    fetchMasterData()
  }, [callApi])

  const fetchForensicData = useCallback(async () => {
    setLoadingForense(true)
    try {
      const result = await callApi('admin/audit_forensic.php')
      setForensicData(result)
    } catch {
      console.error("Forensic Audit error")
    } finally {
      setLoadingForense(false)
    }
  }, [callApi])

  useEffect(() => {
    if (activeTab === 'forense') {
      fetchForensicData()
    }
  }, [activeTab, fetchForensicData])

  if (loading && data.cooperativas.length === 0) {
    return (
      <div style={{ background: '#0a0b12', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="neon-text animate-pulse">SISTEMA GLOBAL - ACCEDIENDO AL NÚCLEO...</div>
      </div>
    )
  }
  
  const handleDBBackup = async () => {
    if (!window.confirm("¿Deseas generar un backup completo de la base de datos y recibirlo en Telegram?")) return
    try {
      await callApi('reportes_exportacion.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'db_backup' })
      })
      alert("¡Backup iniciado! Revisa tu Telegram.")
    } catch {
      alert("Error iniciando backup.")
    }
  }

  return (
    <main className="view-container animate-fade">
      <header className="p-mb-6">
        <div className="p-flex p-flex-col md:p-flex-row p-justify-between p-items-start md:p-items-end p-gap-6">
          <div>
            <div className="p-flex p-items-center p-gap-3 p-mb-2">
              <Activity size={18} className="p-text-accent p-neon-glow" />
              <span className="p-text-[10px] p-font-black p-uppercase p-tracking-widest p-text-accent">SISTEMA GLOBAL - MODO DIOS</span>
            </div>
            <h1 className="p-font-black p-text-white p-tracking-tighter p-neon-text">Panel Maestro</h1>
            <p className="p-text-white-40 p-font-bold p-mt-2">Supervisando la infraestructura de transporte global</p>
          </div>
          <div className="p-flex p-flex-col sm:p-flex-row p-gap-3 p-w-full md:p-w-auto">
            <button 
              onClick={handleDBBackup}
              className="p-glass-premium p-px-6 p-py-3 p-rounded-2xl p-font-black p-text-xs p-flex p-items-center p-justify-center p-gap-2 hover:p-bg-white-5 p-transition-all"
            >
              <Activity size={16} />
              BACKUP SQL
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary p-px-8 p-py-3 p-text-xs p-w-full sm:p-w-auto"
            >
              + REGISTRAR COOPERATIVA
            </button>
          </div>
        </div>
      </header>

      {/* Global Stats */}
      <div className="p-grid p-grid-cols-1 md:p-grid-cols-2 lg:p-grid-cols-4 p-gap-4 p-mb-8">
        <StatCard label="COOPERATIVAS" value={data.stats.total_cooperativas} icon={LayoutGrid} color="var(--accent)" />
        <StatCard label="FLOTA TOTAL" value={data.stats.total_vehiculos} icon={Truck} color="var(--primary)" />
        <StatCard label="RECAUDACIÓN" value={formatMoney(data.stats.recaudacion_total)} icon={DollarSign} color="var(--success)" />
        <StatCard label="PROYECCIÓN SAAS" value={formatMoney(data.stats.proyeccion_saas)} icon={Activity} color="var(--warning)" />
      </div>

      {/* Tabs Navigation */}
      <div className="p-flex p-gap-4 p-mb-8 p-border-b p-border-white-5">
        <button 
          onClick={() => setActiveTab('cooperativas')}
          className={`p-pb-4 p-px-2 p-font-black p-transition-all p-text-xs p-tracking-widest ${activeTab === 'cooperativas' ? 'p-border-b-2 p-border-accent p-text-white' : 'p-text-white-40 hover:p-text-white'}`}
        >
          COOPERATIVAS
        </button>
        <button 
          onClick={() => setActiveTab('forense')}
          className={`p-pb-4 p-px-2 p-font-black p-transition-all p-flex p-items-center p-gap-2 p-text-xs p-tracking-widest ${activeTab === 'forense' ? 'p-border-b-2 p-border-danger p-text-red-500' : 'p-text-white-40 hover:p-text-white'}`}
        >
          <ShieldAlert size={18} />
          SEGURIDAD FORENSE
          {forensicData.summary.critical_count > 0 && (
            <span className="p-bg-red-500 p-text-white p-text-[10px] p-px-2 p-py-0.5 p-rounded-pill animate-pulse">
              {forensicData.summary.critical_count} CRÍTICO
            </span>
          )}
        </button>
      </div>

      {activeTab === 'cooperativas' ? (
        <section className="p-space-y-4">
          <div className="p-flex p-justify-between p-items-center p-mb-4">
            <h2 className="p-text-xl p-font-black p-text-white p-tracking-tight">Cooperativas Federadas</h2>
            <span className="p-text-white-30 p-text-[10px] p-font-black p-uppercase p-tracking-widest">Estado de Red: ONLINE</span>
          </div>
          
          <div className="p-grid p-grid-cols-1 md:p-grid-cols-2 lg:p-grid-cols-3 p-gap-4">
            {data.cooperativas.map(coop => (
              <div key={coop.id} className="p-glass-premium p-p-5 md:p-p-6 p-relative p-overflow-hidden p-group hover:p-border-accent-20 p-transition-shadow">
                <div className="p-absolute p-top-0 p-right-0 p-p-4 p-font-black p-text-[10px] p-text-white-20 p-tracking-widest">
                  COOP_{coop.id}
                </div>
                <h3 className="p-text-lg md:p-text-xl p-font-black p-text-white p-mb-6 p-tracking-tight">{coop.nombre}</h3>
                <div className="p-flex p-flex-col p-gap-3 p-text-white-40 p-text-sm p-font-bold">
                  <div className="p-flex p-justify-between">
                    <span className="p-uppercase p-tracking-widest p-text-[10px]">RIF:</span>
                    <span className="p-text-white">{coop.rif}</span>
                  </div>
                  <div className="p-flex p-justify-between">
                    <span className="p-uppercase p-tracking-widest p-text-[10px]">Vehículos:</span>
                    <span className="p-text-white p-font-black">{coop.vehiculos_count}</span>
                  </div>
                  <div className="p-flex p-justify-between">
                    <span className="p-uppercase p-tracking-widest p-text-[10px]">Suscripción:</span>
                    <span className="p-text-amber-500">{formatMoney(coop.vehiculos_count * 30)}</span>
                  </div>
                </div>
                <div className="p-mt-8 p-flex p-flex-col sm:p-flex-row p-gap-3">
                  <button className="btn-primary p-flex-1 p-py-3 p-text-[10px] p-tracking-widest">CONTROL REMOTO</button>
                  <button className="p-glass-premium p-px-4 p-py-3 p-text-[10px] p-font-black hover:p-bg-white-5 p-tracking-widest">AUDITORÍA</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="p-space-y-6 animate-fade">
          <div className="p-flex p-flex-col md:p-flex-row p-justify-between p-items-start md:p-items-center p-gap-4 p-mb-8">
            <h2 className="p-text-2xl p-font-black p-text-red-500 p-flex p-items-center p-gap-3 p-tracking-tight">
              <ShieldAlert size={28} /> Registro Forense de Fraudes
            </h2>
            <button onClick={fetchForensicData} className="p-text-[10px] p-text-white-40 p-font-black p-uppercase p-tracking-widest hover:p-text-accent p-flex p-items-center p-gap-2">
              <History size={14} /> ACTUALIZAR FEED
            </button>
          </div>

          <div className="p-space-y-4">
            {loadingForense ? (
              <div className="p-py-20 p-text-center p-text-accent p-font-black p-uppercase p-tracking-widest animate-pulse">ESCANEANDO INFRAESTRUCTURA...</div>
            ) : forensicData.incidencias.length === 0 ? (
              <div className="p-glass-premium p-p-16 p-text-center p-text-white-20 p-rounded-3xl p-border p-border-dashed p-border-white-5 p-flex p-flex-col p-items-center p-gap-4">
                <ShieldAlert size={48} className="p-opacity-20" />
                <p className="p-text-[10px] p-font-black p-uppercase p-tracking-widest">No se han detectado anomalías críticas en las últimas 24 horas.</p>
              </div>
            ) : (
              forensicData.incidencias.map((item, idx) => (
                <div key={idx} className={`p-glass-premium p-p-6 md:p-p-8 p-rounded-[2rem] p-flex p-flex-col lg:p-flex-row p-gap-6 md:p-gap-8 hover:p-bg-white-5 p-transition-all p-border-l-4 ${
                     item.severidad === 'Crítica' ? 'p-border-red-500' : item.severidad === 'Alta' ? 'p-border-amber-500' : 'p-border-accent'
                }`}>
                  <div className={`p-w-16 p-h-16 p-rounded-2xl p-flex p-items-center p-justify-center p-shrink-0 ${item.severidad === 'Crítica' ? 'p-bg-red-500/10 p-text-red-500' : 'p-bg-white-5 p-text-white-20'}`}>
                    <AlertOctagon size={24} />
                  </div>
                  <div className="p-flex-1">
                    <div className="p-flex p-justify-between p-items-start p-mb-3">
                      <span className="p-text-[10px] p-font-black p-uppercase p-tracking-widest p-text-white-30">{item.tipo}</span>
                      <span className="p-text-[10px] p-font-bold p-text-white-20">{formatDate(item.fecha)}</span>
                    </div>
                    <h4 className="p-text-lg md:p-text-xl p-font-black p-text-white p-mb-2 p-tracking-tight">{item.detalle}</h4>
                    <p className="p-text-xs md:p-text-sm p-font-bold p-text-white-40 p-mb-6 p-leading-relaxed">{item.evidencia}</p>
                    <div className="p-flex p-flex-wrap p-gap-6 p-items-center p-pt-4 p-border-t p-border-white-5">
                      <div className="p-flex p-items-center p-gap-2 p-text-[10px] p-font-black p-text-white-30 p-uppercase p-tracking-widest">
                        <User size={12} className="p-text-accent" /> {item.chofer}
                      </div>
                      <div className="p-flex p-items-center p-gap-2 p-text-[10px] p-font-black p-text-white-30 p-uppercase p-tracking-widest">
                        <MapPin size={12} className="p-text-accent" /> {item.cooperativa}
                      </div>
                    </div>
                  </div>
                  <div className="p-flex p-flex-row lg:p-flex-col p-items-center lg:p-items-end p-justify-between lg:p-justify-center p-gap-4 p-shrink-0">
                    <span className={`p-px-4 p-py-1.5 p-rounded-pill p-text-[10px] p-font-black p-uppercase p-tracking-widest ${item.severidad === 'Crítica' ? 'p-bg-red-500 p-text-white p-shadow-premium' : 'p-bg-white-10 p-text-white-40'}`}>
                      {item.severidad}
                    </span>
                    <button className="p-text-[10px] p-font-black p-text-accent p-uppercase p-tracking-widest hover:p-underline">EVIDENCIA</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="p-fixed p-inset-0 p-z-50 p-flex p-items-center p-justify-center p-p-6">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="p-absolute p-inset-0 p-bg-black/90 p-backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="p-relative p-w-full p-max-w-md p-glass-premium p-rounded-[2.5rem] p-p-8 md:p-p-10 p-overflow-hidden p-shadow-premium"
            >
              <h2 className="p-text-2xl p-font-black p-text-white p-mb-2 p-tracking-tight">Nueva Cooperativa</h2>
              <p className="p-text-white-40 p-font-bold p-text-xs p-mb-8">Registra una nueva organización en la infraestructura SaaS.</p>
              
              <form onSubmit={handleRegister} className="p-space-y-6">
                <div>
                  <label className="p-text-[10px] p-font-black p-text-accent p-uppercase p-tracking-widest p-mb-2 p-block">NOMBRE COMERCIAL</label>
                  <input 
                    type="text" 
                    value={newCoop.nombre}
                    onChange={e => setNewCoop({...newCoop, nombre: e.target.value})}
                    className="p-p-4 p-bg-white-5 p-rounded-2xl p-border p-border-white-10 p-text-white p-w-full p-font-bold focus:p-border-accent p-outline-none"
                    placeholder="Ej. Linea Maturín Express"
                    required
                  />
                </div>
                <div>
                  <label className="p-text-[10px] p-font-black p-text-accent p-uppercase p-tracking-widest p-mb-2 p-block">RIF / IDENTIFICADOR</label>
                  <input 
                    type="text" 
                    value={newCoop.rif}
                    onChange={e => setNewCoop({...newCoop, rif: e.target.value})}
                    className="p-p-4 p-bg-white-5 p-rounded-2xl p-border p-border-white-10 p-text-white p-w-full p-font-bold focus:p-border-accent p-outline-none"
                    placeholder="J-12345678-9"
                    required
                  />
                </div>
                
                <div className="p-flex p-flex-col sm:p-flex-row p-gap-4 p-pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="p-flex-1 p-p-4 p-bg-white-5 p-rounded-2xl p-font-black p-text-white-40 p-uppercase p-tracking-widest hover:p-bg-white-10 p-transition-all">CANCELAR</button>
                  <button type="submit" className="btn-primary p-flex-1 p-p-4 p-uppercase p-tracking-widest">DAR DE ALTA</button>
                </div>
              </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default SuperAdminDashboard
