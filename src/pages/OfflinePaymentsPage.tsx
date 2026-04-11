import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, RefreshCw, Loader2, CheckCircle, X, Eye, FileText, Search, ArrowLeft, Plus, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paymentService, type Payment } from '@/services/paymentService'
import { toast } from '@/components/ui/use-toast'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getPaymentMethodLabel(method?: string): string {
  switch (method) {
    case 'ONLINE': return 'Pay Online'
    case 'CASH': return 'Cash'
    case 'BANK_TRANSFER': return 'Bank Transfer'
    case 'POS': return 'POS'
    case 'CHEQUE': return 'Cheque'
    default: return '-'
  }
}

interface AddPaymentModalProps {
  onClose: () => void
  onSubmit: (data: { submission_id: string; amount: number; payment_method: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'; external_reference?: string; confirmation_note?: string }) => Promise<void>
}

function AddPaymentModal({ onClose, onSubmit }: AddPaymentModalProps) {
  const [submissionId, setSubmissionId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'>('CASH')
  const [externalReference, setExternalReference] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!submissionId || !amount) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        submission_id: submissionId,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        external_reference: externalReference || undefined,
        confirmation_note: notes || undefined,
      })
      onClose()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-[#191c1e] mb-4">Add Offline Payment</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">Submission ID *</label>
            <Input
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              placeholder="Enter submission ID"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">Amount *</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full p-2 border border-[#c6c6cd] rounded-lg"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="POS">POS</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">External Reference</label>
            <Input
              value={externalReference}
              onChange={(e) => setExternalReference(e.target.value)}
              placeholder="Transaction reference"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full p-2 border border-[#c6c6cd] rounded-lg"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 border-[#c6c6cd] text-[#45464d]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Payment'}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface EditPaymentModalProps {
  payment: Payment
  onClose: () => void
  onSubmit: (data: { status: 'PAID' | 'PARTIAL' | 'FAILED'; paid_at?: string; amount_paid?: number; payment_method?: 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'; confirmation_note?: string; external_reference?: string }) => Promise<void>
}

function EditPaymentModal({ payment, onClose, onSubmit }: EditPaymentModalProps) {
  const [status, setStatus] = useState<'PAID' | 'PARTIAL' | 'FAILED'>(payment.status === 'PENDING' ? 'PAID' : payment.status as 'PAID' | 'PARTIAL' | 'FAILED')
  const [paidAt, setPaidAt] = useState(payment.paid_at ? payment.paid_at.split('T')[0] : '')
  const [amountPaid, setAmountPaid] = useState(payment.amount.toString())
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE' | ''>(payment.payment_method || '')
  const [externalReference, setExternalReference] = useState(payment.external_reference || '')
  const [notes, setNotes] = useState(payment.confirmation_note || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit({
        status,
        paid_at: paidAt ? new Date(paidAt).toISOString() : undefined,
        amount_paid: parseFloat(amountPaid) || undefined,
        payment_method: paymentMethod || undefined,
        external_reference: externalReference || undefined,
        confirmation_note: notes || undefined,
      })
      onClose()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[#191c1e] mb-4">Edit Payment</h3>
        
        <div className="bg-[#f2f4f6] rounded-lg p-4 mb-4">
          <p className="text-sm text-[#45464d]">Reference</p>
          <p className="font-semibold text-[#191c1e]">{payment.reference || payment.id}</p>
          <p className="text-sm text-[#45464d] mt-2">Amount</p>
          <p className="font-semibold text-[#191c1e]">{formatCurrency(payment.amount)}</p>
          {payment.contact_name && (
            <>
              <p className="text-sm text-[#45464d] mt-2">Contact</p>
              <p className="font-semibold text-[#191c1e]">{payment.contact_name}</p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'PAID' | 'PARTIAL' | 'FAILED')}
              className="w-full p-2 border border-[#c6c6cd] rounded-lg"
            >
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          {status !== 'FAILED' && (
            <>
              <div>
                <label className="text-sm font-medium text-[#45464d] mb-1 block">Amount Paid</label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#45464d] mb-1 block">Paid Date</label>
                <Input
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                />
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full p-2 border border-[#c6c6cd] rounded-lg"
            >
              <option value="">Select method</option>
              <option value="ONLINE">Pay Online</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="POS">POS</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">External Reference</label>
            <Input
              value={externalReference}
              onChange={(e) => setExternalReference(e.target.value)}
              placeholder="Transaction reference"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#45464d] mb-1 block">Confirmation Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="w-full p-2 border border-[#c6c6cd] rounded-lg"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 border-[#c6c6cd] text-[#45464d]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function OfflinePaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  const fetchPayments = useCallback(async (pageNum: number = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const params: any = { page: pageNum, limit: 20 }
      if (searchTerm) params.search = searchTerm

      const response = await paymentService.getOfflinePendingPayments(params)

      if (append) {
        setPayments(prev => [...prev, ...response.data])
      } else {
        setPayments(response.data)
      }

      setHasMore(response.data.length > 0 && pageNum < response.totalPages)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to fetch offline payments:', err)
      toast({
        title: 'Error',
        description: 'Failed to load offline payments',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        fetchPayments(1, false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchTerm, fetchPayments])

  const handleAddPayment = async (data: { submission_id: string; amount: number; payment_method: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'; external_reference?: string; confirmation_note?: string }) => {
    try {
      await paymentService.createPayment({
        submission_id: data.submission_id,
        amount: data.amount,
        payment_method: data.payment_method,
        reference: data.external_reference,
      })
      toast({ title: 'Success', description: 'Offline payment added successfully' })
      fetchPayments(1, false)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add payment', variant: 'destructive' })
      throw err
    }
  }

  const handleEditPayment = async (paymentId: string, data: { status: 'PAID' | 'PARTIAL' | 'FAILED'; paid_at?: string; amount_paid?: number; payment_method?: 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'; confirmation_note?: string; external_reference?: string }) => {
    try {
      await paymentService.updateOfflinePaymentReview(paymentId, data)
      toast({ title: 'Success', description: 'Payment updated successfully' })
      fetchPayments(1, false)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update payment', variant: 'destructive' })
      throw err
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchPayments(page + 1, true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/payments">
              <Button variant="ghost" size="sm" className="text-[#45464d] hover:text-[#191c1e]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter text-[#191c1e]">Offline Payments</h1>
              <p className="text-[#45464d]">Manage offline payment submissions and reviews.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 bg-white border border-[#c6c6cd] text-[#191c1e] font-semibold px-4 py-2 rounded-md hover:bg-[#f2f4f6]"
              onClick={() => fetchPayments(1, false)}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76777d]" />
            <Input
              placeholder="Search by reference or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#c6c6cd] text-[#191c1e] placeholder:text-[#76777d]"
            />
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offline payments</h3>
            <p className="text-gray-500">
              There are no pending offline payments to review.
            </p>
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f2f4f6] border-b border-[#e5e7eb]">
                    <tr>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Reference</th>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Contact</th>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Form</th>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Amount</th>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Method</th>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Date</th>
                      <th className="text-left text-xs font-bold text-[#76777d] uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#f7f9fb] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-[#191c1e]">{payment.reference || payment.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#45464d]">{payment.contact_name || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#45464d]">{payment.form_title || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-[#191c1e]">{formatCurrency(payment.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#45464d]">{getPaymentMethodLabel(payment.payment_method)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'PAID' 
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#45464d]">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPayment(payment)}
                            className="text-[#45464d] border-[#c6c6cd] hover:bg-[#f2f4f6]"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {hasMore && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-[#45464d] border-[#c6c6cd]"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}

        {showAddModal && (
          <AddPaymentModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddPayment}
          />
        )}

        {editingPayment && (
          <EditPaymentModal
            payment={editingPayment}
            onClose={() => setEditingPayment(null)}
            onSubmit={(data) => handleEditPayment(editingPayment.id, data)}
          />
        )}
      </div>
    </div>
  )
}