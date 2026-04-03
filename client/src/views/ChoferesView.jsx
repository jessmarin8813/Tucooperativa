import React, { useState, useEffect, useCallback } from 'react'
import { User, Trash2, ShieldCheck, ShieldAlert, RefreshCw, Send, Link2, Copy, Check, Clock, Users, Truck } from 'lucide-react'
import { getApiUrl } from '../utils/api'
import { useApi } from '../hooks/useApi'
import { useRealtime } from '../hooks/useRealtime'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const ChoferesView = () => {
  const [activeTab, setActiveTab] = useState('activos')
  const [choferes, setChoferes] = useState([])
  const [invitaciones, setInvitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchChoferes = useCallback(async () => {
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
  }, [])

  const fetchInvitaciones = useCallback(async () => {
    const r = await fetch(getApiUrl('invitaciones.php'))
    const d = await r.json()
    setInvitaciones(Array.isArray(d) ? d : [])
  }, [])

    useEffect(() => {
        let ignore = false
        const init = async () => {
          await Promise.resolve()
          if (!ignore) {
            fetchChoferes()
            fetchInvitaciones()
          }
        }
        init()
    
        return () => { 
            ignore = true;
        }
    }, [fetchChoferes, fetchInvitaciones])

    // REALTIME SYNC (Standardized)
    useRealtime((event) => {
        if (event.type === 'UPDATE_FLEET') {
            fetchChoferes();
            fetchInvitaciones();
        }
    });

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar a este chofer? Perderá acceso inmediato al Bot.")) return
    await fetch(getApiUrl(`choferes.php?id=${id}`), { method: 'DELETE' })
    fetchChoferes()
  }

  const generateInvite = async () => {
    await fetch(getApiUrl('invitaciones.php'), { method: 'POST' })
    fetchInvitaciones()
  }

  const deleteInvite = async (id) => {
    await fetch(getApiUrl(`invitaciones.php?id=${id}`), { method: 'DELETE' })
    fetchInvitaciones()
  }

  const copyToClipboard = (link, id) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="animate-fade">
      <div className="p-flex-responsive p-justify-between" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="h1-premium neon-text">Drivers Hub</h1>
          <p className="p-subtitle">Control total de la fuerza de transporte y onboarding digital</p>
        </div>
      </div>

      <div className="tab-container" style={{ marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('activos')}
          className={`tab-item ${activeTab === 'activos' ? 'active' : ''}`}
        >
          <Users size={18} />
          CHOFERES ACTIVOS
        </button>
        <button 
          onClick={() => setActiveTab('onboarding')}
          className={`tab-item ${activeTab === 'onboarding' ? 'active' : ''}`}
        >
          <Send size={18} />
          ONBOARDING (TELEGRAM)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'activos' ? (
          <Motion.div 
            key="activos"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}
          >
            {(choferes || []).map((c) => (
              <Motion.div 
                key={c.id}
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
                    <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 900, marginBottom: '2px' }}>{c.nombre}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '4px' }}>ID: {c.cedula || '---'}</p>
                    {c.vehiculo_placa && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Truck size={12} /> {c.vehiculo_modelo} ({c.vehiculo_placa})
                      </p>
                    )}
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>{c.email}</p>
                    
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
              </Motion.div>
            ))}

            {(choferes || []).length === 0 && !loading && (
              <div className="glass" style={{ padding: '64px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-dim)' }}>No hay choferes registrados en esta cooperativa.</p>
              </div>
            )}
          </Motion.div>
        ) : (
          <Motion.div 
            key="onboarding"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 1fr) 2fr', gap: '32px' }}
          >
            <div className="glass" style={{ padding: '32px', borderRadius: '24px', height: 'fit-content' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '20px', 
                background: 'var(--primary-gradient)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', marginBottom: '24px' 
              }}>
                <Send size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Nueva Invitación</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '32px', lineHeight: 1.6 }}>
                Al generar un link, podrás enviarlo por WhatsApp o Telegram. 
                El chofer solo deberá presionar "Iniciar" para quedar vinculado automáticamente.
              </p>
              <button onClick={generateInvite} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Link2 size={18} /> {isMobile ? 'GENERAR LINK' : 'GENERAR LINK MAESTRO'}
              </button>
            </div>

            <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} className="neon-text" /> Links Pendientes
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(invitaciones || []).map((inv) => {
                  const link = `https://t.me/TuCooperativaBot?start=${inv.token}`
                  return (
                     <div 
                      key={inv.id}
                      className="glass-hover" 
                      style={{ 
                        padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '4px', letterSpacing: '0.1em', fontWeight: 900 }}>ID: {inv.token}</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', margin: 0 }}>
                          {link}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => copyToClipboard(link, inv.id)}
                          style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: copied === inv.id ? '#22c55e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          {copied === inv.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button 
                          onClick={() => deleteInvite(inv.id)}
                          style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )
                })}
                
                {(invitaciones || []).length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>No hay links de invitación activos.</p>
                )}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChoferesView
