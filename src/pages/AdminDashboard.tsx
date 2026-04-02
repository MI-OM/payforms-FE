import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

function MaterialIcon({ name, className = '', filled = false }: { name: string; className?: string; filled?: boolean }) {
  const iconStyle = filled ? { fontVariationSettings: "'FILL' 1" } : undefined
  const baseClass = cn('material-symbols-outlined', className)
  
  const icons: Record<string, string> = {
    add_circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
    group_add: "M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    arrow_forward: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z",
    priority_high: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    person_add: "M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    publish: "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z",
    verified_user: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  }
  
  const d = icons[name]
  if (!d) return null
  
  return (
    <svg viewBox="0 0 24 24" className={baseClass} style={{ ...iconStyle, width: '1.125rem', height: '1.125rem' }}>
      <path d={d} fill="currentColor"/>
    </svg>
  )
}

const transactions = [
  { date: 'Oct 24, 2023', name: 'Julian Vance', form: 'Tuition 2026', amount: '$12,450.00', status: 'Success' },
  { date: 'Oct 24, 2023', name: 'Elena Rodriguez', form: 'Annual Gala', amount: '$1,500.00', status: 'Pending' },
  { date: 'Oct 23, 2023', name: 'Marcus Thorne', form: 'Alumni Fund', amount: '$5,000.00', status: 'Partial' },
  { date: 'Oct 23, 2023', name: 'Sarah Jenkins', form: 'Tuition 2026', amount: '$12,450.00', status: 'Success' },
]

const topForms = [
  { name: 'Tuition 2026', amount: '$84.2k', percent: 85 },
  { name: 'Annual Gala', amount: '$31.5k', percent: 60 },
  { name: 'Sports Equipment', amount: '$8.8k', percent: 35 },
]

export function AdminDashboardContent() {
  const [isEmpty, setIsEmpty] = useState(false)

  return (
    <>
      {isEmpty ? (
        <EmptyState onShowLive={() => setIsEmpty(false)} />
      ) : (
        <LiveDashboard onShowEmpty={() => setIsEmpty(true)} />
      )}
    </>
  )
}

function EmptyState({ onShowLive }: { onShowLive: () => void }) {
  return (
    <div className="max-w-6xl mx-auto p-8 md:p-12">
      {/* Welcome Header */}
      <header className="mb-12">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#188ace]">Overview</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#191c1e]">Welcome, Architect.</h1>
          <p className="text-lg text-[#45464d] max-w-2xl leading-relaxed">Your architectural ledger is ready to capture transactions. Start by deploying your first precision-engineered payment form.</p>
        </div>
      </header>

      {/* Empty State Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Primary Action Module */}
        <div className="md:col-span-8 bg-[#e0e3e5] rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img 
              className="w-full h-full object-cover" 
              alt="abstract architectural blueprint" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDety6UPYbi3xJpYH8ID-vuV2w04yzE-vIR5JEXkt_nZi9h1hcqKjrwVQ9id8rSgSS4ZCM2_qd9tBRdWUWS8MpTcXXYWMdTQkMPfj3ZrZbP2K42h7g-TPMtsZlxcbj6CqNfGDoK4_9k1LFZnmvz10JQ6n-fP-YxPDD_pgkvamGrO937A8scQJy1dSEsy62QPTS0Gz5Nb2o9fLuGTj6qyZXDy1I4-7wBwB9YJdztXAVtwTOo6GT7sDKdTrG9avYTOdF4di9bdRuSrI4" 
            />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-[#ffffff] rounded-full flex items-center justify-center mb-8 shadow-sm">
              <MaterialIcon name="add_circle" className="text-5xl text-[#188ace]" filled />
            </div>
            <h2 className="text-3xl font-bold text-[#191c1e] mb-4">Zero Forms Active</h2>
            <p className="text-[#45464d] mb-10 max-w-md">The foundation is laid. It is time to build your first high-conversion payment experience and start tracking your ledger.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/forms/new">
                <button className="px-8 py-4 bg-[#000000] text-white rounded-md font-bold text-sm tracking-tight shadow-lg active:scale-95 transition-all">
                  Create Your First Form
                </button>
              </Link>
              <Link to="/forms/templates">
                <button className="px-8 py-4 bg-[#ffffff] text-[#45464d] rounded-md font-bold text-sm tracking-tight border border-[#c6c6cd]/20 hover:bg-[#f7f9fb] transition-all">
                  View Templates
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Actions / Guides */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Import Card */}
          <div className="bg-[#ffffff] p-8 rounded-xl flex flex-col gap-4 shadow-sm border border-[#c6c6cd]/10">
            <div className="w-12 h-12 bg-[#dae2fd] rounded-lg flex items-center justify-center">
              <MaterialIcon name="group_add" className="text-[#5c647a]" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#191c1e]">Import Contacts</h3>
            <p className="text-sm text-[#45464d] leading-relaxed">Migrate your existing client ledger from CSV or external providers in seconds.</p>
            <Link to="/contacts/import" className="text-sm font-bold text-[#188ace] inline-flex items-center gap-2 hover:underline">
              Start Migration
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>

          {/* Trust/Support Module */}
          <div className="bg-[#002113]/5 p-8 rounded-xl flex flex-col gap-4 border border-[#009668]/10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#002113] text-[#6ffbbe] text-[10px] font-black uppercase tracking-widest rounded-full">Secure</span>
              <span className="text-xs font-semibold text-[#45464d]">Verified Connection</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#191c1e]">Enterprise Infrastructure</h3>
            <p className="text-sm text-[#45464d] leading-relaxed">Every form you create is backed by Tier-4 security protocols and real-time encryption.</p>
          </div>

          {/* Quick Tip */}
          <div className="p-6 border-l-4 border-[#188ace] bg-[#e6e8ea]/50 rounded-r-xl">
            <p className="text-sm italic text-[#45464d]">"The most successful ledgers start with a single, clear purpose. Try the 'Subscription' template for recurring revenue."</p>
          </div>
        </div>
      </div>

      {/* Bottom Quick Links */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#c6c6cd]/15 pt-12">
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#45464d]">Documentation</h4>
          <p className="text-sm text-[#45464d]">Learn how to customize styling with precision.</p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#45464d]">API Access</h4>
          <p className="text-sm text-[#45464d]">Integrate Payforms directly into your existing stack.</p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#45464d]">Ledger Policy</h4>
          <p className="text-sm text-[#45464d]">Understand how we manage architectural compliance.</p>
        </div>
      </section>
    </div>
  )
}

function LiveDashboard({ onShowEmpty }: { onShowEmpty: () => void }) {
  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-6 p-4 bg-[#4edea3]/20 rounded-lg flex items-center justify-between">
        <p className="text-sm text-[#005236]">Demo Mode: Showing live dashboard</p>
        <button onClick={onShowEmpty} className="px-4 py-2 border border-[#005236] text-[#005236] rounded text-sm font-bold hover:bg-[#4edea3]/20">
          Show Empty State
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#ffffff] p-6 rounded-xl border-l-4 border-black shadow-sm group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest">Total Revenue</span>
            <span className="text-[#009668] bg-[#4edea3]/20 px-2 py-0.5 rounded text-[10px] font-bold">+12%</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">$124,500.00</p>
          <p className="text-[11px] text-[#45464d] mt-2 font-medium">vs. $111,160.00 last month</p>
        </div>

        <div className="bg-[#ffffff] p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest">Submissions</span>
            <span className="text-[#009668] bg-[#4edea3]/20 px-2 py-0.5 rounded text-[10px] font-bold">+5%</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">4,820</p>
          <p className="text-[11px] text-[#45464d] mt-2 font-medium">Daily avg: 161 completions</p>
        </div>

        <div className="bg-[#ffffff] p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest">Active Forms</span>
            <span className="text-[#45464d] bg-[#e6e8ea] px-2 py-0.5 rounded text-[10px] font-bold">Stable</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">24</p>
          <p className="text-[11px] text-[#45464d] mt-2 font-medium">3 Scheduled to expire</p>
        </div>

        <div className="bg-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <MaterialIcon name="priority_high" className="text-4xl" filled />
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pending Collections</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter">$14,250.00</p>
          <button className="mt-4 text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors uppercase tracking-wider">
            Review High Priority
          </button>
        </div>
      </div>

      {/* Middle Section: Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Trends Chart */}
        <div className="lg:col-span-2 bg-[#ffffff] rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tighter">Revenue Performance</h2>
              <p className="text-xs text-[#45464d]">Real-time metrics for the trailing 7 days</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-black"></span>
                <span className="text-[10px] font-bold uppercase">Gross Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#188ace]"></span>
                <span className="text-[10px] font-bold uppercase">Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative">
            <svg className="w-full h-full preserve-3d" viewBox="0 0 1000 300">
              <line stroke="#f2f4f6" strokeWidth="1" x1="0" x2="1000" y1="50" y2="50"></line>
              <line stroke="#f2f4f6" strokeWidth="1" x1="0" x2="1000" y1="150" y2="150"></line>
              <line stroke="#f2f4f6" strokeWidth="1" x1="0" x2="1000" y1="250" y2="250"></line>
              <path d="M0,280 Q100,240 200,260 T400,180 T600,220 T800,120 T1000,140" fill="none" stroke="#188ace" strokeWidth="3"></path>
              <path d="M0,260 Q100,200 200,230 T400,140 T600,180 T800,80 T1000,100" fill="none" stroke="#000000" strokeWidth="4"></path>
              <circle cx="800" cy="80" fill="#000000" r="5"></circle>
              <circle cx="1000" cy="100" fill="#000000" r="5"></circle>
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] font-bold text-[#45464d] uppercase py-4">
              <span>Oct 18</span>
              <span>Oct 19</span>
              <span>Oct 20</span>
              <span>Oct 21</span>
              <span>Oct 22</span>
              <span>Oct 23</span>
              <span>Oct 24</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-[#ffffff] rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold tracking-tighter mb-6">Recent Activity</h2>
          <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#e0e3e5]">
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#002113] flex items-center justify-center z-10 border-4 border-white">
                <MaterialIcon name="person_add" className="text-[10px] text-[#4edea3]" filled />
              </div>
              <p className="text-xs font-bold">New staff member invited</p>
              <p className="text-[10px] text-[#45464d] uppercase mt-0.5">Admin Cluster • 2m ago</p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#188ace]/10 flex items-center justify-center z-10 border-4 border-white">
                <MaterialIcon name="publish" className="text-[10px] text-[#188ace]" filled />
              </div>
              <p className="text-xs font-bold">Form published: Gala 2024</p>
              <p className="text-[10px] text-[#45464d] uppercase mt-0.5">Marketing • 45m ago</p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-black flex items-center justify-center z-10 border-4 border-white">
                <MaterialIcon name="verified_user" className="text-[10px] text-white" filled />
              </div>
              <p className="text-xs font-bold">Security Audit completed</p>
              <p className="text-[10px] text-[#45464d] uppercase mt-0.5">System • 3h ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Transactions & Rankings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Transactions Ledger */}
        <div className="xl:col-span-2 bg-[#ffffff] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#f2f4f6] flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tighter">Recent Transactions</h2>
            <button className="text-[10px] font-bold uppercase tracking-widest text-[#188ace] hover:underline">Export Ledger</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f2f4f6] text-[10px] font-bold uppercase tracking-widest text-[#45464d]">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Contact Name</th>
                  <th className="px-6 py-4">Form Name</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4f6] text-xs">
                {transactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#191c1e]">{txn.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                        {txn.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#45464d]">{txn.form}</td>
                    <td className="px-6 py-4 font-bold text-[#191c1e]">{txn.amount}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-[10px] font-bold',
                        txn.status === 'Success' ? 'bg-[#4edea3]/20 text-[#009668]' :
                        txn.status === 'Pending' ? 'bg-[#e6e8ea] text-[#45464d]' :
                        'bg-black text-white'
                      )}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Forms Ranking */}
        <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-xl font-bold tracking-tighter">Top Performing Forms</h2>
            <p className="text-[10px] text-slate-400 uppercase mt-1">Based on Monthly Volume</p>
          </div>
          <div className="flex-1">
            <div className="p-8 space-y-8">
              {topForms.map((form, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-slate-700 italic">0{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold">{form.name}</p>
                      <div className="w-32 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className={cn('h-full', i === 0 ? 'bg-[#188ace]' : 'bg-slate-500')} style={{ width: `${form.percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-extrabold tracking-tighter">{form.amount}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 p-6 mt-auto">
            <Link to="/forms">
              <button className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">View All Payforms</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
