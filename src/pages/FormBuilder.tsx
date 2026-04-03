import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formService, type CreateFormRequest } from '@/services/formService'

export function FormBuilder() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<CreateFormRequest>({
    title: '',
    slug: '',
    category: '',
    description: '',
    note: '',
    payment_type: 'FIXED',
    amount: 0,
    allow_partial: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.slug.trim()) {
      setError('Slug is required')
      return
    }

    setLoading(true)
    try {
      const createdForm = await formService.createForm(form)
      navigate(`/forms/${createdForm.id}/fields`)
    } catch (err) {
      setError('Failed to create form')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/forms" className="p-2 hover:bg-surface-container-low rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Create New Form</h1>
            <p className="text-on-surface-variant">Set up your payment form basics</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Form Title *</label>
            <Input
              placeholder="e.g. Q1 Invoice, Tuition Fee"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value
                setForm({ 
                  ...form, 
                  title,
                  slug: form.slug || generateSlug(title)
                })
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Slug *</label>
            <Input
              placeholder="e.g. q1-invoice"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              required
            />
            <p className="text-xs text-on-surface-variant">Used in the form URL: /pay/{form.slug || 'your-slug'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Category</label>
            <Input
              placeholder="e.g. Invoice, Fee, Donation"
              value={form.category || ''}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg min-h-[100px] resize-none"
              placeholder="Describe what this form is for..."
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Internal Note</label>
            <textarea
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg min-h-[80px] resize-none"
              placeholder="Private notes (not shown to payers)..."
              value={form.note || ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="border-t border-outline-variant/10 pt-6">
            <h3 className="text-sm font-bold mb-4">Payment Settings</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Payment Type</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg"
                  value={form.payment_type}
                  onChange={(e) => setForm({ ...form, payment_type: e.target.value as 'FIXED' | 'VARIABLE' })}
                >
                  <option value="FIXED">Fixed Amount</option>
                  <option value="VARIABLE">Variable Amount</option>
                </select>
              </div>

              {form.payment_type === 'FIXED' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Amount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded"
                  checked={form.allow_partial}
                  onChange={(e) => setForm({ ...form, allow_partial: e.target.checked })}
                />
                <div>
                  <p className="font-medium">Allow Partial Payments</p>
                  <p className="text-xs text-on-surface-variant">Let payers choose to pay less than the full amount</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate('/forms')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Form'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function FormBuilderRefinedFlow() {
  return <FormBuilder />
}

export function FormBuilderPublishStep() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface ml-64 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-3">Form Created!</h1>
          <p className="text-on-surface-variant mb-6">Your form has been created. Now add fields to collect payer information.</p>
          
          <Button onClick={() => navigate('/forms')} className="w-full">
            Go to Forms
          </Button>
        </div>
      </div>
    </div>
  )
}

interface FormBuilderAssignAudienceProps {
  onBack?: () => void
  onNext?: () => void
}

export function FormBuilderAssignAudience({ onBack, onNext }: FormBuilderAssignAudienceProps = {}) {
  return (
    <div className="min-h-screen bg-surface ml-64 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight mb-3">Assign Audience</h1>
          <p className="text-on-surface-variant mb-6">Target specific groups or contacts for this form.</p>
          <div className="flex gap-3 justify-center">
            {onBack && <Button variant="secondary" onClick={onBack}>Back</Button>}
            {onNext && <Button onClick={onNext}>Continue</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}
