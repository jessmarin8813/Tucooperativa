import React from 'react'
import { motion as Motion } from 'framer-motion'

const StatCard = ({ label, value, icon: Icon, color = 'var(--primary)', trend }) => {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="p-glass-premium group"
      style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
    >
      <div className="p-flex p-justify-between p-items-start" style={{ position: 'relative', zIndex: 10 }}>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '8px' }}>{label}</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'white', margin: 0 }}>{value}</h3>
          {trend && (
            <p style={{ fontSize: '12px', fontWeight: 700, marginTop: '8px', color: (trend.startsWith('+') || trend === 'Real-time') ? 'var(--success)' : 'var(--danger)' }}>
              {trend} {trend !== 'Real-time' && 'vs ayer'}
            </p>
          )}
        </div>
        <div 
            className="p-flex p-items-center p-justify-center" 
            style={{ 
                width: '48px', height: '48px', borderRadius: '16px', background: color, color: 'white',
                boxShadow: `0 8px 16px ${color}33`
            }}
        >
          <Icon size={20} />
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div 
        style={{ 
            position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px',
            borderRadius: '100%', background: color, filter: 'blur(40px)', opacity: 0.1, 
            transition: 'all 0.4s ease'
        }}
        className="group-hover:opacity-30"
      />
    </Motion.div>
  )
}

export default StatCard
