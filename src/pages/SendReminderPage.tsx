import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<SelectedContact[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sent, setSent] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const params: { limit?: number; group_id?: string } = { limit: 100 }
        
        // Check for group query param
        const groupId = searchParams.get('group')
        if (groupId) {
          params.group_id = groupId
        }
        
        const response = await contactService.getContacts(params)
        setContacts(response.data)
        
        // Pre-select contacts from URL query param
        const preselectedIds = searchParams.get('ids')
        if (preselectedIds) {
          const idsArray = preselectedIds.split(',')
          const preselected = response.data
            .filter(c => idsArray.includes(c.id))
            .map(c => ({
              id: c.id,
              name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
              email: c.email
            }))
          setSelectedContacts(preselected)
        } else if (groupId) {
          // If group param exists, select all contacts from that group
          const groupContacts = response.data.map(c => ({
            id: c.id,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
            email: c.email
          }))
          setSelectedContacts(groupContacts)
        }
      } catch (err) {
        console.error('Failed to load contacts:', err)
        toast({ title: 'Error', description: 'Failed to load contacts', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [searchParams])

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

    if (attachment && attachment.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Attachment must be less than 10MB', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      await notificationService.sendReminder({
        contact_ids: selectedContacts.map((c) => c.id),
        message: message || undefined,
        attachment: attachment || undefined,
      })
      setSent(true)
    } catch (err) {
      console.error('Failed to send reminders:', err)
      toast({ title: 'Error', description: 'Failed to send reminders', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAttachmentError('File must be less than 10MB')
        setAttachment(null)
      } else {
        setAttachmentError(null)
        setAttachment(file)
      }
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    setAttachmentError(null)
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

              {/* Attachment (Optional) */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-2">
                  Attachment (Optional, max 10MB)
                </label>
                {!attachment ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="attachment"
                      className="hidden"
                      onChange={handleAttachmentChange}
                      accept="*/*"
                    />
                    <label
                      htmlFor="attachment"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-500">Click to upload attachment</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[#f2f4f6] rounded-lg p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <svg className="h-5 w-5 text-[#188ace] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm truncate">{attachment.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={removeAttachment}
                      className="p-1 hover:bg-slate-200 rounded flex-shrink-0"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                )}
                {attachmentError && (
                  <p className="text-xs text-red-500 mt-1">{attachmentError}</p>
                )}
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
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleSend = async () => {
    if (groupIds.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one group', variant: 'destructive' })
      return
    }

    if (attachment && attachment.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Attachment must be less than 10MB', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      await notificationService.sendGroupReminder({
        group_ids: groupIds,
        message: message || undefined,
        attachment: attachment || undefined,
      })
      setSent(true)
    } catch (err) {
      console.error('Failed to send group reminders:', err)
      toast({ title: 'Error', description: 'Failed to send reminders', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAttachmentError('File must be less than 10MB')
        setAttachment(null)
      } else {
        setAttachmentError(null)
        setAttachment(file)
      }
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    setAttachmentError(null)
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

          {/* Attachment (Optional) */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-2">
              Attachment (Optional, max 10MB)
            </label>
            {!attachment ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="group-attachment"
                  className="hidden"
                  onChange={handleAttachmentChange}
                  accept="*/*"
                />
                <label
                  htmlFor="group-attachment"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-500">Click to upload attachment</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-[#f2f4f6] rounded-lg p-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <svg className="h-5 w-5 text-[#188ace] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm truncate">{attachment.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={removeAttachment}
                  className="p-1 hover:bg-slate-200 rounded flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}
            {attachmentError && (
              <p className="text-xs text-red-500 mt-1">{attachmentError}</p>
            )}
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
