import React, { memo } from 'react'
import { motion as Motion } from 'framer-motion'

const StatCard = ({ title, label, value, icon: Icon, color = 'var(--primary)', trend }) => {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass group"
      style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="text-label" style={{ marginBottom: '8px' }}>
            {title || label}
          </div>
          <div className="text-value neon-text">
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <div style={{ 
                padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 900,
                background: (trend.toString().startsWith('+') || trend === 'Real-time') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: (trend.toString().startsWith('+') || trend === 'Real-time') ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${(trend.toString().startsWith('+') || trend === 'Real-time') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {trend}
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {trend === 'Real-time' ? 'Sincronizado' : 'vs ayer'}
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div 
              style={{ 
                  width: '56px', height: '56px', borderRadius: '18px', background: color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 16px ${color}33`
              }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>
      
      {/* Decorative Glow */}
      <div 
        style={{ 
            position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px',
            borderRadius: '100%', background: color, filter: 'blur(50px)', opacity: 0.1, 
            transition: 'all 0.4s ease'
        }}
        className="group-hover:opacity-30"
      />
    </Motion.div>
  )
}

export default memo(StatCard)
