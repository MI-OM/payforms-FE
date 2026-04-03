import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Clock, CheckCircle, AlertCircle, FileText, Loader, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paymentService, type TransactionHistory as TransactionHistoryType } from '@/services/paymentService'

export function TransactionHistory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [history, setHistory] = useState<TransactionHistoryType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await paymentService.getTransactionHistory(id, { limit: 50 })
      setHistory(response.data)
    } catch (err) {
      console.error('Failed to load transaction history', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/transactions/${id}`)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-500">TXN-{id} - Audit trail</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Activity Timeline</h3>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No history found</div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="space-y-6">
                  {history.map((entry) => (
                    <div key={entry.id} className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        entry.action.includes('Paid') 
                          ? 'bg-green-100 text-green-600' 
                          : entry.action.includes('Failed')
                          ? 'bg-red-100 text-red-600'
                          : entry.action.includes('Partial')
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {entry.action.includes('Paid') ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : entry.action.includes('Failed') ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : entry.action.includes('Created') ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{entry.action}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{entry.details}</p>
                        <p className="text-xs text-gray-400">By: {entry.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TransactionExport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: '',
    form_id: '',
    contact_id: '',
    start_date: '',
    end_date: '',
  })
  const [isExporting, setIsExporting] = useState(false)
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null)

  const checkEstimate = useCallback(async () => {
    try {
      const response = await paymentService.getTransactions({
        ...filters,
        limit: 1,
      })
      setEstimatedCount(response.total)
    } catch {
      setEstimatedCount(null)
    }
  }, [filters])

  useEffect(() => {
    const debounce = setTimeout(checkEstimate, 500)
    return () => clearTimeout(debounce)
  }, [checkEstimate])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      )
      const blob = await paymentService.exportTransactions(cleanFilters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export transactions')
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/transactions')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export Transactions</h1>
            <p className="text-gray-500">Download transactions as CSV</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Export Filters</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form ID</label>
                <input 
                  type="text"
                  value={filters.form_id}
                  onChange={(e) => setFilters({...filters, form_id: e.target.value})}
                  placeholder="Filter by form"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input 
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input 
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact ID (optional)</label>
              <input 
                type="text"
                value={filters.contact_id}
                onChange={(e) => setFilters({...filters, contact_id: e.target.value})}
                placeholder="Filter by specific contact"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Estimated Transactions</p>
                <p className="text-sm text-gray-500">Based on your filters</p>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {estimatedCount !== null ? estimatedCount.toLocaleString() : '...'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleExport} disabled={isExporting || estimatedCount === 0}>
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
