import React, { Suspense, lazy } from 'react'
import Sidebar from './Sidebar'
import LoadingSpinner from './LoadingSpinner'

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
  const isMobile = window.innerWidth < 1024

  return (
    <div className="p-flex" style={{ height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-dark)' }}>
      {!isMobile && (
        <Sidebar 
          onLogout={onLogout} 
          userRole={user?.rol || 'owner'} 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />
      )}

      {isMobile && (
        <Sidebar 
            onLogout={onLogout} 
            userRole={user?.rol || 'owner'} 
            activeView={activeView} 
            setActiveView={setActiveView} 
        />
      )}
      
      <main className="p-flex p-flex-col" style={{ 
        flex: 1, 
        height: '100%', 
        overflowY: 'auto'
      }}>
        <div className="view-container">
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
