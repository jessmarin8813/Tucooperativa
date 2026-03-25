import React, { useState, useEffect, useCallback } from 'react'
import { Settings, ShieldCheck, CreditCard, DollarSign, Bot, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ConfiguracionView = () => {
    const { callApi, loading: apiLoading } = useApi()
    const [activeTab, setActiveTab] = useState('sistema')
    const [config, setConfig] = useState({
        cuota_diaria: 10,
        moneda: 'USD',
        telegram_bot_token: '',
        telegram_chat_id: '',
        banco_nombre: '',
        banco_tipo: 'Pago Móvil',
        banco_identidad: '',
        banco_telefono: ''
    })
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState(null)

    const fetchConfig = useCallback(async () => {
        try {
            const res = await callApi('admin/get_config.php')
            if (res) setConfig(prev => ({ ...prev, ...res }))
        } catch { /* Handled */ }
    }, [callApi])

    useEffect(() => {
        let ignore = false
        const init = async () => {
            await Promise.resolve()
            if (!ignore) await fetchConfig()
        }
        init()
        return () => { ignore = true }
    }, [fetchConfig])

    const handleSave = async () => {
        setSaving(true)
        setStatus(null)
        try {
            await callApi('admin/save_config.php', {
                method: 'POST',
                body: JSON.stringify(config)
            })
            setStatus({ type: 'success', msg: 'Configuración guardada correctamente' })
        } catch {
            setStatus({ type: 'error', msg: 'Error al guardar configuración' })
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    if (apiLoading && !config.cuota_diaria) return <LoadingSpinner />

    return (
        <div className="view-container animate-fade">
            <header className="p-flex-responsive p-justify-between" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="h1-premium neon-text">Configuración del Sistema</h1>
                    <p className="p-subtitle">Gestión centralizada de parámetros, seguridad y pagos</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', opacity: saving ? 0.7 : 1 }}
                >
                    {saving ? <div className="animate-spin"><Settings size={20} /></div> : <Save size={20} />}
                    {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
            </header>

            <div style={{ maxWidth: '1200px' }}>
                <div className="tab-container" style={{ marginBottom: '32px', marginLeft: '0px' }}>
                    <button 
                        onClick={() => setActiveTab('sistema')}
                        className={`tab-item ${activeTab === 'sistema' ? 'active' : ''}`}
                    >
                        <Settings size={18} />
                        SISTEMA Y TARIFAS
                    </button>
                    <button 
                        onClick={() => setActiveTab('seguridad')}
                        className={`tab-item ${activeTab === 'seguridad' ? 'active' : ''}`}
                    >
                        <ShieldCheck size={18} />
                        BOT Y SEGURIDAD
                    </button>
                    <button 
                        onClick={() => setActiveTab('pagos')}
                        className={`tab-item ${activeTab === 'pagos' ? 'active' : ''}`}
                    >
                        <CreditCard size={18} />
                        DATOS DE PAGO
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <Motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-premium"
                    style={{ padding: 'clamp(24px, 5vw, 48px)', borderRadius: '32px', maxWidth: '1200px' }}
                >
                    {activeTab === 'sistema' && (
                        <div className="p-grid p-grid-cols-2" style={{ gap: '48px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <DollarSign className="text-success" /> Parámetros Operativos
                                </h3>
                                <div className="p-flex p-flex-col p-gap-6">
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>CUOTA DIARIA ($ USD)</label>
                                        <input 
                                            type="number"
                                            value={config.cuota_diaria}
                                            onChange={(e) => setConfig({...config, cuota_diaria: e.target.value})}
                                            className="glass"
                                            style={{ width: '100%', padding: '16px 24px', fontSize: '1.5rem', fontWeight: 900, color: 'var(--success)' }}
                                        />
                                        <p style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Monto fijo que el sistema exigirá a cada unidad diariamente.</p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>DIVISA PRINCIPAL</label>
                                        <select 
                                            value={config.moneda}
                                            onChange={(e) => setConfig({...config, moneda: e.target.value})}
                                            className="glass select-premium"
                                            style={{ width: '100%', padding: '16px 24px', fontWeight: 700, appearance: 'none' }}
                                        >
                                            <option value="USD">Dólar Estadounidense ($)</option>
                                            <option value="BS">Bolívares Digitales (Bs)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', marginBottom: '24px' }}>
                                    <ShieldCheck size={40} />
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Cumplimiento Automático</h4>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '16px', lineHeight: 1.6 }}>Cualquier cambio en la cuota se aplicará de forma forense a partir del próximo cierre de caja programado.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seguridad' && (
                        <div style={{ maxWidth: '800px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Bot className="text-accent" /> Integración con Telegram
                            </h3>
                            <div className="p-flex p-flex-col p-gap-8">
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>BOT API TOKEN</label>
                                    <input 
                                        type="password"
                                        value={config.telegram_bot_token}
                                        onChange={(e) => setConfig({...config, telegram_bot_token: e.target.value})}
                                        placeholder="712345678:AAH...WXYZ"
                                        className="glass"
                                        style={{ width: '100%', padding: '16px 24px', fontFamily: 'monospace', letterSpacing: '0.1em' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>ADMIN CHAT ID (PARA ALERTAS)</label>
                                    <input 
                                        type="text"
                                        value={config.telegram_chat_id}
                                        onChange={(e) => setConfig({...config, telegram_chat_id: e.target.value})}
                                        placeholder="-100123456789"
                                        className="glass"
                                        style={{ width: '100%', padding: '16px 24px' }}
                                    />
                                    <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--accent)', fontWeight: 800 }}>Aquí es donde el sistema enviará los reportes forenses y alertas de pago.</p>
                                </div>
                                <div className="glass" style={{ padding: '24px', border: '1px solid var(--accent)', background: 'rgba(6, 182, 212, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <Bot className="text-accent animate-bounce" />
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>Vincular mi cuenta personal</p>
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Recibe tu acceso de administrador directo en Telegram</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            const res = await callApi('admin/generate_link_token.php');
                                            if(res.success && res.link) window.open(res.link, '_blank');
                                        }}
                                        className="btn-primary" 
                                        style={{ padding: '10px 20px', background: 'var(--accent)', fontSize: '10px' }}
                                    >
                                        GENERAR TOKEN DE ENLACE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pagos' && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CreditCard className="text-primary" /> Datos de Recaudación (Pago Móvil)
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.9rem' }}>Estos datos son visibles para todos los choferes al momento de reportar su pago diario.</p>
                            
                            <div className="p-grid p-grid-cols-2" style={{ gap: '32px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>BANCO DESTINO</label>
                                    <input 
                                        type="text"
                                        value={config.banco_nombre}
                                        onChange={(e) => setConfig({...config, banco_nombre: e.target.value})}
                                        placeholder="Ej: Banco Mercantil"
                                        className="glass"
                                        style={{ width: '100%', padding: '16px 24px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>CÉDULA / RIF</label>
                                    <input 
                                        type="text"
                                        value={config.banco_identidad}
                                        onChange={(e) => setConfig({...config, banco_identidad: e.target.value})}
                                        placeholder="V-12345678"
                                        className="glass"
                                        style={{ width: '100%', padding: '16px 24px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>TELÉFONO ASOCIADO</label>
                                    <input 
                                        type="text"
                                        value={config.banco_telefono}
                                        onChange={(e) => setConfig({...config, banco_telefono: e.target.value})}
                                        placeholder="04121234567"
                                        className="glass"
                                        style={{ width: '100%', padding: '16px 24px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {status && (
                    <Motion.div 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 50 }}
                        style={{ 
                            position: 'fixed', bottom: '40px', right: '40px', 
                            padding: '20px 32px', borderRadius: '20px', 
                            background: status.type === 'success' ? 'var(--success)' : 'var(--danger)',
                            color: 'white', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '16px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 9999
                        }}
                    >
                        {status.type === 'success' ? <CheckCircle /> : <AlertCircle />}
                        {status.msg}
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ConfiguracionView
