import React, { useState, useEffect, useCallback } from 'react'
import { Settings, ShieldCheck, CreditCard, DollarSign, Bot, Save, AlertCircle, CheckCircle, Users } from 'lucide-react'
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
        telegram_bot_name: '',
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
            <header style={{ marginBottom: '40px' }}>
                <h1 className="h1-premium neon-text">Configuración del Sistema</h1>
                <p className="p-subtitle">Gestión centralizada de parámetros, seguridad y pagos</p>
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
                    className="glass-premium glass mobile-edge-to-edge"
                    style={{ padding: '32px', borderRadius: '32px', maxWidth: '1200px' }}
                >
                    {activeTab === 'sistema' && (
                        <div className="p-grid p-grid-cols-2 p-config-content" style={{ columnGap: '48px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <DollarSign className="text-success" /> Parámetros Operativos
                                </h3>
                                <div className="p-flex p-flex-col p-gap-6">
                                    <div className="p-field-divider">
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>CUOTA DIARIA ($ USD)</label>
                                        <input 
                                            type="number"
                                            value={config.cuota_diaria}
                                            onChange={(e) => setConfig({...config, cuota_diaria: e.target.value})}
                                            className="glass p-mobile-input-premium"
                                            style={{ width: '100%', padding: '16px 24px', fontSize: '1.5rem', fontWeight: 900, color: 'white' }}
                                        />
                                        <p style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Monto fijo que el sistema exigirá a cada unidad diariamente.</p>
                                    </div>
                                    <div className="p-field-divider">
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>DIVISA PRINCIPAL</label>
                                        <select 
                                            value={config.moneda}
                                            onChange={(e) => setConfig({...config, moneda: e.target.value})}
                                            className="glass select-premium p-mobile-input-premium"
                                            style={{ width: '100%', padding: '16px 24px', fontWeight: 700, appearance: 'none' }}
                                        >
                                            <option value="USD">Dólar Estadounidense ($)</option>
                                            <option value="BS">Bolívares Digitales (Bs)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '24px' }}>
                                    <ShieldCheck size={40} />
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Cumplimiento Automático</h4>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '16px', lineHeight: 1.6, marginBottom: '32px' }}>Cualquier cambio en la cuota se aplicará de forma forense a partir del próximo cierre de caja programado.</p>
                                
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-primary p-mobile-full-width"
                                    style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: saving ? 0.7 : 1 }}
                                >
                                    {saving ? <div className="animate-spin"><Settings size={18} /></div> : <Save size={18} />}
                                    {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seguridad' && (
                        <div style={{ maxWidth: '800px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Bot className="text-accent" /> Integración con Telegram
                            </h3>
                            <div className="p-flex p-flex-col p-config-content">
                                <div className="glass p-mobile-column" style={{ padding: '24px', border: '1px solid var(--accent)', background: 'rgba(6, 182, 212, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <ShieldCheck className="text-accent animate-pulse" />
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>Vincular mi cuenta de Dueño</p>
                                            <p className="p-senior-label">Para recibir reportes de auditoría y alertas de pago.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if (config.telegram_chat_id) return;
                                            const res = await callApi('admin/generate_link_token.php?role=owner');
                                            if(res.success && res.link) window.open(res.link, '_blank');
                                        }}
                                        disabled={!!config.telegram_chat_id}
                                        className={`p-mobile-full-width ${config.telegram_chat_id ? 'btn-secondary' : 'btn-primary'}`} 
                                        style={{ 
                                            height: '44px', 
                                            background: config.telegram_chat_id ? 'rgba(34, 197, 94, 0.1)' : 'var(--accent)', 
                                            color: config.telegram_chat_id ? '#22c55e' : 'white',
                                            fontSize: '10px',
                                            opacity: config.telegram_chat_id ? 1 : (saving ? 0.7 : 1),
                                            border: config.telegram_chat_id ? '1px solid #22c55e' : 'none'
                                        }}
                                    >
                                        {config.telegram_chat_id ? 'CUENTA VINCULADA ✓' : 'VINCULAR AHORA'}
                                    </button>
                                </div>
                                {config.telegram_chat_id && (
                                    <p className="p-senior-label" style={{ marginTop: '12px', textAlign: 'center', fontStyle: 'italic' }}>
                                        Tu vínculo está consolidado por seguridad. Para reestablecerlo, contacte al SuperAdmin.
                                    </p>
                                )}

                                <div className="glass p-mobile-column" style={{ padding: '24px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <Users className="text-dim" />
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>Link para Choferes</p>
                                            <p className="p-senior-label">Envía este link a tu grupo para que se vinculen al bot.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            const res = await callApi('admin/generate_link_token.php?role=driver');
                                            if(res.success && res.link) {
                                                navigator.clipboard.writeText(res.link);
                                                setStatus({ type: 'success', msg: '¡Link copiado al portapapeles!' });
                                            }
                                        }}
                                        className="btn-secondary p-mobile-full-width" 
                                        style={{ height: '44px', fontSize: '10px' }}
                                    >
                                        COPIAR LINK DE INVITACIÓN
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pagos' && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CreditCard className="text-primary" /> Datos de Recaudación (Pago Móvil)
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.9rem' }}>Estos datos son visibles para todos los choferes al momento de reportar su pago diario.</p>
                            
                            <div className="p-grid p-grid-cols-2 p-config-content" style={{ columnGap: '32px' }}>
                                <div className="p-field-divider">
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>BANCO DESTINO</label>
                                    <input 
                                        type="text"
                                        value={config.banco_nombre}
                                        onChange={(e) => setConfig({...config, banco_nombre: e.target.value})}
                                        placeholder="Ej: Banco Mercantil"
                                        className="glass p-mobile-input-premium"
                                        style={{ width: '100%', padding: '16px 24px' }}
                                    />
                                </div>
                                <div className="p-field-divider">
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>CÉDULA / RIF</label>
                                    <input 
                                        type="text"
                                        value={config.banco_identidad}
                                        onChange={(e) => setConfig({...config, banco_identidad: e.target.value})}
                                        placeholder="V-12345678"
                                        className="glass p-mobile-input-premium"
                                        style={{ width: '100%', padding: '16px 24px' }}
                                    />
                                </div>
                                <div className="p-field-divider">
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>TELÉFONO ASOCIADO</label>
                                    <input 
                                        type="text"
                                        value={config.banco_telefono}
                                        onChange={(e) => setConfig({...config, banco_telefono: e.target.value})}
                                        placeholder="04121234567"
                                        className="glass p-mobile-input-premium"
                                        style={{ width: '100%', padding: '16px 24px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-primary p-mobile-full-width"
                                    style={{ padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: saving ? 0.7 : 1 }}
                                >
                                    {saving ? <div className="animate-spin"><Settings size={18} /></div> : <Save size={18} />}
                                    {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                                </button>
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
