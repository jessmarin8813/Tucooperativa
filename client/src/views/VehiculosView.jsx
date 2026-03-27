import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Truck, CheckCircle2, AlertTriangle, XCircle, Search, Car, ChevronDown } from 'lucide-react'
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
      const res = await callApi('vehiculos.php')
      // Adaptive adapter for both [Array] and {success, data}
      const rawData = res?.data || res;
      setVehicles(Array.isArray(rawData) ? rawData : [])
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
    
        const interval = setInterval(() => {
            fetchVehicles();
        }, 10000);
    
        return () => { 
            ignore = true;
            clearInterval(interval);
        }
    }, [callApi, fetchVehicles, currentUser])

    // REALTIME SYNC (Standardized)
    useRealtime((event) => {
        if (event.type === 'UPDATE_FLEET') {
            fetchVehicles();
        }
    });

  const handleRegistrationSuccess = () => {
    setIsModalOpen(false)
    setSelectedVehicle(null)
    fetchVehicles()
  }

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleOpenInviteModal = async (vehicle) => {
    setInviteVehicle(vehicle)
    setIsInviteModalOpen(true)
    setInviteLoading(true)
    setInviteToken(null)
    
    try {
      const res = await callApi('auth/invitaciones.php', { 
        method: 'POST', 
        body: JSON.stringify({ vehiculo_id: vehicle.id }) 
      })
      const rawData = res?.data || res;
      if (rawData?.token) {
        setInviteToken(rawData.token)
      } else if (res?.status === 'success' && res.token) {
         setInviteToken(res.token)
      }
    } catch (err) {
      console.error('Failed to generate invite token', err)
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsInviteModalOpen(false)
    setSelectedVehicle(null)
    setInviteVehicle(null)
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
    total: safeVehiclesArray?.length || 0,
    totalTrend: todayVehicles > 0 ? `+${todayVehicles}` : "+0",
    active: safeVehiclesArray?.filter(v => v && (v.estado === 'activo' || v.status === 'activo' || v?.status_label === 'activo')).length || 0,
    activeTrend: "+0",
    maintenance: safeVehiclesArray?.filter(v => v && (v.estado === 'mantenimiento' || v.status === 'mantenimiento')).length || 0,
    inactive: safeVehiclesArray?.filter(v => v && (v.estado === 'inactivo' || v.status === 'inactivo')).length || 0
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
      {/* 2. SEARCH & FILTERS - Pure Symmetry Lock (Standardized to Dropdown) */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ marginBottom: '24px', gap: '16px' }}>
        <div className="glass" style={{ 
            flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', 
            borderRadius: '16px', border: '1px solid var(--glass-border)',
            height: isMobile ? '50px' : '48px', width: '100%',
            background: 'var(--glass-bg)'
        }}>
          <Search size={16} className="text-white/20" style={{ flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Buscar unidad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '0 12px', background: 'transparent', border: 'none', 
              color: 'white', outline: 'none', fontSize: '13px', fontWeight: 600,
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
          <div key="MOBILE_FILTERS_ROOT" className="glass" style={{ width: '100%', height: '50px', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <RefreshCw size={16} className="text-white/20" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'center', color: 'white', fontSize: '12px', fontWeight: 1000, textTransform: 'uppercase' }}>
                  {filterStatus === 'all' ? 'TODOS LOS ESTADOS' : filterStatus.toUpperCase()}
              </div>
              <ChevronDown size={16} className="text-white/20" style={{ flexShrink: 0 }} />
              
              <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ 
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                      opacity: 0, cursor: 'pointer', appearance: 'none'
                  }}
              >
                  <option value="all">TODOS LOS ESTADOS</option>
                  <option value="activo">ACTIVOS / OPERATIVOS</option>
                  <option value="mantenimiento">EN TALLER</option>
                  <option value="inactivo">INACTIVOS</option>
              </select>
          </div>
        )}
      </div>

      {loading && (filteredVehicles || []).length === 0 ? (
        <div className="flex items-center justify-center p-24">
            <RefreshCw size={48} className="animate-spin text-accent" />
        </div>
      ) : (filteredVehicles || []).length === 0 ? (
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
            onInvite={handleOpenInviteModal}
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

      {/* DRIVER INVITATION MODAL v31.0 */}
      <Modal isOpen={isInviteModalOpen} onClose={handleCloseModal} title="Invitar Chofer">
        {inviteVehicle && (
          <div style={{ padding: '0 10px', textAlign: 'center' }}>
            <div className="glass-premium" style={{ marginBottom: '24px', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-dim uppercase font-black" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>Unidad Seleccionada</p>
              <h3 className="text-white font-black uppercase italic" style={{ fontSize: '1.5rem', margin: 0 }}>{inviteVehicle.modelo || 'Unidad'}</h3>
              <span className="p-plate-badge" style={{ fontSize: '10px', padding: '4px 12px', marginTop: '8px', display: 'inline-block' }}>{inviteVehicle.placa}</span>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ margin: '0 auto 16px', padding: '16px', background: 'white', borderRadius: '24px', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {inviteLoading ? (
                  <RefreshCw size={40} className="animate-spin text-primary" />
                ) : (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(`https://t.me/TuCooperativaBot?start=${inviteToken || 'GENERANDO'}`)}`} 
                    alt="QR Invitation"
                    style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
                  />
                )}
              </div>
              <p className="text-dim font-bold" style={{ fontSize: '11px' }}>
                {inviteLoading ? 'Generando código seguro...' : 'Muestra este QR al chofer para vincularlo'}
              </p>
            </div>

            <div className="p-dropdown-divider" style={{ marginBottom: '32px' }}></div>

            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <p className="text-white font-bold" style={{ fontSize: '11px', opacity: 0.6, marginBottom: '12px' }}>O envía este enlace directo:</p>
              <div className="glass" style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <input 
                  readOnly 
                  value={inviteLoading ? 'Generando...' : `https://t.me/TuCooperativaBot?start=${inviteToken || 'ERR'}`}
                  style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 600, fontSize: '10px', flex: 1, outline: 'none', fontFamily: 'monospace' }}
                />
                <button 
                  disabled={inviteLoading || !inviteToken}
                  onClick={() => {
                    const link = `https://t.me/TuCooperativaBot?start=${inviteToken}`;
                    try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(link).then(() => alert('Enlace copiado al portapapeles'));
                        } else {
                            throw new Error('Clipboard API unavailable');
                        }
                    } catch (err) {
                        const textArea = document.createElement("textarea");
                        textArea.value = link;
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                            document.execCommand('copy');
                            alert('Enlace copiado al portapapeles');
                        } catch (copyErr) {
                            console.error('Fallback copy failed', copyErr);
                        }
                        document.body.removeChild(textArea);
                    }
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 1000, height: 'auto', opacity: (inviteLoading || !inviteToken) ? 0.5 : 1 }}
                >
                  COPIAR
                </button>
              </div>
            </div>

            <button 
              onClick={handleCloseModal} 
              className="btn-secondary" 
              style={{ width: '100%', height: '56px' }}
            >
              Cerrar
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VehiculosView
