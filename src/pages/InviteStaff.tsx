import { UserPlus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function InviteStaff() {
  return (
    <div className="flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Invite Team Member</h1>
            <p className="text-gray-500 mt-2">Add a new staff member to your organization</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="colleague@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select id="role" className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option>Admin</option>
                <option>Manager</option>
                <option>Staff</option>
                <option>Viewer</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <textarea 
                id="message" 
                className="w-full h-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"
                placeholder="Add a personal note..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Send Invite</Button>
            </div>
          </form>
        </div>
      </div>
  )
}

export function InviteStaffSuccessState() {
  return (
    <div className="flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Invite Sent!</h1>
          <p className="text-gray-500 mb-6">An invitation email has been sent to your colleague.</p>
          <Button className="w-full">Send Another Invite</Button>
        </div>
      </div>
  )
}

export function InviteStaffErrorState() {
  return (
    <div className="flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Invitation Failed</h1>
          <p className="text-gray-500 mb-6">There was an error sending the invitation. Please try again.</p>
          <Button className="w-full">Try Again</Button>
        </div>
      </div>
  )
}
