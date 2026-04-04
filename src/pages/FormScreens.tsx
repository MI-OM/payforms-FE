import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, Settings, AlertTriangle, X, Check, Grip, Loader, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formService, type FormField, type Form } from '@/services/formService'
import { toast } from '@/components/ui/use-toast'

const fieldTypes = [
  { value: 'TEXT', label: 'Short Text' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'SELECT', label: 'Dropdown' },
  { value: 'TEXTAREA', label: 'Long Text' },
]

export function FormFieldsManagement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [isAddingField, setIsAddingField] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [newField, setNewField] = useState<{ label: string; type: FormField['type']; required: boolean; options: string }>({ 
    label: '', 
    type: 'TEXT', 
    required: false, 
    options: '' 
  })

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const formData = await formService.getForm(id)
      setForm(formData)
      setFields(formData.fields || [])
    } catch (err) {
      console.error('Failed to load form', err)
      toast({ title: 'Error', description: 'Failed to load form data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteField = async (fieldId: string) => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this field?')) return
    
    try {
      await formService.deleteField(fieldId)
      setFields(fields.filter(f => f.id !== fieldId))
      toast({ title: 'Success', description: 'Field deleted successfully' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete field', variant: 'destructive' })
      console.error(err)
    }
  }

  const handleAddField = async () => {
    if (!id || !newField.label.trim()) {
      toast({ title: 'Error', description: 'Field label is required', variant: 'destructive' })
      return
    }
    
    setSaving(true)
    try {
      const field = await formService.createField(id, {
        label: newField.label,
        type: newField.type,
        required: newField.required,
        options: newField.type === 'SELECT' ? newField.options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
        order_index: fields.length,
      })
      setFields([...fields, field])
      setNewField({ label: '', type: 'TEXT', required: false, options: '' })
      setIsAddingField(false)
      toast({ title: 'Success', description: 'Field added successfully' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add field', variant: 'destructive' })
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateField = async () => {
    if (!editingField || !editingField.label.trim()) {
      toast({ title: 'Error', description: 'Field label is required', variant: 'destructive' })
      return
    }
    
    setSaving(true)
    try {
      const updated = await formService.updateField(editingField.id, {
        label: editingField.label,
        type: editingField.type,
        required: editingField.required,
        options: editingField.type === 'SELECT' ? editingField.options : undefined,
      })
      setFields(fields.map(f => f.id === updated.id ? updated : f))
      setEditingField(null)
      toast({ title: 'Success', description: 'Field updated successfully' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update field', variant: 'destructive' })
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const moveField = async (index: number, direction: 'up' | 'down') => {
    if (!id) return
    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newFields.length) return
    
    const temp = newFields[index]
    newFields[index] = newFields[targetIndex]
    newFields[targetIndex] = temp
    
    const reorderedFields = newFields.map((f, i) => ({ ...f, order_index: i }))
    setFields(reorderedFields)
    setHasUnsavedChanges(true)
    
    try {
      await formService.reorderFields(id, reorderedFields.map(f => ({ id: f.id, order_index: f.order_index })))
      setHasUnsavedChanges(false)
      toast({ title: 'Success', description: 'Field order updated' })
    } catch (err) {
      fetchData()
      toast({ title: 'Error', description: 'Failed to reorder fields', variant: 'destructive' })
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/forms')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{form?.title || 'Form'} Fields</h1>
            <p className="text-gray-500">Manage the fields in your payment form</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/forms/${id}/targets`}>
              <Button variant="secondary">
                Assign to Groups
              </Button>
            </Link>
            <Link to={`/forms/${id}/settings`}>
              <Button variant="secondary">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => navigate(`/forms/${id}/delete`)} className="text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Form
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Fields ({fields.length})</h2>
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Loader className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            <Button onClick={() => setIsAddingField(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">No fields yet. Add fields to collect payer information.</p>
              <Button onClick={() => setIsAddingField(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Field
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.sort((a, b) => a.order_index - b.order_index).map((field, index) => (
                <div key={field.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group">
                  <button className="cursor-grab text-gray-400 hover:text-gray-600">
                    <Grip className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => moveField(index, 'down')}
                    disabled={index === fields.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{field.label}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        field.required ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {field.type}
                      </span>
                      {field.required && <span className="text-red-500 text-xs">Required</span>}
                      {field.options && field.options.length > 0 && (
                        <span className="text-gray-400 text-xs">({field.options.length} options)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingField({ ...field })}
                      className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isAddingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Field</h3>
              <button onClick={() => setIsAddingField(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Label *</label>
                <input 
                  type="text" 
                  value={newField.label}
                  onChange={(e) => setNewField({...newField, label: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Full Name, Email Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                <select 
                  value={newField.type}
                  onChange={(e) => setNewField({...newField, type: e.target.value as FormField['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              {newField.type === 'SELECT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated) *</label>
                  <input 
                    type="text" 
                    value={newField.options}
                    onChange={(e) => setNewField({...newField, options: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter at least 2 options for dropdown</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="required"
                  checked={newField.required}
                  onChange={(e) => setNewField({...newField, required: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm text-gray-700">Required field</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setIsAddingField(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddField} disabled={saving || !newField.label.trim()}>
                {saving ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Field
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Field</h3>
              <button onClick={() => setEditingField(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Label *</label>
                <input 
                  type="text" 
                  value={editingField.label}
                  onChange={(e) => setEditingField({...editingField, label: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                <select 
                  value={editingField.type}
                  onChange={(e) => setEditingField({...editingField, type: e.target.value as FormField['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              {editingField.type === 'SELECT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated) *</label>
                  <input 
                    type="text" 
                    value={editingField.options?.join(', ') || ''}
                    onChange={(e) => setEditingField({...editingField, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="editRequired"
                  checked={editingField.required}
                  onChange={(e) => setEditingField({...editingField, required: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="editRequired" className="text-sm text-gray-700">Required field</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleUpdateField} disabled={saving || !editingField.label.trim()}>
                {saving ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function FormSettings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    title: '',
    category: 'other',
    description: '',
    note: '',
    is_active: true,
    payment_type: 'FIXED' as 'FIXED' | 'VARIABLE',
    amount: 0,
    allow_partial: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    formService.getForm(id).then(form => {
      setSettings({
        title: form.title,
        category: form.category || 'other',
        description: form.description || '',
        note: form.note || '',
        is_active: form.is_active,
        payment_type: form.payment_type,
        amount: form.amount || 0,
        allow_partial: form.allow_partial,
      })
    }).catch(err => {
      console.error('Failed to load form', err)
      toast({ title: 'Error', description: 'Failed to load form settings', variant: 'destructive' })
    }).finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      await formService.updateForm(id, {
        title: settings.title,
        category: settings.category,
        description: settings.description,
        note: settings.note,
        is_active: settings.is_active,
        amount: settings.amount,
        allow_partial: settings.allow_partial,
      })
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 2000)
      toast({ title: 'Success', description: 'Settings saved successfully' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const categories = [
    { value: 'tuition', label: 'Tuition' },
    { value: 'fees', label: 'Fees' },
    { value: 'donation', label: 'Donation' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/forms/${id}/fields`)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form Settings</h1>
            <p className="text-gray-500">Configure your payment form</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                <input 
                  type="text"
                  value={settings.title}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={settings.category}
                  onChange={(e) => updateSetting('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={settings.description}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (shown to payers)</label>
                <input 
                  type="text"
                  value={settings.note}
                  onChange={(e) => updateSetting('note', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Private note visible to payers"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Payment Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Form Active</p>
                  <p className="text-sm text-gray-500">{settings.is_active ? 'Form is accepting submissions' : 'Form is a draft'}</p>
                </div>
                <button 
                  onClick={() => updateSetting('is_active', !settings.is_active)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.is_active ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.is_active ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="paymentType"
                      checked={settings.payment_type === 'FIXED'}
                      onChange={() => updateSetting('payment_type', 'FIXED')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Fixed Amount</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="paymentType"
                      checked={settings.payment_type === 'VARIABLE'}
                      onChange={() => updateSetting('payment_type', 'VARIABLE')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Variable Amount</span>
                  </label>
                </div>
              </div>
              {settings.payment_type === 'FIXED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number"
                      value={settings.amount}
                      onChange={(e) => updateSetting('amount', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="partial"
                  checked={settings.allow_partial}
                  onChange={(e) => updateSetting('allow_partial', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="partial" className="text-sm text-gray-700">
                  Allow partial payments
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <Check className="h-4 w-4" />
                Settings saved
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormDeleteConfirmation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formName, setFormName] = useState('')

  useEffect(() => {
    if (!id) return
    formService.getForm(id).then(form => {
      setFormName(form.title)
    }).catch(err => {
      console.error('Failed to load form', err)
    }).finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await formService.deleteForm(id)
      toast({ title: 'Success', description: 'Form deleted successfully' })
      navigate('/forms')
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete form', variant: 'destructive' })
      console.error(err)
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Form?
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Are you sure you want to delete <span className="font-medium text-gray-900">"{formName}"</span>? This action cannot be undone.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> Deleting this form will also delete all associated submissions and transaction records.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/forms')}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Form
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
