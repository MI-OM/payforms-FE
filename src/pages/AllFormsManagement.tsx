import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Search, Plus, MoreVertical, Eye, Edit, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const forms = [
  { title: 'Q1 Invoice Form', submissions: 124, status: 'Active', lastUpdated: '2 hours ago' },
  { title: 'Consultation Request', submissions: 89, status: 'Active', lastUpdated: '1 day ago' },
  { title: 'Project Deposit', submissions: 45, status: 'Draft', lastUpdated: '3 days ago' },
  { title: 'Material Order Form', submissions: 0, status: 'Inactive', lastUpdated: '1 week ago' },
]

export function AllFormsManagement() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Forms</h1>
            <p className="text-gray-500">Manage all your payment forms in one place.</p>
          </div>
          <Link to="/forms/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Form
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['all', 'active', 'draft', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-bold transition-colors capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Search forms..." />
          </div>
          <Button variant="secondary">Filter</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.map((form, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{form.title}</h3>
                  <p className="text-sm text-gray-500">{form.submissions} submissions</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  form.status === 'Active' ? 'bg-green-100 text-green-700' :
                  form.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {form.status}
                </span>
                <span className="text-xs text-gray-400">Updated {form.lastUpdated}</span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Link to="/forms/builder">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}
