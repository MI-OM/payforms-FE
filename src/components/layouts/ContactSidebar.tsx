import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { getStoredOrgLogo, getStoredOrgName } from '@/services/contactAuthService'

interface ContactSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onLogout?: () => void
}

const navItems = [
  { label: "Dashboard", path: "/contact/dashboard", iconKey: "dashboard" },
  { label: "My Forms", path: "/contact/forms", iconKey: "receipt_long" },
  { label: "Transactions", path: "/contact/transactions", iconKey: "payments" },
  { label: "Profile", path: "/contact/profile", iconKey: "person" },
]

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  const icons: Record<string, string> = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    payments: "M19 14V3H5v11H2l3.5 4v-3h13l3.5 4v3L19 14zm-8 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5-.67 1.5-1.5zM6.5 12H4V7h2.5v5zm4.5 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5-.67 1.5-1.5zM18 14h-2V9h-4v5H6v-8h12v8z",
    receipt_long: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    chevron_left: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z",
  }
  
  const d = icons[name]
  if (!d) return null
  
  return (
    <svg viewBox="0 0 24 24" className={cn('material-symbols-outlined', className)} style={{ width: '1.5rem', height: '1.5rem' }}>
      <path d={d} fill="currentColor"/>
    </svg>
  )
}

export function ContactSidebar({ collapsed: externalCollapsed, onToggleCollapse, onLogout }: ContactSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [orgLogo, setOrgLogo] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string | null>(null)
  
  const collapsed = externalCollapsed ?? internalCollapsed
  const handleToggle = externalCollapsed !== undefined ? onToggleCollapse : () => setInternalCollapsed(!internalCollapsed)
  
  useEffect(() => {
    setOrgLogo(getStoredOrgLogo())
    setOrgName(getStoredOrgName())
  }, [])
  
  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      navigate('/contact/login')
    }
  }

  return (
    <>
      {/* Sidebar */}
      <aside className={cn(
        "h-screen fixed left-0 top-0 bg-slate-50 flex flex-col z-50 overflow-hidden transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="absolute top-4 -right-3 z-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-sm transition-all"
        >
          <MaterialIcon name={collapsed ? "menu" : "chevron_left"} className="text-sm" />
        </button>

        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 pt-6 pb-4 border-b border-slate-100 shrink-0",
          collapsed && "justify-center px-2"
        )}>
          {orgLogo ? (
            <img src={orgLogo} alt="Organization" className="w-8 h-8 rounded-lg object-contain bg-white shrink-0" />
          ) : (
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex flex-col">
              {orgName ? (
                <>
                  <h1 className="text-lg font-bold tracking-tighter text-slate-900 leading-tight font-headline truncate">
                    {orgName}
                  </h1>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                    Contact Portal
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-lg font-bold tracking-tighter text-slate-900 leading-tight font-headline truncate">
                    Payforms
                  </h1>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                    Contact Portal
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-white text-slate-950 font-semibold shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <MaterialIcon name={item.iconKey} className="text-lg shrink-0" />
                {!collapsed && (
                  <span className="font-headline text-sm font-medium tracking-tight">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Fixed Bottom Actions */}
        <div className={cn(
          "p-3 border-t border-slate-100 bg-slate-50 shrink-0",
          collapsed && "flex flex-col items-center"
        )}>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors",
              collapsed && "justify-center px-2 w-full"
            )}
            title={collapsed ? "Sign Out" : undefined}
          >
            <MaterialIcon name="logout" className="text-lg shrink-0" />
            {!collapsed && (
              <span className="font-headline text-sm font-medium tracking-tight">Sign Out</span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}