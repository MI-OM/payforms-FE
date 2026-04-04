import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { notificationService } from '@/services/notificationService'
import { contactService, type Contact } from '@/services/contactService'
import { toast } from '@/components/ui/use-toast'
import { Loader, Users, Send, Search, Check, X } from 'lucide-react'

interface SelectedContact {
  id: string
  name: string
  email: string
}

export function SendReminderPage() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<SelectedContact[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await contactService.getContacts({ limit: 100 })
        setContacts(response.data)
      } catch (err) {
        console.error('Failed to load contacts:', err)
        toast({ title: 'Error', description: 'Failed to load contacts', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter((c) => {
    const name = `${c.first_name || ''} ${c.last_name || ''}`.trim().toLowerCase()
    return name.includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const toggleContact = (contact: Contact) => {
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
    const existing = selectedContacts.find((c) => c.id === contact.id)
    if (existing) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id))
    } else {
      setSelectedContacts([...selectedContacts, { id: contact.id, name: fullName, email: contact.email }])
    }
  }

  const removeContact = (id: string) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== id))
  }

  const handleSend = async () => {
    if (selectedContacts.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one contact', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      await notificationService.sendReminder({
        contact_ids: selectedContacts.map((c) => c.id),
        message: message || undefined,
      })
      setSent(true)
    } catch (err) {
      console.error('Failed to send reminders:', err)
      toast({ title: 'Error', description: 'Failed to send reminders', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-[#dcf0e7] text-[#009668] rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#191c1e] mb-2">Reminders Sent!</h2>
          <p className="text-[#45464d] mb-6">
            Payment reminders have been sent to {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}.
          </p>
          <Button className="w-full" onClick={() => navigate('/contacts')}>
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/contacts')}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">Send Payment Reminder</h1>
            <p className="text-[#45464d] mt-1">Send payment reminders to selected contacts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Contact Selection */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#45464d] mb-4">
                Select Contacts ({selectedContacts.length} selected)
              </h3>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#188ace] transition-all"
                />
              </div>

              {/* Contact List */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-[#006398]" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {filteredContacts.map((contact) => {
                    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                    const isSelected = selectedContacts.some((c) => c.id === contact.id)
                    return (
                      <div
                        key={contact.id}
                        onClick={() => toggleContact(contact)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'bg-[#188ace]/10' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-[#188ace] border-[#188ace]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isSelected ? 'text-[#188ace]' : 'text-[#191c1e]'}`}>
                            {fullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary & Send */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15 sticky top-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#45464d] mb-4">
                Reminder Summary
              </h3>

              {/* Stats */}
              <div className="bg-[#f2f4f6] rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#002113]/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#009668]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#191c1e]">{selectedContacts.length}</p>
                    <p className="text-xs text-[#45464d]">Recipients</p>
                  </div>
                </div>
              </div>

              {/* Selected Contacts */}
              {selectedContacts.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-[#45464d] uppercase tracking-widest mb-2">
                    Selected
                  </p>
                  <div className="max-h-[120px] overflow-y-auto space-y-1">
                    {selectedContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between py-2 px-3 bg-[#f2f4f6] rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#188ace]" />
                          <span className="text-sm truncate">{contact.name}</span>
                        </div>
                        <button
                          onClick={() => removeContact(contact.id)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <X className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message (Optional) */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a custom message to the reminder..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#f2f4f6] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#188ace] transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/contacts')}
                  className="flex-1"
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  className="flex-1 bg-[#000] hover:bg-[#333]"
                  disabled={sending || selectedContacts.length === 0}
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Reminders
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SendGroupReminderPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [groupIds, setGroupIds] = useState<string[]>([])

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleSend = async () => {
    if (groupIds.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one group', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      await notificationService.sendGroupReminder({
        group_ids: groupIds,
        message: message || undefined,
      })
      setSent(true)
    } catch (err) {
      console.error('Failed to send group reminders:', err)
      toast({ title: 'Error', description: 'Failed to send reminders', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-[#dcf0e7] text-[#009668] rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#191c1e] mb-2">Reminders Sent!</h2>
          <p className="text-[#45464d] mb-6">
            Payment reminders have been sent to all contacts in {groupIds.length} group{groupIds.length !== 1 ? 's' : ''}.
          </p>
          <Button className="w-full" onClick={() => navigate('/groups')}>
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-2xl mx-auto py-8 px-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">Send Group Reminder</h1>
            <p className="text-[#45464d] mt-1">Send reminders to all contacts in selected groups.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15">
          <p className="text-sm text-[#45464d] mb-6">
            This will send payment reminders to all contacts within the selected groups.
          </p>

          <div className="mb-6">
            <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a custom message to the reminder..."
              rows={4}
              className="w-full px-4 py-3 bg-[#f2f4f6] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#188ace] transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/groups')} className="flex-1" disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} className="flex-1 bg-[#000] hover:bg-[#333]" disabled={sending}>
              {sending ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send to All Groups
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
