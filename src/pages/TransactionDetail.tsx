import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, MoreVertical, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paymentService, type Transaction } from '@/services/paymentService'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function IndividualTransactionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await paymentService.getTransaction(id)
        setTransaction(data)
      } catch (err) {
        setError('Failed to load transaction')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTransaction()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface ml-64 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-surface ml-64 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Transaction not found'}</p>
          <Button onClick={() => navigate('/transactions')}>Back to Transactions</Button>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    PAID: { bg: 'bg-green-100', text: 'text-green-700' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    PARTIAL: { bg: 'bg-blue-100', text: 'text-blue-700' },
    FAILED: { bg: 'bg-red-100', text: 'text-red-700' },
  }

  const statusColor = statusColors[transaction.status] || { bg: 'bg-gray-100', text: 'text-gray-700' }

  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/transactions')} className="hover:text-on-surface flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Transactions
          </button>
          <ChevronRight className="h-4 w-4" />
          <span>{transaction.reference || transaction.id}</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Transaction Details</h1>
              <p className="text-on-surface-variant font-mono">{transaction.reference || transaction.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColor.bg} ${statusColor.text}`}>
              {transaction.status}
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Amount</p>
                <p className="text-3xl font-extrabold">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Date</p>
                <p className="text-xl font-bold">{formatDate(transaction.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Transaction ID</p>
                <p className="font-bold font-mono">{transaction.id}</p>
              </div>
              {transaction.paid_at && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Paid At</p>
                  <p className="text-xl font-bold">{formatDate(transaction.paid_at)}</p>
                </div>
              )}
            </div>

            <div className="bg-surface-container-low rounded-lg p-4 mb-6">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Reference</p>
              <p className="font-mono font-bold text-lg">{transaction.reference || '-'}</p>
            </div>

            <div className="flex gap-3">
              <Link to={`/transactions/${id}/history`} className="flex-1">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  View History
                </Button>
              </Link>
              {transaction.contact_id && (
                <Link to={`/contacts/${transaction.contact_id}`} className="flex-1">
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    View Contact
                  </Button>
                </Link>
              )}
              {transaction.form_id && (
                <Link to={`/forms/${transaction.form_id}`} className="flex-1">
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    View Form
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
