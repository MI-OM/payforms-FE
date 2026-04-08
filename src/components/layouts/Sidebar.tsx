import { cn } from "@/lib/utils"
import { Logo, LogoIcon } from "@/components/Logo"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

interface SidebarProps {
  className?: string
  organizationName?: string
  organizationLogo?: string | null
  userRole?: 'ADMIN' | 'STAFF'
  onLogout?: () => void
  mobileMenuOpen?: boolean
  onCloseMobileMenu?: () => void
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", iconKey: "dashboard" },
  { label: "Forms", path: "/forms", iconKey: "receipt_long" },
  { label: "Payments", path: "/payments", iconKey: "payments" },
  { label: "Contacts", path: "/contacts", iconKey: "group" },
  { label: "Audit Logs", path: "/activity", iconKey: "history" },
  { label: "Reports", path: "/reports", iconKey: "analytics" },
  { label: "Settings", path: "/settings", iconKey: "settings", adminOnly: true },
]

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  const icons: Record<string, string> = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    payments: "M19 14V3H5v11H2l3.5 4v-3h13l3.5 4v3L19 14zm-8 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM6.5 12H4V7h2.5v5zm4.5 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM18 14h-2V9h-4v5H6v-8h12v8z",
    receipt_long: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    group: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    history: "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z",
    analytics: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
    settings: "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    help: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  }
  
  const d = icons[name]
  if (!d) return null
  
  return (
    <svg viewBox="0 0 24 24" className={cn('material-symbols-outlined', className)} style={{ width: '1.5rem', height: '1.5rem' }}>
      <path d={d} fill="currentColor"/>
    </svg>
  )
}

export function Sidebar({ 
  className, 
  organizationName = 'Payforms',
  organizationLogo = null,
  userRole = 'STAFF',
  onLogout,
  mobileMenuOpen,
  onCloseMobileMenu
}: SidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const isAdmin = userRole === 'ADMIN'
  
  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      await logout()
    }
  }

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col z-50 overflow-hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Close Button for Mobile */}
        <button
          onClick={onCloseMobileMenu}
          className="lg:hidden absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-900 z-10"
        >
          <MaterialIcon name="close" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-6 border-b border-slate-100 shrink-0">
          {organizationLogo ? (
            <Link to="/" className="shrink-0">
              <img 
                src={organizationLogo} 
                alt={organizationName} 
                className="w-8 h-8 rounded object-contain shrink-0 bg-white border border-slate-200"
              />
            </Link>
          ) : (
            <LogoIcon size="md" asLink={false} />
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tighter text-slate-900 leading-tight font-headline truncate">
              {organizationName}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              {isAdmin ? 'Institutional Admin' : 'Staff Portal'}
            </p>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobileMenu}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                  isActive
                    ? "bg-white text-slate-950 font-semibold shadow-sm opacity-90"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                <MaterialIcon name={item.iconKey} className="text-lg" />
                <span className="font-headline text-sm font-medium tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Fixed Bottom Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <Link
            to="/forms/new"
            onClick={onCloseMobileMenu}
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-bold mb-3 hover:opacity-90 transition-all flex items-center justify-center"
          >
            Create Form
          </Link>
          <Link
            to="/support"
            onClick={onCloseMobileMenu}
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <MaterialIcon name="help" className="text-lg" />
            <span className="font-headline text-sm font-medium tracking-tight">Support</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <MaterialIcon name="logout" className="text-lg" />
            <span className="font-headline text-sm font-medium tracking-tight">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
