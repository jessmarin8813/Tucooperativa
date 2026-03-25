import React from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <Motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           style={{ 
             position: 'absolute', 
             inset: 0, 
             background: 'rgba(0,0,0,0.7)', 
             backdropFilter: 'blur(8px)' 
           }}
        />

        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass"
          style={{ 
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{title}</h2>
            <button 
              onClick={onClose}
              className="glass-hover"
              style={{ padding: '8px', borderRadius: '50%', display: 'flex' }}
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </Motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Modal
