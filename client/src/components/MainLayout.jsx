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
    <div className="p-flex" style={{ 
      height: '100vh', 
      width: '100vw', 
      background: 'var(--bg-dark)', 
      position: 'relative', 
      overflow: 'hidden',
      flexDirection: 'row'
    }}>
      
      {/* Desktop Sidebar */}
      <div className="desktop-only" style={{ width: 'var(--sidebar-width)', flexShrink: 0 }}>
        <Sidebar 
          onLogout={onLogout} 
          userRole={user?.rol || 'owner'} 
          activeView={activeView} 
          setActiveView={handleNavigate} 
        />
      </div>

      {/* Content Vertical Stack */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0 }}>
        
        {/* Mobile Top Header */}
        <header className="mobile-header" style={{ 
            height: '70px', width: '100%',
            background: 'rgba(7, 8, 13, 0.95)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--glass-border)',
            alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 60,
            flexShrink: 0
        }}>
            <h1 className="neon-text brand" style={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: '1.2' }}>TuCooperativa</h1>
            <button 
              onClick={toggleMobileMenu}
              style={{ background: 'var(--bg-card)', color: 'white', padding: '10px' }}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </header>

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
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
    </div>
  )
}

export default MainLayout
