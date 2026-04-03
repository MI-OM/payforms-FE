import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Plus,
  Search,
  HelpCircle,
  MoreVertical,
  Download,
  Shield,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AppLayoutProps {
  children: React.ReactNode
  showNewFormButton?: boolean
}

const navItems = [
  { icon: FileText, label: 'Forms', path: '/forms' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: CreditCard, label: 'Payments', path: '/transactions' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function AppLayout({ children, showNewFormButton = true }: AppLayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-200 flex flex-col z-50">
        {/* Logo */}
        <div className="mb-8 px-4 pt-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Payforms</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  active
                    ? 'bg-white text-slate-900 font-bold shadow-sm border-l-4 border-slate-900'
                    : 'text-slate-500 hover:bg-slate-300 hover:text-slate-900'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-300 space-y-1">
          <Link
            to="/forms/new"
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Create New Form
          </Link>
          <Link
            to="/help"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-300 rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Support</span>
          </Link>
          <Link
            to="/logout"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-300 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Log out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8">
          {/* Search */}
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="w-full bg-slate-100 border-none rounded-md pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-slate-900"
                placeholder="Search transactions..."
              />
            </div>
            <nav className="ml-10 flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className={cn(
                  "text-sm font-bold font-medium pb-1 border-b-2 transition-colors",
                  isActive('/dashboard')
                    ? "text-slate-900 border-slate-900"
                    : "text-slate-500 border-transparent hover:text-slate-900"
                )}
              >
                Dashboard
              </Link>
              <Link 
                to="/reports" 
                className={cn(
                  "text-sm font-medium pb-1 border-b-2 transition-colors",
                  isActive('/reports')
                    ? "text-slate-900 border-slate-900 font-bold"
                    : "text-slate-500 border-transparent hover:text-slate-900"
                )}
              >
                Analytics
              </Link>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="h-8 w-[1px] bg-slate-300" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">Alex Mercer</p>
                <p className="text-[10px] text-slate-500">Admin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="Profile" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export function getPageTitle(pathname: string): { title: string; breadcrumb?: string } {
  if (pathname.startsWith('/forms')) {
    return { title: 'Forms', breadcrumb: 'Forms' }
  }
  if (pathname.startsWith('/contacts')) {
    return { title: 'Contacts', breadcrumb: 'Contacts' }
  }
  if (pathname.startsWith('/activity')) {
    return { title: 'Activities', breadcrumb: 'Activities' }
  }
  if (pathname.startsWith('/reports')) {
    return { title: 'Reports', breadcrumb: 'Reports' }
  }
  if (pathname.startsWith('/settings')) {
    return { title: 'Settings', breadcrumb: 'Settings' }
  }
  if (pathname.startsWith('/transactions')) {
    return { title: 'Transactions', breadcrumb: 'Transactions' }
  }
  if (pathname.startsWith('/groups')) {
    return { title: 'Groups', breadcrumb: 'Groups' }
  }
  if (pathname.startsWith('/import')) {
    return { title: 'Import', breadcrumb: 'Import' }
  }
  if (pathname.startsWith('/team')) {
    return { title: 'Team', breadcrumb: 'Team' }
  }
  if (pathname.startsWith('/profile')) {
    return { title: 'Profile', breadcrumb: 'Profile' }
  }
  return { title: 'Dashboard', breadcrumb: 'Dashboard' }
}
