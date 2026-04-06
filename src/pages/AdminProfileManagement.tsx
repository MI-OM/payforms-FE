import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save, Shield, User, Building, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { authService, type User as UserType } from '@/services/authService'
import { organizationService } from '@/services/organizationService'
import { ApiError } from '@/lib/apiClient'

export function AdminProfileManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [organizationName, setOrganizationName] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    title: '',
    designation: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userData, orgData] = await Promise.all([
          authService.getProfile(),
          organizationService.getOrganization().catch(() => null)
        ])
        setUser(userData)
        setOrganizationName(orgData?.name || '')
        setFormData({
          first_name: userData.first_name || '',
          middle_name: userData.middle_name || '',
          last_name: userData.last_name || '',
          title: userData.title || '',
          designation: userData.designation || '',
        })
      } catch (err) {
        setError('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const updatedUser = await authService.updateProfile(formData)
      setUser(updatedUser)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to update profile')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-4xl mx-auto p-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Profile Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            Profile updated successfully!
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-slate-100 text-slate-600">
                  {getInitials(formData.first_name, formData.last_name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-slate-500">{user?.email}</p>
              <p className="text-sm text-slate-400 mt-1">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Staff'}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <Input 
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Middle Name</label>
                <Input 
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  placeholder="Middle name (optional)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Last Name</label>
                <Input 
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input 
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-400">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mr., Mrs., Dr."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Designation</label>
                <Input 
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Finance Manager"
                />
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <Building className="h-5 w-5" />
              Organization
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Organization Name</label>
                <Input 
                  value={organizationName}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-400">Organization name is managed in Settings</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <Input 
                  value={user?.role === 'ADMIN' ? 'Administrator' : 'Staff'}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <Shield className="h-5 w-5" />
              Security
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-900">Password</p>
                  <p className="text-sm text-slate-500">Last changed unknown</p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => navigate('/password-reset')}
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
