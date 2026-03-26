import React, { useEffect, useState } from 'react'
import StatCard from './StatCard'
import FleetList from './FleetList'
import { Truck, Activity, DollarSign, AlertCircle } from 'lucide-react'
import { useApi } from '../hooks/useApi'

const Dashboard = () => {
  const { callApi, loading, error } = useApi()
  const [data, setData] = useState({
    stats: {
      total_vehiculos: 0,
      rutas_activas: 0,
      recaudacion_hoy: '0.00',
      alertas_criticas: 0
    },
    mockVehicles: [
      { modelo: 'Encava ENT-610', placa: 'A12BC3D', dueno: 'Jesus Marin', cuota: 25.00, status: 'activo' },
      { modelo: 'NPR Turbo', placa: 'X98YZ7W', dueno: 'Jose Perez', cuota: 20.00, status: 'en ruta' },
    ]
  })

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await callApi('dashboard.php')
        setData(prev => ({
          ...prev,
          stats: result.stats
        }))
      } catch (err) {
        console.error("Dashboard error:", err)
      }
    }
    fetchDashboard()
  }, [callApi])

  if (loading && data.stats.total_vehiculos === 0) {
    return (
      <div style={{ padding: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="neon-text animate-pulse">SINCRONIZANDO CENTRO DE MANDO...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div className="animate-fade">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Centro de Mando</h1>
          <p style={{ color: 'var(--text-dim)' }}>Gestionando Operaciones en Tiempo Real</p>
        </div>
        
        {data.stats.alertas_criticas > 0 && (
          <div className="glass neon-border animate-bounce" style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{data.stats.alertas_criticas} ALERTAS DE SEGURIDAD</span>
          </div>
        )}
      </header>

      {error && (
        <div className="glass" style={{ padding: '16px', marginBottom: '24px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          {error}. Los datos mostrados podrían estar desactualizados.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <StatCard label="FLOTA TOTAL" value={data.stats.total_vehiculos} icon={Truck} trend="+0" />
        <StatCard label="EN OPERACIÓN" value={data.stats.rutas_activas} icon={Activity} color="var(--accent)" />
        <StatCard label="RECAUDACIÓN HOY" value={`$${data.stats.recaudacion_hoy}`} icon={DollarSign} color="var(--success)" trend="Real-time" />
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Estado de la Flota (Mock Preview)</h2>
        <FleetList vehicles={data.mockVehicles} />
      </div>
    </div>
  )
}

export default Dashboard
