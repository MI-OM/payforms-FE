import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LogoIcon } from '@/components/Logo'
import { contactAuthService } from '@/services/contactAuthService'
import { contactService, type Transaction } from '@/services/contactService'
import { ArrowLeft, Download, CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react'

export function ContactPaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<{ id: string; first_name: string; last_name: string; email: string } | null>(null)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Transaction ID not found')
        setLoading(false)
        return
      }

      try {
        const contactData = await contactAuthService.getMe()
        setContact(contactData)
        
        const params = new URLSearchParams(window.location.search)
        const reference = params.get('reference')
        const amount = params.get('amount')
        const status = params.get('status')
        const createdAt = params.get('created_at')
        
        if (reference) {
          setTransaction({
            id,
            reference,
            amount: amount ? parseFloat(amount) : 0,
            status: status || 'UNKNOWN',
            created_at: createdAt || new Date().toISOString(),
          })
        } else {
          setError('Transaction details not available')
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load transaction details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleLogout = async () => {
    try {
      await contactAuthService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('contact_data')
      localStorage.removeItem('payforms_access_token')
      localStorage.removeItem('payforms_refresh_token')
      localStorage.removeItem('pf_contact_token')
      navigate('/contact/login')
    }
  }

  const handleDownloadReceipt = async () => {
    if (!id) return
    
    setDownloading(true)
    try {
      const blob = await contactAuthService.getReceipt(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${transaction?.reference || id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to download receipt:', err)
      alert('Failed to download receipt. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Payment Successful',
        }
      case 'PARTIAL':
        return {
          icon: AlertCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Partial Payment',
        }
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          label: 'Payment Pending',
        }
      case 'FAILED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Payment Failed',
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: status,
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Transaction Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'Unable to load transaction details.'}</p>
          <button
            onClick={() => navigate('/contact/transactions')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(transaction.status)
  const StatusIcon = statusConfig.icon
  const contactName = contact ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') : 'Student'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/contact/transactions')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <LogoIcon size="sm" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contact Portal</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{contactName}</p>
              <p className="text-sm text-gray-500">{contact?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-gray-500 mt-1">View your transaction details and download receipt</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className={`p-8 text-center ${statusConfig.bgColor}`}>
            <StatusIcon className={`w-16 h-16 mx-auto mb-4 ${statusConfig.color}`} />
            <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.label}</h2>
            <p className="text-gray-500 mt-1">
              {transaction.status === 'PAID' 
                ? 'Your payment has been processed successfully.' 
                : transaction.status === 'PARTIAL'
                ? 'A partial payment has been recorded. Please complete the remaining balance.'
                : transaction.status === 'PENDING'
                ? 'Your payment is being processed. Please wait.'
                : 'The payment could not be completed.'}
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono font-medium text-gray-900">{transaction.reference}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Amount</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(transaction.amount)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {transaction.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-900">{formatDate(transaction.created_at)}</span>
              </div>
              
              {transaction.paid_at && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Paid On</span>
                  <span className="text-gray-900">{formatDate(transaction.paid_at)}</span>
                </div>
              )}

              {transaction.form_name && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Form</span>
                  <span className="text-gray-900">{transaction.form_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            {transaction.status === 'PAID' ? (
              <button
                onClick={handleDownloadReceipt}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Receipt
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate('/contact/forms')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Make Another Payment
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/contact/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
