import { Download, TrendingUp, TrendingDown, DollarSign, Users, FileText, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { label: 'Total Revenue', value: '$1,482,900', change: '+12.4%', trend: 'up', icon: DollarSign },
  { label: 'Active Forms', value: '24', change: '+3', trend: 'up', icon: FileText },
  { label: 'Total Contacts', value: '1,248', change: '+156', trend: 'up', icon: Users },
  { label: 'Failed Payments', value: '12', change: '-2', trend: 'down', icon: CreditCard },
]

const chartData = [
  { month: 'Jan', value: 42000 },
  { month: 'Feb', value: 55000 },
  { month: 'Mar', value: 48000 },
  { month: 'Apr', value: 67000 },
  { month: 'May', value: 82000 },
  { month: 'Jun', value: 95000 },
]

export function ReportsAnalytics() {
  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-500">Track your business performance</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <stat.icon className="h-5 w-5 text-gray-600" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold tracking-tight text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Revenue Overview</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600 cursor-pointer"
                  style={{ height: `${(data.value / 100000) * 100}%` }}
                />
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                <span className="text-xs font-bold text-gray-700">${(data.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Top Performing Forms</h3>
          <div className="space-y-4">
            {[
              { form: 'Q1 Retainer - Studio H', revenue: '$45,000', submissions: 12 },
              { form: 'Consultation Fee', revenue: '$12,500', submissions: 28 },
              { form: 'Project Deposit', revenue: '$8,000', submissions: 8 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">{item.form}</p>
                  <p className="text-sm text-gray-500">{item.submissions} submissions</p>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{item.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}
