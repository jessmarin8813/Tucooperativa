import React from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          key="MODAL_OVERLAY_ROOT"
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
             key="MODAL_BACKDROP"
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
            key="MODAL_CONTENT_WRAPPER"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass"
            style={{ 
              position: 'relative',
              width: window.innerWidth <= 768 ? '100%' : '100%',
              maxWidth: '500px',
              height: window.innerWidth <= 768 ? '100%' : 'auto',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: window.innerWidth <= 768 ? '32px 24px 100px 24px' : '32px', // Bottom padding for button safety
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: window.innerWidth <= 768 ? '0px' : '32px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>{title}</h2>
              <button 
                onClick={onClose}
                className="glass-hover"
                style={{ 
                    padding: '12px', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white'
                }}
              >
                <X size={28} />
              </button>
            </div>
            {children}
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
