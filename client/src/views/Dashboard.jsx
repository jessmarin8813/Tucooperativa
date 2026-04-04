import React, { useEffect, useState, useCallback } from 'react'
import StatCard from '../components/ui/StatCard'
import FleetList from '../components/ui/FleetList'
import { Truck, Activity, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import { motion as Motion } from 'framer-motion'

const Dashboard = ({ user, config, setActiveView }) => {
  const { callApi, loading } = useApi()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      const resp = await callApi('dashboard.php')
      const fleetRes = await callApi('vehiculos.php')
      setData({
        stats: resp?.stats || {
          total_vehiculos: 0,
          rutas_activas: 0,
          recaudacion_hoy: '0.00',
          alertas_criticas: 0,
          pagos_pendientes: 0
        },
        vehicles: Array.isArray(fleetRes) ? fleetRes : (fleetRes?.data || [])
      })
    } catch { /* Fail silent */ }
  }, [callApi])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useRealtime((event) => {
    fetchDashboardData()
  })

  return (
    <div className="animate-fade">
      <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '40px', gap: isMobile ? '12px' : '24px' }}>
        <div>
          <h1 className="h1-premium neon-text" style={{ fontSize: isMobile ? '2.2rem' : '3.5rem' }}>Gestión Diaria</h1>
          <p className="p-subtitle" style={{ fontSize: isMobile ? '0.9rem' : '1.1rem' }}>Resumen centralizado en tiempo real.</p>
        </div>
      </header>

      <section className="p-grid p-gap-8" style={{ gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', marginBottom: '40px' }}>
        <StatCard 
            label="Vehículos" 
            value={data.stats?.total_vehiculos || 0} 
            icon={Truck} 
            color="var(--primary)" 
            trend="Configurados"
            compact={isMobile}
        />
        <StatCard 
            label="Activos Hoy" 
            value={data.stats?.rutas_activas || 0} 
            icon={Activity} 
            color="var(--success)" 
            trend="Real-time"
            compact={isMobile}
        />
        <StatCard 
            label="Recaudación" 
            value={`$${data.stats?.recaudacion_hoy || '0.00'}`} 
            icon={DollarSign} 
            color="var(--accent)" 
            trend="Hoy"
            compact={isMobile}
        />
        <StatCard 
            label="Críticos" 
            value={data.stats?.alertas_criticas || 0} 
            icon={AlertCircle} 
            color="var(--danger)" 
            trend="Atención"
            compact={isMobile}
        />
      </section>

      {/* Accesos Directos (Quick Actions) - NUEVO v8.15 */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
            {[
                { id: 'cobranza', label: 'Validar Pagos', icon: DollarSign, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
                { id: 'choferes', label: 'Nuevo Chofer', icon: Activity, color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)' },
                { id: 'bi', label: 'Reporte BI', icon: ShieldCheck, color: 'var(--accent)', bg: 'rgba(6, 182, 212, 0.1)' },
                { id: 'config', label: 'Ajustes', icon: Truck, color: 'var(--text-dim)', bg: 'rgba(255, 255, 255, 0.05)' }
            ].map((action, idx) => (
                <Motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView(action.id)}
                    className="glass-hover"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px', 
                        padding: '20px 24px', 
                        borderRadius: '20px', 
                        background: action.bg, 
                        border: `1px solid ${action.color}22`,
                        textAlign: 'left',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ background: action.bg, padding: '12px', borderRadius: '14px', color: action.color }}>
                        <action.icon size={20} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'white', letterSpacing: '0.02em' }}>{action.label}</span>
                </Motion.button>
            ))}
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: '32px' }}>
          
          {data.stats?.alertas_criticas > 0 ? (
            <Motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveView('forensic')}
              className="p-glass-premium clickable-hover" 
              style={{ padding: '32px', borderRadius: '24px', border: '2px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer' }}
            >
              <div className="p-flex p-items-center p-gap-6">
                <div style={{ background: 'var(--danger)', padding: '16px', borderRadius: '20px' }}>
                  <AlertCircle color="white" size={32} className="animate-pulse" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Alertas Críticas</h4>
                  <p style={{ color: 'var(--danger)', fontWeight: 800 }}>Hay {data.stats?.alertas_criticas} unidades que requieren tu atención inmediata.</p>
                </div>
              </div>
            </Motion.div>
          ) : (
            <div className="p-glass-premium" style={{ padding: '32px', borderRadius: '24px', opacity: 1, background: 'rgba(16, 185, 129, 0.03)' }}>
              <div className="p-flex p-items-center p-gap-6">
                <div style={{ background: 'var(--success)', padding: '16px', borderRadius: '20px' }}>
                  <ShieldCheck color="white" size={32} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Estado de Flota</h4>
                  <p style={{ color: 'var(--success)', fontWeight: 800 }}>Infraestructura estable. Sin incidencias críticas.</p>
                </div>
              </div>
            </div>
          )}

          {data.stats?.pagos_pendientes > 0 ? (
            <Motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveView('cobranza')}
              className="p-glass-premium clickable-hover" 
              style={{ padding: '32px', borderRadius: '24px', border: '2px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)', cursor: 'pointer' }}
            >
              <div className="p-flex p-items-center p-gap-6">
                <div style={{ background: 'var(--primary)', padding: '16px', borderRadius: '20px' }}>
                  <DollarSign color="white" size={32} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Caja y Cobranza</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: 800 }}>{data.stats?.pagos_pendientes} abonos esperando validación.</p>
                </div>
              </div>
            </Motion.div>
          ) : (
            <div className="p-glass-premium" style={{ padding: '32px', borderRadius: '24px', opacity: 1, background: 'rgba(6, 182, 212, 0.03)' }}>
              <div className="p-flex p-items-center p-gap-6">
                <div style={{ background: 'var(--accent)', padding: '16px', borderRadius: '20px' }}>
                  <DollarSign color="white" size={32} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Eflujo de Caja</h4>
                  <p style={{ color: 'var(--accent)', fontWeight: 800 }}>Finanzas al día. Sin abonos pendientes.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="p-flex-col p-gap-8" style={{ marginBottom: '40px' }}>
        <div className="p-flex p-items-center p-justify-between">
          <h2 className="section-title">Vista Previa de Flota</h2>
          <button onClick={() => setActiveView('flota')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '12px 24px', borderRadius: '14px' }}>VER TODO</button>
        </div>
        
        <div className="p-grid p-gap-6">
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
      </section>
    </div>
  )
}

export default Dashboard
