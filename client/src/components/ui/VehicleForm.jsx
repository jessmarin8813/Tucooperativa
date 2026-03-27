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
    km_por_litro: initialData?.km_por_litro || '',
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

  const inputStyle = {
    width: '100%', 
    padding: '14px 18px', 
    background: '#121421', /* Solid dark base for better readability */
    border: '1px solid rgba(255,255,255,0.1)', 
    borderRadius: '14px',
    color: 'white',
    outline: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
  }

  const labelStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginBottom: '10px', 
    color: 'rgba(255,255,255,0.5)', 
    fontSize: '0.75rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && (
        <div style={{ color: '#ff4d4d', fontSize: '0.875rem', background: 'rgba(255,77,77,0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,77,77,0.2)' }}>
          {error}
        </div>
      )}

      <div className="input-group">
        <label style={labelStyle}>
          <Hash size={14} /> PLACA DEL VEHÍCULO
        </label>
        <input 
          type="text" 
          name="placa"
          placeholder="EJ: ABC-123"
          value={formData.placa}
          onChange={handleChange}
          required
          style={inputStyle}
          className="form-input-premium"
        />
      </div>

      <div className="input-group">
        <label style={labelStyle}>
          <Truck size={14} /> MODELO / MARCA
        </label>
        <input 
          type="text" 
          name="modelo"
          placeholder="EJ: Toyota Hiace 2024"
          value={formData.modelo}
          onChange={handleChange}
          required
          style={inputStyle}
          className="form-input-premium"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="input-group">
          <label style={labelStyle}>
            <Calendar size={14} /> AÑO
          </label>
          <input 
            type="number" 
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            required
            style={inputStyle}
            className="form-input-premium"
          />
        </div>

        <div className="input-group">
          <label style={labelStyle}>
            <DollarSign size={14} /> CUOTA DIARIA (USD)
          </label>
          <input 
            type="number" 
            name="cuota_diaria"
            placeholder="0.00"
            step="0.01"
            value={formData.cuota_diaria}
            onChange={handleChange}
            required
            style={inputStyle}
            className="form-input-premium"
          />
        </div>
      </div>

      <div className="input-group">
        <label style={labelStyle}>
          <Truck size={14} /> CONSUMO ESTIMADO (KM/L)
        </label>
        <input 
          type="number" 
          name="km_por_litro"
          step="0.1"
          placeholder="Ej: 8.5"
          value={formData.km_por_litro}
          onChange={handleChange}
          style={inputStyle}
          className="form-input-premium"
        />
      </div>

      <button 
        type="submit" 
        className="btn-primary" 
        disabled={loading}
        style={{ 
          marginTop: '10px', 
          width: '100%', 
          padding: '18px', 
          fontSize: '0.9rem', 
          fontWeight: 900,
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
        }}
      >
        {loading ? 'PROCESANDO...' : (initialData ? 'ACTUALIZAR UNIDAD' : 'REGISTRAR UNIDAD')}
      </button>
    </form>
  )
}

export default VehicleForm
