import React, { useState, useEffect } from 'react'
import { User, Trash2, ShieldCheck, ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react'
import { getApiUrl } from '../utils/api'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

const ChoferesView = () => {
  const [choferes, setChoferes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchChoferes = async () => {
    setLoading(true)
    try {
      const resp = await fetch(getApiUrl('choferes.php'))
      const data = await resp.json()
      setChoferes(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Error fetching drivers", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChoferes()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar a este chofer? Perderá acceso inmediato al Bot.")) return
    await fetch(getApiUrl(`choferes.php?id=${id}`), { method: 'DELETE' })
    fetchChoferes()
  }

  return (
    <div className="view-container animate-fade" style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="h1-premium neon-text">Gestión de Choferes</h1>
          <p className="p-subtitle">Control de acceso y estado de la fuerza de transporte</p>
        </div>
        <button onClick={fetchChoferes} className="glass-hover" style={{ padding: '12px' }}>
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        <AnimatePresence>
          {choferes.map((c) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass" 
              style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', 
                  background: 'var(--primary-gradient)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <User size={28} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>{c.nombre}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '12px' }}>{c.email}</p>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`status-badge ${c.is_online ? 'online' : 'offline'}`} style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', 
                      borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                      background: c.is_online ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: c.is_online ? '#22c55e' : '#ef4444'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                      {c.is_online ? 'EN RUTA' : 'DESCONECTADO'}
                    </span>

                    {c.telegram_id ? (
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                        background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <ShieldCheck size={12} /> VINCULADO
                      </span>
                    ) : (
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                        background: 'rgba(234, 179, 8, 0.1)', color: '#eab308'
                      }}>
                        <ShieldAlert size={12} /> PENDIENTE LINK
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="glass-hover" 
                  style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '10px' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {choferes.length === 0 && !loading && (
          <div className="glass" style={{ padding: '64px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-dim)' }}>No hay choferes registrados en esta cooperativa.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChoferesView
