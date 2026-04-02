import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface PageHeaderProps {
  title: string
  breadcrumb?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        {breadcrumb && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/dashboard" className="hover:text-[#3B82F6]">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>{breadcrumb}</span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

interface StatsCardProps {
  label: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

export function StatsCard({ label, value, change, icon, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  }

  const changeColor = change?.startsWith('+') ? 'text-green-600' : change?.startsWith('-') ? 'text-red-600' : 'text-gray-500'

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${changeColor} bg-opacity-10 ${changeColor.replace('text', 'bg')}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

interface DataTableProps<T> {
  columns: {
    key: string
    label: string
    render?: (item: T) => React.ReactNode
  }[]
  data: T[]
  keyExtractor: (item: T) => string
}

export function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                  {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className || ''}`}>
      {children}
    </div>
  )
}

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'failed' | 'draft' | 'inactive'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    draft: 'bg-gray-100 text-gray-700',
    failed: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-500',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClasses[status]}`}>
      {status}
    </span>
  )
}
