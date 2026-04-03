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
    first_name: '',
    last_name: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authService.invite({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="John" 
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>
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
