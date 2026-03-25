import React, { useEffect, useState, useCallback } from 'react'
import StatCard from './StatCard'
import FleetList from './FleetList'
import Modal from './Modal'
import VehicleForm from './VehicleForm'
import MaintenanceCenter from './MaintenanceCenter'
import { Truck, Activity, DollarSign, AlertCircle, BarChart3, ShieldCheck, Wrench } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { motion as Motion } from 'framer-motion'

const Dashboard = () => {
  const { callApi, loading, error } = useApi()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [data, setData] = useState({
    stats: {
      total_vehiculos: 0,
      rutas_activas: 0,
      recaudacion_hoy: '0.00',
      alertas_criticas: 0
    },
    vehicles: []
  })
  const [activeTab, setActiveTab] = useState('operaciones')

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!currentUser) {
        const sessionRes = await callApi('session.php')
        setCurrentUser(sessionRes.user)
      }
      const statsRes = await callApi('dashboard.php')
      const fleetRes = await callApi('vehiculos.php')
      setData({ stats: statsRes.stats, vehicles: fleetRes })
    } catch { /* Handled */ }
  }, [callApi, currentUser])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleRegistrationSuccess = () => {
    setIsModalOpen(false)
    fetchDashboardData()
  }

  if (loading && data.stats.total_vehiculos === 0) {
    return (
      <div>
        <div style={{ color: 'var(--primary)', fontWeight: 900, letterSpacing: '0.2em' }} className="animate-pulse">SINCRONIZANDO CENTRO DE MANDO...</div>
      </div>
    )
  }

  return (
    <div>
      <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '48px', gap: '24px' }}>
        <div>
          <h1 className="h1-premium neon-text">Centro de Mando</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p className="p-subtitle">Gestión de Operaciones en Tiempo Real</p>
            <span style={{ fontSize: '9px', fontWeight: 900, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-dim)' }}>v5.1.1-HYPER-COMPACT</span>
          </div>
        </div>
        
        <div className="p-flex p-gap-4 p-items-center">
          {data.stats.alertas_criticas > 0 && (
            <div className="p-glass-premium mobile-hide" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{data.stats.alertas_criticas} ALERTS</span>
            </div>
          )}
          <button 
            className="btn-primary mobile-full-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + REGISTRAR UNIDAD
          </button>
        </div>
      </header>

      {/* CONNECTION HUB */}
      {!currentUser?.telegram_chat_id && (
        <Motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-glass-premium" style={{ padding: 'clamp(24px, 5vw, 40px)', marginBottom: '48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1 }} />
          <div className="p-flex-responsive p-justify-between" style={{ position: 'relative', zIndex: 10, gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0 0 12px' }} className="p-neon-text">¡Conecta tu Centro de Mando!</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, maxWidth: '500px', margin: 0 }}>Recibe alertas del Guardián Forense y notificaciones de caja directamente en tu Telegram.</p>
            </div>
            <button 
              onClick={async () => {
                const res = await fetch('/api/admin/generate_link_token.php');
                const data = await res.json();
                if(data.success && data.link) window.open(data.link, '_blank');
              }}
              className="btn-primary mobile-full-btn" 
            >
              VINCULAR TELEGRAM
            </button>
          </div>
        </Motion.div>
      )}

      <div className="p-grid p-grid-cols-3">
        <StatCard title="FLOTA TOTAL" value={data.stats.total_vehiculos} icon={Truck} trend="+0" color="99, 102, 241" />
        <StatCard title="EN OPERACIÓN" value={data.stats.rutas_activas} icon={Activity} color="16, 185, 129" trend="+0" />
        <StatCard title="RECAUDACIÓN HOY" value={`$${data.stats.recaudacion_hoy}`} icon={DollarSign} color="34, 197, 94" trend="Real-time" />
      </div>

      <div style={{ marginTop: '32px' }}>
        <div className="tab-container">
          <button 
            onClick={() => setActiveTab('operaciones')}
            className={`tab-item ${activeTab === 'operaciones' ? 'active' : ''}`}
          >
            <Activity size={18} />
            VISTA OPERATIVA
          </button>
          <button 
            onClick={() => setActiveTab('mantenimiento')}
            className={`tab-item ${activeTab === 'mantenimiento' ? 'active' : ''}`}
          >
            <Wrench size={18} />
            MANTENIMIENTO
          </button>
        </div>

        {activeTab === 'operaciones' ? (
          <>
            <div className="p-flex p-items-center p-gap-4" style={{ marginBottom: '24px' }}>
                <BarChart3 style={{ opacity: 0.2 }} size={20} />
                <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4 }}>Estado de la Flota (Forense)</h2>
            </div>
            <FleetList vehicles={data.vehicles} />
          </>
        ) : (
          <MaintenanceCenter />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Unidad">
        <VehicleForm currentUser={currentUser} onSuccess={handleRegistrationSuccess} />
      </Modal>
    </div>
  )
}

export default Dashboard
