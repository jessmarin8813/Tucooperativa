/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Send, Link2, Copy, Check, Trash2, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getApiUrl } from '../utils/api'

const InvitacionesView = () => {
  const [invitaciones, setInvitaciones] = useState([])
  const [copied, setCopied] = useState(null)
  
  // Use a simple useEffect for fetching
  useEffect(() => {
    let active = true;
    fetch(getApiUrl('invitaciones.php'))
      .then(r => r.json())
      .then(d => {
        if (active) setInvitaciones(d);
      });
    return () => { active = false; };
  }, []);

  const generateInvite = async () => {
    await fetch(getApiUrl('invitaciones.php'), { method: 'POST' });
    // Refresh data
    const r = await fetch(getApiUrl('invitaciones.php'));
    const d = await r.json();
    setInvitaciones(d);
  }

  const deleteInvite = async (id) => {
    await fetch(getApiUrl(`invitaciones.php?id=${id}`), { method: 'DELETE' });
    const r = await fetch(getApiUrl('invitaciones.php'));
    const d = await r.json();
    setInvitaciones(d);
  }

  const copyToClipboard = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="view-container animate-fade" style={{ padding: '40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="neon-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Onboarding Digital</h1>
        <p style={{ color: 'var(--text-dim)' }}>Genera accesos de un click para tus nuevos choferes via Telegram</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
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
            <Link2 size={18} /> GENERAR LINK MAESTRO
          </button>
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} className="neon-text" /> Links Pendientes
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {invitaciones.map((inv) => {
                const link = `https://t.me/TuCooperativaBot?start=${inv.token}`
                return (
                  <motion.div 
                    key={inv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-hover" 
                    style={{ 
                      padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '4px', letterSpacing: '0.1em' }}>TOKEN: {inv.token}</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {link}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => copyToClipboard(link, inv.id)}
                        className="glass" 
                        style={{ padding: '10px', color: copied === inv.id ? '#22c55e' : 'white' }}
                      >
                        {copied === inv.id ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteInvite(inv.id)}
                        className="glass" 
                        style={{ padding: '10px', color: 'var(--danger)' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {invitaciones.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>No hay links de invitación activos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvitacionesView
