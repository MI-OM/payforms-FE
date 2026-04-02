import { Link } from 'react-router-dom'
import { Search, Download, ChevronDown, Upload, Shield, Edit, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const activityLogs = [
  { icon: Upload, title: 'Bulk Import', id: '9XJ-202', description: 'Processed Q4_Invoices_Final.csv', time: '14:20 PM', date: 'Oct 24, 2023' },
  { icon: Shield, title: 'Login Success', id: '8AA-104', description: 'User session from 192.168.1.45', time: '13:45 PM', date: 'Oct 24, 2023' },
  { icon: Edit, title: 'Settings Update', id: '7FF-091', description: 'Changed global VAT rate to 20%', time: '11:12 AM', date: 'Oct 24, 2023' },
  { icon: Settings, title: 'Form Created', id: '6GG-082', description: 'New payment form: Q1 Invoice', time: '09:30 AM', date: 'Oct 23, 2023' },
]

export function AllActivityLogs() {
  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Activity Logs</h1>
            <p className="text-gray-500">Complete audit trail of all administrative actions.</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Recent History</span>
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                <span>Showing last 24 hours</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-10" placeholder="Search logs..." />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {activityLogs.map((log, index) => (
              <Link key={index} to={`/activity/${log.id}`} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  <log.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-gray-900">{log.title}</span>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">ID: {log.id}</span>
                  </div>
                  <p className="text-xs text-gray-500">{log.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-700">{log.time}</div>
                  <div className="text-[10px] text-gray-400">{log.date}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
  )
}
