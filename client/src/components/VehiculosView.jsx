import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Truck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import FleetList from './FleetList'
import StatCard from './StatCard'
import Modal from './Modal'
import VehicleForm from './VehicleForm'

const VehiculosView = () => {
  const [vehicles, setVehicles] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const { callApi, loading } = useApi()

  const fetchVehicles = useCallback(async () => {
    try {
      if (!currentUser) {
        const sessionRes = await callApi('session.php')
        setCurrentUser(sessionRes.user)
      }
      const data = await callApi('vehiculos.php')
      setVehicles(Array.isArray(data) ? data : [])
    } catch { /* Handled */ }
  }, [callApi, currentUser])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const handleRegistrationSuccess = () => {
    setIsModalOpen(false)
    fetchVehicles()
  }

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.estado === 'activo' || v.status === 'activo').length,
    maintenance: vehicles.filter(v => v.estado === 'mantenimiento' || v.status === 'mantenimiento').length,
    inactive: vehicles.filter(v => v.estado === 'inactivo' || v.status === 'inactivo').length
  }

  return (
    <div>
      <div className="p-flex-responsive p-justify-between" style={{ marginBottom: '48px' }}>
        <div>
          <h1 className="h1-premium neon-text">Flota de Vehículos</h1>
          <p className="p-subtitle">Monitorización de unidades y salud de activos en tiempo real</p>
        </div>
        <div className="p-flex p-gap-4">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={24} />
            <span>NUEVA UNIDAD</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <StatCard title="Total Unidades" value={stats.total} trend="+0" icon={Truck} color="99, 102, 241" />
        <StatCard title="Operativas" value={stats.active} trend="+0" icon={CheckCircle2} color="16, 185, 129" />
        <StatCard title="Mantenimiento" value={stats.maintenance} trend="+0" icon={AlertTriangle} color="245, 158, 11" />
        <StatCard title="Fuera de Servicio" value={stats.inactive} trend="+0" icon={XCircle} color="239, 68, 68" />
      </div>

      {loading && vehicles.length === 0 ? (
        <div className="flex items-center justify-center p-24">
            <RefreshCw size={48} className="animate-spin text-accent" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass empty-state-card" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '32px', border: '2px dashed var(--glass-border)' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Truck size={40} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="empty-state-title" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-0.03em' }}>No hay vehículos registrados</h2>
          <p className="empty-state-desc" style={{ color: 'var(--text-dim)', maxWidth: '450px', margin: '0 auto 40px', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>Crea tu flota digital ahora para tomar el control total de los activos, gastos y rendimientos en tiempo real.</p>
          <button className="btn-primary mobile-full-btn btn-wrap" style={{ gap: '16px', borderRadius: '20px' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={24} />
            <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.05em' }}>AGREGAR MI PRIMERA UNIDAD</span>
          </button>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <FleetList vehicles={vehicles} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Unidad">
        <VehicleForm currentUser={currentUser} onSuccess={handleRegistrationSuccess} />
      </Modal>
    </div>
  )
}

export default VehiculosView
