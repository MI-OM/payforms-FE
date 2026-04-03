import { useState, useEffect, useCallback } from 'react'
import { Search, Download, ChevronDown, Upload, Shield, Edit, Settings, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { auditService, type AuditLog } from '@/services/auditService'

const iconMap: Record<string, React.ElementType> = {
  'import': Upload,
  'login': Shield,
  'create': Edit,
  'update': Settings,
  'delete': Settings,
  'default': Settings,
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function AllActivityLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await auditService.getAuditLogs({
        page,
        limit: 20,
        keyword: searchQuery || undefined,
      })
      setLogs(response.data)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.error('Failed to fetch audit logs', err)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await auditService.exportAuditLogs({ keyword: searchQuery || undefined })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Failed to export logs')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
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
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Recent History</span>
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
                {logs.map((log) => {
                  const IconComponent = iconMap[log.action.toLowerCase()] || iconMap['default']
                  return (
                    <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-gray-900">{log.action}</span>
                          <span className="text-[10px] font-mono text-gray-400 uppercase">ID: {log.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {log.entity_type} {log.entity_id && `#${log.entity_id.slice(0, 8)}`}
                          {log.user_email && ` by ${log.user_email}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-700">{formatTime(log.timestamp)}</div>
                        <div className="text-[10px] text-gray-400">{formatDate(log.timestamp)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t">
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
