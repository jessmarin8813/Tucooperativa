import React, { useState, useEffect } from 'react'
import { LayoutGrid, Truck, DollarSign, Activity } from 'lucide-react'
import StatCard from './StatCard'
import { useApi } from '../hooks/useApi'

const SuperAdminDashboard = () => {
  const { callApi, loading, error } = useApi()
  const [data, setData] = useState({
    stats: {
      total_cooperativas: 0,
      total_vehiculos: 0,
      total_rutas_activas: 0,
      recaudacion_total: '0.00'
    },
    cooperativas: []
  })

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const result = await callApi('admin/master_stats.php')
        setData(result)
      } catch (err) {
        console.error("Master Dashboard error:", err)
      }
    }
    fetchMasterData()
  }, [callApi])

  if (loading && data.cooperativas.length === 0) {
    return (
      <div style={{ background: '#0a0b12', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="neon-text animate-pulse">SISTEMA GLOBAL - ACCEDIENDO AL NÚCLEO...</div>
      </div>
    )
  }
  
  return (
    <main className="animate-fade" style={{ padding: '40px', flex: 1 }}>
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Activity size={24} className="neon-text" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--accent)' }}>SISTEMA GLOBAL - MODO DIOS</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Panel de Control Maestro</h1>
            <p style={{ color: 'var(--text-dim)' }}>Supervisando la infraestructura de transporte global</p>
          </div>
          <button className="btn-primary" style={{ padding: '12px 24px' }}>+ REGISTRAR COOPERATIVA</button>
        </div>
      </header>

      {error && (
        <div className="glass" style={{ padding: '16px', marginBottom: '32px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          {error}. Error de enlace con el núcleo de datos.
        </div>
      )}

      {/* Global Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <StatCard label="COOPERATIVAS" value={data.stats.total_cooperativas} icon={LayoutGrid} color="var(--accent)" />
        <StatCard label="FLOTA TOTAL" value={data.stats.total_vehiculos} icon={Truck} color="var(--primary)" />
        <StatCard label="RUTAS ACTIVAS" value={data.stats.total_rutas_activas} icon={Activity} color="var(--success)" />
        <StatCard label="RECAUDACIÓN TOTAL" value={`$${data.stats.recaudacion_total}`} icon={DollarSign} color="var(--warning)" />
      </div>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Cooperativas Federadas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {data.cooperativas.map(coop => (
            <div key={coop.id} className="glass glass-hover" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'white' }}>{coop.nombre}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vehículos Registrados:</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{coop.vehiculos_count}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rutas Activas Hoy:</span>
                  <span style={{ color: coop.rutas_activas > 0 ? 'var(--success)' : '' }}>{coop.rutas_activas}</span>
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                <button className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.75rem' }}>VISUALIZAR</button>
                <button className="glass" style={{ padding: '10px', fontSize: '0.75rem' }}>AUDITORÍA</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default SuperAdminDashboard
