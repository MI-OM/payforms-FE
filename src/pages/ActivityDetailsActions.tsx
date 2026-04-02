import { useState } from 'react'
import { 
  Building2, 
  Search, 
  Bell, 
  HelpCircle,
  Upload,
  Shield,
  PenLine,
  X,
  History,
  Undo,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { icon: Building2, label: "Dashboard" },
  { icon: Building2, label: "Forms" },
  { icon: Building2, label: "Contacts" },
  { icon: Building2, label: "Payments" },
  { icon: Building2, label: "Reports" },
  { icon: Building2, label: "Activity Logs", active: true },
  { icon: Building2, label: "Settings" },
]

const logEntries = [
  {
    icon: Upload,
    title: 'Bulk Import',
    id: '9XJ-202',
    description: 'Admin processed architectural payment ledger \'Q4_Invoices_Final.csv\'',
    time: '14:20 PM',
    date: 'Oct 24, 2023',
    active: true
  },
  {
    icon: Shield,
    title: 'Login Success',
    id: '8AA-104',
    description: 'User session established from 192.168.1.45',
    time: '13:45 PM',
    date: 'Oct 24, 2023',
    active: false
  },
  {
    icon: PenLine,
    title: 'Settings Update',
    id: '7FF-091',
    description: 'Changed global VAT rate to 20%',
    time: '11:12 AM',
    date: 'Oct 24, 2023',
    active: false
  }
]

export function ActivityDetailsActions() {
  const [showRollbackModal, setShowRollbackModal] = useState(true)

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-50 dark:bg-slate-900 w-64 flex-shrink-0 text-sm tracking-tight font-medium">
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
          {navItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? 'text-slate-950 dark:text-white font-bold border-r-2 border-slate-950 dark:border-white bg-slate-200/50 dark:bg-slate-800/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="px-4 mt-auto">
          <Button className="w-full">New Payment</Button>
        </div>
      </aside>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-8 w-full ml-64 h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/15 dark:border-slate-800/15 uppercase tracking-widest font-bold">
        <div className="flex items-center flex-1">
          <div className="relative w-96 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-4 w-4" />
            <Input 
              className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm lowercase tracking-normal" 
              placeholder="Search activities..." 
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:text-slate-950 dark:hover:text-white transition-all">
            <Bell className="h-6 w-6" />
          </button>
          <button className="hover:text-slate-950 dark:hover:text-white transition-all">
            <HelpCircle className="h-6 w-6" />
          </button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGn1DQc79_E48pOVL90nU4BrdWF_O9bxKMGmW2VMAcSQ6T7PqI4mtYKcAS84Bkg3MYqVzf74Lu0ZTTzH2zgQ7jAlKd-cfHvqGIIjcOEwYNZJSK89i4X2JooFzEO-j0eVPOIUeON0HGtNV346Jj0cKEqFwK01bW64gD9DvP7rN-RVWY1vblnniiuh1Bg0-nrVQPVnbBfBRsdw4sKQGC7ClC1JQCsUIk9I54CiKwQLBaRFhEgn0-ZZ6NlW_CBA6QuT3VGO5xA91xtNQ" alt="Administrator Profile" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Activity Logs</h1>
              <p className="text-on-surface-variant max-w-lg">Historical audit of all administrative actions performed within the Architectural Ledger.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary">Export CSV</Button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Main Log Table */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-surface-container-lowest rounded-xl p-1 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Recent History</span>
                  <span className="text-xs text-on-surface-variant font-medium">Showing last 24 hours</span>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {logEntries.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-4 flex items-center gap-4 ${entry.active ? 'bg-primary-container/[0.02] border-l-4 border-primary' : 'opacity-60'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${entry.active ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <entry.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">{entry.title}</span>
                          <span className="text-[10px] font-mono text-on-surface-variant uppercase">ID: {entry.id}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">{entry.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">{entry.time}</div>
                        <div className="text-[10px] text-on-surface-variant">{entry.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-24 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-outline-variant/10">
                <div className="p-6 bg-primary-container text-on-primary-container">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Activity Detail</span>
                    <button className="text-on-primary-container/60 hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tighter mb-1">Bulk Import</h2>
                  <p className="text-on-primary-container/70 text-sm">Processed successfully</p>
                </div>
                <div className="p-6 space-y-8">
                  {/* Details Section */}
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Performed By</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[8px]">EJ</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold">Elena J.</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Timestamp</div>
                      <span className="text-sm font-bold">Oct 24, 14:20:44</span>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">File Source</div>
                      <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant/5">
                        <span className="text-lg font-mono">CSV</span>
                        <span className="text-xs font-mono font-medium truncate">Q4_Invoices_Final_v2.csv</span>
                      </div>
                    </div>
                  </div>

                  {/* Result Summary */}
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3">Result Summary</div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant">Records Imported</span>
                        <span className="text-xs font-bold">1,248</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant">Duplicates Skipped</span>
                        <span className="text-xs font-bold text-on-primary-container">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant">System Errors</span>
                        <span className="text-xs font-bold text-error">0</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-outline-variant/10">
                        <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                          <div className="bg-tertiary-fixed-dim h-full w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-outline-variant/10 flex flex-col gap-3">
                    <Button className="w-full flex items-center justify-center gap-2">
                      <History className="h-4 w-4" />
                      Download Full Audit Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => setShowRollbackModal(true)}
                    >
                      <Undo className="h-4 w-4" />
                      Rollback This Activity
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-[0px_40px_40px_rgba(25,28,30,0.04)] overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tighter mb-2">Confirm Rollback</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                You are about to revert the bulk import of <span className="font-bold text-on-surface">1,248 records</span>. This action will permanently remove these entries from the ledger. This cannot be undone.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-error text-on-error hover:opacity-90">
                  Rollback and Delete Data
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setShowRollbackModal(false)}
                >
                  Cancel Action
                </Button>
              </div>
            </div>

            {/* Toast notifications */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg shadow-lg border border-error/20">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-bold tracking-tight">Authorization failed. Action denied.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
