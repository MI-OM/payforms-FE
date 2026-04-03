import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Filter, Download, MoreVertical, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paymentService, type Transaction } from '@/services/paymentService'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AllTransactionsLedger() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 20 }
      if (searchQuery) params.reference = searchQuery
      const response = await paymentService.getTransactions(params)
      setTransactions(response.data)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError('Failed to load transactions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Transactions</h1>
            <p className="text-gray-500">Complete ledger of all payment transactions.</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2" onClick={() => navigate('/transactions/export')}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10" 
                  placeholder="Search transactions..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && <div className="p-4 text-red-600">{error}</div>}

          {!loading && !error && transactions.length === 0 && (
            <div className="p-8 text-center text-gray-500">No transactions found</div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Transaction ID</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Reference</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Amount</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono text-sm text-gray-900">{txn.id}</td>
                        <td className="p-4 font-mono text-sm text-gray-500">{txn.reference || '-'}</td>
                        <td className="p-4 font-bold text-gray-900">{formatCurrency(txn.amount)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                            txn.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            txn.status === 'PARTIAL' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {txn.status === 'PAID' && <CheckCircle className="h-3 w-3" />}
                            {txn.status === 'PENDING' && <Clock className="h-3 w-3" />}
                            {txn.status === 'PARTIAL' && <Clock className="h-3 w-3" />}
                            {(txn.status === 'FAILED' || txn.status === 'PENDING') && <XCircle className="h-3 w-3" />}
                            {txn.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{formatDate(txn.created_at)}</td>
                        <td className="p-4">
                          <Link to={`/transactions/${txn.id}`} className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-5 w-5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
  )
}
