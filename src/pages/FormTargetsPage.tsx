import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formService, type FormTarget } from '@/services/formService'
import { groupService, type GroupTreeNode } from '@/services/groupService'
import { contactService, type Contact } from '@/services/contactService'
import { toast } from '@/components/ui/use-toast'
import { Loader, Folder, Users, Plus, X, Check, Search } from 'lucide-react'

interface SelectedTarget {
  type: 'group' | 'contact'
  id: string
  name: string
}

export function FormTargetsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [targets, setTargets] = useState<FormTarget[]>([])
  const [groups, setGroups] = useState<GroupTreeNode[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>([])
  const [activeTab, setActiveTab] = useState<'groups' | 'contacts'>('groups')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const [targetsData, groupsData, contactsResponse] = await Promise.all([
          formService.getFormTargets(id).catch(() => []),
          groupService.getGroupTree().catch(() => []),
          contactService.getContacts({ limit: 100 }).catch(() => ({ data: [] as Contact[] }))
        ])
        setTargets(targetsData)
        setGroups(groupsData)
        setContacts('data' in contactsResponse ? contactsResponse.data : contactsResponse)
        setSelectedTargets(targetsData.map(t => ({
          type: t.target_type,
          id: t.target_id,
          name: t.target_type === 'group' ? 'Group' : 'Contact'
        })))
      } catch (err) {
        console.error('Failed to load data:', err)
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const toggleTarget = (type: 'group' | 'contact', targetId: string, name: string) => {
    const exists = selectedTargets.find(t => t.id === targetId)
    if (exists) {
      setSelectedTargets(selectedTargets.filter(t => t.id !== targetId))
    } else {
      setSelectedTargets([...selectedTargets, { type, id: targetId, name }])
    }
  }

  const removeTarget = (targetId: string) => {
    setSelectedTargets(selectedTargets.filter(t => t.id !== targetId))
  }

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      const groupTargets = selectedTargets.filter(t => t.type === 'group')
      const contactTargets = selectedTargets.filter(t => t.type === 'contact')
      
      if (groupTargets.length > 0) {
        await formService.addFormTargets(id, {
          target_type: 'group',
          target_ids: groupTargets.map(t => t.id)
        })
      }
      if (contactTargets.length > 0) {
        await formService.addFormTargets(id, {
          target_type: 'contact',
          target_ids: contactTargets.map(t => t.id)
        })
      }
      
      toast({ title: 'Success', description: 'Targets updated successfully' })
      navigate(`/forms/${id}`)
    } catch (err) {
      console.error('Failed to save targets:', err)
      toast({ title: 'Error', description: 'Failed to save targets', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const flattenGroups = (nodes: GroupTreeNode[], prefix = ''): { id: string; name: string }[] => {
    const result: { id: string; name: string }[] = []
    for (const node of nodes) {
      result.push({ id: node.id, name: prefix ? `${prefix} / ${node.name}` : node.name })
      if (node.children && node.children.length > 0) {
        result.push(...flattenGroups(node.children, prefix ? `${prefix} / ${node.name}` : node.name))
      }
    }
    return result
  }

  const allGroups = flattenGroups(groups)
  const filteredGroups = allGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredContacts = contacts.filter(c => {
    const name = `${c.first_name || ''} ${c.last_name || ''}`.trim().toLowerCase()
    return name.includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#006398]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(`/forms/${id}`)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">Manage Form Targets</h1>
            <p className="text-[#45464d] mt-1">Configure who can access this form publicly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Selection */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15">
              <div className="flex gap-2 p-1 bg-[#eceef0] rounded-lg w-fit mb-4">
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'groups' ? 'bg-white text-[#191c1e] shadow-sm' : 'text-[#45464d]'
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  Groups
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'contacts' ? 'bg-white text-[#191c1e] shadow-sm' : 'text-[#45464d]'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Contacts
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#188ace] transition-all"
                />
              </div>

              {activeTab === 'groups' && (
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {filteredGroups.map(group => {
                    const isSelected = selectedTargets.some(t => t.id === group.id && t.type === 'group')
                    return (
                      <div
                        key={group.id}
                        onClick={() => toggleTarget('group', group.id, group.name)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'bg-[#188ace]/10' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-[#188ace] border-[#188ace]' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <Folder className={`h-4 w-4 ${isSelected ? 'text-[#188ace]' : 'text-slate-400'}`} />
                        <span className={`text-sm ${isSelected ? 'text-[#188ace] font-medium' : 'text-[#191c1e]'}`}>
                          {group.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {filteredContacts.map(contact => {
                    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                    const isSelected = selectedTargets.some(t => t.id === contact.id && t.type === 'contact')
                    return (
                      <div
                        key={contact.id}
                        onClick={() => toggleTarget('contact', contact.id, fullName)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'bg-[#188ace]/10' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-[#188ace] border-[#188ace]' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isSelected ? 'text-[#188ace] font-medium' : 'text-[#191c1e]'}`}>
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

          {/* Right: Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15 sticky top-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#45464d] mb-4">
                Selected Targets ({selectedTargets.length})
              </h3>

              {selectedTargets.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto space-y-1 mb-6">
                  {selectedTargets.map(target => (
                    <div
                      key={`${target.type}-${target.id}`}
                      className="flex items-center justify-between py-2 px-3 bg-[#f2f4f6] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {target.type === 'group' ? (
                          <Folder className="h-4 w-4 text-[#188ace]" />
                        ) : (
                          <Users className="h-4 w-4 text-[#188ace]" />
                        )}
                        <span className="text-sm truncate">{target.name}</span>
                      </div>
                      <button
                        onClick={() => removeTarget(target.id)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                      >
                        <X className="h-3 w-3 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#45464d] mb-6">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No targets selected</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => navigate(`/forms/${id}`)} className="flex-1" disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-[#000] hover:bg-[#333]" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
