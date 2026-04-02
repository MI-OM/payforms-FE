import { useState } from 'react'
import { Search, Filter, Download, Eye, Edit, Trash2, Check, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const contacts = [
  { name: 'Sarah Higgins', email: 'sarah@studio-h.co', group: 'Clients', selected: false },
  { name: 'Marcus Kray', email: 'mk@krayarch.com', group: 'Clients', selected: false },
  { name: 'Jane Lofton', email: 'jane.l@outlook.com', group: 'Leads', selected: false },
  { name: 'Robert Blackstone', email: 'rb@industrial.inc', group: 'Vendors', selected: false },
]

export function MoveContactToGroupView() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')

  const groups = ['Clients', 'Leads', 'Vendors', 'Partners']

  const toggleContact = (name: string) => {
    setSelectedContacts(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
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
            <div className="space-y-2">
              {contacts.map((contact, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedContacts.includes(contact.name) 
                      ? 'bg-primary-fixed text-on-primary-fixed' 
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                  onClick={() => toggleContact(contact.name)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedContacts.includes(contact.name)
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant'
                  }`}>
                    {selectedContacts.includes(contact.name) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-bold">{contact.name}</p>
                    <p className="text-xs opacity-70">{contact.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Select Group */}
          <div className="bg-surface-container-lowest rounded-xl p-6">
            <h3 className="font-bold mb-4">Move to Group</h3>
            <div className="space-y-2">
              {groups.map((group, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedGroup === group
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <FolderPlus className="h-5 w-5" />
                  <span className="font-bold">{group}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary">Cancel</Button>
          <Button disabled={selectedContacts.length === 0 || !selectedGroup}>
            Move {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
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
