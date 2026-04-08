import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Briefcase,
  ArrowRight, 
  Check, 
  Eye, 
  EyeOff,
  Shield,
  Zap,
  BarChart3,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { authService } from '@/services/authService'
import { ApiError } from '@/lib/apiClient'
import { validatePassword, getPasswordStrengthDisplay, isPasswordMatch } from '@/lib/passwordStrength'

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      {children}
    </div>
  )
}

export function OrganizationSignUp() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    organization_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })

  const passwordValidation = validatePassword(formData.password)
  const strengthDisplay = getPasswordStrengthDisplay(formData.password)
  const passwordsMatch = isPasswordMatch(formData.password, formData.confirm_password)
  const isPasswordValid = passwordValidation.isValid && passwordsMatch

  const isFormValid = formData.organization_name && formData.email && isPasswordValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authService.register({
        organization_name: formData.organization_name,
        email: formData.email,
        password: formData.password,
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
    <div className="min-h-screen bg-slate-100 flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.2); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 10s ease infinite; 
        }
        
        .input-field {
          transition: all 0.3s ease;
        }
        .input-field:focus-within {
          transform: translateY(-2px);
        }
        
        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.5);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .benefit-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .benefit-card:hover {
          transform: translateX(8px);
        }
        .benefit-card:hover .benefit-icon {
          transform: scale(1.1);
        }
        .benefit-icon {
          transition: transform 0.3s ease;
        }
      `}</style>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md">
          <AnimatedSection>
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
              <Logo size="md" />
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-headline">
              Create your organization
            </h1>
            <p className="text-slate-500 mb-8 font-body">
              Set up your organization to start collecting payments
            </p>
          </AnimatedSection>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatedSection delay={200}>
              <div className="input-field space-y-2">
                <label htmlFor="orgName" className="text-sm font-semibold text-slate-700 font-body flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Organization Name
                </label>
                <div className="relative">
                  <input
                    id="orgName" 
                    type="text"
                    className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-body"
                    placeholder="Acme University"
                    required
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    disabled={isLoading}
                  />
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={250}>
              <div className="input-field space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 font-body flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Work Email
                </label>
                <div className="relative">
                  <input
                    id="email" 
                    type="email"
                    className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-body"
                    placeholder="admin@university.edu"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="input-field space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 font-body flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 pl-11 pr-12 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-body"
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${strengthDisplay.color}`}
                          style={{ width: `${strengthDisplay.percentage}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold min-w-[70px] ${
                        strengthDisplay.label === 'Very Weak' || strengthDisplay.label === 'Weak' ? 'text-red-600' :
                        strengthDisplay.label === 'Fair' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {strengthDisplay.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {passwordValidation.requirements.map((req) => (
                        <div key={req.id} className={`flex items-center gap-1.5 text-xs font-body ${
                          req.met ? 'text-green-600' : 'text-slate-400'
                        }`}>
                          {req.met ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-slate-300" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={450}>
              <div className="input-field space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 font-body flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword" 
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-4 py-3 pl-11 pr-12 bg-white border rounded-xl outline-none transition-all duration-300 text-slate-900 placeholder:text-slate-400 font-body ${
                      formData.confirm_password && !passwordsMatch 
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                    }`}
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  {formData.confirm_password && (
                    passwordsMatch ? (
                      <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    )
                  )}
                </div>
                {formData.confirm_password && !passwordsMatch && (
                  <p className="text-xs text-red-600 font-body flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={500}>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </AnimatedSection>

            <AnimatedSection delay={550}>
              <button 
                type="submit" 
                disabled={isLoading || !isFormValid}
                className="btn-primary w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-headline font-bold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Organization
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </AnimatedSection>
          </form>

          <AnimatedSection delay={600}>
            <p className="mt-6 text-center text-sm text-slate-500 font-body">
              By signing up, you agree to our{' '}
              <a href="#" className="text-blue-600 font-semibold hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>.
            </p>

            <p className="mt-4 text-center text-sm text-slate-500 font-body">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 animate-gradient p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white mb-4 font-headline leading-tight">
              Everything you need to manage institutional payments
            </h2>
            <p className="text-slate-400 mb-12 text-lg font-body">
              Trusted by 500+ educational institutions worldwide
            </p>
          </AnimatedSection>

          <div className="space-y-6">
            {[
              { 
                icon: FileText, 
                title: 'Beautiful Forms', 
                desc: 'Create stunning payment forms with drag-and-drop simplicity',
                color: 'from-blue-500 to-blue-600'
              },
              { 
                icon: BarChart3, 
                title: 'Real-time Analytics', 
                desc: 'Track revenue and enrollment trends as they happen',
                color: 'from-green-500 to-emerald-600'
              },
              { 
                icon: Shield, 
                title: 'Bank-Grade Security', 
                desc: 'PCI-DSS Level 1 compliant with AES-256 encryption',
                color: 'from-purple-500 to-purple-600'
              },
              { 
                icon: Zap, 
                title: 'Lightning Fast', 
                desc: 'Sub-second transaction processing with 99.99% uptime',
                color: 'from-yellow-500 to-orange-500'
              },
            ].map((item, index) => (
              <AnimatedSection key={item.title} delay={100 + index * 100}>
                <div className="benefit-card flex items-start gap-5 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 benefit-icon shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1 font-headline">{item.title}</h3>
                    <p className="text-slate-400 text-sm font-body">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={500}>
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-slate-800" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-800" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-800" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-400 text-sm font-body">4.9/5 from 2,000+ reviews</p>
            </div>
          </AnimatedSection>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  )
}
