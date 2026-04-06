import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, Clock, Send, Check, Calendar, X, Loader, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { notificationService, type ScheduledNotification as NotificationScheduledNotification, type NotificationHistory as NotificationHistoryItem } from '@/services/notificationService'
import { auditService } from '@/services/auditService'
import { reportService } from '@/services/reportService'
import { toast } from '@/components/ui/use-toast'

export function ScheduledNotifications() {
  const navigate = useNavigate()
  const [scheduled, setScheduled] = useState<NotificationScheduledNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newNotification, setNewNotification] = useState({
    subject: '',
    body: '',
    scheduledDate: '',
    scheduledTime: '',
    recipientType: 'all',
    groups: [] as string[],
  })
  const [isSending, setIsSending] = useState(false)

  const fetchScheduled = useCallback(async () => {
    setLoading(true)
    try {
      const response = await notificationService.getScheduledNotifications({ limit: 50 })
      setScheduled(response.data)
    } catch (err) {
      console.error('Failed to load scheduled notifications', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScheduled()
  }, [fetchScheduled])

  const handleCreate = async () => {
    setIsSending(true)
    try {
      const scheduledFor = newNotification.scheduledDate && newNotification.scheduledTime
        ? `${newNotification.scheduledDate}T${newNotification.scheduledTime}:00Z`
        : undefined
      await notificationService.sendScheduledNotification({
        subject: newNotification.subject,
        body: newNotification.body,
        recipients: [],
      })
      setIsCreating(false)
      setNewNotification({ subject: '', body: '', scheduledDate: '', scheduledTime: '', recipientType: 'all', groups: [] })
      fetchScheduled()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to schedule notification', variant: 'destructive' })
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this notification?')) return
    try {
      await notificationService.cancelScheduledNotification(id)
      setScheduled(scheduled.filter(n => n.id !== id))
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to cancel notification', variant: 'destructive' })
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Notifications</h1>
            <p className="text-gray-500">Manage and create scheduled notifications</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Notification
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Upcoming ({scheduled.length})</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {scheduled.map(notification => (
              <div key={notification.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{notification.subject}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{notification.body}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{new Date(notification.scheduled_for).toLocaleString()}</span>
                        <span>{notification.recipients?.length || 0} recipients</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Scheduled
                    </span>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scheduled.length === 0 && (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No scheduled notifications</p>
            </div>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Schedule Notification</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <Input 
                  value={newNotification.subject}
                  onChange={(e) => setNewNotification({...newNotification, subject: e.target.value})}
                  placeholder="Notification subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  value={newNotification.body}
                  onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Notification message"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input 
                    type="date"
                    value={newNotification.scheduledDate}
                    onChange={(e) => setNewNotification({...newNotification, scheduledDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <Input 
                    type="time"
                    value={newNotification.scheduledTime}
                    onChange={(e) => setNewNotification({...newNotification, scheduledTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <select 
                  value={newNotification.recipientType}
                  onChange={(e) => setNewNotification({...newNotification, recipientType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Contacts</option>
                  <option value="active">Active Contacts Only</option>
                  <option value="groups">Specific Groups</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreate} disabled={isSending}>
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Scheduling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function NotificationHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<NotificationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    notificationService.getScheduledNotifications({ limit: 50 }).then(response => {
      setHistory(response.data.map(n => ({
        id: n.id,
        type: 'scheduled' as const,
        subject: n.subject,
        sent_at: n.scheduled_for,
        recipient_count: n.recipients.length,
        status: n.status === 'sent' ? 'sent' as const : n.status === 'cancelled' ? 'failed' as const : 'sent' as const,
      })))
    }).catch(err => {
      console.error('Failed to load notification history', err)
    }).finally(() => setLoading(false))
  }, [])

  const filteredHistory = history.filter(h => 
    h.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification History</h1>
            <p className="text-gray-500">View sent notifications</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search notifications..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredHistory.map(notification => (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'reminder' ? 'bg-amber-100 text-amber-600' :
                        notification.type === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {notification.type === 'reminder' ? (
                          <Clock className="h-5 w-5" />
                        ) : notification.type === 'scheduled' ? (
                          <Send className="h-5 w-5" />
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{notification.subject}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{new Date(notification.sent_at).toLocaleString()}</span>
                          <span>{notification.recipient_count} recipients</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notification.status === 'sent' ? 'bg-green-100 text-green-700' :
                      notification.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredHistory.length === 0 && (
            <div className="p-8 text-center">
              <Send className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    from: '',
    to: '',
  })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await auditService.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        keyword: searchQuery,
      })
      setLogs(response.data)
      setPagination(prev => ({ ...prev, total: response.total, totalPages: response.totalPages }))
    } catch (err) {
      console.error('Failed to load audit logs', err)
      toast({ title: 'Error', description: 'Failed to load audit logs', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters, searchQuery])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await auditService.exportAuditLogs(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to export logs', variant: 'destructive' })
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Activity history and system events</p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export Logs'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Input 
              placeholder="Action"
              className="w-32"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            />
            <Input 
              placeholder="Entity Type"
              className="w-32"
              value={filters.entity_type}
              onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            />
            <Input 
              type="date"
              className="w-36"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
            <Input 
              type="date"
              className="w-36"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.entity_type}
                      <span className="text-gray-400 ml-1 text-xs">{log.entity_id}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{log.user_email || 'System'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.ip_address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="p-8 text-center text-gray-500">No audit logs found</div>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function PaymentAuditTrail() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!paymentId) return
    setLoading(true)
    auditService.getPaymentAuditLogs(paymentId).then(response => {
      setLogs(response.data)
    }).catch(err => {
      console.error('Failed to load payment audit logs', err)
      toast({ title: 'Error', description: 'Failed to load audit logs', variant: 'destructive' })
    }).finally(() => setLoading(false))
  }, [paymentId])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/activity')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Audit Trail</h1>
          <p className="text-gray-500">Payment ID: {paymentId}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No audit trail found</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  {index < logs.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{log.event}</span>
                    <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-1">By: {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ReportsExport() {
  const navigate = useNavigate()
  const [reportType, setReportType] = useState<'summary' | 'analytics'>('summary')
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await reportService.exportReport({
        type: reportType,
        format,
        start_date: dateRange.from || undefined,
        end_date: dateRange.to || undefined,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to export report', variant: 'destructive' })
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/reports')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Report</h1>
          <p className="text-gray-500">Download reports in various formats</p>
        </div>
      </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'summary', label: 'Summary Report', desc: 'Overview of key metrics' },
                  { value: 'analytics', label: 'Analytics Report', desc: 'Detailed analytics data' },
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value as 'summary' | 'analytics')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      reportType === type.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-500">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <div className="flex gap-4">
                {[
                  { value: 'csv' as const, label: 'CSV', icon: '📊' },
                  { value: 'pdf' as const, label: 'PDF', icon: '📄' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                      format === f.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input 
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input 
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setDateRange({ from: '2026-03-01', to: '2026-03-31' })}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  Last Month
                </button>
                <button 
                  onClick={() => setDateRange({ from: '2026-01-01', to: '2026-03-31' })}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  This Quarter
                </button>
                <button 
                  onClick={() => setDateRange({ from: '2025-04-01', to: '2026-03-31' })}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  This Year
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Exporting...
                  </span>
                ) : (
                  'Export Report'
                )}
              </Button>
            </div>
          </div>
        </div>
    </div>
  )
}
