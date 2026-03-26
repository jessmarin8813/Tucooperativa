import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Truck, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import FleetList from '../components/ui/FleetList'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import VehicleForm from '../components/ui/VehicleForm'

const VehiculosView = ({ user, config, setActiveView }) => {
  const [vehicles, setVehicles] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { callApi, loading } = useApi()

  // Use the passed user or fall back (safety)
  const [currentUser, setCurrentUser] = useState(user)

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await callApi('vehiculos.php')
      setVehicles(Array.isArray(data) ? data : [])
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    let ignore = false
    const init = async () => {
      await Promise.resolve()
      if (ignore) return

      if (!currentUser) {
        const sessionRes = await callApi('session.php')
        setCurrentUser(sessionRes.user)
      }
      fetchVehicles()
    }
    init()
    return () => { ignore = true }
  }, [callApi, fetchVehicles, currentUser])

  const handleRegistrationSuccess = () => {
    setIsModalOpen(false)
    setSelectedVehicle(null)
    fetchVehicles()
  }

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVehicle(null)
  }

  const filteredVehicles = (Array.isArray(vehicles) ? vehicles : []).filter(v => {
    const matchesSearch = v.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || v.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Logic for dynamic trends
  const now = new Date();
  const todayVehicles = (Array.isArray(vehicles) ? vehicles : []).filter(v => {
    if (!v.created_at) return false;
    const createdAt = new Date(v.created_at);
    return (now - createdAt) < 24 * 60 * 60 * 1000;
  }).length;

  const stats = {
    total: Array.isArray(vehicles) ? vehicles.length : 0,
    totalTrend: todayVehicles > 0 ? `+${todayVehicles}` : "+0",
    active: (Array.isArray(vehicles) ? vehicles : []).filter(v => v.estado === 'activo' || v.status === 'activo').length,
    activeTrend: "+0",
    maintenance: (Array.isArray(vehicles) ? vehicles : []).filter(v => v.estado === 'mantenimiento' || v.status === 'mantenimiento').length,
    inactive: (Array.isArray(vehicles) ? vehicles : []).filter(v => v.estado === 'inactivo' || v.status === 'inactivo').length
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
        <StatCard title="Total Unidades" value={stats.total} trend={stats.totalTrend} icon={Truck} color="var(--primary)" />
        <StatCard title="Operativas" value={stats.active} trend={stats.activeTrend} icon={CheckCircle2} color="var(--success)" />
        <StatCard title="Mantenimiento" value={stats.maintenance} trend="+0" icon={AlertTriangle} color="var(--warning)" />
        <StatCard title="Fuera de Servicio" value={stats.inactive} trend="+0" icon={XCircle} color="var(--danger)" />
      </div>

      {/* 2. SEARCH & FILTERS - Tactical Scalability */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ marginBottom: '32px', gap: '16px' }}>
        <div className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={18} className="text-white/20" />
          <input 
            type="text" 
            placeholder="Buscar por Placa o Modelo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '16px', background: 'transparent', border: 'none', 
              color: 'white', outline: 'none', fontSize: '0.9rem', fontWeight: 600 
            }}
          />
        </div>
        <div className="p-flex p-flex-wrap" style={{ gap: '10px', paddingBottom: '5px' }}>
          {['all', 'activo', 'mantenimiento', 'inactivo'].map(st => (
            <button 
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`p-status-pill ${filterStatus === st ? 'active-filter' : 'lite-filter'}`}
              style={{ cursor: 'pointer', transition: 'all 0.2s', border: 'none', whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: '100px' }}
            >
              {st === 'all' ? 'TODOS' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && filteredVehicles.length === 0 ? (
        <div className="flex items-center justify-center p-24">
            <RefreshCw size={48} className="animate-spin text-accent" />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass empty-state-card" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '32px', border: '2px dashed var(--glass-border)' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Truck size={40} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="empty-state-title" style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-0.03em' }}>No hay resultados</h2>
          <p className="empty-state-desc" style={{ color: 'var(--text-dim)', maxWidth: '450px', margin: '0 auto 40px', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>
            {searchTerm || filterStatus !== 'all' ? 'No se encontraron unidades que coincidan con tu búsqueda.' : 'Crea tu flota digital ahora para tomar el control total.'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={24} />
              <span>AGREGAR MI PRIMERA UNIDAD</span>
            </button>
          )}
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: '24px', overflow: 'visible' }}>
          <FleetList 
            vehicles={filteredVehicles} 
            config={config} 
            user={user} 
            setActiveView={setActiveView} 
            onEdit={handleEditVehicle}
          />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedVehicle ? "Modificar Unidad" : "Nueva Unidad"}>
        <VehicleForm 
          currentUser={currentUser} 
          onSuccess={handleRegistrationSuccess} 
          initialData={selectedVehicle}
        />
      </Modal>
    </div>
  )
}

export default VehiculosView
