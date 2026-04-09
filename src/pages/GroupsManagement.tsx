import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Plus, Edit, ChevronRight, UserPlus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { groupService, type Group, type Contact } from '@/services/groupService'
import { toast } from '@/components/ui/use-toast'

export function ContactsGroupsManagement() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    groupService.getGroups({ limit: 100 }).then(response => {
      setGroups(response.data)
    }).catch(err => {
      console.error('Failed to load groups', err)
    }).finally(() => setLoading(false))
  }, [])

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Groups</h1>
            <p className="text-gray-500">Organize your contacts into groups.</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => navigate('/groups/new')}>
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {groups.map((group, index) => (
            <Link key={group.id} to={`/groups/${group.id}`} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="font-bold text-gray-900">{group.contact_count ?? group.contactCount ?? 0}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500">{group.contact_count ?? group.contactCount ?? 0} contacts</p>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">All Groups</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-10" placeholder="Search groups..." />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {groups.map((group) => (
              <div key={group.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {(group.name || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-500">{group.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{group.contact_count ?? group.contactCount ?? 0} contacts</span>
                  <Link to={`/groups/${group.id}`} className="text-gray-400 hover:text-gray-600">
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
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<{ id: string; first_name?: string; last_name?: string; email?: string }[]>([])
  const [parentGroup, setParentGroup] = useState<Group | null>(null)
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [form, setForm] = useState({ name: '', description: '', parent_group_id: '' as string | undefined })

  const parentGroupId = searchParams.get('parent')

  useEffect(() => {
    if (!id) {
      groupService.getGroups({ limit: 100 }).then(response => {
        setAllGroups(response.data)
      }).catch(err => {
        console.error('Failed to load groups', err)
      })
    }
  }, [id])

  useEffect(() => {
    if (!id) {
      if (parentGroupId) {
        groupService.getGroup(parentGroupId).then(parent => {
          setParentGroup(parent)
          setForm(prev => ({ ...prev, parent_group_id: parentGroupId }))
        }).catch(err => {
          console.error('Failed to load parent group', err)
        })
      }
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      groupService.getGroup(id),
      groupService.getGroupContacts(id, { limit: 50 })
    ]).then(([groupData, contactsData]) => {
      setGroup(groupData)
      setForm({ name: groupData.name, description: groupData.description || '' })
      setMembers(contactsData.data)
    }).catch(err => {
      console.error('Failed to load group', err)
    }).finally(() => setLoading(false))
  }, [id, parentGroupId])

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Group name is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      if (id) {
        await groupService.updateGroup(id, { name: form.name, description: form.description })
      } else {
        const createData = {
          name: form.name,
          description: form.description,
          parent_group_id: form.parent_group_id || undefined
        }
        await groupService.createGroup(createData)
      }
      navigate(id ? (parentGroupId ? `/groups/${parentGroupId}/subgroups` : '/groups') : (form.parent_group_id ? `/groups/${form.parent_group_id}/subgroups` : '/groups'))
      toast({ title: 'Success', description: `Group ${id ? 'updated' : 'created'} successfully` })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save group', variant: 'destructive' })
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this group?')) return
    try {
      await groupService.deleteGroup(id)
      navigate('/groups')
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete group', variant: 'destructive' })
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const isSubgroup = !id && parentGroupId

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(id ? `/groups/${id}` : (isSubgroup && parentGroupId ? `/groups/${parentGroupId}/subgroups` : '/groups'))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              {isSubgroup && parentGroup && (
                <button 
                  onClick={() => navigate(`/groups/${parentGroupId}`)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to {parentGroup.name}
                </button>
              )}
              <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">
                {id ? 'Edit' : isSubgroup ? 'Create Subgroup' : 'Create'} Group
              </h1>
              <p className="text-gray-500">
                {id ? 'Update group details and members' : isSubgroup ? `Add a subgroup under ${parentGroup?.name || 'parent group'}` : 'Create a new contact group'}
              </p>
            </div>
          </div>
          {id && <Button variant="secondary" onClick={handleDelete}>Delete Group</Button>}
        </div>

        <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
          {isSubgroup && parentGroup && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{(parentGroup.name || 'P').charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase">Parent Group</p>
                  <p className="font-bold text-gray-900">{parentGroup.name || 'Parent Group'}</p>
                </div>
              </div>
            </div>
          )}
          {!isSubgroup && !id && allGroups.length > 0 && (
            <div className="mb-6 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">
                Parent Group (Optional)
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={form.parent_group_id || ''}
                onChange={(e) => setForm({ ...form, parent_group_id: e.target.value || undefined })}
              >
                <option value="">No parent - create as top-level group</option>
                {allGroups.filter(g => g.id !== id).map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Select a parent group to create this as a subgroup</p>
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">
                {isSubgroup ? 'Subgroup' : 'Group'} Name
              </label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder={isSubgroup ? "Enter subgroup name" : "Enter group name"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Description</label>
              <textarea 
                className="w-full h-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none" 
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter group description"
              />
            </div>
          </div>
        </div>

        {id && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Group Members ({members.length})</h3>
              <Button size="sm" variant="secondary" className="flex items-center gap-1" onClick={() => navigate(`/groups/${id}/contacts`)}>
                <UserPlus className="h-4 w-4" />
                Manage Members
              </Button>
            </div>
            <div className="space-y-3">
              {members.slice(0, 5).map((member) => {
                const displayName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown'
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{displayName}</span>
                    </div>
                  </div>
                )
              })}
              {members.length > 5 && (
                <p className="text-sm text-gray-500 text-center">...and {members.length - 5} more</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => navigate(isSubgroup && parentGroupId ? `/groups/${parentGroupId}/subgroups` : '/groups')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Saving...' : id ? 'Save Changes' : isSubgroup ? 'Create Subgroup' : 'Create Group'}
          </Button>
        </div>
      </div>
  )
}

export function SubgroupManagementView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subgroups, setSubgroups] = useState<Group[]>([])
  const [parentGroup, setParentGroup] = useState<Group | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    groupService.getGroups({ limit: 100 }).then(response => {
      const parent = response.data.find(g => g.id === id)
      setParentGroup(parent || null)
      setSubgroups(response.data.filter(g => g.parent_group_id === id))
    }).catch(err => {
      console.error('Failed to load subgroups', err)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/groups/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">Subgroups</h1>
              <p className="text-gray-500">Manage subgroups within {parentGroup?.name || 'Group'}</p>
            </div>
          </div>
          <Button className="flex items-center gap-2" onClick={() => navigate(`/groups/new?parent=${id}`)}>
            <Plus className="h-4 w-4" />
            Add Subgroup
          </Button>
        </div>

        <div className="space-y-4">
          {subgroups.map((subgroup) => (
            <div key={subgroup.id} className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-gray-900">{subgroup.name}</h3>
                <p className="text-sm text-gray-500">{subgroup.contact_count || 0} contacts</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate(`/groups/${subgroup.id}`)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/groups/${subgroup.id}/subgroups`)}>Subgroups</Button>
              </div>
            </div>
          ))}
          {subgroups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No subgroups yet. Click "Add Subgroup" to create one.
            </div>
          )}
        </div>
      </div>
  )
}
