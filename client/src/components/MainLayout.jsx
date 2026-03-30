import React, { Suspense, lazy, useState } from 'react'
import Sidebar from './Sidebar'
import LoadingSpinner from './ui/LoadingSpinner'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

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
  const [lastScrollY, setLastScrollY] = useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      if (!isMobile) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) setIsMobileMenuOpen(false) // Safety reset prevents "stuck" overlays
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleNavigate = (view) => {
    setActiveView(view)
    if (isMobile) setIsMobileMenuOpen(false)
  }

  return (
    <div className="app-root-container">
      
      {/* 1. Desktop Sidebar (Managed by CSS Classes) */}
      <aside className="sidebar-desktop-wrapper desktop-only">
        <Sidebar 
          onLogout={onLogout} 
          config={config}
          activeView={activeView} 
          setActiveView={handleNavigate} 
        />
      </aside>

      {/* 2. Content Container (Scrollable Stack) */}
      <div className="content-stack-wrapper">
        
        {/* Scrollable View Area */}
        <main className="main-scroll-area">
          
          {/* Mobile-Only Header - Moves with scroll */}
          <header 
            className={`mobile-top-header mobile-only ${(!showHeader && !isMobileMenuOpen) ? 'header-hidden' : ''}`}
          >
            <h1 
              onClick={() => handleNavigate('dashboard')}
              className="neon-text brand" 
              style={{ fontSize: '1.35rem', fontWeight: 900, cursor: 'pointer' }}
            >
              {config?.nombre_cooperativa || 'TuCooperativa'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {config?.bcv_rate && (
                <div style={{ 
                  padding: '4px 10px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '100px',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                  Bs {config.bcv_rate.toFixed(2)}
                </div>
              )}
              <button 
                onClick={toggleMobileMenu}
                className="mobile-menu-trigger"
              >
                <div className="hamburger-box">
                  <div className={`hamburger-inner ${isMobileMenuOpen ? 'active' : ''}`} />
                </div>
              </button>
            </div>
          </header>

          <div className="view-container">
            <AnimatePresence mode="wait">
              <Motion.div
                key={user?.rol === 'superadmin' ? 'superadmin' : activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  {user?.rol === 'superadmin' ? (
                    <SuperAdminDashboard />
                  ) : (
                    <React.Fragment>
                      {activeView === 'dashboard' && <Dashboard user={user} setActiveView={handleNavigate} />}
                      {activeView === 'choferes' && <ChoferesView />}
                      {activeView === 'ranking' && <DriverRanking />}
                      {activeView === 'config' && <ConfiguracionView config={config} setConfig={setConfig} />}
                      {activeView === 'bi' && <BIView />}
                      {activeView === 'cobranza' && <CobranzaView />}
                      {activeView === 'flota' && <VehiculosView user={user} config={config} setActiveView={handleNavigate} />}
                      {activeView === 'maintenance' && <MaintenanceCenter setActiveView={handleNavigate} />}
                      {activeView === 'forensic' && <ForensicView />}
                    </React.Fragment>
                  )}
                </Suspense>
              </Motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation Overlay & Sidebar */}
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
            />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainLayout
