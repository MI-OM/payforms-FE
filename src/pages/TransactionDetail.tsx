import { useState } from 'react'
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, MoreVertical, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const transactions = [
  { id: 'TXN-001', contact: 'Sarah Higgins', email: 'sarah@studio-h.co', form: 'Q1 Retainer', amount: '$12,500.00', status: 'completed', date: 'Jan 24, 2024' },
]

export function IndividualTransactionDetail() {
  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <span>Transactions</span>
          <ChevronRight className="h-4 w-4" />
          <span>TXN-001</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Transaction Details</h1>
              <p className="text-on-surface-variant">TXN-001</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container text-sm font-bold">
              Completed
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Amount</p>
                <p className="text-3xl font-extrabold">$12,500.00</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Date</p>
                <p className="text-xl font-bold">Jan 24, 2024</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Contact</p>
                <p className="font-bold">Sarah Higgins</p>
                <p className="text-sm text-on-surface-variant">sarah@studio-h.co</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Form</p>
                <p className="font-bold">Q1 Retainer - Studio H</p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-lg p-4 mb-6">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Payment Details</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Method</span>
                  <span className="font-bold">Credit Card</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Card</span>
                  <span className="font-bold">•••• 4242</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Reference</span>
                  <span className="font-mono">TXN-123456</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1">Download Receipt</Button>
              <Button variant="secondary" className="flex-1">View Contact</Button>
              <Button variant="outline" className="text-error">Refund</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
