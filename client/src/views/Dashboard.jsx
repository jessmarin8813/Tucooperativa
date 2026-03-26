import React, { useEffect, useState, useCallback } from 'react'
import StatCard from '../components/ui/StatCard'
import FleetList from '../components/ui/FleetList'
import { Truck, Activity, DollarSign, AlertCircle, BarChart3, ShieldCheck, Wrench } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import { motion as Motion } from 'framer-motion'

const Dashboard = ({ user: initialUser }) => {
  const { callApi, loading } = useApi()
  const [currentUser, setCurrentUser] = useState(initialUser)
  const [data, setData] = useState({
    stats: {
      total_vehiculos: 0,
      rutas_activas: 0,
      recaudacion_hoy: '0.00',
      alertas_criticas: 0
    },
    vehicles: []
  })

  const fetchDashboardData = useCallback(async () => {
    try {
      const statsRes = await callApi('dashboard.php')
      const fleetRes = await callApi('vehiculos.php')
      setData({ stats: statsRes.stats, vehicles: fleetRes })
    } catch { /* Handled */ }
  }, [callApi])

  // REALTIME SYNC
  useRealtime((event) => {
    console.log('🔄 Sincronización Realtime gatillada por:', event.type)
    fetchDashboardData()
    // Si fue un vinculación, refrescar también el usuario para quitar el mensaje
    if (event.type === 'REFRESH_AUTH') {
      window.location.reload() 
    }
  })

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading && data.stats.total_vehiculos === 0) {
    return (
      <div>
        <div style={{ color: 'var(--primary)', fontWeight: 900, letterSpacing: '0.2em' }} className="animate-pulse">SINCRONIZANDO CENTRO DE MANDO...</div>
      </div>
    )
  }

  return (
    <div>
      <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '48px', gap: '24px' }}>
        <div>
          <h1 className="h1-premium neon-text">Centro de Mando</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p className="p-subtitle">Gestión de Operaciones en Tiempo Real</p>
            <div 
              className="p-glass-premium" 
              style={{ 
                padding: '4px 12px', 
                borderRadius: '100px', 
                fontSize: '9px', 
                fontWeight: 900, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                border: `1px solid ${data.stats.alertas_criticas > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                color: data.stats.alertas_criticas > 0 ? 'var(--danger)' : '#22c55e'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} className={data.stats.alertas_criticas > 0 ? 'animate-pulse' : ''} />
              {data.stats.alertas_criticas > 0 ? 'INTEGRIDAD COMPROMETIDA' : 'SISTEMA PROTEGIDO'}
            </div>
          </div>
        </div>
        
        <div className="p-flex p-gap-4 p-items-center">
          {data.stats.alertas_criticas > 0 && (
            <div className="p-glass-premium mobile-hide" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{data.stats.alertas_criticas} ALERTS</span>
            </div>
          )}
        </div>
      </header>

      {/* CONNECTION HUB */}
      {!currentUser?.telegram_chat_id && (
        <Motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-glass-premium" style={{ padding: 'clamp(24px, 5vw, 40px)', marginBottom: '48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1 }} />
          <div className="p-flex-responsive p-justify-between" style={{ position: 'relative', zIndex: 10, gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0 0 12px' }} className="p-neon-text">¡Conecta tu Centro de Mando!</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, maxWidth: '500px', margin: 0 }}>Recibe alertas del Guardián Forense y notificaciones de caja directamente en tu Telegram.</p>
            </div>
            <button 
              onClick={async () => {
                const res = await callApi('admin/generate_link_token.php');
                if(res && res.link) window.open(res.link, '_blank');
              }}
              className="btn-primary mobile-full-btn" 
            >
              VINCULAR TELEGRAM
            </button>
          </div>
        </Motion.div>
      )}

      <div className="p-grid p-grid-cols-3">
        <StatCard title="FLOTA TOTAL" value={data.stats.total_vehiculos} icon={Truck} trend="+0" color="99, 102, 241" />
        <StatCard title="EN OPERACIÓN" value={data.stats.rutas_activas} icon={Activity} color="16, 185, 129" trend="+0" />
        <StatCard title="RECAUDACIÓN HOY" value={`$${data.stats.recaudacion_hoy}`} icon={DollarSign} color="34, 197, 94" trend="Real-time" />
      </div>

      <div style={{ marginTop: '32px' }}>
          <div className="p-flex p-items-center p-justify-between" style={{ marginBottom: '24px' }}>
              <div className="p-flex p-items-center p-gap-4">
                <BarChart3 style={{ opacity: 0.2 }} size={20} />
                <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4 }}>Últimas Unidades (Forense)</h2>
              </div>
              <button 
                onClick={() => window.location.search = '?view=flota'}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                Ver Flota Completa →
              </button>
          </div>
          <FleetList vehicles={data.vehicles.slice(0, 5)} />
      </div>
    </div>
  )
}

export default Dashboard
