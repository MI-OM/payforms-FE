import { Link } from 'react-router-dom'
import { Search, Filter, Download, MoreVertical, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const transactions = [
  { id: 'TXN-001', contact: 'Sarah Higgins', email: 'sarah@studio-h.co', form: 'Q1 Retainer', amount: '$12,500.00', status: 'completed', date: 'Jan 24, 2024' },
  { id: 'TXN-002', contact: 'Marcus Kray', email: 'mk@krayarch.com', form: 'Consultation Fee', amount: '$450.00', status: 'pending', date: 'Jan 24, 2024' },
  { id: 'TXN-003', contact: 'Jane Lofton', email: 'jane.l@outlook.com', form: 'Residential Deposit', amount: '$5,000.00', status: 'completed', date: 'Jan 23, 2024' },
  { id: 'TXN-004', contact: 'Robert Blackstone', email: 'rb@industrial.inc', form: 'Material Reimbursement', amount: '$22,480.00', status: 'failed', date: 'Jan 23, 2024' },
]

export function AllTransactionsLedger() {
  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-2">Transactions</h1>
            <p className="text-gray-500">Complete ledger of all payment transactions.</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-10" placeholder="Search transactions..." />
              </div>
              <Button variant="secondary" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Transaction ID</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Contact</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Form</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Amount</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-900">{txn.id}</td>
                    <td className="p-4">
                      <Link to={`/contacts/${index + 1}`} className="block">
                        <p className="font-bold text-gray-900">{txn.contact}</p>
                        <p className="text-xs text-gray-500">{txn.email}</p>
                      </Link>
                    </td>
                    <td className="p-4 text-gray-500">{txn.form}</td>
                    <td className="p-4 font-bold text-gray-900">{txn.amount}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                        txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                        txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {txn.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                        {txn.status === 'pending' && <Clock className="h-3 w-3" />}
                        {txn.status === 'failed' && <XCircle className="h-3 w-3" />}
                        {txn.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{txn.date}</td>
                    <td className="p-4">
                      <Link to={`/transactions/${txn.id}`} className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  )
}
