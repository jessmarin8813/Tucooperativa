import React from 'react'

const LoadingSpinner = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
      <span className="text-accent text-xs font-bold tracking-widest uppercase animate-pulse">Cargando Módulo...</span>
    </div>
  </div>
)

export default LoadingSpinner
