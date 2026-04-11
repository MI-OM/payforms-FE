import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search, Download, Eye, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formService, type FormSubmission } from '@/services/formService'

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

function formatCurrency(amount: number | undefined): string {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function FormSubmissionsPage() {
  const navigate = useNavigate()
  const { formId } = useParams<{ formId: string }>()
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  })

  const fetchSubmissions = async (page = 1) => {
    console.log('📊 fetchSubmissions called with page:', page, 'formId:', formId)
    setLoading(true)
    setError(null)
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('📊 Request timeout - forcing loading to false')
        setLoading(false)
        setError('Request timed out. Please try again.')
      }
    }, 10000)
    
    try {
      const response = await formService.getFormSubmissions({
        page,
        limit: pagination.limit,
        form_id: formId
      })
      console.log('📊 Submissions response:', response)
      console.log('📊 Submissions data:', response.data)
      clearTimeout(timeoutId)
      setSubmissions(response.data)
      setPagination(prev => ({
        ...prev,
        page: response.page || page,
        total: response.total || 0,
        total_pages: response.totalPages || 1
      }))
    } catch (err) {
      clearTimeout(timeoutId)
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError('Failed to load submissions: ' + errorMsg)
      console.error('Submissions fetch error:', err)
    } finally {
      console.log('📊 Loading set to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('📊 useEffect triggered, formId:', formId)
    if (formId) {
      fetchSubmissions()
    } else {
      console.log('📊 No formId, setting loading to false')
      setLoading(false)
    }
  }, [formId])

  const filteredSubmissions = submissions.filter(sub => {
    const searchLower = searchQuery.toLowerCase()
    return (
      sub.contact_name?.toLowerCase().includes(searchLower) ||
      sub.contact_email?.toLowerCase().includes(searchLower) ||
      sub.reference?.toLowerCase().includes(searchLower)
    )
  })

  const handleExport = async () => {
    try {
      const blob = await formService.exportSubmissions({ format: 'csv', form_id: formId })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `submissions-${formId}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const getPaymentStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-700'
      case 'PENDING': return 'bg-orange-100 text-orange-700'
      case 'FAILED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-7xl mx-auto p-6">
        <button 
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Forms</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Form Submissions</h1>
            <p className="text-slate-500">View and manage all submissions for this form</p>
          </div>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-600">{error}</div>
          )}

          {!loading && !error && filteredSubmissions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No submissions found</p>
            </div>
          )}

          {!loading && !error && filteredSubmissions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(submission.submitted_at)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {submission.contact_name || 'Anonymous'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {submission.contact_email || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPaymentStatusColor(submission.payment_status)}`}>
                          {submission.payment_status || 'NO PAYMENT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                        {formatCurrency(submission.payment_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                        {submission.reference || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                Showing {filteredSubmissions.length} of {pagination.total} submissions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchSubmissions(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => fetchSubmissions(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Submission Details</h2>
              <p className="text-sm text-slate-500">ID: {selectedSubmission.id}</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Submitted</p>
                  <p className="text-sm text-slate-900">{formatDate(selectedSubmission.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Payment Status</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPaymentStatusColor(selectedSubmission.payment_status)}`}>
                    {selectedSubmission.payment_status || 'NO PAYMENT'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Contact Name</p>
                  <p className="text-sm text-slate-900">{selectedSubmission.contact_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Contact Email</p>
                  <p className="text-sm text-slate-900">{selectedSubmission.contact_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Amount</p>
                  <p className="text-sm text-slate-900 font-medium">{formatCurrency(selectedSubmission.payment_amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Reference</p>
                  <p className="text-sm text-slate-900 font-mono">{selectedSubmission.reference || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Form Data</p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedSubmission.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}