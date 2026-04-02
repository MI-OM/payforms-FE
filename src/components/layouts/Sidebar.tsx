import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  History, 
  Settings,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  className?: string
  activeItem?: string
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FileText, label: "Forms" },
  { icon: Users, label: "Contacts" },
  { icon: CreditCard, label: "Payments" },
  { icon: BarChart3, label: "Reports" },
  { icon: History, label: "Activity Logs" },
  { icon: Settings, label: "Settings" },
]

export function Sidebar({ className, activeItem = "Dashboard" }: SidebarProps) {
  return (
    <aside className={cn("fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-50 dark:bg-slate-900 w-64 flex-shrink-0 font-['Manrope'] text-sm tracking-tight font-medium", className)}>
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tighter text-slate-950 dark:text-white">Payforms Admin</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">The Architectural Ledger</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.label === activeItem
          return (
            <a
              key={item.label}
              href="#"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                isActive
                  ? "text-slate-950 dark:text-white font-bold border-r-2 border-slate-950 dark:border-white bg-slate-200/50 dark:bg-slate-800/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </a>
          )
        })}
      </nav>
      <div className="px-4 mt-auto">
        <Button className="w-full">New Payment</Button>
      </div>
    </aside>
  )
}
