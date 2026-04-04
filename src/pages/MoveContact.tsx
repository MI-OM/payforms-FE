import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, FolderPlus, Loader2, ArrowLeft, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { contactService, type Contact } from '@/services/contactService'
import { groupService, type Group } from '@/services/groupService'
import { toast } from '@/components/ui/use-toast'

export function MoveContactToGroupView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [moveStatus, setMoveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const preselectedIds = useMemo(() => {
    const ids = searchParams.get('ids')
    return ids ? ids.split(',').filter(Boolean) : []
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsResponse, groupsResponse] = await Promise.all([
          contactService.getContacts({ limit: 100 }),
          groupService.getGroups({ limit: 100 })
        ])
        setContacts(contactsResponse.data)
        setGroups(groupsResponse.data)
        if (preselectedIds.length > 0) {
          setSelectedContacts(preselectedIds)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [preselectedIds])

  const toggleContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )
  }

  const handleMove = async () => {
    if (selectedContacts.length === 0 || !selectedGroup) return
    setIsSaving(true)
    setMoveStatus('loading')
    try {
      await contactService.assignContactsToGroup(selectedGroup, selectedContacts)
      setMoveStatus('success')
      setTimeout(() => {
        navigate('/contacts')
      }, 1500)
    } catch (err) {
      console.error('Failed to move contacts:', err)
      toast({ title: 'Error', description: 'Failed to move contacts', variant: 'destructive' })
      setMoveStatus('error')
      setTimeout(() => {
        setMoveStatus('idle')
      }, 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const getFullName = (contact: Contact) => {
    return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (moveStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tighter mb-2 text-gray-900">Contacts Moved!</h3>
          <p className="text-gray-500 mb-6">
            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} have been moved to {groups.find(g => g.id === selectedGroup)?.name || 'the group'}.
          </p>
          <Button className="w-full" onClick={() => navigate('/contacts')}>
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/contacts')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Move to Group</h1>
            <p className="text-gray-500">
              {preselectedIds.length > 0 
                ? `Moving ${preselectedIds.length} selected contact${preselectedIds.length !== 1 ? 's' : ''}`
                : 'Select contacts and destination group'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-gray-900">Select Contacts ({selectedContacts.length})</h3>
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No contacts available</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                      selectedContacts.includes(contact.id) 
                        ? 'bg-blue-50 text-blue-900' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleContact(contact.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedContacts.includes(contact.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedContacts.includes(contact.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{getFullName(contact)}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-gray-900">Move to Group</h3>
            {groups.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No groups available</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groups.map((group) => (
                  <div 
                    key={group.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                      selectedGroup === group.id
                        ? 'bg-blue-50 text-blue-900'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <FolderPlus className="h-5 w-5 text-gray-400" />
                    <span className="font-bold">{group.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{group.contact_count || 0} contacts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {moveStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            There was an error moving the contacts. Please try again.
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={() => navigate('/contacts')}>Cancel</Button>
          <Button 
            onClick={handleMove} 
            disabled={selectedContacts.length === 0 || !selectedGroup || isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Moving...
              </span>
            ) : (
              `Move ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MoveContactSuccessFailureStates() {
  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8">
        {/* Success State */}
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-tertiary-fixed/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-on-tertiary-container" />
          </div>
          <h3 className="text-xl font-extrabold mb-2">Contacts Moved!</h3>
          <p className="text-on-surface-variant mb-4">2 contacts have been moved to Clients.</p>
          <Button className="w-full">Done</Button>
        </div>

        {/* Error State */}
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold mb-2">Move Failed</h3>
          <p className="text-on-surface-variant mb-4">There was an error moving the contacts.</p>
          <div className="space-y-2">
            <Button className="w-full">Try Again</Button>
            <Button variant="secondary" className="w-full">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
