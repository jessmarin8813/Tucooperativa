import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Truck, CheckCircle2, AlertTriangle, Search, Car, ChevronDown, Copy, Check, UserPlus, Users } from 'lucide-react'
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
  const [inviteStep, setInviteStep] = useState('selection') // 'selection' | 'new' | 'existing'
  const [choferes, setChoferes] = useState([])
  const [loadingChoferes, setLoadingChoferes] = useState(false)
  const [copied, setCopied] = useState(false)
  const [choferSearchTerm, setChoferSearchTerm] = useState('')
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
      const res = await callApi('fleet/vehiculos.php')
      const rawData = res?.data || res;
      setVehicles(Array.isArray(rawData) ? rawData : [])
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    let ignore = false
    const init = async () => {
      if (!currentUser) {
        const sessionRes = await callApi('system/session.php')
        setCurrentUser(sessionRes.user || sessionRes)
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

  const handleOpenInviteModal = (vehicle) => {
    setInviteVehicle(vehicle); 
    setInviteStep('selection');
    setIsInviteModalOpen(true); 
  }

  const handleSelectNew = async () => {
    setInviteStep('new');
    setInviteLoading(true);
    try {
      const res = await callApi('auth/invitaciones.php', { 
        method: 'POST', body: JSON.stringify({ vehiculo_id: inviteVehicle.id }) 
      })
      const rawData = res?.data || res;
      setInviteToken(rawData?.token || res?.token);
    } catch (err) { console.error(err); } finally { setInviteLoading(false); }
  }

  const handleSelectExisting = async () => {
    setInviteStep('existing');
    setLoadingChoferes(true);
    try {
      const res = await callApi('choferes.php');
      setChoferes(Array.isArray(res) ? res : []);
    } catch (err) { console.error(err); } finally { setLoadingChoferes(false); }
  }

  const handleAssignExisting = async (chofer) => {
    if (!window.confirm(`¿Asignar a ${chofer.nombre} a la unidad ${inviteVehicle.placa}?`)) return;
    try {
      await callApi('admin/save_vehicle.php', {
        method: 'POST', body: JSON.stringify({ ...inviteVehicle, chofer_id: chofer.id, action: 'edit' })
      });
      handleCloseModal();
      fetchVehicles();
    } catch (err) { console.error(err); }
  }

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    
    let matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus.toLowerCase();
    if (filterStatus === 'sin_chofer') {
        matchesStatus = !v.chofer_id || v.chofer_id === 0;
    }
    return matchesSearch && matchesStatus;
  });

  // TREND LOGIC (Dynamic Memory)
  const now = new Date();
  const safeVehiclesArray = Array.isArray(vehicles) ? vehicles : [];
  
  const todayCreated = safeVehiclesArray.filter(v => {
    if (!v || !v.created_at) return false;
    return (now - new Date(v.created_at)) < 24 * 60 * 60 * 1000;
  }).length;

  const todayActive = safeVehiclesArray.filter(v => {
    if (!v || !v.status_changed_at) return false;
    const s = (v.estado || v.status_label || '').toString().toLowerCase();
    return (s === 'activo' || s === 'en ruta') && (now - new Date(v.status_changed_at)) < 24 * 60 * 60 * 1000;
  }).length;

  const todayMaintenance = safeVehiclesArray.filter(v => {
    if (!v || !v.status_changed_at) return false;
    const s = (v.estado || v.status_label || '').toString().toLowerCase();
    return (s === 'mantenimiento' || s === 'en taller') && (now - new Date(v.status_changed_at)) < 24 * 60 * 60 * 1000;
  }).length;

  const stats = {
    total: safeVehiclesArray?.length || 0,
    totalTrend: todayCreated > 0 ? `+${todayCreated}` : "+0",
    activeCount: safeVehiclesArray?.filter(v => {
      const s = (v.estado || v.status_label || 'inactivo').toString().toLowerCase();
      return (s === 'activo' || s === 'en ruta');
    }).length || 0,
    activeTrend: todayActive > 0 ? `+${todayActive}` : "+0",
    maintenanceCount: safeVehiclesArray?.filter(v => {
      const s = (v.estado || v.status_label || '').toString().toLowerCase();
      return (s === 'mantenimiento' || s === 'en taller');
    }).length || 0,
    maintenanceTrend: todayMaintenance > 0 ? `+${todayMaintenance}` : "+0"
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
        <StatCard title="Activas" value={stats.activeCount} trend={stats.activeTrend} icon={CheckCircle2} color="var(--success)" compact />
        <StatCard title="Taller" value={stats.maintenanceCount} trend={stats.maintenanceTrend} icon={AlertTriangle} color="var(--warning)" compact />
      </div>

      {/* Search & Filters */}
      <div className="p-flex-responsive p-justify-between p-items-center" style={{ marginBottom: '24px', gap: '16px' }}>
        <div className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '16px', height: '48px', background: 'var(--glass-bg)' }}>
          <Search size={16} className="text-white/20" />
          <input type="text" placeholder="Buscar unidad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0 12px', background: 'transparent', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600 }} />
        </div>
        
        {!isMobile ? (
          <div className="p-flex" style={{ gap: '8px' }}>
            {['all', 'activo', 'mantenimiento', 'sin_chofer'].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)} className={`p-status-pill ${filterStatus === st ? 'active-filter' : 'lite-filter'}`} style={{ padding: '10px 20px', fontSize: '10px', fontWeight: 900 }}>
                {st === 'all' ? 'TODOS' : st === 'sin_chofer' ? 'SIN CHOFER' : st.toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <div className="glass" style={{ width: '100%', height: '50px', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '16px' }}>
              <div style={{ flex: 1, textAlign: 'center', color: 'white', fontSize: '12px', fontWeight: 1000 }}>{filterStatus === 'all' ? 'TODOS LOS ESTADOS' : filterStatus === 'sin_chofer' ? 'SIN CHOFER' : filterStatus.toUpperCase()}</div>
              <ChevronDown size={16} className="text-white/20" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }}>
                  <option value="all">TODOS LOS ESTADOS</option>
                  <option value="activo">ACTIVOS</option>
                  <option value="mantenimiento">EN TALLER</option>
                  <option value="sin_chofer">SIN CHOFER</option>
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

      <Modal isOpen={isInviteModalOpen} onClose={handleCloseModal} title="Asignar Chofer">
        {inviteVehicle && (
          <div className="animate-fade">
            <div className="glass-premium" style={{ marginBottom: '24px', padding: '16px 24px', borderRadius: '24px', textAlign: 'center' }}>
              <h3 className="text-white font-black uppercase italic" style={{ fontSize: '1.25rem' }}>{inviteVehicle.modelo}</h3>
              <span className="p-plate-badge" style={{ marginTop: '4px', display: 'inline-block' }}>{inviteVehicle.placa}</span>
            </div>

            {inviteStep === 'selection' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button onClick={handleSelectNew} className="btn-primary" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <UserPlus size={32} />
                  <div>
                    <span style={{ fontSize: '1rem', fontWeight: 900, display: 'block' }}>NUEVO INGRESO</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>Generar Link y código QR</span>
                  </div>
                </button>
                <button onClick={handleSelectExisting} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Users size={32} className="text-accent" />
                  <div>
                    <span style={{ fontSize: '1rem', fontWeight: 900, display: 'block', color: 'var(--accent)' }}>CHOFER EXISTENTE</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>Seleccionar de la plantilla actual</span>
                  </div>
                </button>
              </div>
            )}

            {inviteStep === 'new' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: 'white', borderRadius: '24px', width: '200px', height: '200px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {inviteLoading ? <RefreshCw className="animate-spin text-primary" /> : <img src={`https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(`https://t.me/TuCooperativaBot?start=${inviteToken}`)}`} alt="QR" style={{ borderRadius: '16px' }} />}
                </div>
                {!inviteLoading && inviteToken && (
                  <div className="glass" style={{ padding: '12px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 900, textTransform: 'uppercase' }}>LINK DE INVITACIÓN (TOCA PARA COPIAR)</span>
                        <p style={{ fontSize: '0.8rem', color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', margin: 0 }}>https://t.me/TuCooperativaBot?start={inviteToken}</p>
                    </div>
                    <button onClick={() => copyToClipboard(`https://t.me/TuCooperativaBot?start=${inviteToken}`)} className="btn" style={{ background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)', color: copied ? '#22c55e' : 'white', padding: '10px', width: 'auto' }}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                )}
                <button onClick={() => setInviteStep('selection')} className="btn-secondary" style={{ width: '100%', height: '56px' }}>← VOLVER</button>
              </div>
            )}

            {inviteStep === 'existing' && (
              <div>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '16px', height: '48px', marginBottom: '16px' }}>
                  <Search size={16} className="text-white/20" />
                  <input type="text" placeholder="Buscar chofer..." value={choferSearchTerm} onChange={(e) => setChoferSearchTerm(e.target.value)} style={{ width: '100%', padding: '0 12px', background: 'transparent', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600 }} />
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', paddingRight: '4px' }}>
                   {loadingChoferes ? (
                       <div className="p-24" style={{ textAlign: 'center' }}><RefreshCw className="animate-spin text-accent" /></div>
                   ) : (
                       choferes.filter(c => (!c.vehiculo_id || c.vehiculo_id === 0) && c.nombre.toLowerCase().includes(choferSearchTerm.toLowerCase())).length === 0 ? (
                           <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>No hay choferes disponibles sin unidad asignada.</div>
                       ) : (
                           choferes.filter(c => (!c.vehiculo_id || c.vehiculo_id === 0) && c.nombre.toLowerCase().includes(choferSearchTerm.toLowerCase())).map(c => (
                               <div key={c.id} onClick={() => handleAssignExisting(c)} className="glass-hover clickable-hover" style={{ padding: '16px', borderRadius: '16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                       <Users size={18} color="white" />
                                   </div>
                                   <div>
                                       <span style={{ display: 'block', fontWeight: 700, fontSize: '1rem', color: 'white' }}>{c.nombre}</span>
                                       <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)' }}>ID: {c.cedula || '---'}</span>
                                   </div>
                               </div>
                           ))
                       )
                   )}
                </div>
                <button onClick={() => setInviteStep('selection')} className="btn-secondary" style={{ width: '100%', height: '56px' }}>← VOLVER</button>
              </div>
            )}
            
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VehiculosView
