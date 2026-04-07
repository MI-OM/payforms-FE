import { useState, useEffect, useCallback } from 'react'
import { Calendar, BarChart3 } from 'lucide-react'
import { Download, TrendingUp, TrendingDown, DollarSign, Users, FileText, CreditCard, Loader, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { reportService, type ReportSummary, type AnalyticsData, type FormsPerformanceResponse, type GroupContributionsResponse } from '@/services/reportService'
import { toast } from '@/components/ui/use-toast'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
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
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      start_date: firstDay.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    }
  })
  const [endpointErrors, setEndpointErrors] = useState<Record<string, boolean>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    const errors: Record<string, boolean> = {}
    
    try {
      const params = {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      }

      const [summaryData, analyticsData, formsData, groupsData] = await Promise.all([
        reportService.getSummary(params).catch(err => {
          console.warn('[Reports] Summary error:', err)
          errors.summary = true
          return null
        }),
        reportService.getAnalytics(params).catch(err => {
          console.warn('[Reports] Analytics error:', err)
          errors.analytics = true
          return null
        }),
        reportService.getFormsPerformance(params).catch(err => {
          console.warn('[Reports] Forms performance error:', err)
          errors.forms = true
          return null
        }),
        reportService.getGroupContributions(params).catch(err => {
          console.warn('[Reports] Group contributions error:', err)
          errors.groups = true
          return null
        }),
      ])
      
      setSummary(summaryData)
      setAnalytics(analyticsData)
      setFormsPerformance(formsData)
      setGroupContributions(groupsData)
      setEndpointErrors(errors)
    } catch (err) {
      console.error('[Reports] Failed to load reports', err)
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
        <Loader className="h-8 w-8 animate-spin text-[#006398]" />
      </div>
    )
  }

  const chartData = analytics?.payments_by_day?.map(d => ({
    month: new Date(d.day).toLocaleDateString('en-US', { month: 'short' }),
    value: d.total,
  })) || []

  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1e]">Reports & Analytics</h1>
          <p className="text-[#45464d]">Track your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              className="w-36"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            />
            <span className="text-[#45464d]">to</span>
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
              ? 'text-[#006398] border-b-2 border-[#006398]'
              : 'text-[#45464d] hover:text-[#191c1e]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('forms')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-1 ${
            activeTab === 'forms'
              ? 'text-[#006398] border-b-2 border-[#006398]'
              : 'text-[#45464d] hover:text-[#191c1e]'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Form Performance
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-1 ${
            activeTab === 'groups'
              ? 'text-[#006398] border-b-2 border-[#006398]'
              : 'text-[#45464d] hover:text-[#191c1e]'
          }`}
        >
          <Users className="h-4 w-4" />
          Group Contributions
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-[#4edea3]/20 rounded-lg">
                  <DollarSign className="h-4 w-4 text-[#009668]" />
                </div>
              </div>
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-xl font-extrabold text-[#191c1e]">
                {summary ? formatCurrency(summary.payment_paid_total) : '₦0'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-[#006398]/10 rounded-lg">
                  <FileText className="h-4 w-4 text-[#006398]" />
                </div>
              </div>
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Total Transactions</p>
              <p className="text-xl font-extrabold text-[#191c1e]">
                {formatNumber(summary?.payments || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-[#188ace]/10 rounded-lg">
                  <Users className="h-4 w-4 text-[#188ace]" />
                </div>
              </div>
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Total Contacts</p>
              <p className="text-xl font-extrabold text-[#191c1e]">
                {formatNumber(summary?.contacts || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CreditCard className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                  <TrendingDown className="h-3 w-3 inline" />
                </span>
              </div>
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Failed Payments</p>
              <p className="text-xl font-extrabold text-[#191c1e]">
                {formatCurrency(summary?.payment_failed_total || 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-[#c6c6cd]/10">
            <h3 className="text-lg font-bold mb-4 text-[#191c1e]">Revenue Overview</h3>
            {chartData.length > 0 ? (
              <div className="h-48 flex items-end justify-between gap-2">
                {chartData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-[#006398] rounded-t transition-all hover:bg-[#188ace] cursor-pointer"
                      style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: data.value > 0 ? '4px' : '0' }}
                    />
                    <span className="text-xs text-[#45464d] mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#45464d]">
                <p className="text-sm">No revenue data available for this period</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/10">
            <h3 className="text-lg font-bold mb-4 text-[#191c1e]">Top Performing Forms</h3>
            <div className="space-y-3">
              {formsPerformance?.data?.slice(0, 5).map((item) => (
                <div key={item.form_id} className="flex items-center justify-between p-3 bg-[#f2f4f6] rounded-lg">
                  <div>
                    <p className="font-bold text-[#191c1e]">{item.title}</p>
                    <p className="text-xs text-[#45464d]">{item.submissions} submissions</p>
                  </div>
                  <p className="font-extrabold text-[#191c1e]">{formatCurrency(item.paid_amount_total)}</p>
                </div>
              ))}
              {(!formsPerformance?.data || formsPerformance.data.length === 0) && (
                <p className="text-center text-[#45464d] py-4">No form data available</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'forms' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#c6c6cd]/10">
          <div className="p-4 border-b border-[#eceef0]">
            <h3 className="text-lg font-bold text-[#191c1e]">Form Performance</h3>
            {endpointErrors.forms ? (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-100 rounded text-[10px] font-bold">Endpoint unavailable</span>
                This feature requires backend implementation
              </p>
            ) : formsPerformance?.totals && (
              <p className="text-sm text-[#45464d] mt-1">
                {formsPerformance.totals.submissions} submissions, {formsPerformance.totals.payments} payments, {formatCurrency(formsPerformance.totals.paid_amount_total)} collected
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            {endpointErrors.forms ? (
              <div className="p-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-[#e0e3e5] mb-4" />
                <p className="text-[#45464d] mb-2">Form Performance API endpoint is not available</p>
                <p className="text-sm text-[#76777d]">The backend needs to implement GET /reports/forms/performance</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#f2f4f6] border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Form</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Submissions</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Payments</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Collected</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {formsPerformance?.data?.map((form) => (
                    <tr key={form.form_id} className="hover:bg-[#f2f4f6]/50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#191c1e]">{form.title}</p>
                        <p className="text-xs text-[#45464d]">{form.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                          form.is_active ? 'bg-[#4edea3]/20 text-[#009668]' : 'bg-[#e0e3e5] text-[#45464d]'
                        }`}>
                          {form.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{form.submissions}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[#009668] font-bold">{form.paid_payments}</span>
                        <span className="text-[#76777d]"> / {form.payments}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold">{formatCurrency(form.paid_amount_total)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${form.completion_rate >= 50 ? 'text-[#009668]' : 'text-amber-600'}`}>
                          {form.completion_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!formsPerformance?.data || formsPerformance.data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#45464d]">No form performance data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#c6c6cd]/10">
          <div className="p-4 border-b border-[#eceef0]">
            <h3 className="text-lg font-bold text-[#191c1e]">Group Contributions</h3>
            {endpointErrors.groups ? (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-100 rounded text-[10px] font-bold">Endpoint unavailable</span>
                This feature requires backend implementation
              </p>
            ) : groupContributions?.totals && (
              <p className="text-sm text-[#45464d] mt-1">
                {groupContributions.totals.submissions} submissions, {formatCurrency(groupContributions.totals.paid_amount)} collected
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            {endpointErrors.groups ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-[#e0e3e5] mb-4" />
                <p className="text-[#45464d] mb-2">Group Contributions API endpoint is not available</p>
                <p className="text-sm text-[#76777d]">The backend needs to implement GET /reports/groups/contributions</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#f2f4f6] border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Group</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Contacts</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Submissions</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Payments</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Collected</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {groupContributions?.data?.map((group) => (
                    <tr key={group.group_id} className="hover:bg-[#f2f4f6]/50">
                      <td className="px-4 py-3 font-bold text-[#191c1e]">{group.group_name}</td>
                      <td className="px-4 py-3 text-right">{group.contact_count}</td>
                      <td className="px-4 py-3 text-right">{group.submissions}</td>
                      <td className="px-4 py-3 text-right text-[#009668] font-bold">{group.payments}</td>
                      <td className="px-4 py-3 text-right font-extrabold">{formatCurrency(group.paid_amount)}</td>
                      <td className="px-4 py-3 text-right">
                        {group.collection_rate !== undefined ? (
                          <span className={`font-bold ${group.collection_rate >= 50 ? 'text-[#009668]' : 'text-amber-600'}`}>
                            {group.collection_rate.toFixed(1)}%
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!groupContributions?.data || groupContributions.data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#45464d]">No group contribution data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
