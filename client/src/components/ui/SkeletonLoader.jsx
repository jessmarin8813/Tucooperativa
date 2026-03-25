import React from 'react'
import { motion as Motion } from 'framer-motion'

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = Array(count).fill(0)

  const renderSkeleton = (key) => {
    if (type === 'stats') {
      return (
        <div key={key} className="p-glass-premium animate-pulse" style={{ height: '140px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }} />
      )
    }

    if (type === 'list') {
      return (
        <div key={key} className="p-flex p-items-center p-gap-4" style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }} className="animate-pulse" />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', marginBottom: '8px' }} className="animate-pulse" />
            <div style={{ width: '20%', height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }} className="animate-pulse" />
          </div>
        </div>
      )
    }

    return (
      <div key={key} className="p-glass-premium animate-pulse" style={{ height: '200px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)' }} />
    )
  }

  return (
    <div className={type === 'stats' ? 'p-grid p-grid-cols-3' : 'p-flex p-flex-col p-gap-4'}>
      {skeletons.map((_, i) => renderSkeleton(i))}
    </div>
  )
}

export default SkeletonLoader
