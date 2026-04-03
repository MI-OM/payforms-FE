import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, TrendingUp, TrendingDown, DollarSign, Users, FileText, CreditCard, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reportService, type ReportSummary, type AnalyticsData } from '@/services/reportService'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function ReportsAnalytics() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryData, analyticsData] = await Promise.all([
        reportService.getSummary(),
        reportService.getAnalytics(),
      ])
      setSummary(summaryData)
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Failed to load reports', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await reportService.exportReport({
        type: 'summary',
        format: 'csv',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export report')
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
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-500">Track your business performance</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Active
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold tracking-tight text-gray-900">
              {summary ? formatCurrency(summary.total_revenue) : '$0'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Forms</p>
            <p className="text-2xl font-extrabold tracking-tight text-gray-900">
              {summary?.total_forms || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Contacts</p>
            <p className="text-2xl font-extrabold tracking-tight text-gray-900">
              {summary?.total_contacts || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Failed
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Failed Payments</p>
            <p className="text-2xl font-extrabold tracking-tight text-gray-900">
              {summary?.failed_payments || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Revenue Overview</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600 cursor-pointer"
                  style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: data.value > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                <span className="text-xs font-bold text-gray-700">{data.value > 0 ? formatCurrency(data.value) : '-'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Top Performing Forms</h3>
          <div className="space-y-4">
            {analytics?.top_forms?.map((item) => (
              <div key={item.form_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">{item.form_title}</p>
                  <p className="text-sm text-gray-500">{item.count} submissions</p>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{formatCurrency(item.amount)}</p>
              </div>
            ))}
            {(!analytics?.top_forms || analytics.top_forms.length === 0) && (
              <p className="text-center text-gray-500 py-4">No form data available</p>
            )}
          </div>
        </div>
      </div>
  )
}
