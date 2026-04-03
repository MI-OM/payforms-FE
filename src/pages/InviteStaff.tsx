import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/authService'
import { ApiError } from '@/lib/apiClient'

export function InviteStaff() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    role: 'staff' as 'admin' | 'manager' | 'staff' | 'viewer',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authService.invite({
        email: formData.email,
        role: formData.role,
        message: formData.message || undefined,
      })
      navigate('/invite/success')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to send invitation')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="colleague@company.com" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select 
              id="role" 
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'staff' | 'viewer' })}
              disabled={isLoading}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <textarea 
              id="message" 
              className="w-full h-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"
              placeholder="Add a personal note..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function InviteStaffSuccessState() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Invite Sent!</h1>
          <p className="text-gray-500 mb-6">An invitation email has been sent to your colleague.</p>
          <Button className="w-full" onClick={() => navigate('/team/invite')}>Send Another Invite</Button>
        </div>
      </div>
  )
}

export function InviteStaffErrorState() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Invitation Failed</h1>
          <p className="text-gray-500 mb-6">There was an error sending the invitation. Please try again.</p>
          <Button className="w-full" onClick={() => navigate('/team/invite')}>Try Again</Button>
        </div>
      </div>
  )
}
