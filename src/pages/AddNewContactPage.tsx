import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type CreateContactRequest } from '@/services/contactService'
import { toast } from '@/components/ui/use-toast'

export function AddNewContactPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateContactRequest>({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    student_id: '',
    guardian_name: '',
    guardian_email: '',
    guardian_phone: '',
    require_login: true,
  })

  const handleChange = (field: keyof CreateContactRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await contactService.createContact(formData)
      toast({
        title: 'Success',
        description: 'Contact created successfully',
      })
      navigate('/contacts')
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create contact. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#45464d] font-medium mb-4">
          <Link to="/contacts" className="hover:text-[#006398] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#191c1e] tracking-tight mb-2">
            Add New Contact
          </h1>
          <p className="text-[#45464d] max-w-2xl">
            Create a permanent ledger entry for a new student and their corresponding guardian information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Information */}
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#001d31] flex items-center justify-center text-[#93ccff]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#006398] uppercase tracking-wide">Student Information</h3>
                <p className="text-xs text-[#45464d]">Primary identification and personal details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 lg:gap-6">
              {/* Student ID */}
              <div className="md:col-span-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Student Identification Number or USER ID
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4 text-[#191c1e]"
                  placeholder="e.g. STU-2024-001"
                  value={formData.student_id || ''}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                />
              </div>

              {/* Names */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  First Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="First name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Middle Name
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="Middle name"
                  value={formData.middle_name || ''}
                  onChange={(e) => handleChange('middle_name', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Last Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="Last name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>

              {/* Contact Details */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Email Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="student@institution.edu"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Phone Number
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              {/* Gender */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Gender
                </label>
                <select
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4 text-sm"
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">Select option</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#e6e8ea] flex items-center justify-center text-[#191c1e]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#191c1e] uppercase tracking-wide">Guardian Information</h3>
                <p className="text-xs text-[#45464d]">Secondary contact details for emergency or billing use</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Guardian Full Name
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="Guardian's full name"
                  value={formData.guardian_name || ''}
                  onChange={(e) => handleChange('guardian_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Guardian Email
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="guardian@email.com"
                  type="email"
                  value={formData.guardian_email || ''}
                  onChange={(e) => handleChange('guardian_email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                  Guardian Phone
                </label>
                <Input
                  className="w-full bg-[#f2f4f6] border-none rounded-lg p-3 lg:p-4"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  value={formData.guardian_phone || ''}
                  onChange={(e) => handleChange('guardian_phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sticky Action Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-[#e0e3e5]">
            <div className="flex items-center gap-2 text-[#45464d]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              <span className="text-xs font-medium">Secure Entry Protocol Active</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/contacts')}
                className="px-6 lg:px-8 py-3 rounded-md font-bold text-xs uppercase tracking-widest border border-[#c6c6cd]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 lg:px-8 py-3 rounded-md font-bold text-xs uppercase tracking-widest bg-black text-white hover:bg-slate-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Contact'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
