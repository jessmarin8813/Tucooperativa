import React, { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Calendar, Download, TrendingUp, ArrowUpRight } from 'lucide-react'
import { getApiUrl } from '../utils/api'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const FinanzasView = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(getApiUrl('reportes_financieros.php'))
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="animate-pulse" style={{ padding: '40px' }}>Cargando Finanzas...</div>

  const stats = [
    { label: 'Efectivo Total', value: `$${data?.resumen?.total_efectivo || 0}`, icon: DollarSign, color: '#22c55e' },
    { label: 'Pago Móvil Total', value: `$${data?.resumen?.total_pagomovil || 0}`, icon: CreditCard, color: '#3b82f6' },
    { label: 'Cierre Proyectado', value: `$${data?.resumen?.total_esperado || 0}`, icon: TrendingUp, color: '#a855f7' },
  ]

  return (
    <div className="view-container animate-fade" style={{ padding: '40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="neon-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Corte de Caja Global</h1>
        <p style={{ color: 'var(--text-dim)' }}>Auditoría de ingresos y reconciliación de pagos (Estilo Maturín)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {stats.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass" 
            style={{ padding: '24px', borderRadius: '24px', borderLeft: `4px solid ${s.color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <s.icon size={24} style={{ color: s.color }} />
              <ArrowUpRight size={16} style={{ color: 'var(--text-dim)' }} />
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', fontWeight: 600 }}>{s.label}</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{s.value}</h2>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div className="glass" style={{ padding: '32px', borderRadius: '24px', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '24px', fontWeight: 700 }}>Flujo de Ingresos (7 días)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.grafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="fecha" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1a1b26', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'white' }}
                />
                <Bar dataKey="efectivo" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pagomovil" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontWeight: 700 }}>Pagos Recientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {data?.recientes?.slice(0, 5).map((p, i) => (
               <div key={i} style={{ 
                 padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)',
                 border: '1px solid rgba(255,255,255,0.05)'
               }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.placa}</span>
                   <span style={{ color: 'var(--accent)', fontWeight: 800 }}>${p.monto}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                   <span>{p.chofer_nombre}</span>
                   <span>{p.fecha}</span>
                 </div>
               </div>
             ))}
             <button className="glass-hover" style={{ width: '100%', marginTop: '8px', fontSize: '0.875rem' }}>VER TODO EL HISTORIAL</button>
          </div>
        </div>
      </div>

      {/* Printable Receipt logic would go here, for now a button simulation */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
         <button className="btn-primary" style={{ padding: '16px 40px', letterSpacing: '0.1em' }}>
            <Download size={18} style={{ marginRight: '10px' }} /> GENERAR REPORTE PDF (MATURÍN STYLE)
         </button>
      </div>
    </div>
  )
}

export default FinanzasView
