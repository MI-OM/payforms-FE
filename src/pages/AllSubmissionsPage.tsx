import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Download, Loader2, FileText, Filter, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paymentService } from '@/services/paymentService'
import { formService } from '@/services/formService'

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(amount: string | number | undefined): string {
  if (!amount) return 'N/A'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return 'N/A'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(num)
}

function getPaymentStatusColor(status?: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700'
    case 'PARTIAL':
      return 'bg-blue-100 text-blue-700'
    case 'PENDING':
      return 'bg-amber-100 text-amber-700'
    case 'FAILED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

interface Transaction {
  id: string
  reference: string
  amount: string
  status: string
  payment_method?: string
  created_at: string
  paid_at: string | null
  form_title?: string
  customer_name?: string
  customer_email?: string
  submission?: {
    id: string
    form_id: string
    contact_id?: string
  }
}

export function AllSubmissionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [forms, setForms] = useState<{id: string, title: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  })
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({
    status: '' as '' | 'PAID' | 'PARTIAL' | 'PENDING' | 'FAILED',
    payment_method: '' as '' | 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE',
    form_id: '' as string,
    start_date: '',
    end_date: '',
  })

  const fetchForms = async () => {
    try {
      const response = await formService.getForms({ limit: 100 })
      setForms(response.data.map(f => ({ id: f.id, title: f.title })))
    } catch (err) {
      console.error('Failed to load forms:', err)
    }
  }

  const fetchAllTransactions = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        page,
        limit: pagination.limit
      }
      if (filters.status) params.status = filters.status
      if (filters.payment_method) params.payment_method = filters.payment_method
      if (filters.form_id) params.form_id = filters.form_id
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      
      const response = await paymentService.getTransactions(params)
      console.log('📊 Transactions response:', response)
      console.log('📊 First transaction sample:', response.data[0])
      setTransactions(response.data)
      setPagination(prev => ({
        ...prev,
        page: response.page,
        total: response.total,
        total_pages: response.totalPages
      }))
    } catch (err) {
      setError('Failed to load transactions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllTransactions()
    fetchForms()
  }, [filters])

  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchQuery.toLowerCase()
    return (
      tx.customer_name?.toLowerCase().includes(searchLower) ||
      tx.customer_email?.toLowerCase().includes(searchLower) ||
      tx.reference?.toLowerCase().includes(searchLower) ||
      tx.form_title?.toLowerCase().includes(searchLower)
    )
  })

  const handleExport = async () => {
    try {
      const blob = await paymentService.exportTransactions()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `all_transactions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleExportFiltered = async () => {
    try {
      const params: any = {}
      if (filters.status) params.status = filters.status
      if (filters.payment_method) params.payment_method = filters.payment_method
      if (filters.form_id) params.form_id = filters.form_id
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      
      const blob = await paymentService.exportTransactions(params)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Transactions</h1>
            <p className="text-slate-500">View and manage all payment transactions</p>
          </div>
          <Button 
            onClick={() => {
              // Export with filters if any are active, otherwise export all
              const hasFilters = filters.status || filters.payment_method || filters.form_id || filters.start_date || filters.end_date
              if (hasFilters) {
                handleExportFiltered()
              } else {
                handleExport()
              }
            }} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, form, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <button 
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${showFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {(filters.status || filters.payment_method || filters.form_id || filters.start_date || filters.end_date) && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-50">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                        >
                          <option value="">All</option>
                          <option value="PAID">Paid</option>
                          <option value="PARTIAL">Partial</option>
                          <option value="PENDING">Pending</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                        <select
                          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                          value={filters.payment_method}
                          onChange={(e) => setFilters({ ...filters, payment_method: e.target.value as any })}
                        >
                          <option value="">All Methods</option>
                          <option value="ONLINE">Online</option>
                          <option value="CASH">Cash</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="POS">POS</option>
                          <option value="CHEQUE">Cheque</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Form</label>
                        <select
                          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                          value={filters.form_id}
                          onChange={(e) => setFilters({ ...filters, form_id: e.target.value })}
                        >
                          <option value="">All Forms</option>
                          {forms.map(form => (
                            <option key={form.id} value={form.id}>{form.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="date"
                              className="w-full border border-slate-300 rounded-md pl-10 py-2 text-sm"
                              value={filters.start_date}
                              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="date"
                              className="w-full border border-slate-300 rounded-md pl-10 py-2 text-sm"
                              value={filters.end_date}
                              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200"
                          onClick={() => setFilters({ status: '', payment_method: '', form_id: '', start_date: '', end_date: '' })}
                        >
                          Clear
                        </button>
                        <button
                          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          onClick={() => setShowFilter(false)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-center py-12 text-red-600">{error}</div>
          )}

          {!loading && !error && filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No transactions found</p>
            </div>
          )}

          {!loading && !error && filteredTransactions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Form</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {tx.form_title ? (
                          <Link 
                            to={`/forms/${tx.submission?.form_id}/submissions`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {tx.form_title}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {tx.customer_name || 'Anonymous'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {tx.customer_email || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPaymentStatusColor(tx.status)}`}>
                          {tx.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {tx.payment_method || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 truncate max-w-[150px]">
                        {tx.reference || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.total_pages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {filteredTransactions.length} of {pagination.total} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchAllTransactions(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => fetchAllTransactions(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}