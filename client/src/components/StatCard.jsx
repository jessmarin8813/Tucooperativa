/* eslint-disable no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'

const StatCard = (props) => {
  const Icon = props.icon;
  const { label, value, color = 'var(--primary)', trend } = props;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass glass-hover" 
      style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</p>
          <h3 style={{ fontSize: '2.25rem', margin: '8px 0', fontWeight: 700 }}>{value}</h3>
          {trend && (
            <p style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
              {trend} vs ayer
            </p>
          )}
        </div>
        <div className="neon-border" style={{ 
          padding: '12px', 
          borderRadius: '12px', 
          background: color,
          color: 'white'
        }}>
          <Icon size={24} />
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div style={{ 
        position: 'absolute', 
        bottom: '-20px', 
        right: '-20px', 
        width: '100px', 
        height: '100px', 
        background: color, 
        filter: 'blur(40px)', 
        opacity: 0.15 
      }}></div>
    </motion.div>
  )
}

export default StatCard
