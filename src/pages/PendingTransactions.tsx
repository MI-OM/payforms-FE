import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, RefreshCw, Loader2, TrendingUp, CheckCircle, X, Edit2, Eye, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paymentService } from '@/services/paymentService'
import { contactService, type Contact } from '@/services/contactService'
import { formService, type Form } from '@/services/formService'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface EditStatusModalProps {
  transaction: {
    id: string
    reference: string
    status: string
    amount: string
    submission?: { contact_id?: string; form_id: string }
  }
  onClose: () => void
  onStatusUpdate: (transactionId: string, newStatus: string) => Promise<void>
}

function EditStatusModal({ transaction, onClose, onStatusUpdate }: EditStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(transaction.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const statuses = ['PENDING', 'PAID', 'PARTIAL', 'FAILED']

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === transaction.status) {
      return
    }
    
    setIsUpdating(true)
    try {
      await onStatusUpdate(transaction.id, newStatus)
      setSelectedStatus(newStatus)
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 border-b border-[#e0e3e5]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#191c1e]">Update Payment Status</h3>
              <p className="text-xs text-[#45464d] mt-1">Reference: {transaction.reference?.slice(0, 12)}...</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-colors">
              <X className="h-5 w-5 text-[#45464d]" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-xs font-bold text-[#45464d] uppercase tracking-wider mb-2">Amount</p>
            <p className="text-2xl font-extrabold text-[#191c1e]">{formatCurrency(parseFloat(transaction.amount))}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-xs font-bold text-[#45464d] uppercase tracking-wider mb-3">Select New Status</p>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating || status === transaction.status}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-bold ${
                    status === selectedStatus
                      ? 'border-[#006398] bg-[#006398]/5 text-[#006398]'
                      : status === transaction.status
                      ? 'border-[#e0e3e5] bg-[#f2f4f6] text-[#76777d] cursor-not-allowed'
                      : 'border-[#e0e3e5] hover:border-[#006398] text-[#191c1e]'
                  }`}
                >
                  {status}
                  {status === transaction.status && (
                    <span className="block text-[10px] font-normal mt-0.5">Current</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {showSuccess && (
            <div className="flex items-center justify-center gap-2 p-4 bg-[#009668]/10 rounded-lg text-[#009668]">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Status updated successfully!</span>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-[#f2f4f6] flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-[#45464d] border-[#c6c6cd] hover:bg-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

interface PendingTransaction {
  id: string
  reference: string
  amount: string
  amount_paid: string
  balance_due: string
  status: string
  paid_at: string | null
  created_at: string
  submission: {
    id: string
    form_id: string
    contact_id?: string
    organization_id: string
  }
}

interface SummaryStats {
  total_pending: number
  total_pending_amount: number
  count: number
}

export function PendingTransactions() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<PendingTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<SummaryStats>({ total_pending: 0, total_pending_amount: 0, count: 0 })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [editingTransaction, setEditingTransaction] = useState<PendingTransaction | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      const response = await contactService.getContacts({ limit: 1000 })
      setContacts(response.data || [])
    } catch (err) {
      console.error('Failed to load contacts:', err)
    }
  }, [])

  const fetchForms = useCallback(async () => {
    try {
      const response = await formService.getForms({ limit: 1000 })
      setForms(response.data || [])
    } catch (err) {
      console.error('Failed to load forms:', err)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number | undefined> = { 
        page, 
        limit: 20,
        status: 'PENDING'
      }
      if (searchQuery) params.reference = searchQuery
      
      const response = await paymentService.getTransactions(params)
      setTransactions(response.data as unknown as PendingTransaction[])
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (err) {
      setError('Failed to load pending transactions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  const fetchStats = useCallback(async () => {
    try {
      const response = await paymentService.getTransactions({ limit: 1000, status: 'PENDING' })
      const pendingTxns = (response.data || []) as PendingTransaction[]
      const totalAmount = pendingTxns.reduce((sum, txn) => sum + parseFloat(String(txn.amount || '0')), 0)
      setStats({
        total_pending: totalAmount,
        total_pending_amount: totalAmount,
        count: pendingTxns.length
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      await paymentService.updatePaymentStatus(transactionId, { 
        status: newStatus as 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED',
        paid_at: newStatus === 'PAID' ? new Date().toISOString() : undefined
      })
      
      setTransactions(prev => prev.filter(txn => txn.id !== transactionId))
      await fetchStats()
    } catch (err) {
      console.error('Failed to update transaction status:', err)
      throw err
    }
  }

  useEffect(() => {
    Promise.all([fetchContacts(), fetchForms()])
  }, [fetchContacts, fetchForms])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

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

  const filteredTransactions = searchQuery 
    ? transactions.filter(txn => 
        txn.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getContactName(txn.submission?.contact_id).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 lg:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter text-[#191c1e]">Pending Payments</h1>
                <p className="text-[#45464d]">Review and update status for outstanding payments.</p>
              </div>
            </div>
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
            <Link to="/transactions">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 text-[#45464d] border-[#c6c6cd] px-4 py-2 rounded-md hover:bg-[#f2f4f6]"
              >
                View All Transactions
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 lg:mb-8">
          <div className="bg-black text-white rounded-xl p-6 shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Total Outstanding</p>
            <h3 className="text-3xl font-extrabold tracking-tight">{formatCurrency(stats.total_pending)}</h3>
            <p className="text-[11px] opacity-60 mt-2">{stats.count} pending payments</p>
          </div>
          
          <div className="bg-[#f2f4f6] rounded-xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">Awaiting Collection</p>
            <h3 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">{stats.count}</h3>
            <p className="text-[11px] text-[#45464d] mt-2">payments pending</p>
          </div>
          
          <div className="bg-[#f2f4f6] rounded-xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">Average Pending</p>
            <h3 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">
              {stats.count > 0 ? formatCurrency(stats.total_pending / stats.count) : formatCurrency(0)}
            </h3>
            <p className="text-[11px] text-[#45464d] mt-2">per transaction</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#f2f4f6] p-4 rounded-xl flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76777d]" />
            <Input 
              className="pl-10 bg-white border border-[#c6c6cd]/15 rounded-md text-sm focus:ring-1 focus:ring-[#006398]"
              placeholder="Search by Reference or Contact Name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-[#45464d] hover:text-[#191c1e]"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#c6c6cd]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#c6c6cd]/10">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d]">Form</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d] text-right">Amount Due</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d] text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#45464d] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/10">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#006398] mx-auto" />
                    </td>
                  </tr>
                )}
                
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#ba1a1a]">{error}</td>
                  </tr>
                )}
                
                {!loading && !error && filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <CheckCircle className="h-12 w-12 text-[#009668]" />
                        <p className="text-[#45464d] font-semibold">No pending payments!</p>
                        <p className="text-sm text-[#76777d]">All payments have been processed.</p>
                      </div>
                    </td>
                  </tr>
                )}
                
                {!loading && !error && filteredTransactions.map((txn) => (
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                        PENDING
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setEditingTransaction(txn)}
                          className="inline-flex items-center gap-1 text-[#006398] hover:text-[#004a73] transition-colors text-sm font-medium"
                        >
                          <Edit2 className="h-4 w-4" />
                          Update Status
                        </button>
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#f2f4f6] flex items-center justify-between border-t border-[#c6c6cd]/10">
            <span className="text-xs text-[#45464d]">
              Showing <span className="font-bold text-[#191c1e]">{((page - 1) * 20) + 1}</span> to{' '}
              <span className="font-bold text-[#191c1e]">{Math.min(page * 20, total)}</span> of{' '}
              <span className="font-bold text-[#191c1e]">{total.toLocaleString()}</span> pending transactions
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

      {/* Edit Status Modal */}
      {editingTransaction && (
        <EditStatusModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
