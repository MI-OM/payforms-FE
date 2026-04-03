import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Download, Eye, Edit, Trash2, Check, FolderPlus, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type Contact } from '@/services/contactService'
import { groupService, type Group } from '@/services/groupService'

export function MoveContactToGroupView() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsResponse, groupsResponse] = await Promise.all([
          contactService.getContacts({ limit: 100 }),
          groupService.getGroups({ limit: 100 })
        ])
        setContacts(contactsResponse.data)
        setGroups(groupsResponse.data)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )
  }

  const handleMove = async () => {
    if (selectedContacts.length === 0 || !selectedGroup) return
    setIsSaving(true)
    try {
      await contactService.assignGroups(selectedGroup, selectedContacts)
      navigate('/contacts')
    } catch (err) {
      console.error('Failed to move contacts:', err)
      alert('Failed to move contacts')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Move to Group</h1>
            <p className="text-on-surface-variant">Select contacts and destination group</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Select Contacts */}
          <div className="bg-surface-container-lowest rounded-xl p-6">
            <h3 className="font-bold mb-4">Select Contacts ({selectedContacts.length})</h3>
            {contacts.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">No contacts available</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                      selectedContacts.includes(contact.id) 
                        ? 'bg-primary-fixed text-on-primary-fixed' 
                        : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                    onClick={() => toggleContact(contact.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedContacts.includes(contact.id)
                        ? 'bg-primary border-primary'
                        : 'border-outline-variant'
                    }`}>
                      {selectedContacts.includes(contact.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-bold">{contact.first_name} {contact.last_name}</p>
                      <p className="text-xs opacity-70">{contact.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Select Group */}
          <div className="bg-surface-container-lowest rounded-xl p-6">
            <h3 className="font-bold mb-4">Move to Group</h3>
            {groups.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">No groups available</p>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <div 
                    key={group.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                      selectedGroup === group.id
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <FolderPlus className="h-5 w-5" />
                    <span className="font-bold">{group.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={() => navigate('/contacts')}>Cancel</Button>
          <Button onClick={handleMove} disabled={selectedContacts.length === 0 || !selectedGroup || isSaving}>
            {isSaving ? 'Moving...' : `Move ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
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
