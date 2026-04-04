import { cn } from "@/lib/utils"
import { Building2 } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

interface SidebarProps {
  className?: string
  organizationName?: string
  userRole?: 'ADMIN' | 'STAFF'
  onLogout?: () => void
  mobileMenuOpen?: boolean
  onCloseMobileMenu?: () => void
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", iconKey: "dashboard" },
  { label: "Transactions", path: "/transactions", iconKey: "payments" },
  { label: "Payforms", path: "/forms", iconKey: "receipt_long" },
  { label: "Customers", path: "/contacts", iconKey: "group" },
  { label: "Settings", path: "/settings", iconKey: "settings", adminOnly: true },
]

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  const icons: Record<string, string> = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    payments: "M19 14V3H5v11H2l3.5 4v-3h13l3.5 4v3L19 14zm-8 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM6.5 12H4V7h2.5v5zm4.5 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM18 14h-2V9h-4v5H6v-8h12v8z",
    receipt_long: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    group: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
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
        "h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-slate-50 flex flex-col p-4 gap-2 z-50",
        // Mobile: hidden by default, shown when open
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always visible
        "lg:translate-x-0"
      )}>
        {/* Close Button for Mobile */}
        <button
          onClick={onCloseMobileMenu}
          className="lg:hidden absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-900"
        >
          <MaterialIcon name="close" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter text-slate-900 leading-tight font-headline truncate max-w-[160px]">
              {organizationName}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              {isAdmin ? 'Institutional Admin' : 'Staff Portal'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path
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

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <Link
            to="/forms/new"
            onClick={onCloseMobileMenu}
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-bold mb-4 hover:opacity-90 transition-all flex items-center justify-center"
          >
            Create Payform
          </Link>
          <Link
            to="/support"
            onClick={onCloseMobileMenu}
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <MaterialIcon name="help" className="text-lg" />
            <span className="font-headline text-sm font-medium tracking-tight">Support</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <MaterialIcon name="logout" className="text-lg" />
            <span className="font-headline text-sm font-medium tracking-tight">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
