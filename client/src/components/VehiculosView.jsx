import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import FleetList from './FleetList'

const VehiculosView = () => {
  const [vehicles, setVehicles] = useState([])
  const { callApi, loading } = useApi()

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await callApi('vehiculos.php')
      setVehicles(Array.isArray(data) ? data : [])
    } catch { /* Handled */ }
  }, [callApi])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  return (
    <div className="view-container animate-fade">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter neon-text">Flota de Vehículos</h1>
          <p className="text-white/40 font-bold mt-2">Monitorización de unidades y salud de activos en tiempo real</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchVehicles} className="glass-premium p-4 flex items-center justify-center">
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn-primary flex items-center gap-4 px-8 py-4">
            <Plus size={24} />
            Nueva Unidad
          </button>
        </div>
      </div>

      {loading && vehicles.length === 0 ? (
        <div className="flex items-center justify-center p-24">
            <RefreshCw size={48} className="animate-spin text-accent" />
        </div>
      ) : (
        <FleetList vehicles={vehicles} />
      )}
    </div>
  )
}

export default VehiculosView
