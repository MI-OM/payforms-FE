import { Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DeleteContactConfirmationModal() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
        <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tighter mb-2">Delete Contact?</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Are you sure you want to delete <span className="font-bold text-on-surface">Sarah Higgins</span>? This action cannot be undone and will remove all associated payment history.
            </p>
            <div className="space-y-3">
              <Button className="w-full bg-error text-on-error hover:opacity-90">
                Delete Contact
              </Button>
              <Button variant="secondary" className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeleteContactSuccessModal() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
        <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-tertiary-fixed/30 text-on-tertiary-container rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tighter mb-2">Contact Deleted</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Sarah Higgins has been successfully removed from your contacts.
            </p>
            <Button className="w-full">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeleteContactErrorModal() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
        <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tighter mb-2">Deletion Failed</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              There was an error deleting this contact. Please try again.
            </p>
            <div className="space-y-3">
              <Button className="w-full">
                Try Again
              </Button>
              <Button variant="secondary" className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeleteContactConfirmationStates() {
  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
        <div className="bg-surface-container-lowest rounded-xl p-8">
          <h3 className="text-lg font-bold mb-4">Confirmation State</h3>
          <p className="text-sm text-on-surface-variant mb-4">Default confirmation modal before deletion.</p>
          <Button variant="outline" className="w-full">Show Modal</Button>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-8">
          <h3 className="text-lg font-bold mb-4">Success State</h3>
          <p className="text-sm text-on-surface-variant mb-4">Shown after successful deletion.</p>
          <Button variant="outline" className="w-full">Show Modal</Button>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-8">
          <h3 className="text-lg font-bold mb-4">Error State</h3>
          <p className="text-sm text-on-surface-variant mb-4">Shown when deletion fails.</p>
          <Button variant="outline" className="w-full">Show Modal</Button>
        </div>
      </div>
    </div>
  )
}
