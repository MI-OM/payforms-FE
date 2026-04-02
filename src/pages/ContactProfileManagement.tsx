import { Mail, Phone, Building, MapPin, Calendar, MoreVertical, Edit, Trash2, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function ContactProfileManagement() {
  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary-container p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                  <AvatarFallback className="text-xl">SH</AvatarFallback>
                </Avatar>
                <div className="text-on-primary-container">
                  <h1 className="text-2xl font-extrabold tracking-tight">Sarah Higgins</h1>
                  <p className="text-on-primary-container/70">sarah@studio-h.co</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">Edit Profile</Button>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Email</p>
                <p className="font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> sarah@studio-h.co</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Phone</p>
                <p className="font-medium flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 123-4567</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Company</p>
                <p className="font-medium flex items-center gap-2"><Building className="h-4 w-4" /> Studio H</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Location</p>
                <p className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4" /> New York, NY</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Added On</p>
                <p className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Oct 15, 2023</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total Payments</p>
                <p className="font-bold text-lg">$24,500.00</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {[
                  { date: 'Jan 24, 2024', form: 'Q1 Retainer', amount: '$12,500.00', status: 'Completed' },
                  { date: 'Dec 15, 2023', form: 'Project Deposit', amount: '$8,000.00', status: 'Completed' },
                  { date: 'Nov 1, 2023', form: 'Initial Consultation', amount: '$4,000.00', status: 'Completed' },
                ].map((txn, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                    <div>
                      <p className="font-bold">{txn.form}</p>
                      <p className="text-sm text-on-surface-variant">{txn.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{txn.amount}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container font-bold">
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
              <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                <History className="h-4 w-4" />
                View All Payments
              </Button>
              <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Contact
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2 text-error">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
