import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, MoreVertical, Eye, Edit, Copy, Trash2, Loader2, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formService, publicFormService, type Form, type PublicForm } from '@/services/formService'
import { toast } from '@/components/ui/use-toast'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export function AllFormsManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [previewForm, setPreviewForm] = useState<PublicForm | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchForms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number | boolean | undefined> = { limit: 50 }
      const response = await formService.getForms(params)
      setForms(response.data)
    } catch (err) {
      setError('Failed to load forms')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenu && !(e.target as Element).closest('.menu-container')) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openMenu])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return
    setDeletingId(id)
    try {
      await formService.deleteForm(id)
      setForms(prev => prev.filter(f => f.id !== id))
      setOpenMenu(null)
      toast({ title: 'Success', description: 'Form deleted successfully' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete form', variant: 'destructive' })
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDuplicate = async (form: Form) => {
    try {
      const newForm = await formService.createForm({
        title: `${form.title} (Copy)`,
        slug: `${form.slug}-copy-${Date.now()}`,
        category: form.category,
        description: form.description,
        note: form.note,
        payment_type: form.payment_type,
        amount: form.amount,
        allow_partial: form.allow_partial,
      })
      setForms(prev => [newForm, ...prev])
      setOpenMenu(null)
      toast({ title: 'Success', description: 'Form duplicated successfully' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to duplicate form', variant: 'destructive' })
      console.error(err)
    }
  }

  const handleToggleStatus = async (form: Form) => {
    setTogglingId(form.id)
    try {
      const updated = await formService.updateForm(form.id, { is_active: !form.is_active })
      setForms(prev => prev.map(f => f.id === updated.id ? updated : f))
      setOpenMenu(null)
      toast({ 
        title: 'Success', 
        description: `Form ${updated.is_active ? 'activated' : 'deactivated'} successfully` 
      })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update form status', variant: 'destructive' })
      console.error(err)
    } finally {
      setTogglingId(null)
    }
  }

  const handlePreview = async (form: Form) => {
    setPreviewLoading(true)
    try {
      const publicForm = await publicFormService.getForm(form.slug)
      setPreviewForm(publicForm)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load preview. Make sure the form has targets configured.', variant: 'destructive' })
      console.error(err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'active' && form.is_active) ||
      (activeTab === 'draft' && !form.is_active)
    return matchesSearch && matchesTab
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Forms</h1>
          <p className="text-gray-500">Manage all your payment forms in one place.</p>
        </div>
        <Link to="/forms/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Form
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'draft', label: 'Draft' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-1 text-sm font-bold transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.key === 'all' ? forms.length : forms.filter(f => tab.key === 'active' ? f.is_active : !f.is_active).length})
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="Search forms..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {!loading && !error && filteredForms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No forms found. Create your first form to get started.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredForms.map((form) => (
          <div key={form.id} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{form.title}</h3>
                <p className="text-sm text-gray-500">{form.category || 'Uncategorized'}</p>
              </div>
              <div className="relative menu-container">
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenu(openMenu === form.id ? null : form.id)
                  }}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {openMenu === form.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-100 z-10">
                    <button
                      onClick={() => handleToggleStatus(form)}
                      disabled={togglingId === form.id}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {togglingId === form.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {form.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(form)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      disabled={deletingId === form.id}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      {deletingId === form.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {form.is_active ? 'Active' : 'Draft'}
              </span>
              <span className="text-xs text-gray-400">Updated {formatRelativeTime(form.updated_at)}</span>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={() => handlePreview(form)}
                disabled={previewLoading}
              >
                {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Preview
              </Button>
              <Link to={`/forms/${form.id}/fields`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Fields
                </Button>
              </Link>
              <Link to={`/forms/${form.id}/settings`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  Settings
                </Button>
              </Link>
              <a 
                href={`/pay/${form.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded"
              >
                <ExternalLink className="h-4 w-4" />
                Live
              </a>
            </div>
          </div>
        ))}
      </div>

      {previewForm && (
        <FormPreviewModal form={previewForm} onClose={() => setPreviewForm(null)} />
      )}
    </div>
  )
}

interface FormPreviewModalProps {
  form: PublicForm
  onClose: () => void
}

function FormPreviewModal({ form, onClose }: FormPreviewModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    for (const field of form.fields) {
      if (field.required && !formData[field.label]) {
        setErrors(prev => ({ ...prev, [field.label]: 'This field is required' }))
        return
      }
    }

    setSubmitting(true)
    try {
      await publicFormService.submitForm(form.slug, formData)
      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Preview: {form.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-60px)]">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Form Submitted!</h3>
              <p className="text-gray-500">This is a preview - no actual payment was processed.</p>
              <Button className="mt-4" onClick={() => { setSubmitted(false); setFormData({}) }}>
                Submit Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {form.description && (
                <p className="text-gray-600 mb-6">{form.description}</p>
              )}

              {form.payment_type === 'FIXED' && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Amount Due</p>
                  <p className="text-2xl font-bold text-gray-900">${form.amount?.toFixed(2)}</p>
                  {form.allow_partial && (
                    <p className="text-xs text-gray-500 mt-1">Partial payments allowed</p>
                  )}
                </div>
              )}

              {form.fields.sort((a, b) => a.order_index - b.order_index).map((field) => (
                <div key={field.id} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'TEXT' && (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData[field.label] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    />
                  )}
                  
                  {field.type === 'EMAIL' && (
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData[field.label] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    />
                  )}
                  
                  {field.type === 'NUMBER' && (
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData[field.label] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    />
                  )}
                  
                  {field.type === 'TEXTAREA' && (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                      value={formData[field.label] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    />
                  )}
                  
                  {field.type === 'SELECT' && (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData[field.label] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  
                  {errors[field.label] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.label]}</p>
                  )}
                </div>
              ))}

              {form.payment_type === 'VARIABLE' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount
                    {form.allow_partial && <span className="text-gray-400 font-normal ml-1">(any amount)</span>}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter amount"
                  />
                </div>
              )}

              {form.note && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-600">{form.note}</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Preview Mode:</strong> This is a preview of your form. No actual data will be submitted.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  `Submit Payment${form.payment_type === 'FIXED' ? ` - $${form.amount?.toFixed(2)}` : ''}`
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
