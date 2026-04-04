import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Download, Search, Filter, Plus, Loader2, Upload, Edit, FolderInput, Mail, Trash2, X, AlertTriangle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type Contact, type PaginatedResponse } from '@/services/contactService'
import { groupService, type Group, type GroupTreeNode } from '@/services/groupService'
import { reportService } from '@/services/reportService'
import { toast } from '@/components/ui/use-toast'

interface DeleteModalState {
  isOpen: boolean
  contactId: string | null
  contactName: string
  status: 'confirm' | 'loading' | 'success' | 'error'
}

function getInitials(firstName?: string, lastName?: string): string {
  return [firstName, lastName].map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2)
}

function getFullName(contact: { first_name?: string; last_name?: string }): string {
  return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return `$${amount.toFixed(2)}`
}

interface FinancialSummary {
  total_paid: number
  total_outstanding: number
  total_records: number
}

export function ContactsManagement() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<GroupTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    contactId: null,
    contactName: '',
    status: 'confirm',
  })
  const limit = 20

  const fetchGroups = useCallback(async () => {
    try {
      const groupTree = await groupService.getGroupTree()
      setGroups(groupTree)
    } catch (err) {
      console.error('Failed to load groups:', err)
    }
  }, [])

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: { page: number; limit: number; group_id?: string; search?: string } = {
        page,
        limit,
      }
      if (selectedGroupId) {
        params.group_id = selectedGroupId
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      const response: PaginatedResponse<Contact> = await contactService.getContacts(params)
      
      const contactsWithGroups = await Promise.all(
        response.data.map(async (contact) => {
          try {
            const details = await contactService.getContactDetails(contact.id)
            return { ...contact, groups: details.groups, group_hierarchy: details.group_hierarchy }
          } catch {
            return contact
          }
        })
      )
      
      setContacts(contactsWithGroups)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError('Failed to load contacts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, selectedGroupId, searchQuery])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const fetchFinancialSummary = useCallback(async () => {
    setLoadingSummary(true)
    try {
      const summary = await reportService.getSummary()
      setFinancialSummary({
        total_paid: summary.total_revenue || 0,
        total_outstanding: summary.pending_payments || 0,
        total_records: total || 0
      })
    } catch (err) {
      console.error('Failed to load financial summary:', err)
      setFinancialSummary({
        total_paid: 0,
        total_outstanding: 0,
        total_records: total
      })
    } finally {
      setLoadingSummary(false)
    }
  }, [total])

  useEffect(() => {
    fetchFinancialSummary()
  }, [fetchFinancialSummary])

  const handleSelectAll = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([])
    } else {
      setSelectedContactIds(contacts.map(c => c.id))
    }
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleExportContacts = async () => {
    try {
      const blob = await contactService.exportContacts(selectedGroupId ? { group_id: selectedGroupId } : undefined)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contacts.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: 'Success', description: 'Contacts exported successfully' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to export contacts', variant: 'destructive' })
    }
  }

  const getGroupCount = (group: GroupTreeNode): number => {
    return group.contact_count || 0
  }

  const handleDeleteClick = (contact: Contact) => {
    setDeleteModal({
      isOpen: true,
      contactId: contact.id,
      contactName: getFullName(contact),
      status: 'confirm',
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.contactId) return
    setDeleteModal(prev => ({ ...prev, status: 'loading' }))
    try {
      await contactService.deleteContact(deleteModal.contactId)
      setDeleteModal(prev => ({ ...prev, status: 'success' }))
      setTimeout(() => {
        setDeleteModal({ isOpen: false, contactId: null, contactName: '', status: 'confirm' })
        fetchContacts()
      }, 1500)
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, status: 'error' }))
      setTimeout(() => {
        setDeleteModal(prev => ({ ...prev, status: 'confirm' }))
      }, 2000)
    }
  }

  const handleBulkDelete = () => {
    if (selectedContactIds.length === 0) return
    const firstContact = contacts.find(c => c.id === selectedContactIds[0])
    if (firstContact) {
      setDeleteModal({
        isOpen: true,
        contactId: selectedContactIds[0],
        contactName: `${selectedContactIds.length} contacts`,
        status: 'confirm',
      })
    }
  }

  const flattenGroups = (nodes: GroupTreeNode[]): Group[] => {
    const result: Group[] = []
    const flatten = (items: GroupTreeNode[]) => {
      for (const item of items) {
        result.push(item)
        if (item.children && item.children.length > 0) {
          flatten(item.children)
        }
      }
    }
    flatten(nodes)
    return result
  }

  const allGroups = flattenGroups(groups)

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 lg:mb-10 gap-4 lg:gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191c1e] mb-2">Contacts</h1>
          <p className="text-[#45464d] max-w-md">Manage your organization's members, assign groups, and track financial balances with precision.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/contacts/import">
            <Button variant="secondary" className="bg-[#eceef0] text-[#191c1e] font-semibold px-5 py-2.5 rounded-md flex items-center gap-2 hover:bg-[#d8dadc] transition-colors">
              <Upload className="h-4 w-4" />
              Import Contacts
            </Button>
          </Link>
          <Link to="/contacts/reminder">
            <Button variant="secondary" className="bg-[#002113] text-white font-semibold px-5 py-2.5 rounded-md flex items-center gap-2 hover:bg-[#003d20] transition-colors">
              <Send className="h-4 w-4" />
              Send Reminder
            </Button>
          </Link>
          <Link to="/contacts/new">
            <Button className="bg-black text-white font-semibold px-5 py-2.5 rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              New Contact
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-6 lg:mb-10">
        {/* Sidebar - shows below on mobile, left on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 lg:space-y-6">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm ring-1 ring-[#c6c6cd]/10">
            <div className="flex justify-between items-center mb-4 lg:mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d]">Groups</h3>
              <Link to="/groups/new" className="text-[#006398] hover:bg-[#006398]/5 p-1 rounded transition-colors">
                <Plus className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-2 lg:space-y-3">
              <li>
                <button
                  onClick={() => { setSelectedGroupId(null); setPage(1); }}
                  className={`w-full flex justify-between items-center px-3 py-2 font-bold rounded-lg text-sm transition-colors ${
                    selectedGroupId === null
                      ? 'bg-[#006398]/5 text-[#006398]'
                      : 'text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#006398]"></span>
                    All Contacts
                  </span>
                  <span className="bg-[#006398]/10 px-2 py-0.5 rounded text-[10px]">{total}</span>
                </button>
              </li>
              {allGroups.slice(0, 10).map((group) => (
                <li key={group.id}>
                  <button
                    onClick={() => { setSelectedGroupId(group.id); setPage(1); }}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedGroupId === group.id
                        ? 'bg-[#006398]/5 text-[#006398] font-bold'
                        : 'text-[#45464d] font-medium hover:bg-[#f2f4f6]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#c6c6cd]"></span>
                      {group.name}
                    </span>
                    <span className="text-[#45464d]/50 text-[10px]">{group.contact_count || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
            <Link to="/groups" className="mt-4 lg:mt-6 w-full py-2 text-xs font-semibold text-[#188ace] hover:underline text-center block">
              Manage Groups
            </Link>
          </div>

          <div className="bg-[#eceef0] rounded-xl p-4 lg:p-6 border border-transparent">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-4">Financial Status</h3>
            {loadingSummary ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[#006398]" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-[#45464d] flex justify-between mb-1">
                    <span>Total Paid</span>
                    <span className="text-[#191c1e] font-bold">{formatCurrency(financialSummary?.total_paid || 0)}</span>
                  </div>
                  <div className="h-1.5 bg-[#e0e3e5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#009668] rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#45464d] flex justify-between mb-1">
                    <span>Outstanding</span>
                    <span className="text-[#ba1a1a] font-bold">{formatCurrency(financialSummary?.total_outstanding || 0)}</span>
                  </div>
                  <div className="h-1.5 bg-[#e0e3e5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ba1a1a] rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table - shows on top on mobile, right on desktop */}
        <div className="order-1 lg:order-2 lg:col-span-9 bg-white rounded-xl shadow-sm ring-1 ring-[#c6c6cd]/10 overflow-hidden flex flex-col">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#eceef0]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#eceef0] px-3 py-1.5 rounded-md text-sm font-medium text-[#191c1e]">
                <input
                  className="rounded border-[#c6c6cd] text-[#006398] focus:ring-[#006398]"
                  type="checkbox"
                  checked={selectedContactIds.length === contacts.length && contacts.length > 0}
                  onChange={handleSelectAll}
                />
                <span>Selected: {selectedContactIds.length}</span>
              </div>
              {selectedContactIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <Link to={`/contacts/move?ids=${selectedContactIds.join(',')}`}>
                    <button className="p-2 hover:bg-[#f2f4f6] rounded transition-colors text-[#45464d] disabled:opacity-30" title="Move to Group">
                      <FolderInput className="h-5 w-5" />
                    </button>
                  </Link>
                  <button className="p-2 hover:bg-[#f2f4f6] rounded transition-colors text-[#45464d] disabled:opacity-30" title="Send Email">
                    <Mail className="h-5 w-5" />
                  </button>
                  <button 
                    className="p-2 hover:bg-[#f2f4f6] rounded transition-colors text-[#ba1a1a] disabled:opacity-30" 
                    title="Delete"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#45464d]" />
                <Input
                  className="pl-10 bg-[#f2f4f6] border-none rounded-md text-sm"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#45464d] hover:bg-[#f2f4f6] rounded transition-colors">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button
                onClick={handleExportContacts}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#45464d] hover:bg-[#f2f4f6] rounded transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#006398]" />
            </div>
          )}

          {error && <div className="text-center py-12 text-[#ba1a1a]">{error}</div>}

          {!loading && !error && contacts.length === 0 && (
            <div className="text-center py-12 text-[#45464d]">
              No contacts found. Add your first contact to get started.
            </div>
          )}

          {!loading && !error && contacts.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="hidden md:table-header-group">
                    <tr className="bg-[#f2f4f6]/50">
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] w-10">
                        <input
                          className="rounded border-[#c6c6cd] text-[#006398] focus:ring-[#006398]"
                          type="checkbox"
                          checked={selectedContactIds.length === contacts.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Name</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Group</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right hidden lg:table-cell">Total Paid</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right hidden lg:table-cell">Balance</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef0]">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-[#f2f4f6] transition-colors group">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <input
                            className="rounded border-[#c6c6cd] text-[#006398] focus:ring-[#006398]"
                            type="checkbox"
                            checked={selectedContactIds.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#cce5ff] text-[#001d31] font-bold text-xs flex items-center justify-center shrink-0">
                              {getInitials(contact.first_name, contact.last_name)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-[#191c1e] truncate">{getFullName(contact)}</div>
                              <div className="text-xs text-[#45464d] truncate">{contact.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {contact.groups && contact.groups.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {contact.groups.slice(0, 2).map((group) => (
                                <span key={group.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#dae2fd] text-[#3f465c]">
                                  {group.name}
                                </span>
                              ))}
                              {contact.groups.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                                  +{contact.groups.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium text-right text-[#191c1e] hidden lg:table-cell">$0.00</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm font-bold text-right text-[#009668] hidden lg:table-cell">$0.00</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/contacts/${contact.id}/edit`}
                              className="p-2 hover:bg-[#f2f4f6] rounded transition-colors text-[#45464d]"
                            >
                              <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(contact)}
                              className="p-2 hover:bg-[#f2f4f6] rounded transition-colors text-[#ba1a1a]"
                            >
                              <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 lg:p-6 border-t border-[#eceef0] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-medium text-[#45464d]">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total.toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-bold ring-1 ring-[#c6c6cd]/15 rounded-md hover:bg-[#f2f4f6] transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-bold ring-1 ring-[#c6c6cd]/15 rounded-md hover:bg-[#f2f4f6] transition-colors disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
            {deleteModal.status === 'confirm' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ffdad6] text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tighter mb-2 text-[#191c1e]">Delete Contact?</h3>
                <p className="text-[#45464d] text-sm leading-relaxed mb-8">
                  Are you sure you want to delete <span className="font-bold text-[#191c1e]">{deleteModal.contactName}</span>? This action cannot be undone.
                </p>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-[#ba1a1a] text-white hover:bg-[#93000a]"
                    onClick={handleDeleteConfirm}
                  >
                    Delete Contact
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setDeleteModal({ isOpen: false, contactId: null, contactName: '', status: 'confirm' })}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {deleteModal.status === 'loading' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#eceef0] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-8 w-8 animate-spin text-[#006398]" />
                </div>
                <h3 className="text-xl font-extrabold mb-2 text-[#191c1e]">Deleting...</h3>
                <p className="text-[#45464d] text-sm">Please wait while we delete the contact.</p>
              </div>
            )}
            {deleteModal.status === 'success' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#dcf0e7] text-[#009668] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tighter mb-2 text-[#191c1e]">Contact Deleted</h3>
                <p className="text-[#45464d] text-sm leading-relaxed mb-8">
                  {deleteModal.contactName} has been successfully removed.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => setDeleteModal({ isOpen: false, contactId: null, contactName: '', status: 'confirm' })}
                >
                  Done
                </Button>
              </div>
            )}
            {deleteModal.status === 'error' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ffdad6] text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tighter mb-2 text-[#191c1e]">Deletion Failed</h3>
                <p className="text-[#45464d] text-sm leading-relaxed mb-8">
                  There was an error deleting this contact. Please try again.
                </p>
                <div className="space-y-3">
                  <Button 
                    className="w-full"
                    onClick={handleDeleteConfirm}
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setDeleteModal({ isOpen: false, contactId: null, contactName: '', status: 'confirm' })}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
