import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { reportService, type ReportSummary, type FormPerformance, type AnalyticsData } from '@/services/reportService'
import { paymentService, type Transaction } from '@/services/paymentService'
import { formService, type Form } from '@/services/formService'
import { toast } from '@/components/ui/use-toast'

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

export function AdminDashboardContent() {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [topForms, setTopForms] = useState<FormPerformance[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [summaryData, analyticsData, txnData, performanceData, formsData] = await Promise.all([
          reportService.getSummary().catch(() => null),
          reportService.getAnalytics().catch(() => null),
          paymentService.getTransactions({ limit: 10 }).catch(() => ({ data: [] })),
          reportService.getFormsPerformance().catch(() => ({ data: [] })),
          formService.getForms({ limit: 100 }).catch(() => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 }))
        ])
        
        setSummary(summaryData)
        setAnalytics(analyticsData)
        setTransactions(txnData.data || [])
        setTopForms(performanceData.data || [])
        setForms(formsData.data || [])
      } catch (err) {
        setError('Failed to load dashboard data')
        toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getFormName = (formId: string) => {
    const form = forms.find(f => f.id === formId)
    return form?.title || 'Unknown Form'
  }

  const hasNoData = !summary && transactions.length === 0 && forms.length === 0

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      )}
      
      {!loading && error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      {!loading && hasNoData ? (
        <EmptyState />
      ) : !loading ? (
        <LiveDashboard 
          summary={summary}
          analytics={analytics}
          transactions={transactions}
          topForms={topForms}
          forms={forms}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getFormName={getFormName}
        />
      ) : null}
    </>
  )
}

function EmptyState() {
  return (
    <div className="max-w-6xl mx-auto p-8 md:p-12">
      {/* Welcome Header */}
      <header className="mb-12">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#188ace]">Overview</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#191c1e]">Welcome to Payforms.</h1>
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

interface LiveDashboardProps {
  summary: ReportSummary | null
  analytics: AnalyticsData | null
  transactions: Transaction[]
  topForms: FormPerformance[]
  forms: Form[]
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  getFormName: (formId: string) => string
}

function LiveDashboard({ summary, analytics, transactions, topForms, forms, formatCurrency, formatDate, getFormName }: LiveDashboardProps) {
  const revenueData = analytics?.revenue_by_day || []
  const maxRevenue = Math.max(...revenueData.map(d => d.amount), 1)
  
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-4">
      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#ffffff] p-6 rounded-xl border-l-4 border-black shadow-sm group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest">Total Revenue</span>
            <span className="text-[#009668] bg-[#4edea3]/20 px-2 py-0.5 rounded text-[10px] font-bold">
              {summary?.payments || 0} txns
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">{formatCurrency(summary?.payment_paid_total || 0)}</p>
          <p className="text-[11px] text-[#45464d] mt-2 font-medium">Total collected</p>
        </div>

        <div className="bg-[#ffffff] p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest">Total Transactions</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">{summary?.payments || 0}</p>
          <p className="text-[11px] text-[#45464d] mt-2 font-medium">Payment attempts</p>
        </div>

        <div className="bg-[#ffffff] p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-[#45464d] uppercase tracking-widest">Active Forms</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">{forms.filter(f => f.is_active).length || summary?.forms || 0}</p>
          <p className="text-[11px] text-[#45464d] mt-2 font-medium">Total forms: {forms.length || summary?.forms || 0}</p>
        </div>

        <div className="bg-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <MaterialIcon name="priority_high" className="text-4xl" filled />
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pending Collections</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter">{formatCurrency(summary?.payment_pending_total || 0)}</p>
          <Link to="/transactions?status=PENDING">
            <button className="mt-4 text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors uppercase tracking-wider">
              Review Pending
            </button>
          </Link>
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
                <span className="text-[10px] font-bold uppercase">Revenue</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative">
            {revenueData.length > 0 ? (
              <svg className="w-full h-full" viewBox={`0 0 ${revenueData.length * 120} 300`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#188ace" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#188ace" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {revenueData.map((_, i) => (
                  <line 
                    key={`grid-${i}`} 
                    stroke="#f2f4f6" 
                    strokeWidth="1" 
                    x1={i * 120 + 60} 
                    x2={i * 120 + 60} 
                    y1="0" 
                    y2="280"
                  />
                ))}
                <path 
                  d={`M${revenueData.map((d, i) => `${i * 120 + 60},${280 - (d.amount / maxRevenue) * 250}`).join(' L')} L${(revenueData.length - 1) * 120 + 60},280 L60,280 Z`}
                  fill="url(#revenueGradient)"
                />
                <path 
                  d={`M${revenueData.map((d, i) => `${i * 120 + 60},${280 - (d.amount / maxRevenue) * 250}`).join(' L')}`}
                  fill="none"
                  stroke="#188ace"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {revenueData.map((d, i) => (
                  <circle 
                    key={`dot-${i}`}
                    cx={i * 120 + 60} 
                    cy={280 - (d.amount / maxRevenue) * 250} 
                    fill="#188ace" 
                    r="5"
                  />
                ))}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-[#45464d]">
                <p className="text-sm">No revenue data available</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] font-bold text-[#45464d] uppercase py-4">
              {revenueData.length > 0 ? (
                revenueData.map((d, i) => (
                  <span key={`label-${i}`}>
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                ))
              ) : (
                <>
                  <span>Day 1</span>
                  <span>Day 2</span>
                  <span>Day 3</span>
                  <span>Day 4</span>
                  <span>Day 5</span>
                  <span>Day 6</span>
                  <span>Day 7</span>
                </>
              )}
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
              <p className="text-[10px] text-[#45464d] uppercase mt-0.5">Admin Cluster • Recent</p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#188ace]/10 flex items-center justify-center z-10 border-4 border-white">
                <MaterialIcon name="publish" className="text-[10px] text-[#188ace]" filled />
              </div>
              <p className="text-xs font-bold">New form created</p>
              <p className="text-[10px] text-[#45464d] uppercase mt-0.5">System • Recent</p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-black flex items-center justify-center z-10 border-4 border-white">
                <MaterialIcon name="verified_user" className="text-[10px] text-white" filled />
              </div>
              <p className="text-xs font-bold">Payment received</p>
              <p className="text-[10px] text-[#45464d] uppercase mt-0.5">System • Recent</p>
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
            <Link to="/transactions" className="text-[10px] font-bold uppercase tracking-widest text-[#188ace] hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f2f4f6] text-[10px] font-bold uppercase tracking-widest text-[#45464d]">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Form Name</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4f6] text-xs">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#45464d]">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, i) => (
                    <tr key={txn.id || i} className="hover:bg-[#f7f9fb] transition-colors">
                      <td className="px-6 py-4 font-medium text-[#191c1e]">{formatDate(txn.created_at)}</td>
                      <td className="px-6 py-4 font-mono text-[#45464d]">
                        {txn.reference?.slice(0, 12) || txn.id?.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-[#45464d]">{getFormName(txn.form_id)}</td>
                      <td className="px-6 py-4 font-bold text-[#191c1e]">{formatCurrency(txn.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-[10px] font-bold',
                          txn.status === 'PAID' ? 'bg-[#4edea3]/20 text-[#009668]' :
                          txn.status === 'PENDING' ? 'bg-[#e6e8ea] text-[#45464d]' :
                          txn.status === 'PARTIAL' ? 'bg-[#188ace]/20 text-[#188ace]' :
                          'bg-red-100 text-red-700'
                        )}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Forms Ranking */}
        <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-xl font-bold tracking-tighter">Top Performing Forms</h2>
            <p className="text-[10px] text-slate-400 uppercase mt-1">Based on Collection Rate</p>
          </div>
          <div className="flex-1">
            <div className="p-8 space-y-8">
              {!topForms || topForms.length === 0 ? (
                <p className="text-slate-400 text-sm text-center">No form performance data</p>
              ) : (
                topForms.slice(0, 5).map((form, i) => (
                  <div key={form.form_id || i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-slate-700 italic">0{i + 1}</span>
                      <div>
                        <p className="text-sm font-bold">{form.title}</p>
                        <div className="w-32 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                          <div className={cn('h-full', i === 0 ? 'bg-[#188ace]' : 'bg-slate-500')} style={{ width: `${form.collection_rate || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold tracking-tighter">{formatCurrency(form.paid_amount_total || 0)}</p>
                      <p className="text-[10px] text-slate-400">{form.submissions} submissions</p>
                    </div>
                  </div>
                ))
              )}
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
