import React, { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { Truck, Hash, Calendar, DollarSign, UserCheck } from 'lucide-react'

const VehicleForm = ({ onSuccess, currentUser, initialData }) => {
  const { callApi, loading, error } = useApi()
  const [owners, setOwners] = useState([])
  const [formData, setFormData] = useState({
    placa: initialData?.placa || '',
    modelo: initialData?.modelo || '',
    anio: initialData?.anio || new Date().getFullYear(),
    cuota_diaria: initialData?.cuota_diaria || '',
    km_por_litro: initialData?.km_por_litro || '8.0',
    dueno_id: initialData?.dueno_id || (currentUser?.rol === 'dueno' ? currentUser.user_id : '')
  })

  // Load owners if user is admin
  useEffect(() => {
    let ignore = false
    if (currentUser?.rol === 'admin') {
      const init = async () => {
        await Promise.resolve()
        if (ignore) return
        try {
          const res = await callApi('usuarios.php?list_owners=1')
          setOwners(res)
        } catch (err) {
          console.error("Error loading owners:", err)
        }
      }
      init()
    } else if (currentUser?.rol === 'dueno') {
      // Auto-set owner if not already set (re-run as backup)
      setFormData(prev => ({ ...prev, dueno_id: currentUser.user_id }))
    }
    return () => { ignore = true }
  }, [callApi, currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'placa' ? value.toUpperCase() : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const isEdit = !!initialData?.id;
      await callApi('vehiculos.php', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(isEdit ? { ...formData, id: initialData.id } : formData)
      })
      onSuccess()
    } catch {
      // Error handled by useApi
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          <Hash size={14} /> PLACA DEL VEHÍCULO
        </label>
        <input 
          type="text" 
          name="placa"
          placeholder="EJ: ABC-123"
          value={formData.placa}
          onChange={handleChange}
          required
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '12px',
            color: 'white',
            outline: 'none'
          }}
        />
      </div>

      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          <Truck size={14} /> MODELO / MARCA
        </label>
        <input 
          type="text" 
          name="modelo"
          placeholder="EJ: Toyota Hiace 2024"
          value={formData.modelo}
          onChange={handleChange}
          required
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '12px',
            color: 'white',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="input-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            <Calendar size={14} /> AÑO
          </label>
          <input 
            type="number" 
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '12px',
              color: 'white',
              outline: 'none'
            }}
          />
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            <DollarSign size={14} /> CUOTA DIARIA
          </label>
          <input 
            type="number" 
            name="cuota_diaria"
            placeholder="0.00"
            step="0.01"
            value={formData.cuota_diaria}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '12px',
              color: 'white',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          <Truck size={14} /> CONSUMO ESTIMADO (KM/L)
        </label>
        <input 
          type="number" 
          name="km_por_litro"
          step="0.1"
          value={formData.km_por_litro}
          onChange={handleChange}
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '12px',
            color: 'white',
            outline: 'none'
          }}
        />
      </div>

      {/* Automatic Owner Assignment for Smart Flow */}
      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          <UserCheck size={14} /> PROPIETARIO
        </label>
        <div 
          className="glass"
          style={{ 
            padding: '16px', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '0.875rem',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}
        >
          {currentUser?.nombre || 'MI PERFIL'} (ASIGNACIÓN AUTOMÁTICA)
        </div>
      </div>

      <button 
        type="submit" 
        className="btn-primary" 
        disabled={loading}
        style={{ marginTop: '12px', width: '100%', padding: '16px' }}
      >
        {loading ? 'GUARDANDO...' : (initialData ? 'GUARDAR CAMBIOS' : 'CONFIRMAR REGISTRO')}
      </button>
    </form>
  )
}

export default VehicleForm
