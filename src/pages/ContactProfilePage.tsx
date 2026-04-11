import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoIcon } from '@/components/Logo'
import { ContactSidebar } from '@/components/layouts/ContactSidebar'
import { contactAuthService } from '@/services/contactAuthService'
import { contactService } from '@/services/contactService'
import { User, Mail, Phone, GraduationCap, Save, Loader2, Shield, Check } from 'lucide-react'

interface ContactProfile {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone?: string
  gender?: string
  student_id?: string
  external_id?: string
  guardian_name?: string
  guardian_email?: string
  guardian_phone?: string
  is_active: boolean
  require_login: boolean
}

export function ContactProfilePage() {
  const navigate = useNavigate()
  const [contact, setContact] = useState<ContactProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await contactAuthService.getMe()
        setContact(data)
        setFormData({
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
        })
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await contactAuthService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('contact_data')
      localStorage.removeItem('payforms_access_token')
      localStorage.removeItem('payforms_refresh_token')
      localStorage.removeItem('pf_contact_token')
      localStorage.removeItem('pf_contact')
      navigate('/contact/login')
    }
  }

  const handleSave = async () => {
    if (!contact) return
    
    setSaving(true)
    setSaved(false)
    setError(null)
    
    try {
      await contactService.updateContact(contact.id, {
        first_name: formData.first_name,
        middle_name: formData.middle_name || undefined,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  const contactName = contact ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') : 'Student'

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <ContactSidebar onLogout={handleLogout} />
      
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your profile information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{contactName}</h2>
                <p className="text-sm text-gray-500">{contact?.email}</p>
                {contact?.student_id && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    <GraduationCap className="w-3 h-3" />
                    ID: {contact.student_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => handleChange('middle_name', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1 text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={contact?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1 text-gray-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {contact?.student_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <GraduationCap className="w-4 h-4 inline mr-1 text-gray-400" />
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={contact.student_id}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}

              {contact?.external_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Shield className="w-4 h-4 inline mr-1 text-gray-400" />
                    External ID
                  </label>
                  <input
                    type="text"
                    value={contact.external_id}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {(contact?.guardian_name || contact?.guardian_email) && (
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Guardian Information</h3>
              <div className="space-y-2 text-sm">
                {contact.guardian_name && (
                  <div className="flex gap-2">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-gray-900">{contact.guardian_name}</span>
                  </div>
                )}
                {contact.guardian_email && (
                  <div className="flex gap-2">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900">{contact.guardian_email}</span>
                  </div>
                )}
                {contact.guardian_phone && (
                  <div className="flex gap-2">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-900">{contact.guardian_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
