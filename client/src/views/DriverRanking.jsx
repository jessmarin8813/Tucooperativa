import React, { useState, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, AlertTriangle, Fuel, Timer, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApi } from '../hooks/useApi'
import StatCard from '../components/ui/StatCard'

const DriverRanking = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { callApi } = useApi()

  useEffect(() => {
    let ignore = false
    const init = async () => {
      await Promise.resolve()
      if (ignore) return
      try {
        const response = await callApi('admin/driver_ranking.php')
        setData(response)
      } catch (error) {
        console.error('Error fetching ranking:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
    return () => { ignore = true }
  }, [callApi])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="neon-text animate-pulse">CARGANDO ESCALAFÓN...</div>
      </div>
    )
  }

  const rankingList = Array.isArray(data?.ranking) ? data.ranking : []
  const summaryData = data?.summary || { avg_score: 0 }

  const chartData = rankingList.slice(0, 5).map(r => ({
    name: r.nombre?.split(' ')[0] || '---',
    puntos: r.puntos || 0
  }))

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold neon-text mb-2">Escalafón de Honor</h1>
          <p className="text-dim">Gamificación y rendimiento basado en eficiencia operativa.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border-neon">
          <span className="text-xs uppercase tracking-widest text-dim block">Promedio Flota</span>
          <span className="text-2xl font-bold neon-text">{summaryData.avg_score?.toFixed(1) || 0} PTS</span>
        </div>
      </div>

      {/* Podium / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Top Eficiencia" 
          value={`${rankingList[0]?.stats?.eficiencia || 0}%`} 
          icon={Fuel} 
          trend={rankingList.length > 0 ? "+12%" : "Esperando datos"}
        />
        <StatCard 
          title="Puntualidad Flota" 
          value={`${rankingList[0]?.stats?.puntualidad || 0}%`} 
          icon={Timer} 
          trend={rankingList.length > 0 ? "+5%" : "Sincronizando"}
        />
        <StatCard 
          title="Incidentes Críticos" 
          value={rankingList.reduce((acc, curr) => acc + (curr.stats?.alertas || 0), 0)} 
          icon={AlertTriangle} 
          trend="0 hoy"
        />
      </div>

      {rankingList.length === 0 ? (
        <Motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-16 rounded-3xl text-center flex flex-column items-center gap-6"
          style={{ border: '2px dashed rgba(255,255,255,0.1)' }}
        >
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Trophy size={40} className="text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white">No hay datos de rendimiento todavía</h2>
          <p className="text-dim max-w-md mx-auto">
            El escalafón se generará automáticamente a medida que los choferes completen sus rutas y reporten datos desde el Bot.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <div className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-widest text-accent">Sincronización Activa</div>
            <div className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-widest text-dim">Esperando Primeros Reportes</div>
          </div>
        </Motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard Table */}
          <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                Leaderboard Mensual
              </h3>
              <span className="text-xs text-dim">{rankingList.length} Choferes Activos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-dim text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Símbolo</th>
                    <th className="px-6 py-4">Chofer</th>
                    <th className="px-6 py-4 text-center">Eficiencia</th>
                    <th className="px-6 py-4 text-center">Pts Global</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rankingList.map((driver) => (
                    <tr key={driver.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-dim">
                        {(driver.rango || 0).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        {driver.medalla === 'oro' && <div className="medal-oro"><Medal size={24} /></div>}
                        {driver.medalla === 'plata' && <div className="medal-plata"><Medal size={24} /></div>}
                        {driver.medalla === 'bronce' && <div className="medal-bronce"><Medal size={24} /></div>}
                        {driver.medalla === 'ninguna' && <Users className="text-white/20" size={20} />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{driver.nombre}</div>
                        <div className="text-xs text-dim">KM: {driver.stats?.distancia || 0}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden max-w-[100px] mx-auto">
                          <Motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${driver.stats?.eficiencia || 0}%` }}
                            className={`h-full ${(driver.stats?.eficiencia || 0) > 90 ? 'bg-green-500' : 'bg-blue-500'}`}
                          />
                        </div>
                        <span className="text-[10px] text-dim">{driver.stats?.eficiencia || 0}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-bold text-sm">
                          {driver.puntos || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Motion.div>

          {/* Charts Side */}
          <div className="space-y-8">
            <Motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-3xl"
            >
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-400" size={20} />
                Top 5 Desempeño
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Bar dataKey="puntos" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#fbbf24' : '#60a5fa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Motion.div>

            <div className="glass p-6 rounded-3xl border-dashed border-white/10">
              <h4 className="text-sm font-bold mb-2">¿Cómo se calcula el Score?</h4>
              <ul className="text-xs text-dim space-y-2">
                <li className="flex justify-between"><span>Eficiencia Fuel</span> <span>40%</span></li>
                <li className="flex justify-between"><span>Puntualidad</span> <span>40%</span></li>
                <li className="flex justify-between"><span>Seguridad</span> <span>20%</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverRanking
