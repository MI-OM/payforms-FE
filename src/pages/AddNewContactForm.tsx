import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { contactService } from '@/services/contactService'

export function AddNewContactForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.first_name || !form.last_name) {
      alert('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      await contactService.createContact({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        student_id: form.student_id || undefined,
        guardian_name: form.guardian_name || undefined,
        guardian_email: form.guardian_email || undefined,
        guardian_phone: form.guardian_phone || undefined,
        require_login: form.require_login,
      })
      navigate('/contacts')
    } catch (err) {
      alert('Failed to create contact')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Add New Contact</h1>
            <button onClick={() => navigate('/contacts')} className="text-on-surface-variant hover:text-on-surface">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input 
                  id="first_name" 
                  placeholder="John" 
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input 
                  id="last_name" 
                  placeholder="Doe" 
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@example.com" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID</Label>
              <Input 
                id="student_id" 
                placeholder="S12345" 
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              />
            </div>

            <div className="border-t border-outline-variant/10 pt-4">
              <h3 className="text-sm font-bold text-on-surface-variant mb-4">Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input 
                    id="guardian_name" 
                    placeholder="Jane Doe" 
                    value={form.guardian_name}
                    onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input 
                    id="guardian_phone" 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    value={form.guardian_phone}
                    onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="guardian_email">Guardian Email</Label>
                <Input 
                  id="guardian_email" 
                  type="email" 
                  placeholder="guardian@example.com" 
                  value={form.guardian_email}
                  onChange={(e) => setForm({ ...form, guardian_email: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/contacts')}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Contact
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
