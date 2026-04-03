import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown, Users, Search, Check, X, Folder, FolderOpen, Loader } from 'lucide-react'
import { groupService, type GroupTreeNode } from '@/services/groupService'
import { contactService, type Contact } from '@/services/contactService'

interface SelectedTarget {
  type: 'group' | 'contact'
  id: string
  name: string
}

interface Group extends GroupTreeNode {
  contactCount?: number
}

interface GroupTreeItemProps {
  group: Group
  selectedIds: Set<string>
  expandedGroups: Set<string>
  onToggle: (id: string) => void
  onSelect: (id: string, name: string) => void
  onSelectChild: (child: Group, parentName: string) => void
  depth?: number
}

function GroupTreeItem({ group, selectedIds, expandedGroups, onToggle, onSelect, onSelectChild, depth = 0 }: GroupTreeItemProps) {
  const hasChildren = group.children && group.children.length > 0
  const isExpanded = expandedGroups.has(group.id)
  const isSelected = selectedIds.has(group.id)
  const totalCount = hasChildren
    ? (group.children?.reduce((sum, c) => sum + (c.contactCount || 0), 0) || 0)
    : (group.contactCount || 0)

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all',
          isSelected ? 'bg-[#188ace]/10 text-[#188ace]' : 'hover:bg-slate-100',
          depth > 0 && 'ml-6'
        )}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(group.id)}
            className="p-0.5 hover:bg-slate-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <button
          onClick={() => onSelect(group.id, group.name)}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-[#188ace] border-[#188ace]'
              : 'border-slate-300 hover:border-[#188ace]'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </button>

        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-[#188ace]" />
        ) : (
          <Folder className="h-4 w-4 text-slate-400" />
        )}

        <div className="flex-1 flex items-center justify-between">
          <span className={cn('text-sm font-medium', isSelected && 'text-[#188ace]')}>
            {group.name}
          </span>
          <span className="text-xs text-slate-400">{totalCount} contacts</span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {group.children?.map((child) => (
            <div
              key={child.id}
              onClick={() => onSelectChild(child, group.name)}
              className={cn(
                'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all ml-6',
                selectedIds.has(child.id) ? 'bg-[#188ace]/10 text-[#188ace]' : 'hover:bg-slate-100'
              )}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectChild(child, group.name)
                }}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  selectedIds.has(child.id)
                    ? 'bg-[#188ace] border-[#188ace]'
                    : 'border-slate-300 hover:border-[#188ace]'
                )}
              >
                {selectedIds.has(child.id) && <Check className="h-3 w-3 text-white" />}
              </button>

              <Folder className={cn('h-4 w-4', selectedIds.has(child.id) ? 'text-[#188ace]' : 'text-slate-400')} />

              <div className="flex-1 flex items-center justify-between">
                <span className={cn('text-sm', selectedIds.has(child.id) && 'text-[#188ace]')}>
                  {child.name}
                </span>
                <span className="text-xs text-slate-400">{child.contactCount} contacts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ContactSelectItemProps {
  contact: Contact
  isSelected: boolean
  onToggle: () => void
}

function ContactSelectItem({ contact, isSelected, onToggle }: ContactSelectItemProps) {
  const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
  return (
    <div
      onClick={onToggle}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-50',
        isSelected && 'bg-[#188ace]/10'
      )}
    >
      <button
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
          isSelected
            ? 'bg-[#188ace] border-[#188ace]'
            : 'border-slate-300 hover:border-[#188ace]'
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isSelected && 'text-[#188ace]')}>
          {fullName}
        </p>
        <p className="text-xs text-slate-400 truncate">{contact.email}</p>
      </div>
    </div>
  )
}

interface FormBuilderAssignAudienceProps {
  onBack: () => void
  onNext: (selectedTargets: SelectedTarget[]) => void
}

export function FormBuilderAssignAudience({ onBack, onNext }: FormBuilderAssignAudienceProps) {
  const [groups, setGroups] = useState<GroupTreeNode[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set())
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set())
  const [contactSearch, setContactSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'groups' | 'contacts'>('groups')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsData, contactsData] = await Promise.all([
          groupService.getGroupTree(),
          contactService.getContacts({ limit: 100 })
        ])
        setGroups(groupsData)
        setContacts(contactsData.data)
        if (groupsData.length > 0) {
          setExpandedGroups(new Set([groupsData[0].id]))
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectGroup = (id: string, name: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectChild = (child: Group, parentName: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      const fullName = `${parentName} / ${child.name}`
      if (next.has(child.id)) {
        next.delete(child.id)
      } else {
        next.add(child.id)
      }
      return next
    })
  }

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedGroups = groups.flatMap((g) => {
    const selected: SelectedTarget[] = []
    if (selectedGroupIds.has(g.id)) {
      selected.push({ type: 'group', id: g.id, name: g.name })
    }
    g.children?.forEach((c) => {
      if (selectedGroupIds.has(c.id)) {
        selected.push({ type: 'group', id: c.id, name: `${g.name} / ${c.name}` })
      }
    })
    return selected
  })

  const selectedContacts = contacts
    .filter((c) => selectedContactIds.has(c.id))
    .map((c) => ({ type: 'contact' as const, id: c.id, name: `${c.first_name || ''} ${c.last_name || ''}`.trim() }))

  const allSelectedTargets = [...selectedGroups, ...selectedContacts]

  const filteredContacts = contacts.filter(
    (c) => {
      const name = `${c.first_name || ''} ${c.last_name || ''}`.trim()
      return name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearch.toLowerCase())
    }
  )

  const totalContacts = selectedGroupIds.size > 0
    ? groups.reduce((sum, g) => {
        if (selectedGroupIds.has(g.id)) {
          return sum + (g.children?.reduce((s, c) => s + (c.contactCount || 0), 0) || g.contactCount || 0)
        }
        g.children?.forEach((c) => {
          if (selectedGroupIds.has(c.id)) {
            sum += c.contactCount || 0
          }
        })
        return sum
      }, 0)
    : selectedContactIds.size

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-[#c6c6cd]/30 -z-0"></div>
            <div className="z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#002113] text-white flex items-center justify-center font-bold text-sm">1</div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#009668]">Basic Info</span>
            </div>
            <div className="z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#002113] text-white flex items-center justify-center font-bold text-sm">2</div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#009668]">Add Fields</span>
            </div>
            <div className="z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#000] text-white flex items-center justify-center font-bold text-sm">3</div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#191c1e]">Assign Audience</span>
            </div>
            <div className="z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#e0e3e5] text-[#45464d] flex items-center justify-center font-bold text-sm border border-[#c6c6cd]/20">4</div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#45464d]">Publish</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-['Manrope'] font-extrabold tracking-tight text-[#191c1e]">
            Assign Audience
          </h1>
          <p className="text-[#45464d] mt-1">
            Select which groups or individual contacts can access this form.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-[#eceef0] rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('groups')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all',
                  activeTab === 'groups'
                    ? 'bg-white text-[#191c1e] shadow-sm'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                )}
              >
                <Folder className="h-4 w-4" />
                Groups
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all',
                  activeTab === 'contacts'
                    ? 'bg-white text-[#191c1e] shadow-sm'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                )}
              >
                <Users className="h-4 w-4" />
                Individual Contacts
              </button>
            </div>

            {/* Groups Tree View */}
            {activeTab === 'groups' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#45464d]">
                    Target Groups
                  </h3>
                  <span className="text-xs text-[#45464d]">
                    {selectedGroupIds.size} selected
                  </span>
                </div>
                <div className="space-y-1">
                  {groups.map((group) => (
                    <GroupTreeItem
                      key={group.id}
                      group={group}
                      selectedIds={selectedGroupIds}
                      expandedGroups={expandedGroups}
                      onToggle={toggleGroup}
                      onSelect={selectGroup}
                      onSelectChild={selectChild}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Individual Contacts */}
            {activeTab === 'contacts' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#45464d]">
                    Individual Contacts
                  </h3>
                  <span className="text-xs text-[#45464d]">
                    {selectedContactIds.size} selected
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#188ace] transition-all"
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {filteredContacts.map((contact) => (
                    <ContactSelectItem
                      key={contact.id}
                      contact={contact}
                      isSelected={selectedContactIds.has(contact.id)}
                      onToggle={() => toggleContact(contact.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#45464d] mb-4">
                Selection Summary
              </h3>

              {/* Stats */}
              <div className="bg-[#f2f4f6] rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#002113]/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#009668]" />
                  </div>
                  <div>
                    <p className="text-2xl font-['Manrope'] font-bold text-[#191c1e]">
                      {totalContacts}
                    </p>
                    <p className="text-xs text-[#45464d]">Total Contacts</p>
                  </div>
                </div>
              </div>

              {/* Selected Items */}
              {allSelectedTargets.length > 0 ? (
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold text-[#45464d] uppercase tracking-widest">
                    Selected ({allSelectedTargets.length})
                  </p>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {allSelectedTargets.map((target) => (
                      <div
                        key={target.id}
                        className="flex items-center justify-between py-2 px-3 bg-[#f2f4f6] rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {target.type === 'group' ? (
                            <Folder className="h-4 w-4 text-[#188ace]" />
                          ) : (
                            <Users className="h-4 w-4 text-[#188ace]" />
                          )}
                          <span className="text-sm">{target.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (target.type === 'group') {
                              setSelectedGroupIds((prev) => {
                                const next = new Set(prev)
                                next.delete(target.id)
                                return next
                              })
                            } else {
                              setSelectedContactIds((prev) => {
                                const next = new Set(prev)
                                next.delete(target.id)
                                return next
                              })
                            }
                          }}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <X className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#45464d]">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No targets selected</p>
                  <p className="text-xs">Select groups or contacts above</p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> If no targets are selected, the form will be available to all contacts.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => onNext(allSelectedTargets)}
                  className="flex-1 bg-[#000] hover:bg-[#333]"
                >
                  Continue to Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
