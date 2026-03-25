import React, { Suspense, lazy, useState } from 'react'
import Sidebar from './Sidebar'
import LoadingSpinner from './LoadingSpinner'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const Dashboard = lazy(() => import('./Dashboard'))
const SuperAdminDashboard = lazy(() => import('./SuperAdminDashboard'))
const ChoferesView = lazy(() => import('./ChoferesView'))
const ConfiguracionView = lazy(() => import('./ConfiguracionView'))
const DriverRanking = lazy(() => import('./DriverRanking'))
const BIView = lazy(() => import('./BIView'))
const ExpensesView = lazy(() => import('./ExpensesView'))
const CobranzaView = lazy(() => import('./CobranzaView'))
const VehiculosView = lazy(() => import('./VehiculosView'))
const MaintenanceCenter = lazy(() => import('./MaintenanceCenter'))
const ForensicView = lazy(() => import('./ForensicView'))

const MainLayout = ({ user, activeView, setActiveView, onLogout }) => {
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
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
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
            className={`mobile-top-header mobile-only ${(!showHeader || isMobileMenuOpen) ? 'header-hidden' : ''}`}
          >
            <h1 className="neon-text brand" style={{ fontSize: '1.35rem', fontWeight: 900 }}>TuCooperativa</h1>
            <button 
              onClick={toggleMobileMenu}
              className="mobile-menu-trigger"
            >
              <div className="hamburger-box">
                <div className={`hamburger-inner ${isMobileMenuOpen ? 'active' : ''}`} />
              </div>
            </button>
          </header>

          <div className="view-container animate-fade">
            <Suspense fallback={<LoadingSpinner />}>
              {user?.rol === 'superadmin' ? (
                <SuperAdminDashboard />
              ) : (
                <React.Fragment>
                  {activeView === 'dashboard' && <Dashboard />}
                  {activeView === 'choferes' && <ChoferesView />}
                  {activeView === 'ranking' && <DriverRanking />}
                  {activeView === 'config' && <ConfiguracionView />}
                  {activeView === 'bi' && <BIView />}
                  {activeView === 'gastos' && <ExpensesView />}
                  {activeView === 'cobranza' && <CobranzaView />}
                  {activeView === 'flota' && <VehiculosView />}
                  {activeView === 'mantenimiento' && <MaintenanceCenter />}
                  {activeView === 'forensic' && <ForensicView />}
                </React.Fragment>
              )}
            </Suspense>
          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation Overlay & Sidebar */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <React.Fragment>
            <Motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="mobile-overlay"
            />
            <Motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="mobile-drawer-container"
            >
              <Sidebar 
                onLogout={onLogout} 
                activeView={activeView} 
                setActiveView={handleNavigate} 
                isMobile={true}
              />
            </Motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainLayout
