import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Sidebar */}
      <Sidebar 
        organizationName={user?.organization_name || 'Payforms'}
        userRole={user?.role as 'ADMIN' | 'STAFF' | undefined}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={closeMobileMenu}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen bg-[#f7f9fb] flex flex-col">
        {/* Top Navigation */}
        <TopNav 
          user={user ?? undefined}
          onLogout={handleLogout}
          onToggleMobileMenu={toggleMobileMenu}
        />

        {/* Page Content */}
        <section className="flex-1 px-4 lg:px-8 py-8">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
