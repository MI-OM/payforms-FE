import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { organizationService } from '@/services/organizationService'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [orgLogo, setOrgLogo] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrgLogo = async () => {
      try {
        const org = await organizationService.getOrganization()
        if (org.logo_url) {
          setOrgLogo(org.logo_url)
        }
      } catch (err) {
        console.error('Failed to fetch organization logo:', err)
      }
    }
    fetchOrgLogo()
  }, [])

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
        organizationLogo={orgLogo}
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
        <section className="flex-1">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
