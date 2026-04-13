import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Mail, Phone, Building, MapPin, Calendar, Edit, Trash2, History, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { contactService, type ContactDetails, type Transaction } from '@/services/contactService'
import { toast } from '@/components/ui/use-toast'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function ContactProfileManagement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<ContactDetails | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchContact = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [contactData, txnData] = await Promise.all([
        contactService.getContactDetails(id),
        contactService.getContactTransactions(id, { limit: 5 })
      ])
      setContact(contactData)
      setTransactions(txnData.data)
    } catch (err) {
      setError('Failed to load contact')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchContact()
  }, [fetchContact])

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this contact?')) return
    setDeleting(true)
    try {
      await contactService.deleteContact(id)
      navigate('/contacts')
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete contact', variant: 'destructive' })
      console.error(err)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Contact not found'}</p>
          <Button onClick={() => navigate('/contacts')}>Back to Contacts</Button>
        </div>
      </div>
    )
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/contacts')}
          className="mb-4 text-[#45464d] hover:text-[#191c1e]"
        >
          ← Back to Contacts
        </Button>
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <div className="bg-primary-container p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white">
                  <AvatarFallback className="text-xl">{getInitials(fullName)}</AvatarFallback>
                </Avatar>
                <div className="text-on-primary-container">
                  <h1 className="text-2xl font-extrabold tracking-tight">{fullName}</h1>
                  <p className="text-on-primary-container/70">{contact.email}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/contacts/${id}/edit`)}>Edit Profile</Button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Email</p>
                <p className="font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> {contact.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Phone</p>
                <p className="font-medium flex items-center gap-2"><Phone className="h-4 w-4" /> {contact.phone || 'N/A'}</p>
              </div>
              {contact.student_id && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Student ID</p>
                  <p className="font-medium">{contact.student_id}</p>
                </div>
              )}
              {contact.guardian_name && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Guardian</p>
                  <p className="font-medium">{contact.guardian_name}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Groups</p>
                <p className="font-medium">{contact.group_hierarchy?.join(' > ') || 'None'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Added On</p>
                <p className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(contact.created_at)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p className="text-gray-500">No transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                      <div>
                        <p className="font-bold">{txn.reference}</p>
                        <p className="text-sm text-on-surface-variant">{formatDate(txn.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(txn.amount)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          txn.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
              <Link to={`/contacts/${id}/transactions`} className="flex-1">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  <History className="h-4 w-4" />
                  View All Payments
                </Button>
              </Link>
              <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2" onClick={() => navigate(`/contacts/${id}/edit`)}>
                <Edit className="h-4 w-4" />
                Edit Contact
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2 text-error" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
