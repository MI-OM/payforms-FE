import { useState, useEffect, useCallback } from 'react'
import { Calendar, BarChart3 } from 'lucide-react'
import { Download, TrendingUp, TrendingDown, DollarSign, Users, FileText, CreditCard, Loader, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { reportService, type ReportSummary, type AnalyticsData, type FormsPerformanceResponse, type GroupContributionsResponse } from '@/services/reportService'
import { toast } from '@/components/ui/use-toast'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function ReportsAnalytics() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [formsPerformance, setFormsPerformance] = useState<FormsPerformanceResponse | null>(null)
  const [groupContributions, setGroupContributions] = useState<GroupContributionsResponse | null>(null)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'forms' | 'groups'>('overview')
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        start_date: dateRange.start_date || undefined,
        end_date: dateRange.end_date || undefined,
      }
      const [summaryData, analyticsData, formsData, groupsData] = await Promise.all([
        reportService.getSummary(params),
        reportService.getAnalytics(params),
        reportService.getFormsPerformance(params).catch(() => null),
        reportService.getGroupContributions(params).catch(() => null),
      ])
      setSummary(summaryData)
      setAnalytics(analyticsData)
      setFormsPerformance(formsData)
      setGroupContributions(groupsData)
    } catch (err) {
      console.error('Failed to load reports', err)
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await reportService.exportReport({
        type: 'analytics',
        format: 'csv',
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to export report', variant: 'destructive' })
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const chartData = analytics?.revenue_by_day?.map(d => ({
    month: new Date(d.date).toLocaleDateString('en-US', { month: 'short' }),
    value: d.amount,
  })) || [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0 },
  ]

  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Track your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              className="w-36"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            />
            <span className="text-gray-400">to</span>
            <Input 
              type="date" 
              className="w-36"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            />
          </div>
          <Button variant="secondary" className="flex items-center gap-2" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('forms')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-1 ${
            activeTab === 'forms'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Form Performance
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-1 ${
            activeTab === 'groups'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Group Contributions
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                {summary ? formatCurrency(summary.total_revenue) : '$0'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Forms</p>
              <p className="text-xl font-bold text-gray-900">
                {summary?.total_forms || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Contacts</p>
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(summary?.total_contacts || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  <TrendingDown className="h-3 w-3 inline" />
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Failed Payments</p>
              <p className="text-xl font-bold text-gray-900">
                {summary?.failed_payments || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Revenue Overview</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                    style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: data.value > 0 ? '4px' : '0' }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Top Performing Forms</h3>
            <div className="space-y-3">
              {analytics?.top_forms?.slice(0, 5).map((item) => (
                <div key={item.form_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.form_title}</p>
                    <p className="text-xs text-gray-500">{item.count} submissions</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                </div>
              ))}
              {(!analytics?.top_forms || analytics.top_forms.length === 0) && (
                <p className="text-center text-gray-500 py-4">No form data available</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'forms' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">Form Performance</h3>
            {formsPerformance?.totals && (
              <p className="text-sm text-gray-500 mt-1">
                {formsPerformance.totals.submissions} submissions, {formsPerformance.totals.payments} payments, {formatCurrency(formsPerformance.totals.paid_amount_total)} collected
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Form</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Submissions</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Payments</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Collected</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formsPerformance?.data?.map((form) => (
                  <tr key={form.form_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{form.title}</p>
                      <p className="text-xs text-gray-500">{form.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{form.submissions}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-600 font-medium">{form.paid_payments}</span>
                      <span className="text-gray-400"> / {form.payments}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(form.paid_amount_total)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${form.completion_rate >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                        {form.completion_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
                {(!formsPerformance?.data || formsPerformance.data.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No form performance data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">Group Contributions</h3>
            {groupContributions?.totals && (
              <p className="text-sm text-gray-500 mt-1">
                {groupContributions.totals.submissions} submissions, {formatCurrency(groupContributions.totals.paid_amount)} collected
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Group</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contacts</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Submissions</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Payments</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Collected</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Collection Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupContributions?.data?.map((group) => (
                  <tr key={group.group_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{group.group_name}</td>
                    <td className="px-4 py-3 text-right">{group.contact_count}</td>
                    <td className="px-4 py-3 text-right">{group.submissions}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{group.payments}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(group.paid_amount)}</td>
                    <td className="px-4 py-3 text-right">
                      {group.collection_rate !== undefined ? (
                        <span className={`font-medium ${group.collection_rate >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                          {group.collection_rate.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
                {(!groupContributions?.data || groupContributions.data.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No group contribution data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
