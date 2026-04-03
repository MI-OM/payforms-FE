import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Plus, Search, Users, X, Check, Folder, FolderOpen, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { groupService, type GroupTreeNode, type Contact } from '@/services/groupService'

interface GroupNode {
  id: string
  name: string
  contactCount: number
  children?: GroupNode[]
  expanded?: boolean
}

interface LocalContact {
  id: string
  name: string
  email: string
  selected: boolean
}

export function GroupTreeView() {
  const navigate = useNavigate()
  const [tree, setTree] = useState<GroupTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedGroup, setSelectedGroup] = useState<GroupNode | null>(null)

  const fetchTree = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await groupService.getGroupTree()
      setTree(data)
      const rootIds = new Set(data.map(g => g.id))
      setExpanded(rootIds)
    } catch (err) {
      setError('Failed to load groups')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  const toggleExpand = (nodeId: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const flattenTree = (nodes: GroupTreeNode[]): GroupNode[] => {
    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      contactCount: node.contact_count || 0,
      children: node.children ? flattenTree(node.children) : undefined,
    }))
  }

  const renderNode = (node: GroupNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expanded.has(node.id)
    const paddingLeft = level * 24 + 12

    return (
      <div key={node.id}>
        <div 
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-lg group ${
            selectedGroup?.id === node.id ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft }}
          onClick={() => setSelectedGroup(node)}
        >
          {hasChildren ? (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id) }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          {isExpanded && hasChildren ? (
            <FolderOpen className="h-5 w-5 text-blue-500" />
          ) : (
            <Folder className="h-5 w-5 text-gray-400" />
          )}
          <span className="flex-1 font-medium text-gray-900">{node.name}</span>
          <span className="text-sm text-gray-500">{node.contactCount}</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/groups/${node.id}`) }}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="Edit group"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            {hasChildren && (
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/groups/${node.id}/subgroups`) }}
                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                title="Manage subgroups"
              >
                <Users className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const flattenedTree = flattenTree(tree)
  const totalContacts = flattenedTree.reduce((sum, node) => sum + node.contactCount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ml-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-500">Manage your contact groups</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/contacts')}>
              <Users className="h-4 w-4 mr-2" />
              All Contacts
            </Button>
            <Button onClick={() => navigate('/groups/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search groups..." className="pl-10" />
              </div>
            </div>
            <div className="p-4">
              {flattenedTree.map(node => renderNode(node))}
              {!loading && flattenedTree.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No groups yet. Create your first group to get started.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {selectedGroup ? (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">{selectedGroup.name}</h3>
                  <button onClick={() => setSelectedGroup(null)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Contacts</span>
                    <span className="font-medium">{selectedGroup.contactCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subgroups</span>
                    <span className="font-medium">{selectedGroup.children?.length || 0}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" className="flex-1" onClick={() => navigate(`/groups/${selectedGroup.id}`)}>
                      View Details
                    </Button>
                    <Button className="flex-1" onClick={() => navigate(`/groups/${selectedGroup.id}/contacts`)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contacts
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select a group to view details</p>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-bold text-blue-900 mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Groups</span>
                  <span className="font-medium text-blue-900">{flattenedTree.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Contacts</span>
                  <span className="font-medium text-blue-900">{totalContacts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GroupContactsManagement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<LocalContact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddMode, setIsAddMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [groupName, setGroupName] = useState('Group')

  const fetchGroupContacts = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [group, contactsData] = await Promise.all([
        groupService.getGroup(id),
        groupService.getGroupContacts(id, { limit: 100 })
      ])
      setGroupName(group.name)
      setContacts(contactsData.data.map(c => ({ ...c, selected: false })))
    } catch (err) {
      console.error('Failed to load group contacts', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGroupContacts()
  }, [fetchGroupContacts])

  const toggleContact = (contactId: string) => {
    setContacts(contacts.map(c => 
      c.id === contactId ? { ...c, selected: !c.selected } : c
    ))
  }

  const handleRemoveSelected = async () => {
    if (!id) return
    const selectedIds = contacts.filter(c => c.selected).map(c => c.id)
    try {
      await Promise.all(selectedIds.map(contactId => groupService.removeContactFromGroup(id, contactId)))
      setContacts(contacts.filter(c => !c.selected))
    } catch (err) {
      alert('Failed to remove contacts')
      console.error(err)
    }
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      const selectedIds = contacts.filter(c => c.selected).map(c => c.id)
      if (selectedIds.length > 0) {
        await groupService.addContactsToGroup(id, selectedIds)
      }
      setIsAddMode(false)
      setContacts(contacts.map(c => ({ ...c, selected: false })))
    } catch (err) {
      alert('Failed to add contacts')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCount = contacts.filter(c => c.selected).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ml-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/groups')} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{groupName} Contacts</h1>
            <p className="text-gray-500">{contacts.length} contacts in this group</p>
          </div>
          <Button variant="secondary" onClick={() => setIsAddMode(!isAddMode)}>
            {isAddMode ? 'Done Adding' : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contacts
              </>
            )}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search contacts..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAddMode && selectedCount > 0 && (
              <Button variant="ghost" onClick={handleRemoveSelected}>
                <UserMinus className="h-4 w-4 mr-2" />
                Remove ({selectedCount})
              </Button>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {filteredContacts.map(contact => (
              <div 
                key={contact.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 ${
                  isAddMode ? 'cursor-pointer' : ''
                }`}
                onClick={() => isAddMode && toggleContact(contact.id)}
              >
                {isAddMode && (
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    contact.selected 
                      ? 'bg-red-500 border-red-500' 
                      : 'border-gray-300'
                  }`}>
                    {contact.selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                )}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
                {!isAddMode && (
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/contacts/${contact.id}`)}>
                    View
                  </Button>
                )}
              </div>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No contacts found</p>
            </div>
          )}
        </div>

        {isAddMode && contacts.some(c => c.selected) && (
          <div className="flex justify-end mt-4 gap-3">
            <Button variant="ghost" onClick={handleRemoveSelected}>
              <UserMinus className="h-4 w-4 mr-2" />
              Remove {selectedCount} Contact{selectedCount > 1 ? 's' : ''}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
