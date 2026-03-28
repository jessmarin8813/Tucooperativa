import React, { useState, useEffect, useCallback } from 'react'
import { LayoutGrid, Truck, DollarSign, Activity, AlertOctagon, ShieldAlert, History, User, MapPin } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
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
    let ignore = false
    const init = async () => {
      await Promise.resolve()
      if (ignore) return
      try {
        const result = await callApi('admin/master_stats.php')
        setData(result)
      } catch {
        console.error("Master Dashboard error")
      }
    }
    init()
    return () => { ignore = true }
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
    let ignore = false
    const init = async () => {
      await Promise.resolve()
      if (!ignore && activeTab === 'forense') {
        fetchForensicData()
      }
    }
    init()
    return () => { ignore = true }
  }, [activeTab, fetchForensicData])

  if (loading && (data?.cooperativas || []).length === 0) {
    return (
      <div style={{ background: '#0a0b12', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="neon-text animate-pulse" style={{ fontSize: '1.2rem', fontWeight: 800 }}>SISTEMA GLOBAL - ACCEDIENDO AL NÚCLEO...</div>
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
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Activity size={18} style={{ color: 'var(--accent)' }} className="animate-pulse" />
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em' }}>SISTEMA GLOBAL - MODO DIOS</span>
            </div>
            <h1 className="neon-text brand" style={{ fontSize: '3rem', fontWeight: 900 }}>Panel Maestro</h1>
            <p style={{ color: 'var(--text-dim)', fontWeight: 600, marginTop: '8px' }}>Supervisando la infraestructura de transporte global</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={handleDBBackup}
              className="glass"
              style={{ padding: '16px 24px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}
            >
              <Activity size={18} />
              BACKUP SQL
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary"
              style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: 800 }}
            >
              + REGISTRAR COOPERATIVA
            </button>
          </div>
        </div>
      </header>

      {/* Global Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <StatCard label="COOPERATIVAS" value={data.stats.total_cooperativas} icon={LayoutGrid} color="var(--accent)" />
        <StatCard label="FLOTA TOTAL" value={data.stats.total_vehiculos} icon={Truck} color="var(--primary)" />
        <StatCard label="RECAUDACIÓN" value={formatMoney(data.stats.recaudacion_total)} icon={DollarSign} color="var(--success)" />
        <StatCard label="PROYECCIÓN SAAS" value={formatMoney(data.stats.proyeccion_saas)} icon={Activity} color="var(--warning)" />
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', borderBottom: '1px solid var(--glass-border)' }}>
        <button 
          onClick={() => setActiveTab('cooperativas')}
          style={{ 
            paddingBottom: '20px', 
            fontWeight: 800, 
            fontSize: '0.875rem', 
            letterSpacing: '0.1em',
            borderBottom: activeTab === 'cooperativas' ? '3px solid var(--accent)' : 'none',
            color: activeTab === 'cooperativas' ? 'white' : 'var(--text-dim)',
            background: 'none'
          }}
        >
          COOPERATIVAS
        </button>
        <button 
          onClick={() => setActiveTab('forense')}
          style={{ 
            paddingBottom: '20px', 
            fontWeight: 800, 
            fontSize: '0.875rem', 
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: activeTab === 'forense' ? '3px solid var(--danger)' : 'none',
            color: activeTab === 'forense' ? 'var(--danger)' : 'var(--text-dim)',
            background: 'none'
          }}
        >
          <ShieldAlert size={18} />
          SEGURIDAD FORENSE
          {forensicData.summary.critical_count > 0 && (
            <span style={{ background: 'var(--danger)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '100px' }} className="animate-pulse">
              {forensicData.summary.critical_count} CRÍTICO
            </span>
          )}
        </button>
      </div>

      {activeTab === 'cooperativas' ? (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>Cooperativas Federadas</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>ESTADO DE RED: ONLINE</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {data.cooperativas.map(coop => (
              <div key={coop.id} className="glass glass-hover" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', fontWeight: 900, fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                  COOP_{coop.id}
                </div>
                <h3 className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '24px' }}>{coop.nombre}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.65rem' }}>RIF:</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>{coop.rif}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Vehículos:</span>
                    <span style={{ color: 'white', fontWeight: 900 }}>{coop.vehiculos_count}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Suscripción:</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{formatMoney(coop.vehiculos_count * 30)}</span>
                  </div>
                </div>
                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.65rem', fontWeight: 800 }}>CONTROL REMOTO</button>
                  <button className="glass" style={{ px: '16px', padding: '12px', fontSize: '0.65rem', fontWeight: 800 }}>AUDITORÍA</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 className="neon-text" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ShieldAlert size={28} /> Registro Forense de Fraudes
            </h2>
            <button onClick={fetchForensicData} style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', background: 'none' }}>
              <History size={14} /> ACTUALIZAR FEED
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {loadingForense ? (
              <div style={{ padding: '80px', textAlign: 'center', color: 'var(--accent)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }} className="animate-pulse">ESCANEANDO INFRAESTRUCTURA...</div>
            ) : (forensicData?.incidencias || []).length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }} className="glass">
                <ShieldAlert size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                <p style={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>No se han detectado anomalías críticas en las últimas 24 horas.</p>
              </div>
            ) : (
              (forensicData?.incidencias || []).map((item, idx) => (
                <div key={idx} className="glass glass-hover" style={{ 
                    padding: '32px', 
                    display: 'flex', 
                    gap: '32px', 
                    borderLeft: `6px solid ${item.severidad === 'Crítica' ? 'var(--danger)' : item.severidad === 'Alta' ? 'var(--warning)' : 'var(--accent)'}` 
                }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.severidad === 'Crítica' ? 'var(--danger)' : 'var(--text-dim)' }}>
                    <AlertOctagon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.tipo}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{formatDate(item.fecha)}</span>
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{item.detalle}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '24px', lineHeight: 1.6 }}>{item.evidencia}</p>
                    <div style={{ display: 'flex', gap: '32px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                        <User size={12} style={{ color: 'var(--accent)' }} /> {item.chofer}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                        <MapPin size={12} style={{ color: 'var(--accent)' }} /> {item.cooperativa}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: '16px' }}>
                    <span style={{ 
                        padding: '6px 16px', 
                        borderRadius: '100px', 
                        fontSize: '0.75rem', 
                        fontWeight: 900, 
                        background: item.severidad === 'Crítica' ? 'var(--danger)' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        boxShadow: item.severidad === 'Crítica' ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
                    }}>
                      {item.severidad}
                    </span>
                    <button style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', background: 'none', borderBottom: '1px solid currentColor' }}>EVIDENCIA</button>
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
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            />
            <Motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass"
              style={{ position: 'relative', width: '100%', maxWidth: '480px', padding: '48px', overflow: 'hidden' }}
            >
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Nueva Cooperativa</h2>
              <p style={{ color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '32px' }}>Registra una nueva organización en la infraestructura SaaS.</p>
              
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>NOMBRE COMERCIAL</label>
                  <input 
                    type="text" 
                    value={newCoop.nombre}
                    onChange={e => setNewCoop({...newCoop, nombre: e.target.value})}
                    className="glass"
                    style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', width: '100%', fontWeight: 800, outline: 'none' }}
                    placeholder="Ej. Linea Maturín Express"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>RIF / IDENTIFICADOR</label>
                  <input 
                    type="text" 
                    value={newCoop.rif}
                    onChange={e => setNewCoop({...newCoop, rif: e.target.value})}
                    className="glass"
                    style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', width: '100%', fontWeight: 800, outline: 'none' }}
                    placeholder="J-12345678-9"
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="glass" style={{ flex: 1, padding: '16px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>CANCELAR</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px', fontWeight: 800, textTransform: 'uppercase' }}>DAR DE ALTA</button>
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
