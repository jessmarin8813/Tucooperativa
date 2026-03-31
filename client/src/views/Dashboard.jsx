import React, { useEffect, useState, useCallback } from 'react'
import StatCard from '../components/ui/StatCard'
import FleetList from '../components/ui/FleetList'
import { Truck, Activity, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import { motion as Motion } from 'framer-motion'

const Dashboard = ({ user, config, setActiveView }) => {
  const { callApi, loading } = useApi()
  const [data, setData] = useState({
    stats: {
      total_vehiculos: 0,
      rutas_activas: 0,
      recaudacion_hoy: '0.00',
      alertas_criticas: 0,
      pagos_pendientes: 0
    },
    vehicles: []
  })

  const fetchDashboardData = useCallback(async () => {
    try {
      const resp = await callApi('dashboard.php')
      const fleetRes = await callApi('vehiculos.php')
      
      if (resp && typeof resp === 'object' && resp.stats) {
        setData({ 
          stats: {
            total_vehiculos: resp.stats.total_vehiculos || 0,
            rutas_activas: resp.stats.rutas_activas || 0,
            recaudacion_hoy: resp.stats.recaudacion_hoy || '0.00',
            alertas_criticas: resp.stats.alertas_criticas || 0,
            pagos_pendientes: resp.stats.pagos_pendientes || 0
          }, 
          vehicles: Array.isArray(fleetRes) ? fleetRes : [] 
        })
      } else {
          // Fallback a vacio si la respuesta no es valida
          setData(prev => ({ ...prev, vehicles: Array.isArray(fleetRes) ? fleetRes : [] }))
      }
    } catch { /* Fail silent */ }
  }, [callApi])

  // REALTIME SYNC
  useRealtime((event) => {
    fetchDashboardData()
  })

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading && data.stats.total_vehiculos === 0) {
    return (
      <div className="p-flex p-items-center p-justify-center" style={{ height: '60vh' }}>
        <div style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.5rem' }} className="animate-pulse">CARGANDO TU RESUMEN...</div>
      </div>
    )
  }

  return (
    <div className="animate-fade">
      <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '40px', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
             <ShieldCheck size={20} color="var(--success)" />
             <span style={{ fontSize: '0.75rem', fontWeight: 1000, textTransform: 'uppercase', color: 'var(--success)', letterSpacing: '0.1em' }}>SISTEMA PROTEGIDO v5.1</span>
          </div>
          <h1 className="h1-premium neon-text" style={{ fontSize: '3rem' }}>Gestión Diaria</h1>
          <p className="p-subtitle">Resumen centralizado de tu cooperativa en tiempo real.</p>
        </div>
      </header>

      {/* ACCIONES RECOMENDADAS (CHECKLIST SENIOR) */}
      <section style={{ marginBottom: '48px' }}>
        <h3 className="text-label" style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.5)' }}>Acciones Recomendadas</h3>
        <div className="p-grid p-grid-cols-2" style={{ gap: '20px' }}>
          
          {data.stats.alertas_criticas > 0 ? (
            <Motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveView('forensic')}
              className="p-glass-premium clickable-hover" 
              style={{ padding: '24px', borderRadius: '24px', border: '2px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer' }}
            >
              <div className="p-flex p-items-center p-gap-4">
                <div style={{ background: 'var(--danger)', padding: '12px', borderRadius: '16px' }}>
                  <AlertCircle color="white" size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>Revisar Seguridad</h4>
                  <p style={{ color: 'var(--danger)', fontWeight: 700 }}>Hay {data.stats.alertas_criticas} alertas detectadas.</p>
                </div>
              </div>
            </Motion.div>
          ) : (
            <div className="p-glass-premium" style={{ padding: '24px', borderRadius: '24px', opacity: 0.8 }}>
              <div className="p-flex p-items-center p-gap-4">
                <div style={{ background: 'var(--success)', padding: '12px', borderRadius: '16px' }}>
                  <ShieldCheck color="white" size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>Seguridad OK</h4>
                  <p style={{ color: 'var(--success)', fontWeight: 700 }}>Sin problemas detectados.</p>
                </div>
              </div>
            </div>
          )}

          {data.stats.pagos_pendientes > 0 ? (
            <Motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveView('cobranza')}
              className="p-glass-premium clickable-hover" 
              style={{ padding: '24px', borderRadius: '24px', border: '2px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)', cursor: 'pointer' }}
            >
              <div className="p-flex p-items-center p-gap-4">
                <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '16px' }}>
                  <DollarSign color="white" size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>Validar Pagos</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{data.stats.pagos_pendientes} por confirmar.</p>
                </div>
              </div>
            </Motion.div>
          ) : (
            <div className="p-glass-premium" style={{ padding: '24px', borderRadius: '24px', opacity: 0.8 }}>
              <div className="p-flex p-items-center p-gap-4">
                <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '16px' }}>
                  <DollarSign color="white" size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>Finanzas al día</h4>
                  <p style={{ color: 'var(--accent)', fontWeight: 700 }}>Sin pagos pendientes.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <h3 className="text-label" style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.5)' }}>Resumen Operativo</h3>
      <div className="p-grid p-grid-cols-3">
        <StatCard title="VEHÍCULOS" value={data?.stats?.total_vehiculos || 0} icon={Truck} trend="Real-time" color="99, 102, 241" />
        <StatCard title="EN RUTA" value={data?.stats?.rutas_activas || 0} icon={Activity} color="16, 185, 129" trend="Real-time" />
        <StatCard title="EFECTIVO" value={`$${data?.stats?.recaudacion_hoy || '0.00'}`} icon={DollarSign} color="34, 197, 94" trend="Real-time" />
      </div>

      <div style={{ marginTop: '40px' }}>
        <FleetList 
             vehicles={data.vehicles} 
             user={user} 
             config={config}
             loading={loading} 
             setActiveView={setActiveView} 
             onEdit={() => setActiveView('flota')}
             onInvite={() => setActiveView('choferes')}
             onUnlink={() => setActiveView('choferes')}
             onDelete={() => {}}
        />
      </div>
    </div>
  )
}

export default Dashboard
