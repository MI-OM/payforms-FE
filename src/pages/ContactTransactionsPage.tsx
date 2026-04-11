import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoIcon } from '@/components/Logo'
import { ContactSidebar } from '@/components/layouts/ContactSidebar'
import { contactAuthService } from '@/services/contactAuthService'
import { contactService, type Transaction } from '@/services/contactService'
import { Search, Download, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export function ContactTransactionsPage() {
  const navigate = useNavigate()
  const [contact, setContact] = useState<{ id: string; first_name: string; last_name: string; email: string } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null)
  const limit = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactData = await contactAuthService.getMe()
        setContact(contactData)
        
        const params: any = { page, limit }
        if (statusFilter !== 'all') {
          params.status = statusFilter
        }
        
        const data = await contactAuthService.getTransactions(params)
        setTransactions(data.data)
        setTotalPages(data.totalPages)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        navigate('/contact/login')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate, page, statusFilter])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await contactAuthService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('contact_data')
      localStorage.removeItem('payforms_access_token')
      localStorage.removeItem('payforms_refresh_token')
      localStorage.removeItem('pf_contact_token')
      localStorage.removeItem('pf_contact')
      navigate('/contact/login')
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contact-auth/transactions?format=csv`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )
      if (!response.ok) {
        throw new Error('Failed to export transactions')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().split('T')[0]
      a.download = `transactions_${date}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export transactions. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadReceipt = async (paymentId: string, reference?: string) => {
    setDownloadingReceipt(paymentId)
    try {
      const blob = await contactAuthService.getReceipt(paymentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt_${reference || paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Receipt download error:', err)
      alert('Failed to download receipt. Please try again.')
    } finally {
      setDownloadingReceipt(null)
    }
  }

  const filteredTransactions = transactions.filter(tx =>
    tx.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <ContactSidebar onLogout={handleLogout} />
      
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-500 mt-1">View all your payment transactions</p>
          </div>
          <button 
            onClick={handleExportCSV} 
            disabled={exporting || transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="all">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/contact/payment/${tx.id}?reference=${tx.reference}&amount=${tx.amount}&status=${tx.status}&created_at=${tx.created_at}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {tx.reference || `Transaction #${tx.id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString('en-NG', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    {tx.status === 'PAID' && (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDownloadReceipt(tx.id, tx.reference); 
                        }}
                        disabled={downloadingReceipt === tx.id}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title="Download Receipt"
                      >
                        {downloadingReceipt === tx.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
