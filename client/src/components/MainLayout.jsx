import React, { Suspense, lazy, useState, useCallback } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './ui/BottomNav'
import LoadingSpinner from './ui/LoadingSpinner'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'

const Dashboard = lazy(() => import('../views/Dashboard'))
const SuperAdminDashboard = lazy(() => import('../views/SuperAdminDashboard'))
const ChoferesView = lazy(() => import('../views/ChoferesView'))
const ConfiguracionView = lazy(() => import('../views/ConfiguracionView'))
const DriverRanking = lazy(() => import('../views/DriverRanking'))
const BIView = lazy(() => import('../views/BIView'))
const CobranzaView = lazy(() => import('../views/CobranzaView'))
const VehiculosView = lazy(() => import('../views/VehiculosView'))
const MaintenanceCenter = lazy(() => import('../views/MaintenanceCenter'))
const ForensicView = lazy(() => import('../views/ForensicView'))

const MainLayout = ({ user, config, setConfig, activeView, setActiveView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [showHeader, setShowHeader] = useState(true)
  const { callApi } = useApi()
  const [stats, setStats] = useState({ alertas_criticas: 0 })

  const fetchStats = useCallback(async () => {
    try {
      const res = await callApi('dashboard.php')
      if (res?.stats) setStats(res.stats)
    } catch { /* Fail silent */ }
  }, [callApi])

  React.useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) setIsMobileMenuOpen(false) 
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleNavigate = (view) => {
    if (view === 'logout') {
      if (window.confirm("¿Deseas cerrar sesión?")) {
        onLogout()
      }
      return
    }
    setActiveView(view)
    if (isMobile) setIsMobileMenuOpen(false)
  }

  return (
    <div className="app-root-container">
      
      {/* 1. Desktop Sidebar */}
      <aside className="sidebar-desktop-wrapper desktop-only">
        <Sidebar 
          onLogout={onLogout} 
          config={config}
          activeView={activeView} 
          setActiveView={handleNavigate} 
        />
      </aside>

      {/* 2. Content Container */}
      <div className="content-stack-wrapper">
        
        <main className="main-scroll-area">
          
          {/* Mobile-Only Header - Slimmer for Senior UX */}
          <header 
            className={`mobile-top-header mobile-only ${isMobileMenuOpen ? 'header-hidden' : ''}`}
            style={{ height: '70px', padding: '0 24px', background: 'var(--bg-dark)' }}
          >
            <h1 
              onClick={() => handleNavigate('dashboard')}
              className="neon-text brand" 
              style={{ fontSize: '1.4rem', fontWeight: 1000, cursor: 'pointer' }}
            >
              {config?.nombre_cooperativa || 'TuCooperativa'}
            </h1>
            
            <button 
                onClick={toggleMobileMenu}
                className="mobile-menu-trigger"
                style={{ width: '48px', height: '48px' }}
              >
                <div className="hamburger-box">
                  <div className={`hamburger-inner ${isMobileMenuOpen ? 'active' : ''}`} />
                </div>
            </button>
          </header>

          <div className="view-container" style={{ paddingBottom: isMobile ? '120px' : '32px' }}>
            <AnimatePresence mode="wait">
              <Motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  {activeView === 'dashboard' && <Dashboard user={user} setActiveView={handleNavigate} />}
                  {activeView === 'choferes' && <ChoferesView />}
                  {activeView === 'ranking' && <DriverRanking />}
                  {activeView === 'config' && <ConfiguracionView config={config} setConfig={setConfig} />}
                  {activeView === 'bi' && <BIView />}
                  {activeView === 'cobranza' && <CobranzaView />}
                  {activeView === 'flota' && <VehiculosView user={user} config={config} setActiveView={handleNavigate} />}
                  {activeView === 'maintenance' && <MaintenanceCenter setActiveView={handleNavigate} />}
                  {activeView === 'forensic' && <ForensicView />}
                </Suspense>
              </Motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation Bottom Bar */}
      {isMobile && (
        <BottomNav 
            activeView={activeView} 
            setActiveView={handleNavigate} 
            stats={stats}
        />
      )}

      {/* 4. Mobile Menu Overlay (SECONDARY OPTIONS) */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <Motion.div 
            key="mobile-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
            className="mobile-overlay"
          />
        )}
        {isMobile && isMobileMenuOpen && (
          <Motion.div 
            key="mobile-drawer"
            initial={{ x: '-100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="mobile-drawer-container"
          >
            <Sidebar 
              onLogout={onLogout} 
              config={config}
              activeView={activeView} 
              setActiveView={handleNavigate} 
              isMobile={true}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainLayout
