import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Download, MoreVertical, CheckCircle, Clock, XCircle, Loader2, TrendingUp, TrendingDown, Filter, Calendar, Eye, RefreshCw, Edit2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paymentService } from '@/services/paymentService'
import { reportService } from '@/services/reportService'
import { contactService, type Contact } from '@/services/contactService'
import { formService, type Form } from '@/services/formService'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface EditStatusButtonProps {
  transactionId: string
  currentStatus: string
  onStatusUpdate: (transactionId: string, newStatus: string) => Promise<void>
}

function EditStatusButton({ transactionId, currentStatus, onStatusUpdate }: EditStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const statuses = ['PENDING', 'PAID', 'PARTIAL', 'FAILED']

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false)
      return
    }
    
    setIsUpdating(true)
    try {
      await onStatusUpdate(transactionId, newStatus)
      setSelectedStatus(newStatus)
      setIsOpen(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (showSuccess) {
    return (
      <span className="inline-flex items-center gap-1 text-[#009668] text-sm font-medium">
        <CheckCircle className="h-4 w-4" />
        Updated
      </span>
    )
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-[#006398] hover:text-[#004a73] transition-colors text-sm font-medium disabled:opacity-50"
        disabled={isUpdating}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Edit2 className="h-4 w-4" />
            Edit
          </>
        )}
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-[#e0e3e5] z-20 overflow-hidden">
            <div className="p-2 border-b border-[#e0e3e5] bg-[#f2f4f6]">
              <p className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Change Status</p>
            </div>
            <div className="py-1">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#f2f4f6] transition-colors flex items-center justify-between ${
                    status === selectedStatus ? 'bg-[#f2f4f6] font-semibold' : ''
                  }`}
                >
                  <span className={status === currentStatus ? 'text-[#76777d]' : 'text-[#191c1e]'}>{status}</span>
                  {status === currentStatus && <span className="text-[10px] text-[#76777d]">Current</span>}
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-[#e0e3e5]">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-[#45464d] hover:bg-[#f2f4f6] rounded transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface Submission {
  id: string
  form_id: string
  contact_id?: string
  organization_id: string
}

interface TransactionData {
  id: string
  submission_id: string
  organization_id: string
  reference: string
  amount: string
  total_amount: string
  amount_paid: string
  balance_due: string
  status: string
  paid_at: string | null
  created_at: string
  submission: Submission
}

interface SummaryStats {
  total_volume: number
  outstanding_balance: number
  success_rate: number
  today_collections: number
  today_count: number
  volume_change: number
  balance_change: number
}

export function AllTransactionsLedger() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState<SummaryStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loadingLookupData, setLoadingLookupData] = useState(true)

  const fetchContacts = useCallback(async () => {
    try {
      const response = await contactService.getContacts({ limit: 1000 })
      setContacts(response.data || [])
    } catch (err) {
      console.error('Failed to load contacts:', err)
      setContacts([])
    }
  }, [])

  const fetchForms = useCallback(async () => {
    try {
      const response = await formService.getForms({ limit: 1000 })
      setForms(response.data || [])
    } catch (err) {
      console.error('Failed to load forms:', err)
      setForms([])
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 20 }
      if (searchQuery) params.reference = searchQuery
      if (statusFilter) params.status = statusFilter
      if (dateRange.from) params.start_date = dateRange.from
      if (dateRange.to) params.end_date = dateRange.to
      const response = await paymentService.getTransactions(params)
      setTransactions(response.data as unknown as TransactionData[])
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (err) {
      setError('Failed to load transactions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, statusFilter, dateRange])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const [summary, analytics] = await Promise.all([
        reportService.getSummary(),
        reportService.getAnalytics().catch(() => null)
      ])
      
      const getStatusCount = (status: string) => {
        return analytics?.payment_status_breakdown?.find(s => s.status === status)?.count || 0
      }
      const getStatusAmount = (status: string) => {
        return analytics?.payment_status_breakdown?.find(s => s.status === status)?.total_amount || 0
      }

      const paidCount = getStatusCount('PAID')
      const pendingCount = getStatusCount('PENDING')
      const failedCount = getStatusCount('FAILED')
      const partialCount = getStatusCount('PARTIAL')
      const totalTransactions = paidCount + pendingCount + failedCount + partialCount
      const successRate = totalTransactions > 0 ? Math.round((paidCount / totalTransactions) * 100 * 10) / 10 : 0

      setStats({
        total_volume: getStatusAmount('PAID'),
        outstanding_balance: getStatusAmount('PENDING'),
        success_rate: successRate,
        today_collections: getStatusAmount('PAID'),
        today_count: totalTransactions,
        volume_change: 0,
        balance_change: 0,
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
      setStats({
        total_volume: 0,
        outstanding_balance: 0,
        success_rate: 0,
        today_collections: 0,
        today_count: 0,
        volume_change: 0,
        balance_change: 0,
      })
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      await paymentService.updatePaymentStatus(transactionId, { 
        status: newStatus as 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED',
        paid_at: newStatus === 'PAID' ? new Date().toISOString() : undefined
      })
      
      setTransactions(prev => prev.map(txn => 
        txn.id === transactionId ? { ...txn, status: newStatus } : txn
      ))
      
      await fetchStats()
    } catch (err) {
      console.error('Failed to update transaction status:', err)
      throw err
    }
  }

  useEffect(() => {
    Promise.all([fetchContacts(), fetchForms()]).then(() => {
      setLoadingLookupData(false)
    }).catch((err) => {
      console.error('Error loading lookup data:', err)
      setLoadingLookupData(false)
    })
  }, [fetchContacts, fetchForms])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setDateRange({ from: '', to: '' })
    setPage(1)
  }

  const getContactName = (contactId: string | undefined) => {
    if (!contactId) return 'Unknown'
    const contact = contacts.find(c => c.id === contactId)
    if (contact) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email
    }
    return contactId.slice(0, 8) + '...'
  }

  const getFormName = (formId: string | undefined) => {
    if (!formId) return 'Unknown'
    const form = forms.find(f => f.id === formId)
    return form?.title || formId.slice(0, 8) + '...'
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider'
    switch (status) {
      case 'PAID':
        return `${baseClasses} bg-slate-950 text-white`
      case 'PENDING':
        return `${baseClasses} bg-slate-100 text-slate-500 border border-slate-200`
      case 'PARTIAL':
        return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`
      default:
        return baseClasses
    }
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 lg:mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter text-[#191c1e] mb-2">All Transactions</h1>
            <p className="text-[#45464d]">Centralized ledger for all organization payments.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-2 bg-white border border-[#c6c6cd] text-[#191c1e] font-semibold px-4 py-2 rounded-md hover:bg-[#f2f4f6]"
              onClick={() => { fetchTransactions(); fetchStats(); }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-2 bg-white border border-[#c6c6cd] text-[#191c1e] font-semibold px-4 py-2 rounded-md hover:bg-[#f2f4f6]"
              onClick={() => navigate('/transactions/export')}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
          {/* Total Volume */}
          <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-[#c6c6cd]/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-4">Total Volume</p>
            {loadingStats ? (
              <div className="h-9 bg-[#f2f4f6] rounded animate-pulse"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#191c1e]">
                {formatCurrency(stats?.total_volume || 0)}
              </h3>
            )}
            <div className="mt-3 flex items-center gap-1 text-[#009668] text-xs font-semibold">
              <TrendingUp className="h-3 w-3" />
              <span>{stats?.volume_change || 0}% from last month</span>
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-[#c6c6cd]/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-4">Outstanding Balance</p>
            {loadingStats ? (
              <div className="h-9 bg-[#f2f4f6] rounded animate-pulse"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#191c1e]">
                {formatCurrency(stats?.outstanding_balance || 0)}
              </h3>
            )}
            <div className="mt-3 flex items-center gap-1 text-[#ba1a1a] text-xs font-semibold">
              <TrendingUp className="h-3 w-3" />
              <span>Higher than usual</span>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-[#c6c6cd]/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-4">Success Rate</p>
            {loadingStats ? (
              <div className="h-9 bg-[#f2f4f6] rounded animate-pulse"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#191c1e]">
                {(stats?.success_rate ?? 0) > 0 ? `${stats?.success_rate}%` : 'N/A'}
              </h3>
            )}
            <div className="mt-3 flex items-center gap-1 text-[#009668] text-xs font-semibold">
              <CheckCircle className="h-3 w-3" />
              <span>Based on transactions</span>
            </div>
          </div>

          {/* Today's Collections */}
          <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-[#c6c6cd]/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-4">Today's Collections</p>
            {loadingStats ? (
              <div className="h-9 bg-[#f2f4f6] rounded animate-pulse"></div>
            ) : (
              <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#191c1e]">
                {formatCurrency(stats?.today_collections || 0)}
              </h3>
            )}
            <div className="mt-3 flex items-center gap-1 text-[#009668] text-xs font-semibold">
              <Clock className="h-3 w-3" />
              <span>{stats?.today_count || 0} transactions today</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#f2f4f6] p-4 rounded-xl flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76777d]" />
            <Input 
              className="pl-10 bg-white border border-[#c6c6cd]/15 rounded-md text-sm focus:ring-1 focus:ring-[#006398]"
              placeholder="Search by Reference or Contact"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76777d] pointer-events-none" />
            <select 
              className="w-full bg-white border border-[#c6c6cd]/15 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#006398] appearance-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#76777d]" />
            <input 
              type="date"
              className="px-3 py-2 bg-white border border-[#c6c6cd]/15 rounded-md text-sm"
              value={dateRange.from}
              onChange={(e) => { setDateRange(prev => ({ ...prev, from: e.target.value })); setPage(1); }}
            />
            <span className="text-[#76777d]">-</span>
            <input 
              type="date"
              className="px-3 py-2 bg-white border border-[#c6c6cd]/15 rounded-md text-sm"
              value={dateRange.to}
              onChange={(e) => { setDateRange(prev => ({ ...prev, to: e.target.value })); setPage(1); }}
            />
          </div>

          {(searchQuery || statusFilter || dateRange.from || dateRange.to) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              className="text-[#45464d] hover:text-[#191c1e]"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#c6c6cd]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#c6c6cd]/10">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Transaction ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Form</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d] text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d] text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/10">
                {(loading || loadingLookupData) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#006398] mx-auto" />
                    </td>
                  </tr>
                )}
                
                {!loading && !loadingLookupData && error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#ba1a1a]">{error}</td>
                  </tr>
                )}
                
                {!loading && !loadingLookupData && !error && transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#45464d]">
                      No transactions found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
                
                {!loading && !loadingLookupData && !error && transactions.map((txn) => {
                  return (
                  <tr key={txn.id} className="hover:bg-[#f2f4f6]/50 transition-colors">
                    <td className="px-6 py-5 font-mono text-xs text-[#5c647a]">
                      <p className="font-semibold">{txn.reference?.slice(0, 12) || txn.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#45464d]">{formatDate(txn.created_at)}</td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-[#191c1e]">{getContactName(txn.submission?.contact_id)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-[#45464d]">{getFormName(txn.submission?.form_id)}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[#191c1e] text-right">{formatCurrency(parseFloat(txn.amount))}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={getStatusBadge(txn.status)}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <EditStatusButton transactionId={txn.id} currentStatus={txn.status} onStatusUpdate={handleStatusUpdate} />
                        <Link 
                          to={`/transactions/${txn.id}`}
                          className="inline-flex items-center gap-1 text-[#45464d] hover:text-[#006398] transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#f2f4f6] flex items-center justify-between border-t border-[#c6c6cd]/10">
            <span className="text-xs text-[#45464d]">
              Showing <span className="font-bold text-[#191c1e]">{((page - 1) * 20) + 1}</span> to{' '}
              <span className="font-bold text-[#191c1e]">{Math.min(page * 20, total)}</span> of{' '}
              <span className="font-bold text-[#191c1e]">{total.toLocaleString()}</span> transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1 rounded hover:bg-[#e6e8ea] disabled:opacity-30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-md bg-[#191c1e] text-white text-xs font-bold">{page}</button>
              {page < totalPages && (
                <>
                  <button className="w-8 h-8 rounded-md hover:bg-[#e6e8ea] text-xs font-bold">{page + 1}</button>
                  {page + 2 < totalPages && <span className="px-1 text-xs text-[#76777d]">...</span>}
                  {totalPages > 2 && (
                    <button className="w-8 h-8 rounded-md hover:bg-[#e6e8ea] text-xs font-bold">{totalPages}</button>
                  )}
                </>
              )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded hover:bg-[#e6e8ea] disabled:opacity-30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
