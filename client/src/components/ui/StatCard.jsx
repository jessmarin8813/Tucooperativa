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
            <p style={{ fontSize: '0.875rem', fontWeight: 700, marginTop: '12px', color: (trend.startsWith('+') || trend === 'Real-time') ? 'var(--success)' : 'var(--danger)' }}>
              {trend} {trend !== 'Real-time' && 'vs ayer'}
            </p>
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
