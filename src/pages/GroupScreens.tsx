import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Plus, Search, Users, X, Check, Folder, FolderOpen, UserPlus, UserMinus, Loader2, RefreshCw, Send, DollarSign, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { groupService, type GroupTreeNode } from '@/services/groupService'
import { contactService } from '@/services/contactService'
import { toast } from '@/components/ui/use-toast'

interface GroupNode {
  id: string
  name: string
  contactCount: number
  children?: GroupNode[]
  expanded?: boolean
  description?: string
}

interface LocalContact {
  id: string
  name: string
  email: string
  phone?: string
  selected: boolean
}

export function GroupTreeView() {
  const navigate = useNavigate()
  const [tree, setTree] = useState<GroupTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedGroup, setSelectedGroup] = useState<GroupNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalContacts, setTotalContacts] = useState(0)
  const [totalGroups, setTotalGroups] = useState(0)

  const fetchTree = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch both group tree and contacts in parallel
      const [data, contactsResponse] = await Promise.all([
        groupService.getGroupTree(),
        contactService.getContacts({ limit: 1 })
      ])
      
      // Clean the tree data - fix escaped quotes in names and ensure proper hierarchy
      const cleanTree = (nodes: GroupTreeNode[]): GroupTreeNode[] => {
        return nodes.map(node => ({
          ...node,
          name: (node.name || 'Unnamed')
            .replace(/^["\\]+|["\\]+$/g, '') // Remove leading/trailing quotes and backslashes
            .replace(/\\"/g, '"')              // Unescape quotes
            .trim(),
          contact_count: node.contact_count ?? 0,
          children: node.children ? cleanTree(node.children) : []
        }))
      }
      
      const cleanedData = cleanTree(data)
      setTree(cleanedData)
      const rootIds = new Set(cleanedData.map(g => g.id))
      setExpanded(rootIds)
      
      // Count total groups
      const countGroups = (nodes: GroupTreeNode[]): number => {
        return nodes.reduce((acc, node) => {
          return acc + 1 + (node.children ? countGroups(node.children) : 0)
        }, 0)
      }
      
      const totalGroups = countGroups(cleanedData)
      const totalContacts = contactsResponse.total // Use true total from /contacts endpoint
      
      setTotalGroups(totalGroups)
      setTotalContacts(totalContacts)
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
      description: node.description,
      contactCount: node.contact_count || 0,
      children: node.children ? flattenTree(node.children) : undefined,
    }))
  }

  const filterTree = (nodes: GroupNode[], query: string): GroupNode[] => {
    if (!query) return nodes
    const lowerQuery = query.toLowerCase()
    return nodes.reduce((acc: GroupNode[], node) => {
      const matches = node.name.toLowerCase().includes(lowerQuery)
      const filteredChildren = node.children ? filterTree(node.children, query) : undefined
      if (matches || (filteredChildren && filteredChildren.length > 0)) {
        acc.push({
          ...node,
          children: filteredChildren,
        })
      }
      return acc
    }, [])
  }

  const renderNode = (node: GroupNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expanded.has(node.id)
    const paddingLeft = level * 24 + 12

    return (
      <div key={node.id}>
        <div 
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-lg group transition-colors ${
            selectedGroup?.id === node.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
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
          <Folder className={`h-5 w-5 ${isExpanded && hasChildren ? 'text-blue-500' : 'text-gray-400'}`} />
          <span className="flex-1 font-medium text-gray-900 truncate">{node.name}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{node.contactCount}</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/groups/${node.id}`) }}
              className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
              title="Edit group"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {hasChildren && (
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/groups/${node.id}/subgroups`) }}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                title="Manage subgroups"
              >
                <Users className="h-3.5 w-3.5" />
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
  const filteredTree = filterTree(flattenedTree, searchQuery)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-sm text-gray-500">Manage your contact groups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchTree} size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/groups/new')} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Group
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search groups..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {filteredTree.length > 0 ? (
              filteredTree.map(node => renderNode(node))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">
                  {searchQuery ? 'No groups match your search' : 'No groups yet'}
                </p>
                <p className="text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'Create your first group to get started'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedGroup ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Folder className="h-5 w-5 text-white" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-white truncate">{selectedGroup.name}</h3>
                      {selectedGroup.description && (
                        <p className="text-xs text-white/80 truncate">{selectedGroup.description}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedGroup(null)} 
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedGroup.contactCount}</p>
                    <p className="text-xs text-gray-500">Contacts</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedGroup.children?.length || 0}</p>
                    <p className="text-xs text-gray-500">Subgroups</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start" 
                    onClick={() => navigate(`/groups/${selectedGroup.id}`)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Group
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => navigate(`/groups/${selectedGroup.id}/contacts`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Contacts
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate(`/groups/new?parent=${selectedGroup.id}`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subgroup
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => navigate(`/contacts/reminder?group=${selectedGroup.id}`)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Select a group to view details</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Quick Stats
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100 text-sm">Total Groups</span>
                <span className="font-bold">{totalGroups}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100 text-sm">Total Contacts</span>
                <span className="font-bold">{totalContacts}</span>
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
  const [showAllContacts, setShowAllContacts] = useState(false)
  const [allContacts, setAllContacts] = useState<LocalContact[]>([])

  const fetchGroupContacts = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [group, contactsData] = await Promise.all([
        groupService.getGroup(id),
        groupService.getGroupContacts(id, { limit: 500 })
      ])
      setGroupName(group.name)
      setContacts(contactsData.data.map(c => ({ ...c, selected: false })))
    } catch (err) {
      console.error('Failed to load group contacts', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchAllContacts = useCallback(async () => {
    try {
      const response = await contactService.getContacts({ limit: 500 })
      setAllContacts(response.data.map(c => ({ 
        id: c.id, 
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email, 
        email: c.email,
        phone: c.phone,
        selected: false 
      })))
    } catch (err) {
      console.error('Failed to load all contacts', err)
    }
  }, [])

  useEffect(() => {
    fetchGroupContacts()
  }, [fetchGroupContacts])

  useEffect(() => {
    if (showAllContacts && allContacts.length === 0) {
      fetchAllContacts()
    }
  }, [showAllContacts, fetchAllContacts])

  const toggleContact = (contactId: string, contactList: LocalContact[], setContacts: React.Dispatch<React.SetStateAction<LocalContact[]>>) => {
    setContacts(contactList.map(c => 
      c.id === contactId ? { ...c, selected: !c.selected } : c
    ))
  }

  const handleRemoveSelected = async () => {
    if (!id) return
    const selectedIds = contacts.filter(c => c.selected).map(c => c.id)
    try {
      await groupService.removeContactsFromGroup(id, selectedIds)
      setContacts(contacts.filter(c => !c.selected))
      toast({ title: 'Success', description: `Removed ${selectedIds.length} contact(s)` })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to remove contacts', variant: 'destructive' })
      console.error(err)
    }
  }

  const handleAddContacts = async () => {
    if (!id) return
    const selectedToAdd = allContacts.filter(c => c.selected)
    if (selectedToAdd.length === 0) {
      toast({ title: 'Error', description: 'Please select contacts to add', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    try {
      await groupService.addContactsToGroup(id, selectedToAdd.map(c => c.id))
      toast({ title: 'Success', description: `Added ${selectedToAdd.length} contact(s) to group` })
      setAllContacts(allContacts.map(c => ({ ...c, selected: false })))
      setShowAllContacts(false)
      fetchGroupContacts()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add contacts', variant: 'destructive' })
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredGroupContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAllContacts = allContacts.filter(c => 
    !contacts.some(gc => gc.id === c.id) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedGroupCount = contacts.filter(c => c.selected).length
  const selectedAddCount = allContacts.filter(c => c.selected).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/groups')} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{groupName}</h1>
          <p className="text-sm text-gray-500">{contacts.length} contacts in this group</p>
        </div>
        <div className="flex gap-2">
          {!showAllContacts ? (
            <Button variant="secondary" onClick={() => setShowAllContacts(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contacts
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => { setShowAllContacts(false); setAllContacts([]); }}>
                Cancel
              </Button>
              <Button onClick={handleAddContacts} disabled={isSaving || selectedAddCount === 0}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Add {selectedAddCount > 0 ? `(${selectedAddCount})` : ''}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {showAllContacts ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search contacts to add..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredAllContacts.length > 0 ? (
              filteredAllContacts.map(contact => (
                <div 
                  key={contact.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                  onClick={() => toggleContact(contact.id, allContacts, setAllContacts)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    contact.selected 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {contact.selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No contacts available to add</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search contacts..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredGroupContacts.map(contact => (
              <div 
                key={contact.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">
                    {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setContacts(contacts.map(c => c.id === contact.id ? { ...c, selected: true } : c))
                  }}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/contacts/${contact.id}`)}>
                  View
                </Button>
              </div>
            ))}
          </div>

          {filteredGroupContacts.length === 0 && (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No contacts in this group</p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => setShowAllContacts(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contacts
              </Button>
            </div>
          )}
        </div>
      )}

      {contacts.some(c => c.selected) && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-4 border border-gray-200">
          <span className="text-sm text-gray-600">
            {selectedGroupCount} contact{selectedGroupCount > 1 ? 's' : ''} selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleRemoveSelected}>
            <UserMinus className="h-4 w-4 mr-2" />
            Remove Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setContacts(contacts.map(c => ({ ...c, selected: false })))}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
