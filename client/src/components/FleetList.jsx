import React from 'react'
import { MoreVertical, User, Tag, Calendar } from 'lucide-react'

const FleetList = ({ vehicles = [] }) => {
  return (
    <div className="glass" style={{ marginTop: '32px', overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Estado de la Flota</h3>
        <button className="glass-hover" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>Ver Todos</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <th style={{ padding: '20px 24px' }}>Vehículo / Placa</th>
              <th style={{ padding: '20px 24px' }}>Dueño</th>
              <th style={{ padding: '20px 24px' }}>Cuota Diaria</th>
              <th style={{ padding: '20px 24px' }}>Estado</th>
              <th style={{ padding: '20px 24px' }}>Salud (Aceite / Cauchos)</th>
              <th style={{ padding: '20px 24px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, i) => (
              <tr key={i} className="glass-hover" style={{ borderTop: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{v.modelo}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{v.placa}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={14} />
                    </div>
                    <span>{v.dueno}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 600 }}>
                  ${v.cuota}
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    background: v.status === 'activo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: v.status === 'activo' ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {v.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '120px' }}>
                      <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '75%', background: 'var(--success)' }}></div>
                      </div>
                      <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '40%', background: 'var(--warning)' }}></div>
                      </div>
                    </div>
                 </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <MoreVertical size={18} style={{ color: 'var(--text-dim)', cursor: 'pointer' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FleetList
