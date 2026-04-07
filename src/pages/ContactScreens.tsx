import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, Search, Filter, Check, X, ChevronRight, Users, Folder, Plus, Loader, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type Contact, type Group, type ImportValidationResult } from '@/services/contactService'
import { groupService } from '@/services/groupService'
import { toast } from '@/components/ui/use-toast'

function getInitials(firstName: string, lastName: string): string {
  return [firstName, lastName].map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2)
}

function getFullName(contact: { first_name?: string; last_name?: string }): string {
  return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
}

export function ContactsList() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await contactService.getContacts({ page, limit: 20, ...(searchQuery && { search: searchQuery }) })
      setContacts(response.data)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError('Failed to load contacts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Contacts</h1>
            <p className="text-gray-500">Manage your contacts and student records.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/contacts/export">
              <Button variant="secondary" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </Link>
            <Link to="/import">
              <Button variant="secondary" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Bulk Import
              </Button>
            </Link>
            <Link to="/contacts/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-10" 
              placeholder="Search contacts..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {!loading && !error && contacts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No contacts found. Add your first contact to get started.
          </div>
        )}

        {!loading && !error && contacts.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">{getInitials(contact.first_name || '', contact.last_name || '')}</span>
                          </div>
                          <span className="font-medium text-gray-900">{getFullName(contact)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{contact.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{contact.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contact.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {contact.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); navigate(`/contacts/${contact.id}/edit`) }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface ContactExportFilters {
  groupId: string
  status: string
  dateFrom: string
  dateTo: string
}

export function ContactExport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ContactExportFilters>({
    groupId: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  })
  const [isExporting, setIsExporting] = useState(false)

  const groups = [
    { id: '', label: 'All Groups' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'eng', label: 'Engineering' },
    { id: 'sci', label: 'Science' },
    { id: 'alumni', label: 'Alumni' },
    { id: 'staff', label: 'Staff' },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await contactService.exportContacts({ group_id: filters.groupId || undefined })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to export contacts', variant: 'destructive' })
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/contacts')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export Contacts</h1>
            <p className="text-gray-500">Download your contacts as CSV</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Export Options</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <select 
                value={filters.groupId}
                onChange={(e) => setFilters({...filters, groupId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Contacts</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input 
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input 
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Estimated Contacts</p>
                <p className="text-sm text-gray-500">Based on your filters</p>
              </div>
              <span className="text-2xl font-bold text-gray-900">1,248</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fields to Include</h4>
            <div className="flex flex-wrap gap-2">
              {['Name', 'Email', 'Phone', 'Groups', 'Created Date', 'Status'].map(field => (
                <label key={field} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  {field}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface GroupHierarchy {
  id: string
  name: string
  path: string
}

export function ContactDetailsView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contact, setContact] = useState<Awaited<ReturnType<typeof contactService.getContactDetails>>>()

  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await contactService.getContactDetails(id)
        setContact(data)
      } catch (err) {
        setError('Failed to load contact')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchContact()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Contact not found'}</p>
          <Button onClick={() => navigate('/contacts')}>Back to Contacts</Button>
        </div>
      </div>
    )
  }

  const fullName = [contact.first_name, contact.middle_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/contacts')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {fullName}
              </h1>
              <p className="text-gray-500">{contact.email}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/contacts/${id}/edit`)}>
            Edit Contact
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{contact.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{contact.phone || 'N/A'}</p>
                </div>
                {contact.student_id && (
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{contact.student_id}</p>
                  </div>
                )}
                {contact.gender && (
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{contact.gender}</p>
                  </div>
                )}
                {contact.guardian_name && (
                  <div>
                    <p className="text-sm text-gray-500">Guardian</p>
                    <p className="font-medium">{contact.guardian_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    contact.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {contact.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(contact.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Group Hierarchy</h3>
              <div className="space-y-3">
                {contact.group_hierarchy && contact.group_hierarchy.length > 0 ? (
                  contact.group_hierarchy.map((path, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Folder className="h-5 w-5 text-blue-500" />
                      <div className="flex items-center">
                        {path.split(' > ').map((segment, i, arr) => (
                          <span key={i} className="flex items-center">
                            <span className={i === 0 ? 'font-medium' : 'text-gray-500'}>{segment}</span>
                            {i < arr.length - 1 && (
                              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No groups assigned</p>
                )}
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {contact.groups && contact.groups.map(group => (
                  <span key={group.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {group.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-2xl">
                  {(contact.first_name || '')[0]}{(contact.last_name || '')[0]}
                </span>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">{contact.first_name} {contact.last_name}</p>
                <p className="text-sm text-gray-500">{contact.student_id || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h4 className="font-bold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate(`/contacts/${id}/transactions`)}>
                  View Transactions
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate(`/contacts/${id}/statement`)}>
                  View Statement
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate(`/contacts/${id}/groups`)}>
                  Manage Groups
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface GroupOption {
  id: string
  name: string
  selected: boolean
  parent?: string
}

export function AssignGroupsToContact() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [groupsResponse, contactData] = await Promise.all([
          groupService.getGroups({ limit: 100 }),
          contactService.getContactDetails(id).catch(() => null)
        ])
        
        setAllGroups(groupsResponse.data)
        
        const contactGroupIds = contactData?.groups?.map(g => g.id) || []
        
        setGroups(groupsResponse.data.map(g => ({
          id: g.id,
          name: g.name,
          selected: contactGroupIds.includes(g.id),
          parent: g.parent_group_id
        })))
      } catch (err) {
        console.error('Failed to fetch groups:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, selected: !g.selected } : g
    ))
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      const selectedIds = groups.filter(g => g.selected).map(g => g.id)
      await contactService.assignGroups(id, selectedIds)
      navigate(`/contacts/${id}`)
    } catch (err) {
      console.error('Failed to save groups:', err)
      toast({ title: 'Error', description: 'Failed to save groups', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedCount = groups.filter(g => g.selected).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/contacts/${id}`)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Groups</h1>
            <p className="text-gray-500">Manage group membership</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Select Groups</h3>
            <span className="text-sm text-gray-500">{selectedCount} selected</span>
          </div>

          <div className="space-y-1">
            {groups.map(group => (
              <label 
                key={group.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  group.selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  group.selected 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {group.selected && <Check className="h-3 w-3 text-white" />}
                </div>
                <input 
                  type="checkbox"
                  checked={group.selected}
                  onChange={() => toggleGroup(group.id)}
                  className="sr-only"
                />
                <Folder className={`h-5 w-5 ${group.selected ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`${group.selected ? 'text-blue-900 font-medium' : 'text-gray-900'}`}>
                  {group.name}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate(`/contacts/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ImportValidationRow {
  id: string
  name: string
  email: string
  phone: string
  status: 'valid' | 'duplicate' | 'error'
  error?: string
}

export function ImportValidationReview() {
  const navigate = useNavigate()
  const [validationData, setValidationData] = useState<ImportValidationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCommitting, setIsCommitting] = useState(false)

  useEffect(() => {
    const fetchValidation = async () => {
      const stored = localStorage.getItem('pending_import_validation')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setValidationData(parsed)
        } catch {
          setValidationData(null)
        }
      }
      setLoading(false)
    }
    fetchValidation()
  }, [])

  const rows: ImportValidationRow[] = validationData?.rows?.map((row, index) => {
    const isDuplicate = validationData.duplicates > 0 && index >= validationData.valid
    const hasError = !isDuplicate && validationData.errors > 0 && index >= validationData.valid + validationData.duplicates
    return {
      id: String(index + 1),
      name: `${row.first_name || ''} ${row.last_name || row.name || ''}`.trim() || 'Unknown',
      email: row.email,
      phone: row.phone || '-',
      status: isDuplicate ? 'duplicate' : hasError ? 'error' : 'valid',
      error: hasError ? 'Validation failed' : undefined
    }
  }) || []

  const validCount = validationData?.valid || 0
  const duplicateCount = validationData?.duplicates || 0
  const errorCount = validationData?.errors || 0

  const handleCommit = async () => {
    const stored = localStorage.getItem('pending_import_id')
    if (!stored) {
      toast({ title: 'No Import Found', description: 'No pending import found to commit', variant: 'destructive' })
      return
    }
    
    setIsCommitting(true)
    try {
      await contactService.commitImport(stored)
      localStorage.removeItem('pending_import_validation')
      localStorage.removeItem('pending_import_id')
      navigate('/import/activities')
    } catch (err) {
      console.error('Failed to commit import:', err)
      toast({ title: 'Error', description: 'Failed to commit import', variant: 'destructive' })
    } finally {
      setIsCommitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!validationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No validation data found</p>
          <Button onClick={() => navigate('/import')}>Go to Import</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/import')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Import</h1>
              <p className="text-gray-500">Validate and commit your contact import</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Rows</p>
            <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Valid</p>
            <p className="text-2xl font-bold text-green-600">{validCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Duplicates</p>
            <p className="text-2xl font-bold text-amber-600">{duplicateCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Errors</p>
            <p className="text-2xl font-bold text-red-600">{errorCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Issue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'valid' ? 'bg-green-100 text-green-700' :
                      row.status === 'duplicate' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{row.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{row.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{row.error || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> {duplicateCount} duplicate contacts will be skipped. {errorCount} contacts with errors will not be imported.
          </p>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/import')}>
            Go Back
          </Button>
          <Button onClick={handleCommit} disabled={isCommitting || validCount === 0}>
            {isCommitting ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Importing...
              </span>
            ) : (
              <span>Import {validCount} Contacts</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
