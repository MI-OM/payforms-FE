import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Check, X, Loader, Search, Users } from 'lucide-react'
import { groupService, type GroupTreeNode } from '@/services/groupService'
import { formService } from '@/services/formService'
import { toast } from '@/components/ui/use-toast'

interface Group extends GroupTreeNode {
  contact_count?: number
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
    ? (group.children?.reduce((sum, c) => sum + (c.contact_count || 0), 0) || 0)
    : (group.contact_count || 0)

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
                <span className="text-xs text-slate-400">{child.contact_count || 0} contacts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface SelectedGroup {
  id: string
  name: string
  fullName: string
}

export function FormAssignGroupsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GroupTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set())
  const [assignedGroupIds, setAssignedGroupIds] = useState<Set<string>>(new Set())
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const [groupsData, formGroupsData] = await Promise.all([
          groupService.getGroupTree(),
          formService.getFormGroups(id).catch(() => [])
        ])
        setGroups(groupsData)
        setAssignedGroupIds(new Set(formGroupsData.map((g: { id: string }) => g.id)))
        setSelectedGroupIds(new Set(formGroupsData.map((g: { id: string }) => g.id)))
        if (groupsData.length > 0) {
          setExpandedGroups(new Set([groupsData[0].id]))
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
      } finally {
        setLoading(false)
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [id])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const selectGroup = (groupId: string, name: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const selectChild = (child: Group, parentName: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(child.id)) {
        next.delete(child.id)
      } else {
        next.add(child.id)
      }
      return next
    })
  }

  const selectedGroups: SelectedGroup[] = groups.flatMap((g) => {
    const selected: SelectedGroup[] = []
    if (selectedGroupIds.has(g.id)) {
      selected.push({ id: g.id, name: g.name, fullName: g.name })
    }
    g.children?.forEach((c) => {
      if (selectedGroupIds.has(c.id)) {
        selected.push({ id: c.id, name: c.name, fullName: `${g.name} / ${c.name}` })
      }
    })
    return selected
  })

  const totalContacts = selectedGroupIds.size > 0
    ? groups.reduce((sum, g) => {
        if (selectedGroupIds.has(g.id)) {
          return sum + (g.children?.reduce((s, c) => s + (c.contact_count || 0), 0) || g.contact_count || 0)
        }
        g.children?.forEach((c) => {
          if (selectedGroupIds.has(c.id)) {
            sum += c.contact_count || 0
          }
        })
        return sum
      }, 0)
    : 0

  const hasChanges = JSON.stringify([...selectedGroupIds].sort()) !== JSON.stringify([...assignedGroupIds].sort())

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await formService.addFormGroups(id, [...selectedGroupIds])
      setAssignedGroupIds(new Set(selectedGroupIds))
      toast({ title: 'Success', description: 'Groups assigned successfully' })
      navigate(`/forms/${id}`)
    } catch (err) {
      console.error('Failed to save groups:', err)
      toast({ title: 'Error', description: 'Failed to save groups', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedGroupIds(new Set(assignedGroupIds))
    navigate(`/forms/${id}`)
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#006398]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate(`/forms/${id}`)}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-['Manrope'] font-extrabold tracking-tight text-[#191c1e]">
              Assign Groups
            </h1>
            <p className="text-[#45464d] mt-1">
              Select which groups can access this form.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Group Selection */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/15">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#45464d]">
                  Available Groups
                </h3>
                <span className="text-xs text-[#45464d]">
                  {selectedGroupIds.size} selected
                </span>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-[#006398]" />
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12 text-[#45464d]">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No groups available</p>
                  <p className="text-xs mt-1">Create groups to assign them to forms</p>
                </div>
              ) : (
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
              )}
            </div>
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
              {selectedGroups.length > 0 ? (
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold text-[#45464d] uppercase tracking-widest">
                    Selected ({selectedGroups.length})
                  </p>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {selectedGroups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between py-2 px-3 bg-[#f2f4f6] rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-[#188ace]" />
                          <span className="text-sm">{group.fullName}</span>
                        </div>
                        <button
                          onClick={() => selectGroup(group.id, group.name)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <X className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#45464d] mb-6">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No groups selected</p>
                  <p className="text-xs">Select groups above to assign</p>
                </div>
              )}

              {/* Warning */}
              {selectedGroups.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> If no groups are selected, the form will be available to all contacts.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#000] hover:bg-[#333]"
                  disabled={saving || !hasChanges}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
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
