import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, Download, Check, X, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type Contact, type Transaction } from '@/services/contactService'
import { organizationService } from '@/services/organizationService'
import { toast } from '@/components/ui/use-toast'

const templates = [
  { id: 'invoice', name: 'Invoice Template', description: 'Professional invoice for services', fields: 8, uses: 245 },
  { id: 'donation', name: 'Donation Form', description: 'Accept donations with customizable amounts', fields: 5, uses: 123 },
  { id: 'event', name: 'Event Registration', description: 'Register attendees for events', fields: 6, uses: 89 },
  { id: 'contact', name: 'Contact Form', description: 'Simple contact information collection', fields: 4, uses: 312 },
  { id: 'tuition', name: 'Tuition Payment', description: 'Student tuition fee collection', fields: 6, uses: 156 },
  { id: 'membership', name: 'Membership Renewal', description: 'Annual membership fee collection', fields: 4, uses: 89 },
  { id: 'donation-recurring', name: 'Recurring Donation', description: 'Monthly or annual recurring donations', fields: 5, uses: 67 },
  { id: 'product-sale', name: 'Product Sale', description: 'Sell products with fixed or variable pricing', fields: 5, uses: 234 },
]

export function FormWidgetTemplatesShowcase() {
  const navigate = useNavigate()
  
  const handleUseTemplate = (templateId: string) => {
    navigate('/forms/new')
  }
  
  return (
    <div className="min-h-screen bg-surface p-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/50 transition-colors group">
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
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-3">
                  <span>{template.fields} fields</span>
                  <span>{template.uses} uses</span>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FullStatementTemplateContact() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<Contact | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [organization, setOrganization] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const [contactData, txnData, orgData] = await Promise.all([
          contactService.getContactDetails(id),
          contactService.getContactTransactions(id, { limit: 50 }),
          organizationService.getOrganization().catch(() => null)
        ])
        setContact(contactData)
        setTransactions(txnData.data)
        setOrganization(orgData)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const fullName = contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : ''
  
  const totalPaid = transactions
    .filter(t => t.status === 'PAID')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const paidTransactions = transactions.filter(t => t.status === 'PAID')

  const handleDownloadPDF = async () => {
    try {
      const blob = await contactService.exportContactStatement(id!)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `statement-${fullName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to download statement:', err)
      toast({ title: 'Error', description: 'Failed to download statement', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/contacts/${id}`)} className="p-2 hover:bg-surface-container-low rounded-lg">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Account Statement</h1>
            <p className="text-on-surface-variant">{fullName} - {organization?.name || 'Organization'}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="grid grid-cols-3 gap-6 flex-1">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Statement Date</p>
                <p className="font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Payments</p>
                <p className="font-bold text-tertiary-container">${totalPaid.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Transactions</p>
                <p className="font-bold">{paidTransactions.length}</p>
              </div>
            </div>
            <Button variant="secondary" className="flex items-center gap-2 ml-6" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>

          {paidTransactions.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {paidTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                  <div>
                    <p className="font-bold">Payment #{txn.reference}</p>
                    <p className="text-sm text-on-surface-variant">{new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${Number(txn.amount).toFixed(2)}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container font-bold">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function FullTransactionHistoryContact() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<Contact | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const [contactData, txnData] = await Promise.all([
          contactService.getContactDetails(id),
          contactService.getContactTransactions(id, { limit: 50 })
        ])
        setContact(contactData)
        setTransactions(txnData.data)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const fullName = contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : ''

  const handleExport = async () => {
    try {
      const blob = await contactService.exportContactTransactions(id!)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${fullName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to export:', err)
      toast({ title: 'Error', description: 'Failed to export transactions', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/contacts/${id}`)} className="p-2 hover:bg-surface-container-low rounded-lg">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Transaction History</h1>
            <p className="text-on-surface-variant">{fullName}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <div>
              <p className="font-bold">{transactions.length} transactions</p>
            </div>
            <Button variant="secondary" className="flex items-center gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              No transactions found
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {transactions.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                      <span className="text-lg font-bold">{txn.reference[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold">Payment #{txn.reference}</p>
                      <p className="text-sm text-on-surface-variant">
                        {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${Number(txn.amount).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      txn.status === 'PAID' ? 'bg-tertiary-fixed/30 text-on-tertiary-container' :
                      txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      txn.status === 'PARTIAL' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    student_id: '',
    external_id: '',
    guardian_name: '',
    guardian_email: '',
    guardian_phone: '',
    is_active: true,
  })

  const fetchContact = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const contact = await contactService.getContact(id)
      setForm({
        first_name: contact.first_name || '',
        middle_name: contact.middle_name || '',
        last_name: contact.last_name || '',
        email: contact.email,
        phone: contact.phone || '',
        gender: contact.gender || '',
        student_id: contact.student_id || '',
        external_id: contact.external_id || '',
        guardian_name: contact.guardian_name || '',
        guardian_email: contact.guardian_email || '',
        guardian_phone: contact.guardian_phone || '',
        is_active: contact.is_active,
      })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load contact', variant: 'destructive' })
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
    if (!form.email || !form.first_name || !form.last_name) {
      toast({ title: 'Error', description: 'Email, first name, and last name are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await contactService.updateContact(id, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || undefined,
        is_active: form.is_active,
      })
      toast({ title: 'Success', description: 'Contact updated successfully' })
      navigate(`/contacts/${id}`)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update contact', variant: 'destructive' })
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/contacts/${id}`)}
          className="mb-4 text-[#45464d] hover:text-[#191c1e]"
        >
          ← Back to Contact
        </Button>
        <div className="bg-surface-container-lowest rounded-xl p-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-6">Edit Contact</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">First Name *</label>
                <Input 
                  value={form.first_name} 
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Middle Name</label>
                <Input 
                  value={form.middle_name} 
                  onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Last Name *</label>
                <Input 
                  value={form.last_name} 
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Email *</label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Student ID</label>
                <Input 
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">External ID</label>
                <Input 
                  value={form.external_id}
                  onChange={(e) => setForm({ ...form, external_id: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Gender</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Status</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg"
                  value={form.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="border-t border-outline-variant/10 pt-6">
              <h3 className="text-sm font-bold text-on-surface-variant mb-4">Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Guardian Name</label>
                  <Input 
                    value={form.guardian_name}
                    onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Guardian Phone</label>
                  <Input 
                    type="tel"
                    value={form.guardian_phone}
                    onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Guardian Email</label>
                <Input 
                  type="email"
                  value={form.guardian_email}
                  onChange={(e) => setForm({ ...form, guardian_email: e.target.value })}
                />
              </div>
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
