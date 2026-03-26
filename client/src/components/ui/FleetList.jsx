import React from 'react'
import { MoreVertical, User, AlertTriangle, Car, History } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const FleetList = ({ vehicles = [] }) => {
  if (vehicles.length === 0) {
    return (
      <div className="glass-premium p-16 text-center text-white/20 font-black uppercase tracking-widest text-xs border-dashed border-2 border-white/5 rounded-3xl m-8">
        No hay vehículos registrados en la flota.
      </div>
    )
  }

  return (
    <div className="glass-premium rounded-3xl overflow-hidden shadow-2xl mt-8 border border-white/5 bg-white/2">
      <div className="p-8 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/2">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Car size={20} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Estado de la Flota</h3>
        </div>
        <button className="btn-primary px-6 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <History size={14} />
            Ver Historial
        </button>
      </div>

      <div className="p-0 overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-[2.5fr_2fr_1fr_1.5fr_1.5fr] text-[10px] font-black uppercase text-white/20 tracking-widest border-b border-white/5 bg-white/2 p-6 px-10">
            <div>Vehículo / Placa</div>
            <div>Dueño / Chofer</div>
            <div className="text-center">Cuota</div>
            <div className="text-center">Estado</div>
            <div className="text-right">Acciones</div>
          </div>

          {/* Body */}
          <div className="divide-y divide-white/5">
            {vehicles.map((v, i) => (
              <Motion.div 
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[2.5fr_2fr_1fr_1.5fr_1.5fr] items-center p-8 px-10 glass-hover group"
              >
                {/* Vehículo */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/5 rounded-[22px] flex items-center justify-center text-white/10 group-hover:bg-accent/10 group-hover:text-accent transition-all duration-500 border border-white/5 group-hover:border-accent/20">
                      <Car size={28} />
                  </div>
                  <div>
                      <p className="text-white font-black text-lg tracking-tighter group-hover:translate-x-1 transition-transform duration-300">{v.modelo || 'Unidad de Flota'}</p>
                      <p className="text-[10px] text-accent font-black tracking-widest uppercase mt-1 px-2 py-0.5 bg-accent/5 rounded-md inline-block border border-accent/10">{v.placa}</p>
                  </div>
                </div>

                {/* Dueño / Chofer */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center">
                        <User size={12} className="text-white/40" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-tight truncate">{v.dueno_nombre}</span>
                  </div>
                  {v.chofer_nombre ? (
                    <div className="text-[9px] text-white/30 font-black uppercase tracking-wider pl-8 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-pulse"></div>
                      Op: {v.chofer_nombre}
                    </div>
                  ) : (
                    <div className="text-[9px] text-white/10 font-bold uppercase tracking-wider pl-8">
                      Sin Chofer
                    </div>
                  )}
                </div>

                {/* Cuota */}
                <div className="text-center">
                    <div className="inline-block px-4 py-2 bg-white/3 rounded-2xl border border-white/5">
                        <span className="text-white/40 text-[10px] font-black mr-1">$</span>
                        <span className="text-white font-black text-xl">{v.cuota_diaria}</span>
                    </div>
                </div>

                {/* Estado */}
                <div className="flex flex-col items-center gap-2">
                   <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-pill text-[10px] font-black uppercase tracking-widest border transition-all ${
                        v.status_label === 'en ruta'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                          : 'bg-white/5 text-white/30 border-white/5'
                      }`}>
                        {v.status_label || 'Inactivo'}
                      </span>
                   </div>
                   {v.alerta_combustible == 1 && (
                    <div className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-pill text-[9px] font-black animate-pulse">
                        <AlertTriangle size={10} />
                        FUEL ALERT
                    </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 items-center">
                    {!v.chofer_id && (
                      <button 
                        onClick={async () => {
                          try {
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
                          } catch (e) {
                            alert('❌ Error al generar invitación');
                          }
                        }}
                        className="btn-primary hover:bg-emerald-500 h-10 px-4 text-[9px] font-black uppercase tracking-widest border border-white/10 flex-shrink-0"
                      >
                        INVITAR CHOFER
                      </button>
                    )}
                    <button className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                        <MoreVertical size={18} />
                    </button>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FleetList
