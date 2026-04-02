import { Link, useNavigate } from 'react-router-dom'
import { Building, Mail, Globe, ArrowRight, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function OrganizationSignUp() {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/email/verify-prompt')
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
                <Input id="orgName" className="pl-10" placeholder="Acme Corporation" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <Input id="email" type="email" className="pl-10" placeholder="john@acme.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" required minLength={8} />
              <p className="text-xs text-on-surface-variant">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <Input id="website" className="pl-10" placeholder="https://acme.com" />
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2">
              Create Organization
              <ArrowRight className="h-4 w-4" />
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
