import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X, Send, Users, AlertCircle, CheckCircle } from 'lucide-react'

interface Form {
  id: string
  title: string
  pendingCount: number
}

interface Group {
  id: string
  name: string
  contactCount: number
}

interface ReminderModalProps {
  isOpen: boolean
  onClose: () => void
}

const mockForms: Form[] = [
  { id: 'f1', title: 'Tuition Fee - Fall 2024', pendingCount: 45 },
  { id: 'f2', title: 'Laboratory Equipment', pendingCount: 12 },
  { id: 'f3', title: 'Library Fine', pendingCount: 8 },
  { id: 'f4', title: 'Sports Equipment', pendingCount: 23 },
]

const mockGroups: Group[] = [
  { id: 'g1', name: 'Year 1 / Engineering', contactCount: 85 },
  { id: 'g2', name: 'Year 1 / Science', contactCount: 65 },
  { id: 'g3', name: 'Year 2 / Engineering', contactCount: 70 },
  { id: 'g4', name: 'Year 2 / Science', contactCount: 50 },
  { id: 'g5', name: 'Year 3 / Engineering', contactCount: 55 },
  { id: 'g6', name: 'Year 3 / Science', contactCount: 40 },
  { id: 'g7', name: 'Postgraduate / MSc', contactCount: 25 },
  { id: 'g8', name: 'Postgraduate / PhD', contactCount: 20 },
]

type ReminderType = 'all' | 'unpaid' | 'partial'

export function PaymentReminderModal({ isOpen, onClose }: ReminderModalProps) {
  const [selectedForm, setSelectedForm] = useState<string>('')
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [reminderType, setReminderType] = useState<ReminderType>('all')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  if (!isOpen) return null

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSend = async () => {
    if (!selectedForm || selectedGroups.size === 0) return

    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSending(false)
    setIsSent(true)
  }

  const handleClose = () => {
    setSelectedForm('')
    setSelectedGroups(new Set())
    setReminderType('all')
    setIsSent(false)
    onClose()
  }

  const totalContacts = Array.from(selectedGroups).reduce((sum, id) => {
    const group = mockGroups.find((g) => g.id === id)
    return sum + (group?.contactCount || 0)
  }, 0)

  const selectedFormData = mockForms.find((f) => f.id === selectedForm)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#002113] flex items-center justify-center">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-['Manrope'] font-bold text-slate-900">
                Send Payment Reminder
              </h2>
              <p className="text-sm text-slate-500">Notify contacts about pending payments</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Reminders Sent Successfully
              </h3>
              <p className="text-slate-500 mb-6">
                {totalContacts} contacts will receive the payment reminder email.
              </p>
              <Button onClick={handleClose} className="bg-slate-900 hover:bg-slate-800">
                Done
              </Button>
            </div>
          ) : (
            <>
              {/* Form Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                  Select Form
                </label>
                <select
                  value={selectedForm}
                  onChange={(e) => setSelectedForm(e.target.value)}
                  className={cn(
                    'w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-[#188ace] transition-all',
                    !selectedForm ? 'border-slate-200' : 'border-[#188ace]'
                  )}
                >
                  <option value="">Choose a form...</option>
                  {mockForms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.title} ({form.pendingCount} pending)
                    </option>
                  ))}
                </select>
              </div>

              {/* Reminder Type */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                  Reminder Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'all', label: 'All Contacts', desc: 'Everyone' },
                    { value: 'unpaid', label: 'Unpaid Only', desc: 'No payment' },
                    { value: 'partial', label: 'Partial', desc: 'Incomplete' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReminderType(type.value as ReminderType)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        reminderType === type.value
                          ? 'border-[#188ace] bg-[#188ace]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <p className="text-sm font-bold text-slate-900">{type.label}</p>
                      <p className="text-xs text-slate-500">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Groups */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                    Target Groups
                  </label>
                  <span className="text-xs text-slate-500">
                    {selectedGroups.size} selected
                  </span>
                </div>
                <div className="max-h-[200px] overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {mockGroups.map((group) => (
                    <label
                      key={group.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                        selectedGroups.has(group.id)
                          ? 'bg-[#188ace]/5'
                          : 'hover:bg-slate-50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#188ace] focus:ring-[#188ace]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{group.name}</p>
                      </div>
                      <span className="text-xs text-slate-400">{group.contactCount}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedForm && selectedGroups.size > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[#188ace] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Ready to send to {totalContacts} contact{totalContacts !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Selected: <span className="font-medium">{selectedFormData?.title}</span> -{' '}
                        {reminderType === 'all'
                          ? 'All contacts'
                          : reminderType === 'unpaid'
                          ? 'Contacts with no payment'
                          : 'Contacts with partial payment'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSent && (
          <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedForm || selectedGroups.size === 0 || isSending}
              className="flex-1 bg-[#000] hover:bg-[#333] disabled:bg-slate-300"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Reminders
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ReminderButtonProps {
  className?: string
}

export function ReminderButton({ className }: ReminderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all',
          className
        )}
      >
        <Send className="h-4 w-4" />
        Send Reminder
      </button>
      <PaymentReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
