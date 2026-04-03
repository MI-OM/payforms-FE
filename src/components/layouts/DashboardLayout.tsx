import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

function MaterialIcon({ name, className = '', filled = false }: { name: string; className?: string; filled?: boolean }) {
  const iconStyle = filled ? { fontVariationSettings: "'FILL' 1" } : undefined
  const baseClass = cn('material-symbols-outlined', className)
  
  const icons: Record<string, { d: string; filled?: boolean }> = {
    account_balance: { d: "M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z" },
    dashboard: { d: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    payments: { d: "M19 14V3H5v11H2l3.5 4v-3h13l3.5 4v3L19 14zm-8 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM6.5 12H4V7h2.5v5zm4.5 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM18 14h-2V9h-4v5H6v-8h12v8z" },
    receipt_long: { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" },
    group: { d: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
    settings: { d: "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" },
    help: { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" },
    logout: { d: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" },
    search: { d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" },
    notifications: { d: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" },
    help_outline: { d: "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" },
  }
  
  const icon = icons[name]
  if (!icon) return null
  
  return (
    <svg viewBox="0 0 24 24" className={baseClass} style={{ ...iconStyle, width: '1.125rem', height: '1.125rem' }}>
      <path d={icon.d} fill="currentColor"/>
    </svg>
  )
}

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', adminOnly: false },
    { icon: 'payments', label: 'Transactions', path: '/transactions', adminOnly: false },
    { icon: 'receipt_long', label: 'Payforms', path: '/forms', adminOnly: false },
    { icon: 'group', label: 'Customers', path: '/contacts', adminOnly: false },
    { icon: 'settings', label: 'Settings', path: '/settings', adminOnly: true },
  ]

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-slate-50 flex flex-col p-4 gap-2 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center">
            <MaterialIcon name="account_balance" className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter text-slate-900 leading-tight font-headline">The Ledger</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              {isAdmin ? 'Institutional Admin' : 'Staff Portal'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {visibleNavItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-headline',
                  active
                    ? 'bg-white text-slate-950 font-semibold shadow-sm opacity-90'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                <MaterialIcon name={item.icon} className="text-lg" />
                <span className="text-sm font-medium tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <Link
            to="/forms/new"
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-bold mb-4 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            Create Payform
          </Link>
          <Link
            to="/support"
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <MaterialIcon name="help" className="text-lg" />
            <span className="text-sm font-medium tracking-tight font-headline">Support</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <MaterialIcon name="logout" className="text-lg" />
            <span className="text-sm font-medium tracking-tight font-headline">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen bg-[#f7f9fb]">
        {/* Top Navigation */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8">
          {/* Search */}
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                className="w-full bg-slate-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-slate-200 transition-all font-headline"
                placeholder="Search transactions, forms, or users..."
                type="text"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-500">
              <button className="hover:text-slate-900 transition-opacity flex items-center">
                <MaterialIcon name="notifications" className="text-lg" />
              </button>
              <button className="hover:text-slate-900 transition-opacity flex items-center">
                <MaterialIcon name="help_outline" className="text-lg" />
              </button>
            </div>
            <div className="h-8 w-[1px] bg-slate-100" />
            <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-black transition-all">
              New Transaction
            </button>
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-bold text-slate-900">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  {user?.role === 'ADMIN' ? 'Admin' : 'Staff'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-600">
                  {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="pt-24 px-8 pb-12">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
