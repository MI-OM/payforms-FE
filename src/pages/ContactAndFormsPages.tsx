import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, Download, Check, X, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type Contact } from '@/services/contactService'

const templates = [
  { name: 'Invoice Template', description: 'Professional invoice for services', fields: 8, uses: 245 },
  { name: 'Donation Form', description: 'Accept donations with customizable amounts', fields: 5, uses: 123 },
  { name: 'Event Registration', description: 'Register attendees for events', fields: 6, uses: 89 },
  { name: 'Contact Form', description: 'Simple contact information collection', fields: 4, uses: 312 },
]

export function FormWidgetTemplatesShowcase() {
  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Form Templates</h1>
            <p className="text-on-surface-variant">Start with a pre-built template</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Blank Form
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <div key={index} className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="bg-surface-container-low h-40 flex items-center justify-center">
                <div className="w-32 h-20 bg-white rounded-lg shadow-sm p-2">
                  <div className="h-2 bg-surface-container-high rounded mb-1" />
                  <div className="h-1 bg-surface-container-low rounded w-3/4 mb-1" />
                  <div className="h-1 bg-surface-container-low rounded w-1/2" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1">{template.name}</h3>
                <p className="text-sm text-on-surface-variant mb-3">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{template.fields} fields</span>
                  <span>{template.uses} uses</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FullStatementTemplateContact() {
  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Account Statement</h1>
              <p className="text-on-surface-variant">Sarah Higgins - Studio H</p>
            </div>
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <div className="border-b border-outline-variant/10 pb-6 mb-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Statement Period</p>
                <p className="font-bold">Jan 1 - Jan 31, 2024</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Payments</p>
                <p className="font-bold text-tertiary-container">$24,500.00</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Transactions</p>
                <p className="font-bold">3</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { date: 'Jan 24, 2024', description: 'Q1 Retainer', amount: '$12,500.00', status: 'Completed' },
              { date: 'Dec 15, 2023', description: 'Project Deposit', amount: '$8,000.00', status: 'Completed' },
              { date: 'Nov 1, 2023', description: 'Initial Consultation', amount: '$4,000.00', status: 'Completed' },
            ].map((txn, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div>
                  <p className="font-bold">{txn.description}</p>
                  <p className="text-sm text-on-surface-variant">{txn.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{txn.amount}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container font-bold">{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FullTransactionHistoryContact() {
  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Transaction History</h1>
              <p className="text-on-surface-variant">Sarah Higgins</p>
            </div>
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="divide-y divide-outline-variant/10">
            {[
              { date: 'Jan 24, 2024', form: 'Q1 Retainer', amount: '$12,500.00', status: 'Completed', ref: 'TXN-001' },
              { date: 'Dec 15, 2023', form: 'Project Deposit', amount: '$8,000.00', status: 'Completed', ref: 'TXN-002' },
              { date: 'Nov 1, 2023', form: 'Initial Consultation', amount: '$4,000.00', status: 'Completed', ref: 'TXN-003' },
              { date: 'Oct 15, 2023', form: 'Site Visit Fee', amount: '$500.00', status: 'Completed', ref: 'TXN-004' },
            ].map((txn, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <span className="text-lg font-bold">{txn.form[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold">{txn.form}</p>
                    <p className="text-sm text-on-surface-variant">{txn.date} • {txn.ref}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{txn.amount}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container font-bold">{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EditContactView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    is_active: true,
  })

  const fetchContact = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const contact = await contactService.getContact(id)
      setForm({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || '',
        is_active: contact.is_active,
      })
    } catch (err) {
      alert('Failed to load contact')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchContact()
  }, [fetchContact])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      await contactService.updateContact(id, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        is_active: form.is_active,
      })
      navigate(`/contacts/${id}`)
    } catch (err) {
      alert('Failed to update contact')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface ml-64 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl p-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-6">Edit Contact</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Name</label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Email</label>
              <Input 
                type="email" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Phone</label>
              <Input 
                type="tel" 
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(`/contacts/${id}`)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
