import React from 'react'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import SuperAdminDashboard from './SuperAdminDashboard'
import ChoferesView from './ChoferesView'
import InvitacionesView from './InvitacionesView'
import FinanzasView from './FinanzasView'

const MainLayout = ({ user, activeView, setActiveView, onLogout }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar 
        onLogout={onLogout} 
        userRole={user?.rol || 'owner'} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {user?.rol === 'superadmin' ? (
          <SuperAdminDashboard />
        ) : (
          <>
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'choferes' && <ChoferesView />}
            {activeView === 'invitar' && <InvitacionesView />}
            {activeView === 'config' && <FinanzasView />}
          </>
        )}
      </div>
    </div>
  )
}

export default MainLayout
