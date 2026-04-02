import { Link } from 'react-router-dom'
import { Search, Plus, Edit, ChevronRight, UserPlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const groups = [
  { name: 'Clients', count: 45, color: 'bg-blue-500' },
  { name: 'Vendors', count: 23, color: 'bg-green-500' },
  { name: 'Partners', count: 12, color: 'bg-purple-500' },
  { name: 'Leads', count: 67, color: 'bg-orange-500' },
]

const contacts = [
  { name: 'Sarah Higgins', email: 'sarah@studio-h.co', group: 'Clients' },
  { name: 'Marcus Kray', email: 'mk@krayarch.com', group: 'Clients' },
  { name: 'Jane Lofton', email: 'jane.l@outlook.com', group: 'Leads' },
]

export function ContactsGroupsManagement() {
  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Groups</h1>
            <p className="text-gray-500">Organize your contacts into groups.</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {groups.map((group, index) => (
            <Link key={index} to={`/groups/${index + 1}`} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${group.color}`} />
                <span className="font-bold text-gray-900">{group.count}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500">{group.count} contacts</p>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">All Contacts</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-10" placeholder="Search contacts..." />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {contacts.map((contact, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{contact.group}</span>
                  <Link to={`/contacts/${index + 1}`} className="text-gray-400 hover:text-gray-600">
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export function GroupEditorView() {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">Edit Group</h1>
            <p className="text-gray-500">Update group details and members</p>
          </div>
          <Button variant="secondary">Delete Group</Button>
        </div>

        <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Group Name</label>
              <Input defaultValue="Clients" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Description</label>
              <textarea className="w-full h-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none" defaultValue="All active clients" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Color</label>
              <div className="flex gap-2">
                {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'].map((color) => (
                  <button key={color} className={`w-8 h-8 rounded-full ${color} ${color === 'bg-blue-500' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Group Members (45)</h3>
            <Button size="sm" variant="secondary" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
          <div className="space-y-3">
            {['Sarah Higgins', 'Marcus Kray', 'Jane Lofton', 'Robert Blackstone', 'Alex Chen'].map((name, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="font-medium text-gray-900">{name}</span>
                </div>
                <button className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
  )
}

export function SubgroupManagementView() {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">Subgroups</h1>
            <p className="text-gray-500">Manage subgroups within Clients</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Subgroup
          </Button>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Enterprise Clients', count: 12 },
            { name: 'SMB Clients', count: 23 },
            { name: 'Freelance Clients', count: 10 },
          ].map((subgroup, index) => (
            <div key={index} className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-gray-900">{subgroup.name}</h3>
                <p className="text-sm text-gray-500">{subgroup.count} contacts</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">Edit</Button>
                <Button size="sm" variant="ghost">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}
