import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Truck, CheckCircle2, AlertTriangle, XCircle, Search, Car } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false)
  const { callApi, loading } = useApi()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (!v) return false;
    const plaque = (v.placa || '').toString().toLowerCase();
    const model = (v.modelo || '').toString().toLowerCase();
    const term = (searchTerm || '').toString().toLowerCase();
    
    const matchesSearch = plaque.includes(term) || model.includes(term);
    const vStatus = (v.estado || v.status_label || 'inactivo').toString().toLowerCase();
    const matchesStatus = filterStatus === 'all' || vStatus === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Logic for dynamic trends - Highly Resilient
  const now = new Date();
  const safeVehiclesArray = Array.isArray(vehicles) ? vehicles : [];
  const todayVehicles = safeVehiclesArray.filter(v => {
    if (!v || !v.created_at) return false;
    const createdAt = new Date(v.created_at);
    return (now - createdAt) < 24 * 60 * 60 * 1000;
  }).length;

  const stats = {
    total: safeVehiclesArray.length,
    totalTrend: todayVehicles > 0 ? `+${todayVehicles}` : "+0",
    active: safeVehiclesArray.filter(v => v && (v.estado === 'activo' || v.status === 'activo' || v.status_label === 'activo')).length,
    activeTrend: "+0",
    maintenance: safeVehiclesArray.filter(v => v && (v.estado === 'mantenimiento' || v.status === 'mantenimiento')).length,
    inactive: safeVehiclesArray.filter(v => v && (v.estado === 'inactivo' || v.status === 'inactivo')).length
  }

  return (
    <div>
      <div className="p-flex-responsive p-justify-between" style={{ marginBottom: '32px' }}>
        <div className="mobile-center p-flex p-items-center" style={{ gap: '20px' }}>
            <div style={{ 
                width: '56px', height: '56px', borderRadius: '18px', 
                background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                <Car size={28} className="text-primary" />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <h1 className="h1-premium neon-text" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', lineHeight: 1 }}>Módulo de Flota</h1>
                <p className="p-subtitle mobile-hide" style={{ margin: 0, marginTop: '4px' }}>Gestión Operativa Senior</p>
            </div>
        </div>
        <div className="p-flex p-gap-4">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0 24px', height: '48px' }}>
            <Plus size={20} />
            <span style={{ fontSize: '11px', fontWeight: 900 }}>NUEVA UNIDAD</span>
          </button>
        </div>
      </div>

      {/* Stats Overview - Grid optimized */}
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px', 
          marginBottom: '32px' 
      }}>
        <StatCard title="Total" value={stats.total} trend={stats.totalTrend} icon={Truck} color="var(--primary)" compact />
        <StatCard title="Activas" value={stats.active} trend={stats.activeTrend} icon={CheckCircle2} color="var(--success)" compact />
        <StatCard title="Taller" value={stats.maintenance} trend="+0" icon={AlertTriangle} color="var(--warning)" compact />
        <StatCard title="Fuera" value={stats.inactive} trend="+0" icon={XCircle} color="var(--danger)" compact />
      </div>
      {/* 2. SEARCH & FILTERS - Pure Symmetry Lock (50px) */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ marginBottom: '24px', gap: '16px' }}>
        <div className="glass" style={{ 
            flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', 
            borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)',
            height: isMobile ? '50px' : 'auto', width: '100%'
        }}>
          <Search size={16} className="text-white/20" style={{ flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Buscar unidad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '0 12px', background: 'transparent', border: 'none', 
              color: 'white', outline: 'none', fontSize: '0.85rem', fontWeight: 600,
              height: '100%'
            }}
          />
        </div>
        
        {/* FILTER NAVIGATION - Absolute Isolation (Key-Forced Protection) */}
        {!isMobile ? (
          <div key="PC_FILTERS_ROOT" className="p-flex" style={{ gap: '8px' }}>
            {['all', 'activo', 'mantenimiento', 'inactivo'].map(st => (
              <button 
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`p-status-pill ${filterStatus === st ? 'active-filter' : 'lite-filter'}`}
                style={{ 
                  cursor: 'pointer', transition: 'all 0.2s', border: 'none', 
                  whiteSpace: 'nowrap', padding: '10px 20px', fontSize: '10px', fontWeight: 900
                }}
              >
                {st === 'all' ? 'TODOS' : st.toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <div key="MOBILE_FILTERS_ROOT" style={{ width: '100%' }}>
              <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="glass"
                  style={{ 
                      width: '100%', padding: '0 16px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                      color: 'white', background: 'var(--glass-bg)', outline: 'none', fontWeight: 1000, fontSize: '11px',
                      appearance: 'none', textAlign: 'center', cursor: 'pointer', textTransform: 'uppercase',
                      height: '50px', lineHeight: 'normal'
                  }}
              >
                  <option value="all">TODOS LOS ESTADOS</option>
                  <option value="activo">SOLO ACTIVOS / OPERATIVOS</option>
                  <option value="mantenimiento">EN TALLER / REPARACIÓN</option>
                  <option value="inactivo">INACTIVOS / FUERA</option>
              </select>
          </div>
        )}
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
