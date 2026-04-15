import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Download, ChevronDown, Upload, Shield, Edit, Settings, Loader2, Filter, X, User, FileText, Users, CreditCard, Building, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { auditService, type AuditLog } from '@/services/auditService'
import { contactService } from '@/services/contactService'
import { formService } from '@/services/formService'
import { paymentService } from '@/services/paymentService'
import { organizationService } from '@/services/organizationService'
import { toast } from '@/components/ui/use-toast'

const iconMap: Record<string, React.ElementType> = {
  'import': Upload,
  'login': Shield,
  'create': Edit,
  'update': Settings,
  'delete': Settings,
  'view': Eye,
  'submit': Upload,
  'payment': CreditCard,
  'default': Settings,
}

const entityIconMap: Record<string, React.ElementType> = {
  'contact': User,
  'form': FileText,
  'payment': CreditCard,
  'transaction': CreditCard,
  'group': Users,
  'organization': Building,
  'user': User,
  'audit_log': Settings,
  'audit': Settings,
  'authentication': Shield,
  'report': FileText,
  'default': Settings,
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'import', label: 'Import' },
  { value: 'export', label: 'Export' },
  { value: 'submit', label: 'Submit' },
  { value: 'payment', label: 'Payment' },
]

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'user', label: 'User' },
  { value: 'contact', label: 'Contact' },
  { value: 'group', label: 'Group' },
  { value: 'form', label: 'Form' },
  { value: 'payment', label: 'Payment' },
  { value: 'organization', label: 'Organization' },
  { value: 'audit_log', label: 'Audit Log' },
]

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dateString: string | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatAction(action: string | undefined): string {
  if (!action) return 'Unknown'
  if (action.startsWith('GET ') || action.startsWith('POST ') || action.startsWith('PUT ') || action.startsWith('PATCH ') || action.startsWith('DELETE ')) {
    const parts = action.split(' ')
    return `${parts[0]} ${parts[1].split('?')[0]}`
  }
  return action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')
}

function isInternalApiRequest(log: AuditLog): boolean {
  const action = log.action?.toLowerCase() || ''
  const entityType = log.entity_type?.toLowerCase() || ''
  return (
    action.includes('/api/') ||
    action.includes('/auth/') ||
    action.includes('/organization') ||
    action.includes('/reports') ||
    action.includes('/audit/logs') ||
    action.includes('/forms') ||
    action.includes('/transactions') ||
    entityType === 'audit_log' ||
    action.startsWith('get ') ||
    action.startsWith('post ') ||
    action.startsWith('put ') ||
    action.startsWith('patch ') ||
    action.startsWith('delete ')
  )
}

interface EntityInfo {
  name: string
  subtitle?: string
  icon: React.ElementType
}

interface EntityCache {
  [key: string]: EntityInfo
}

export function AllActivityLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [exporting, setExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [entityCache, setEntityCache] = useState<EntityCache>({})
  const [loadingEntities, setLoadingEntities] = useState(false)
  const entityCacheRef = useRef<EntityCache>({})

  const hasActiveFilters = actionFilter || entityTypeFilter || fromDate || toDate

  const fetchEntityInfo = useCallback(async (entityType: string, entityId: string, cleanId?: string): Promise<EntityInfo | null> => {
    const cacheKey = `${entityType}-${entityId}`
    
    if (entityCacheRef.current[cacheKey]) {
      return entityCacheRef.current[cacheKey]
    }

    try {
      let entityInfo: EntityInfo | null = null
      const normalizedType = entityType.toLowerCase()
      
      const idToUse = cleanId || entityId

      switch (normalizedType) {
        case 'contact':
          try {
            console.log('Fetching contact with ID:', idToUse)
            const contact = await contactService.getContact(idToUse)
            console.log('Contact fetched:', contact)
            entityInfo = {
              name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown Contact',
              subtitle: contact.email || undefined,
              icon: User
            }
          } catch (err) {
            console.error('Failed to fetch contact:', idToUse, err)
            entityInfo = { name: 'Unknown Contact', icon: User }
          }
          break

        case 'form':
          try {
            const form = await formService.getForm(idToUse)
            entityInfo = {
              name: form.title || 'Unknown Form',
              subtitle: form.slug || undefined,
              icon: FileText
            }
          } catch {
            entityInfo = { name: 'Unknown Form', icon: FileText }
          }
          break

        case 'payment':
        case 'transaction':
          try {
            const txn = await paymentService.getTransaction(idToUse)
            entityInfo = {
              name: txn.reference?.slice(0, 16) || entityId.slice(0, 8),
              subtitle: `₦${parseFloat(txn.amount).toLocaleString()}`,
              icon: CreditCard
            }
          } catch {
            entityInfo = { name: entityId.slice(0, 12), icon: CreditCard }
          }
          break

        case 'group':
          entityInfo = { name: 'Group', subtitle: entityId.slice(0, 8), icon: Users }
          break

        case 'organization':
          try {
            const org = await organizationService.getOrganization()
            entityInfo = {
              name: org.name || 'Organization',
              icon: Building
            }
          } catch {
            entityInfo = { name: 'Organization', icon: Building }
          }
          break

        case 'user':
          entityInfo = { name: 'User', subtitle: entityId.slice(0, 8), icon: User }
          break

        case 'audit':
        case 'audit_log':
          entityInfo = { name: 'Audit Log', icon: Settings }
          break

        case 'authentication':
          entityInfo = { name: 'Authentication', icon: Shield }
          break

        case 'report':
          entityInfo = { name: 'Report', icon: FileText }
          break

        default:
          entityInfo = { name: entityType, subtitle: entityId.slice(0, 8), icon: Settings }
      }

      if (entityInfo) {
        entityCacheRef.current = { ...entityCacheRef.current, [cacheKey]: entityInfo! }
        setEntityCache(entityCacheRef.current)
      }

      return entityInfo
    } catch (err) {
      console.error(`Failed to fetch ${entityType} info:`, err)
      return null
    }
  }, [])

  const fetchEntitiesForLogs = useCallback(async (logs: AuditLog[]) => {
    const uniqueEntities = new Map<string, { type: string; id: string; cleanId: string }>()
    
    logs.forEach(log => {
      if (log.entity_type && log.entity_id) {
        const key = `${log.entity_type}-${log.entity_id}`
        if (!uniqueEntities.has(key)) {
          const cleanId = log.entity_id.replace(/^(payment|contact|form|group|transaction|user|organization)_?/i, '')
          uniqueEntities.set(key, { type: log.entity_type, id: log.entity_id, cleanId })
        }
      }
    })

    if (uniqueEntities.size === 0) return

    setLoadingEntities(true)
    
    try {
      await Promise.all(
        Array.from(uniqueEntities.values()).map(({ type, id, cleanId }) =>
          fetchEntityInfo(type, id, cleanId)
        )
      )
    } finally {
      setLoadingEntities(false)
    }
  }, [fetchEntityInfo])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await auditService.getAuditLogs({
        page,
        limit: 20,
        keyword: searchQuery || undefined,
        action: actionFilter || undefined,
        entity_type: entityTypeFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      })
      setLogs(response.data)
      setTotalPages(response.totalPages)
      setTotal(response.total || 0)
    } catch (err) {
      console.error('Failed to fetch audit logs', err)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, actionFilter, entityTypeFilter, fromDate, toDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    if (logs.length > 0) {
      fetchEntitiesForLogs(logs)
    }
  }, [logs, fetchEntitiesForLogs])

  const clearFilters = () => {
    setActionFilter('')
    setEntityTypeFilter('')
    setFromDate('')
    setToDate('')
    setSearchQuery('')
    setPage(1)
  }

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getEntityName = async (entityType: string, entityId: string): Promise<string> => {
    if (!entityId) return ''
    try {
      const cleanId = entityId.replace(/^(payment|contact|form|group|transaction|user|organization)_?/i, '')
      const id = cleanId || entityId
      switch (entityType.toLowerCase()) {
        case 'contact':
          const contact = await contactService.getContact(id)
          return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown Contact'
        case 'form':
          const form = await formService.getForm(id)
          return form.title || 'Unknown Form'
        case 'payment':
        case 'transaction':
          const txn = await paymentService.getTransaction(id)
          return txn.reference ? `Payment ${txn.reference.slice(0, 12)}` : `Transaction ${id.slice(0, 8)}`
        case 'group':
          return `Group ${id.slice(0, 8)}`
        case 'organization':
          const org = await organizationService.getOrganization()
          return org.name || 'Organization'
        default:
          return entityId
      }
    } catch {
      return entityId
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await auditService.getAuditLogs({
        page: 1,
        limit: 1000,
        keyword: searchQuery || undefined,
        action: actionFilter || undefined,
        entity_type: entityTypeFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      })
      
      const logsToExport = response.data.filter(log => !isInternalApiRequest(log))
      
      const entityNames = await Promise.all(
        logsToExport.map(async (log) => {
          if (log.entity_type && log.entity_id) {
            return getEntityName(log.entity_type, log.entity_id)
          }
          return ''
        })
      )
      
      const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity Name', 'Performed By', 'IP Address', 'Details']
      const csvRows = [headers.join(',')]
      
      logsToExport.forEach((log, index) => {
        const row = [
          log.timestamp || log.created_at || '',
          log.action || '',
          log.entity_details?.type || log.entity_type || '',
          entityNames[index] || log.entity_id || '',
          log.actor?.email || log.user?.email || 'System',
          log.ip_address || log.metadata?.ip_address || '',
          log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : ''
        ]
        csvRows.push(row.map(cell => `"${cell}"`).join(','))
      })
      
      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: 'Success', description: `${logsToExport.length} logs exported successfully`, variant: 'success' })
    } catch (err) {
      console.error('Export failed:', err)
      toast({ title: 'Error', description: 'Failed to export logs. Please try again.', variant: 'destructive' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Activity Logs</h1>
            <p className="text-gray-500">Complete audit trail of all administrative actions.</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Filters</span>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10" 
                  placeholder="Search logs..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {ACTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Entity Type</label>
                  <select
                    value={entityTypeFilter}
                    onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(1); }}
                    className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {ENTITY_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                    className="h-9"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                    className="h-9"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 px-2">Recent History</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No activity logs found.
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {logs
                  .filter(log => !isInternalApiRequest(log))
                  .map((log) => {
                    const ActionIcon = iconMap[log.action?.toLowerCase() || 'default'] || iconMap['default']
                    const entityKey = log.entity_type?.toLowerCase() || ''
                    const EntityIcon = entityIconMap[entityKey] || entityIconMap['default']
                    return (
                      <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <EntityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-gray-900">{formatAction(log.action)}</span>
                            <span className="text-[10px] font-mono text-gray-400 uppercase">ID: {log.id?.slice(0, 8) || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded">
                              {log.entity_type}
                            </span>
                            {log.entity_type && log.entity_id ? (
                              (() => {
                                const cacheKey = `${log.entity_type}-${log.entity_id}`
                                const entityInfo = entityCacheRef.current[cacheKey] || entityCache[cacheKey]
                                if (entityInfo) {
                                  return (
                                    <span className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-gray-700">{entityInfo.name}</span>
                                      {entityInfo.subtitle && (
                                        <span className="text-[10px] text-gray-400">({entityInfo.subtitle})</span>
                                      )}
                                    </span>
                                  )
                                }
                                return (
                                  <span className="text-xs text-gray-500 font-mono">
                                    {log.entity_id.slice(0, 8)}...
                                  </span>
                                )
                              })()
                            ) : null}
                            {(log.actor?.email && log.actor.email.toLowerCase() !== 'system') && (
                              <span className="text-[10px] text-gray-400">by {log.actor.email}</span>
                            )}
                            {log.actor?.email?.toLowerCase() === 'system' && (
                              <span className="text-[10px] text-gray-400 italic">(System action)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-700">{formatTime(log.timestamp)}</div>
                          <div className="text-[10px] text-gray-400">{formatDate(log.timestamp)}</div>
                        </div>
                      </div>
                    )
                  })}
                {logs.filter(log => !isInternalApiRequest(log)).length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    No user activity logs found. (Only system API requests are available.)
                  </div>
                )}
              </div>

              {total > 0 && (
                <div className="flex justify-between items-center gap-2 p-4 border-t">
                  <span className="text-sm text-gray-500">
                    {total} total logs
                  </span>
                  <div className="flex justify-center gap-2">
                    <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
  )
}
