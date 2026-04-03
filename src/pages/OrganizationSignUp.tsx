import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Building, Mail, Globe, ArrowRight, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/authService'
import { ApiError } from '@/lib/apiClient'
import { validatePassword, getPasswordStrengthDisplay, isPasswordMatch } from '@/lib/passwordStrength'

export function OrganizationSignUp() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    organization_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    website: '',
  })

  const passwordValidation = validatePassword(formData.password)
  const strengthDisplay = getPasswordStrengthDisplay(formData.password)
  const passwordsMatch = isPasswordMatch(formData.password, formData.confirm_password)
  const isPasswordValid = passwordValidation.isValid && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authService.register({
        organization_name: formData.organization_name,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        website: formData.website || undefined,
      })
      navigate('/email/verify-prompt')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Registration failed. Please try again.')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Payforms</span>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create your organization</h1>
          <p className="text-on-surface-variant mb-8">Set up your organization to start collecting payments</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <Input 
                  id="orgName" 
                  className="pl-10" 
                  placeholder="Acme Corporation" 
                  required 
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

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
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <Input 
                  id="email" 
                  type="email" 
                  className="pl-10" 
                  placeholder="john@acme.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Create a strong password" 
                required 
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${strengthDisplay.color}`}
                        style={{ width: `${strengthDisplay.percentage}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strengthDisplay.label === 'Very Weak' || strengthDisplay.label === 'Weak' ? 'text-red-600' :
                      strengthDisplay.label === 'Fair' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {strengthDisplay.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {passwordValidation.requirements.map((req) => (
                      <div key={req.id} className={`flex items-center gap-1.5 text-xs ${
                        req.met ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {req.met ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-gray-300" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm your password" 
                required 
                minLength={8}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                disabled={isLoading}
              />
              {formData.confirm_password && !passwordsMatch && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <Input 
                  id="website" 
                  className="pl-10" 
                  placeholder="https://acme.com" 
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isLoading || !isPasswordValid}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            By signing up, you agree to our <a href="#" className="text-on-primary-container hover:underline">Terms of Service</a> and <a href="#" className="text-on-primary-container hover:underline">Privacy Policy</a>.
          </p>

          <p className="mt-4 text-center text-sm text-on-surface-variant">
            Already have an account? <Link to="/login" className="font-bold text-on-primary-container hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-container p-12 flex-col justify-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-8">Everything you need to collect payments</h2>
        <div className="space-y-6">
          {[
            { title: 'Beautiful Forms', desc: 'Create stunning payment forms in minutes' },
            { title: 'Powerful Analytics', desc: 'Track your revenue with real-time insights' },
            { title: 'Secure Payments', desc: 'PCI-DSS Level 1 compliant' },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-on-tertiary-fixed" />
              </div>
              <div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
