import React from 'react'
import { MoreVertical, User, ChevronRight, AlertTriangle, Car } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const FleetList = ({ vehicles = [] }) => {
  if (vehicles.length === 0) {
    return (
      <div className="glass-premium p-16 text-center text-white/20 font-black uppercase tracking-widest text-xs border-dashed">
        No hay vehículos registrados en la flota.
      </div>
    )
  }

  return (
    <div className="glass-premium rounded-3xl overflow-hidden shadow-2xl mt-8">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
        <h3 className="text-xl font-black text-white tracking-tight">Estado de la Flota</h3>
        <button className="btn-primary px-6 py-2 text-xs font-black uppercase tracking-widest">Ver Historial</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-black uppercase text-white/20 tracking-widest border-b border-white/5 bg-white/2">
              <th className="p-8">Vehículo / Placa</th>
              <th className="p-8">Dueño / Chofer</th>
              <th className="p-8 text-center">Cuota</th>
              <th className="p-8">Estado</th>
              <th className="p-8 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/2">
            {vehicles.map((v, i) => (
              <Motion.tr 
                key={v.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-hover group"
              >
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <Car size={24} />
                    </div>
                    <div>
                        <p className="text-white font-black text-lg tracking-tighter group-hover:translate-x-1 transition-transform">{v.modelo || 'Unidad de Flota'}</p>
                        <p className="text-xs text-accent font-black tracking-widest uppercase">{v.placa}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-white/20" />
                    <span className="text-white font-bold text-sm tracking-tight">{v.dueno_nombre}</span>
                  </div>
                  {v.chofer_nombre && (
                    <div className="text-xs text-white/30 font-bold uppercase tracking-wide ml-5">
                      Op: {v.chofer_nombre}
                    </div>
                  )}
                </td>
                <td className="p-8 text-center font-black text-white/60 text-lg">${v.cuota_diaria}</td>
                <td className="p-8">
                   <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-pill text-xs font-black uppercase tracking-widest border ${
                        v.status_label === 'en ruta'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                          : 'bg-white/5 text-white/30 border-white/5'
                      }`}>
                        {v.status_label}
                      </span>
                      {v.alerta_combustible == 1 && (
                        <div className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-pill text-xs font-black animate-pulse">
                          <AlertTriangle size={12} />
                          FUEL ALERT
                        </div>
                      )}
                   </div>
                </td>
                <td className="p-8 text-right">
                  <div className="flex justify-end gap-4 items-center">
                    {!v.chofer_id && (
                      <button 
                        onClick={async () => {
                          const res = await fetch('/api/invitaciones.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ vehiculo_id: v.id })
                          });
                          const data = await res.json();
                          if (data.status === 'success') {
                            navigator.clipboard.writeText(data.link);
                            alert('✅ Link de Invitación copiado al portapapeles. Envíalo al chofer.');
                          }
                        }}
                        className="btn-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest border-neon"
                      >
                        INVITAR CHOFER
                      </button>
                    )}
                    <button className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                  </div>
                </td>
              </Motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FleetList
