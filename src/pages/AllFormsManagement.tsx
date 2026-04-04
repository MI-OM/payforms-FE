import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, MoreVertical, Eye, Edit, Copy, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formService, type Form } from '@/services/formService'
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return
    setDeletingId(id)
    try {
      await formService.deleteForm(id)
      setForms(prev => prev.filter(f => f.id !== id))
      setOpenMenu(null)
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
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to duplicate form', variant: 'destructive' })
      console.error(err)
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'active' && form.is_active) ||
      (activeTab === 'draft' && !form.is_active) ||
      (activeTab === 'inactive' && !form.is_active)
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
        {['all', 'active', 'draft', 'inactive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-bold transition-colors capitalize ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
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
              <div className="relative">
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setOpenMenu(openMenu === form.id ? null : form.id)}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {openMenu === form.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-10">
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
                    <button
                      onClick={() => handleDuplicate(form)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {form.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-400">Updated {formatRelativeTime(form.updated_at)}</span>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Link to={`/forms/${form.id}/edit`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Link to={`/forms/${form.id}/settings`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
