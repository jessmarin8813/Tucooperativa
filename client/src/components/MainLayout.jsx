import React, { Suspense, lazy, useState } from 'react'
import Sidebar from './Sidebar'
import LoadingSpinner from './LoadingSpinner'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const Dashboard = lazy(() => import('./Dashboard'))
const SuperAdminDashboard = lazy(() => import('./SuperAdminDashboard'))
const ChoferesView = lazy(() => import('./ChoferesView'))
const InvitacionesView = lazy(() => import('./InvitacionesView'))
const FinanzasView = lazy(() => import('./FinanzasView'))
const DriverRanking = lazy(() => import('./DriverRanking'))
const BIView = lazy(() => import('./BIView'))
const ExpensesView = lazy(() => import('./ExpensesView'))
const CobranzaView = lazy(() => import('./CobranzaView'))
const VehiculosView = lazy(() => import('./VehiculosView'))

const MainLayout = ({ user, activeView, setActiveView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

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
    <div className="p-flex" style={{ height: '100vh', width: '100vw', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <Sidebar 
          onLogout={onLogout} 
          userRole={user?.rol || 'owner'} 
          activeView={activeView} 
          setActiveView={handleNavigate} 
        />
      </div>

      {/* Mobile Top Header */}
      <header className="mobile-header" style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, height: '70px', 
          background: 'rgba(7, 8, 13, 0.9)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--glass-border)', alignItems: 'center', 
          justifyContent: 'space-between', padding: '0 24px', zIndex: 60 
      }}>
          <h1 className="neon-text brand" style={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: '1.2' }}>TuCooperativa</h1>
          <button 
            onClick={toggleMobileMenu}
            style={{ background: 'var(--bg-card)', color: 'white', padding: '10px' }}
          >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
            <>
                <Motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={toggleMobileMenu}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100 }}
                />
                <Motion.div 
                    initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '280px', zIndex: 110 }}
                    className="mobile-sidebar"
                >
                    <Sidebar 
                        onLogout={onLogout} 
                        userRole={user?.rol || 'owner'} 
                        activeView={activeView} 
                        setActiveView={handleNavigate} 
                    />
                </Motion.div>
            </>
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        height: '100vh', 
        overflowY: 'auto',
        position: 'relative'
      }}>
        <div className="view-container animate-fade">
            <Suspense fallback={<LoadingSpinner />}>
            {user?.rol === 'superadmin' ? (
                <SuperAdminDashboard />
            ) : (
                <>
                {activeView === 'dashboard' && <Dashboard />}
                {activeView === 'choferes' && <ChoferesView />}
                {activeView === 'invitar' && <InvitacionesView />}
                {activeView === 'ranking' && <DriverRanking />}
                {activeView === 'config' && <FinanzasView />}
                {activeView === 'bi' && <BIView />}
                {activeView === 'gastos' && <ExpensesView />}
                {activeView === 'cobranza' && <CobranzaView />}
                {activeView === 'flota' && <VehiculosView />}
                </>
            )}
            </Suspense>
        </div>
      </main>
    </div>
  )
}

export default MainLayout
