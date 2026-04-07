import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, BarChart3 } from 'lucide-react'
import { Download, TrendingUp, TrendingDown, DollarSign, Users, FileText, CreditCard, Loader, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { reportService, type ReportSummary, type AnalyticsData, type FormsPerformanceResponse, type GroupContributionsResponse } from '@/services/reportService'
import { paymentService } from '@/services/paymentService'
import { toast } from '@/components/ui/use-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'

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
  const [transactionStats, setTransactionStats] = useState<{ paid: number; pending: number; failed: number; partial: number; total: number }>({ paid: 0, pending: 0, failed: 0, partial: 0, total: 0 })
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

      const [summaryData, analyticsData, formsData, groupsData, transactionsData] = await Promise.all([
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
        paymentService.getTransactions({ limit: 1000, ...params }).catch(() => null),
      ])
      
      if (transactionsData?.data) {
        const stats = {
          paid: 0,
          pending: 0,
          failed: 0,
          partial: 0,
          total: 0,
          paidAmount: 0,
          pendingAmount: 0,
          failedAmount: 0,
          partialAmount: 0,
        }
        transactionsData.data.forEach((txn: any) => {
          const amount = parseFloat(txn.amount_paid || txn.amount || 0)
          stats.total++
          switch (txn.status?.toUpperCase()) {
            case 'PAID':
              stats.paid++
              stats.paidAmount += amount
              break
            case 'PENDING':
              stats.pending++
              stats.pendingAmount += amount
              break
            case 'FAILED':
              stats.failed++
              stats.failedAmount += amount
              break
            case 'PARTIAL':
              stats.partial++
              stats.partialAmount += amount
              break
          }
        })
        setTransactionStats({
          paid: stats.paid,
          pending: stats.pending,
          failed: stats.failed,
          partial: stats.partial,
          total: stats.total,
          paidAmount: stats.paidAmount,
          pendingAmount: stats.pendingAmount,
          failedAmount: stats.failedAmount,
          partialAmount: stats.partialAmount,
        })
      }
      
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
    day: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: d.total,
    count: d.count
  })) || []

  const getStatusCount = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    const breakdown = analytics?.payment_status_breakdown?.find(s => s.status.toUpperCase() === normalizedStatus)
    return breakdown?.count || 0
  }

  const getStatusAmount = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    const breakdown = analytics?.payment_status_breakdown?.find(s => s.status.toUpperCase() === normalizedStatus)
    return breakdown?.total_amount || 0
  }

  const paidCount = transactionStats.paid || summary?.payments || getStatusCount('PAID')
  const pendingCount = transactionStats.pending || getStatusCount('PENDING')
  const failedCount = transactionStats.failed || getStatusCount('FAILED')
  const partialCount = transactionStats.partial || getStatusCount('PARTIAL')
  const totalTransactions = transactionStats.total || summary?.payments || (paidCount + pendingCount + failedCount + partialCount)
  const successRate = totalTransactions > 0 ? Math.round((paidCount / totalTransactions) * 100 * 10) / 10 : 0
  
  const collectedAmount = transactionStats.paidAmount || 
    summary?.payment_paid_total || 
    getStatusAmount('PAID') ||
    (formsPerformance?.totals?.paid_amount_total) ||
    0
  const pendingAmount = transactionStats.pendingAmount || summary?.payment_pending_total || getStatusAmount('PENDING') || 0
  const failedAmount = transactionStats.failedAmount || summary?.payment_failed_total || getStatusAmount('FAILED') || 0
  const partialAmount = transactionStats.partialAmount || summary?.payment_partial_total || getStatusAmount('PARTIAL') || 0
  const totalPaymentVolume = collectedAmount + pendingAmount + failedAmount + partialAmount || summary?.payment_total || 0
  const outstandingAmount = pendingAmount + partialAmount

  const COLORS = ['#009668', '#188ace', '#e0e3e5', '#ba1a1a']
  
  const statusData = [
    { name: 'Paid', value: paidCount, amount: collectedAmount },
    { name: 'Pending', value: pendingCount, amount: pendingAmount },
    { name: 'Partial', value: partialCount, amount: partialAmount },
    { name: 'Failed', value: failedCount, amount: failedAmount },
  ].filter(d => d.value > 0)

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
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Collected</p>
              <p className="text-xl font-extrabold text-[#009668]">
                {formatCurrency(collectedAmount)}
              </p>
              <p className="text-[10px] text-[#76777d] mt-1">{paidCount} paid payments</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Outstanding</p>
              <p className="text-xl font-extrabold text-amber-600">
                {formatCurrency(outstandingAmount)}
              </p>
              <p className="text-[10px] text-[#76777d] mt-1">{pendingCount + partialCount} pending payments</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-[#006398]/10 rounded-lg">
                  <FileText className="h-4 w-4 text-[#006398]" />
                </div>
              </div>
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Total Volume</p>
              <p className="text-xl font-extrabold text-[#191c1e]">
                {formatCurrency(totalPaymentVolume)}
              </p>
              <p className="text-[10px] text-[#76777d] mt-1">{totalTransactions} transactions</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CreditCard className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-1">Failed</p>
              <p className="text-xl font-extrabold text-red-600">
                {formatCurrency(failedAmount)}
              </p>
              <p className="text-[10px] text-[#76777d] mt-1">{failedCount} failed payments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#191c1e]">Daily Revenue</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#000000]"></span>
                    <span className="text-[10px] font-bold uppercase">Revenue</span>
                  </div>
                </div>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12, fill: '#45464d' }}
                      axisLine={{ stroke: '#f2f4f6' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₦${(Number(value) / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 12, fill: '#45464d' }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip 
                      formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e0e3e5', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#000000" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#000000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-[#45464d]">
                  <p className="text-sm">No revenue data available</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c6c6cd]/10">
              <h3 className="text-lg font-bold mb-4 text-[#191c1e]">Payment Status</h3>
              {statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} payments`, String(name)]}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e0e3e5', 
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {statusData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="text-[#45464d]">{item.name}</span>
                        </div>
                        <span className="font-bold text-[#191c1e]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-[#45464d]">
                  <p className="text-sm">No payment data available</p>
                </div>
              )}
            </div>
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
                  <p className="font-extrabold text-[#191c1e]">
                    {formatCurrency(item.paid_amount_total || item.paid_amount || 0)}
                  </p>
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
                {formsPerformance.totals.submissions} submissions, {formsPerformance.totals.payments} payments, {formatCurrency(formsPerformance.totals.paid_amount_total || 0)} collected
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
                      <td className="px-4 py-3 text-right font-extrabold">
                        {formatCurrency(form.paid_amount_total || form.paid_amount || 0)}
                      </td>
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
