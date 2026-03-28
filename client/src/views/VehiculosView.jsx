import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Truck, CheckCircle2, AlertTriangle, Search, Car, ChevronDown } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import FleetList from '../components/ui/FleetList'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import VehicleForm from '../components/ui/VehicleForm'

const VehiculosView = ({ user, config, setActiveView }) => {
  const [vehicles, setVehicles] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [inviteVehicle, setInviteVehicle] = useState(null)
  const [inviteToken, setInviteToken] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
  const { callApi, loading } = useApi()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentUser, setCurrentUser] = useState(user)

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await callApi('vehiculos.php')
      const rawData = res?.data || res;
      setVehicles(Array.isArray(rawData) ? rawData : [])
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    let ignore = false
    const init = async () => {
      if (!currentUser) {
        const sessionRes = await callApi('session.php')
        setCurrentUser(sessionRes.user)
      }
      if (!ignore) fetchVehicles()
    }
    init()
    return () => { ignore = true }
  }, [callApi, fetchVehicles, currentUser])

  useRealtime((event) => {
    if (event.type === 'UPDATE_FLEET') fetchVehicles();
  });

  const handleRegistrationSuccess = () => {
    setIsModalOpen(false); setSelectedVehicle(null); fetchVehicles();
  }

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle); setIsModalOpen(true);
  }

  const handleUnlinkDriver = async (vehicle) => {
    if (!window.confirm(`¿Estás seguro de desvincular al chofer de la unidad ${vehicle.placa}?`)) return;
    try {
      await callApi('admin/save_vehicle.php', {
        method: 'POST', body: JSON.stringify({ ...vehicle, chofer_id: 0, action: 'edit' })
      });
      fetchVehicles();
    } catch (err) { console.error(err); }
  }

  const handleOpenInviteModal = async (vehicle) => {
    setInviteVehicle(vehicle); setIsInviteModalOpen(true); setInviteLoading(true);
    try {
      const res = await callApi('auth/invitaciones.php', { 
        method: 'POST', body: JSON.stringify({ vehiculo_id: vehicle.id }) 
      })
      const rawData = res?.data || res;
      setInviteToken(rawData?.token || res?.token);
    } catch (err) { console.error(err); } finally { setInviteLoading(false); }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false); setIsInviteModalOpen(false);
    setSelectedVehicle(null); setInviteVehicle(null);
  }

  const filteredVehicles = (Array.isArray(vehicles) ? vehicles : []).filter(v => {
    if (!v) return false;
    const plaque = (v.placa || '').toString().toLowerCase();
    const model = (v.modelo || '').toString().toLowerCase();
    const term = (searchTerm || '').toString().toLowerCase();
    const matchesSearch = plaque.includes(term) || model.includes(term);
    const vStatus = (v.estado || v.status_label || 'inactivo').toString().toLowerCase();
    const normalizedStatus = vStatus === 'en ruta' ? 'activo' : vStatus;
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const now = new Date();
  const safeVehiclesArray = Array.isArray(vehicles) ? vehicles : [];
  const todayVehicles = safeVehiclesArray.filter(v => {
    if (!v || !v.created_at) return false;
    const createdAt = new Date(v.created_at);
    return (now - createdAt) < 24 * 60 * 60 * 1000;
  }).length;

  const stats = {
    total: safeVehiclesArray?.length || 0,
    totalTrend: todayVehicles > 0 ? `+${todayVehicles}` : "+0",
    activeCount: safeVehiclesArray?.filter(v => {
      if (!v) return false;
      const s = (v.estado || v.status_label || 'inactivo').toString().toLowerCase();
      return (s === 'activo' || s === 'en ruta');
    }).length || 0,
    maintenanceCount: safeVehiclesArray?.filter(v => {
      if (!v) return false;
      const s = (v.estado || v.status_label || '').toString().toLowerCase();
      return (s === 'mantenimiento' || s === 'en taller');
    }).length || 0
  }

  return (
    <div>
      <div className="p-flex-responsive p-justify-between" style={{ marginBottom: '32px' }}>
        <div className="p-flex p-items-center" style={{ gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={28} className="text-primary" />
            </div>
            <div>
                <h1 className="h1-premium neon-text" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', lineHeight: 1 }}>Módulo de Flota</h1>
                <p className="p-subtitle" style={{ margin: 0, marginTop: '4px' }}>Gestión Operativa Senior</p>
            </div>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0 24px', height: '48px' }}>
          <Plus size={20} /> <span style={{ fontSize: '11px', fontWeight: 900 }}>NUEVA UNIDAD</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <StatCard title="Total" value={stats.total} trend={stats.totalTrend} icon={Truck} color="var(--primary)" compact />
        <StatCard title="Activas" value={stats.activeCount} trend="+0" icon={CheckCircle2} color="var(--success)" compact />
        <StatCard title="Taller" value={stats.maintenanceCount} trend="+0" icon={AlertTriangle} color="var(--warning)" compact />
      </div>

      {/* Search & Filters */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ marginBottom: '24px', gap: '16px' }}>
        <div className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '16px', height: '48px', background: 'var(--glass-bg)' }}>
          <Search size={16} className="text-white/20" />
          <input type="text" placeholder="Buscar unidad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0 12px', background: 'transparent', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600 }} />
        </div>
        
        {!isMobile ? (
          <div className="p-flex" style={{ gap: '8px' }}>
            {['all', 'activo', 'mantenimiento'].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)} className={`p-status-pill ${filterStatus === st ? 'active-filter' : 'lite-filter'}`} style={{ padding: '10px 20px', fontSize: '10px', fontWeight: 900 }}>
                {st === 'all' ? 'TODOS' : st.toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <div className="glass" style={{ width: '100%', height: '50px', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '16px' }}>
              <div style={{ flex: 1, textAlign: 'center', color: 'white', fontSize: '12px', fontWeight: 1000 }}>{filterStatus === 'all' ? 'TODOS LOS ESTADOS' : filterStatus.toUpperCase()}</div>
              <ChevronDown size={16} className="text-white/20" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }}>
                  <option value="all">TODOS LOS ESTADOS</option>
                  <option value="activo">ACTIVOS</option>
                  <option value="mantenimiento">EN TALLER</option>
              </select>
          </div>
        )}
      </div>

      {loading && filteredVehicles.length === 0 ? (
        <div className="p-flex p-items-center p-justify-center p-24"><RefreshCw size={48} className="animate-spin text-accent" /></div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '32px', border: '2px dashed var(--glass-border)' }}>
          <Truck size={40} style={{ color: 'var(--primary)', margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>No hay resultados</h2>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>AGREGAR UNIDAD</button>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: '24px' }}>
          <FleetList vehicles={filteredVehicles} config={config} user={user} setActiveView={setActiveView} onEdit={handleEditVehicle} onInvite={handleOpenInviteModal} onUnlink={handleUnlinkDriver} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedVehicle ? "Modificar Unidad" : "Nueva Unidad"}>
        <VehicleForm currentUser={currentUser} onSuccess={handleRegistrationSuccess} initialData={selectedVehicle} />
      </Modal>

      <Modal isOpen={isInviteModalOpen} onClose={handleCloseModal} title="Invitar Chofer">
        {inviteVehicle && (
          <div style={{ textAlign: 'center' }}>
            <div className="glass-premium" style={{ marginBottom: '24px', padding: '24px', borderRadius: '24px' }}>
              <h3 className="text-white font-black uppercase italic" style={{ fontSize: '1.5rem' }}>{inviteVehicle.modelo}</h3>
              <span className="p-plate-badge" style={{ marginTop: '8px', display: 'inline-block' }}>{inviteVehicle.placa}</span>
            </div>
            <div style={{ background: 'white', borderRadius: '24px', width: '200px', height: '200px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {inviteLoading ? <RefreshCw className="animate-spin" /> : <img src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(`https://t.me/TuCooperativaBot?start=${inviteToken}`)}`} alt="QR" />}
            </div>
            <button onClick={handleCloseModal} className="btn-secondary" style={{ width: '100%', height: '56px' }}>Cerrar</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VehiculosView
