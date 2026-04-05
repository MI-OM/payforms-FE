import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formService, type Form } from '@/services/formService'

export function FormSettings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Partial<Form>>({})
  const [formSettings, setFormSettings] = useState({
    title: '',
    slug: '',
    category: '',
    description: '',
    note: '',
    payment_type: 'FIXED' as 'FIXED' | 'VARIABLE',
    amount: 0,
    allow_partial: false,
    is_active: true,
  })

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await formService.getForm(id)
        setForm(data)
        setFormSettings({
          title: data.title,
          slug: data.slug,
          category: data.category || '',
          description: data.description || '',
          note: data.note || '',
          payment_type: data.payment_type,
          amount: data.amount || 0,
          allow_partial: data.allow_partial,
          is_active: data.is_active,
        })
      } catch (err) {
        setError('Failed to load form')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [id])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setError('')
    try {
      await formService.updateForm(id, {
        title: formSettings.title,
        slug: formSettings.slug,
        category: formSettings.category || undefined,
        description: formSettings.description || undefined,
        note: formSettings.note || undefined,
        amount: formSettings.amount,
        allow_partial: formSettings.allow_partial,
        is_active: formSettings.is_active,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError('Failed to save changes')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface ml-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/forms/${id}/fields`} className="p-2 hover:bg-surface-container-low rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Form Settings</h1>
            <p className="text-on-surface-variant">Edit form details and payment settings</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 space-y-6">
            <h3 className="font-bold">Basic Information</h3>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Form Title</label>
              <Input
                value={formSettings.title}
                onChange={(e) => setFormSettings({ ...formSettings, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Slug</label>
              <Input
                value={formSettings.slug}
                onChange={(e) => setFormSettings({ ...formSettings, slug: e.target.value })}
              />
              <p className="text-xs text-on-surface-variant">URL: /pay/{formSettings.slug}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Category</label>
              <Input
                value={formSettings.category}
                onChange={(e) => setFormSettings({ ...formSettings, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg min-h-[80px] resize-none"
                value={formSettings.description}
                onChange={(e) => setFormSettings({ ...formSettings, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Internal Note</label>
              <textarea
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg min-h-[80px] resize-none"
                value={formSettings.note}
                onChange={(e) => setFormSettings({ ...formSettings, note: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 space-y-6">
            <h3 className="font-bold">Payment Settings</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Payment Type</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg"
                  value={formSettings.payment_type}
                  onChange={(e) => setFormSettings({ ...formSettings, payment_type: e.target.value as 'FIXED' | 'VARIABLE' })}
                >
                  <option value="FIXED">Fixed Amount</option>
                  <option value="VARIABLE">Variable Amount</option>
                </select>
              </div>

              {formSettings.payment_type === 'FIXED' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Amount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formSettings.amount}
                    onChange={(e) => setFormSettings({ ...formSettings, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded"
                  checked={formSettings.allow_partial}
                  onChange={(e) => setFormSettings({ ...formSettings, allow_partial: e.target.checked })}
                />
                <div>
                  <p className="font-medium">Allow Partial Payments</p>
                  <p className="text-xs text-on-surface-variant">Let payers choose to pay less than the full amount</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 space-y-6">
            <h3 className="font-bold">Status</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded"
                checked={formSettings.is_active}
                onChange={(e) => setFormSettings({ ...formSettings, is_active: e.target.checked })}
              />
              <div>
                <p className="font-medium">Form Active</p>
                <p className="text-xs text-on-surface-variant">Inactive forms cannot receive payments</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate(`/forms/${id}/fields`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
