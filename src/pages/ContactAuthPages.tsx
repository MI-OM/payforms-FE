import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { contactAuthService, type Transaction } from '@/services/contactAuthService'
import { Logo, LogoIcon } from '@/components/Logo'
import { ContactSidebar } from '@/components/layouts/ContactSidebar'
import { ApiError } from '@/lib/apiClient'

function getAutoDetectedSubdomain(): string {
  const hostname = window.location.hostname
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      return parts[0]
    }
  }
  return ''
}

export function ContactLoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [subdomain, setSubdomain] = useState(getAutoDetectedSubdomain())
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/contact/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const loginResponse = await contactAuthService.login({
        ...formData,
        organization_subdomain: subdomain || undefined,
      })
      
      const contact = await contactAuthService.getMe()
      localStorage.setItem('pf_contact', JSON.stringify(contact))
      navigate(redirectUrl, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid email or password')
      } else if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {import.meta.env.DEV && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="subdomain">
                  Organization Subdomain
                </label>
                <div className="relative">
                  <input
                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                    id="subdomain"
                    type="text"
                    placeholder="your-school"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    autoComplete="off"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                    .payforms.com
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2" to="/contact/reset-password">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <button
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500">
              Need to make a payment?{' '}
              <Link className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2" to="/">
                Use payment link
              </Link>
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-2">
          <LogoIcon size="sm" asLink={false} />
        </div>
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Payforms Inc. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export function ContactSetPassword() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const passwordRequirements = [
    { id: 'length', label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
    { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'At least one lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'At least one number (0-9)', test: (p: string) => /\d/.test(p) },
    { id: 'special', label: 'At least one special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ]

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    const passed = passwordRequirements.filter(req => req.test(password)).length
    if (password.length === 0) return { score: 0, label: '', color: '' }
    if (passed < 2) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (passed < 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (passed === 4) return { score: 3, label: 'Good', color: 'bg-blue-500' }
    return { score: 4, label: 'Strong', color: 'bg-green-500' }
  }

  const isPasswordStrongEnough = (password: string): boolean => {
    return passwordRequirements.every(req => req.test(password))
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  const canSubmit = isPasswordStrongEnough(formData.password) && passwordsMatch && !isLoading
  const strength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isPasswordStrongEnough(formData.password)) {
      setError('Please ensure your password meets all requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      let token = new URLSearchParams(window.location.search).get('token') || ''
      if (!token) {
        setError('Invalid or expired token. Please request a new password setup link.')
        setIsLoading(false)
        return
      }
      try {
        token = decodeURIComponent(token)
      } catch {
        // Token not URL encoded
      }
      await contactAuthService.setPassword({
        token,
        password: formData.password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/contact/login'), 3000)
    } catch (err) {
      console.error('Set password error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mb-3">Password Set!</h2>
            <p className="font-body text-slate-500 mb-8">Your password has been created. Redirecting to login...</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Create New Password</h2>
            <p className="text-slate-500 text-sm font-body">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 pr-12"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {formData.password.length > 0 && (
                <>
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= strength.score ? strength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.label === 'Strong' ? 'text-green-600' :
                      strength.label === 'Good' ? 'text-blue-600' :
                      strength.label === 'Fair' ? 'text-yellow-600' :
                      strength.label === 'Weak' ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      {strength.label && `Password strength: ${strength.label}`}
                    </p>
                  </div>
                  
                  <ul className="space-y-1.5 mt-3">
                    {passwordRequirements.map((req) => {
                      const passed = req.test(formData.password)
                      return (
                        <li key={req.id} className="flex items-center gap-2 text-xs">
                          {passed ? (
                            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                          <span className={passed ? 'text-green-700' : 'text-slate-500'}>
                            {req.label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className={`w-full px-4 py-3.5 bg-slate-100 border rounded-lg outline-none transition-all font-body text-slate-900 ${
                  formData.confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500/20'
                      : 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                autoComplete="new-password"
              />
              {formData.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Passwords do not match
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 font-body">{error}</p>
              </div>
            )}

            <button
              className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export function ContactResetPasswordRequest() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await contactAuthService.requestPasswordReset({ email })
      setSuccess(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to send reset email')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mb-3">Check Your Email</h2>
            <p className="font-body text-slate-500 mb-6">
              We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>
            </p>
            <p className="text-sm text-slate-400 font-body mb-8">The link will expire in 15 minutes.</p>
            <button
              className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
              onClick={() => { setSuccess(false); setEmail('') }}
            >
              Didn't receive it? Try again
            </button>
            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" to="/contact/login">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Forgot Password?</h2>
            <p className="text-slate-500 text-sm font-body">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900"
                id="email"
                type="email"
                placeholder="student@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 font-body">{error}</p>
              </div>
            )}

            <button
              className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" to="/contact/login">
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export function ContactResetPasswordConfirm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const passwordRequirements = [
    { id: 'length', label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
    { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'At least one lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'At least one number (0-9)', test: (p: string) => /\d/.test(p) },
    { id: 'special', label: 'At least one special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ]

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    const passed = passwordRequirements.filter(req => req.test(password)).length
    if (password.length === 0) return { score: 0, label: '', color: '' }
    if (passed < 2) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (passed < 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (passed === 4) return { score: 3, label: 'Good', color: 'bg-blue-500' }
    return { score: 4, label: 'Strong', color: 'bg-green-500' }
  }

  const isPasswordStrongEnough = (password: string): boolean => {
    return passwordRequirements.every(req => req.test(password))
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  const canSubmit = isPasswordStrongEnough(formData.password) && passwordsMatch && !isLoading
  const strength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isPasswordStrongEnough(formData.password)) {
      setError('Please ensure your password meets all requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const token = window.location.pathname.split('/').pop() || ''
      if (!token) {
        setError('Invalid or expired token. Please request a new reset link.')
        setIsLoading(false)
        return
      }
      await contactAuthService.confirmPasswordReset({
        token,
        password: formData.password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/contact/login'), 3000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to reset password. The link may have expired.')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mb-3">Password Reset!</h2>
            <p className="font-body text-slate-500 mb-8">Your password has been updated. Redirecting to login...</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Create New Password</h2>
            <p className="text-slate-500 text-sm font-body">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 pr-12"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {formData.password.length > 0 && (
                <>
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= strength.score ? strength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.label === 'Strong' ? 'text-green-600' :
                      strength.label === 'Good' ? 'text-blue-600' :
                      strength.label === 'Fair' ? 'text-yellow-600' :
                      strength.label === 'Weak' ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      {strength.label && `Password strength: ${strength.label}`}
                    </p>
                  </div>
                  
                  <ul className="space-y-1.5 mt-3">
                    {passwordRequirements.map((req) => {
                      const passed = req.test(formData.password)
                      return (
                        <li key={req.id} className="flex items-center gap-2 text-xs">
                          {passed ? (
                            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                          <span className={passed ? 'text-green-700' : 'text-slate-500'}>
                            {req.label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className={`w-full px-4 py-3.5 bg-slate-100 border rounded-lg outline-none transition-all font-body text-slate-900 ${
                  formData.confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-green-500 focus:ring-2 focus:ring-green-500/20'
                      : 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                autoComplete="new-password"
              />
              {formData.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Passwords do not match
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 font-body">{error}</p>
              </div>
            )}

            <button
              className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export function ContactDashboard() {
  const navigate = useNavigate()
  const [contact, setContact] = useState<{ id: string; first_name: string; last_name: string; email: string; student_id?: string; organization_id?: string; is_active: boolean } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const contactData = await contactAuthService.getMe()
        console.log('📊 ContactDashboard - API Response:', JSON.stringify(contactData, null, 2))
        setContact(contactData)
        
        const txData = await contactAuthService.getTransactions({ limit: 100 })
        console.log('📊 ContactDashboard - Transactions Response:', { 
          count: txData.data.length, 
          transactions: txData.data.slice(0, 3)
        })
        setTransactions(txData.data)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  // Temporary: Try to get name from localStorage if API doesn't return it
  const getContactName = () => {
    if (contact?.first_name || contact?.last_name) {
      return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    }
    // Try localStorage as fallback
    const stored = localStorage.getItem('pf_contact')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.first_name || parsed.last_name) {
          return [parsed.first_name, parsed.last_name].filter(Boolean).join(' ')
        }
        return parsed.email // Fall back to email
      } catch {
        return contact?.email || 'Student'
      }
    }
    return contact?.email || 'Student'
  }

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

  const formatCurrency = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '₦0'
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) {
      return '₦0'
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const getAmount = (tx: Transaction): number => {
    if (tx.amount === undefined || tx.amount === null) return 0
    if (typeof tx.amount === 'number') return tx.amount
    if (typeof tx.amount === 'string') return parseFloat(tx.amount) || 0
    return 0
  }

  const totalPaid = transactions
    .filter(t => t.status === 'PAID')
    .reduce((sum, t) => sum + getAmount(t), 0)
  
  const totalPending = transactions
    .filter(t => t.status === 'PENDING' || t.status === 'PARTIAL')
    .reduce((sum, t) => sum + getAmount(t), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Connect</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg w-full">
              Try Again
            </button>
            <button onClick={() => navigate('/contact/login')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg w-full">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Unable to load your profile. Please login again.</p>
          <button onClick={() => navigate('/contact/login')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <ContactSidebar onLogout={handleLogout} />
      
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {getContactName()}
          </h2>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <p className="text-slate-600">{contact?.email}</p>
            {contact?.student_id && (
              <>
                <span className="text-gray-300">•</span>
                <p className="text-slate-600">ID: {contact.student_id}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600">Total Paid</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPending)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600">Account Status</p>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${contact.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                <svg className={`w-5 h-5 ${contact.is_active ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${contact.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {contact.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recent Transactions</h3>
              <button 
                onClick={() => navigate('/contact/transactions')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                View All →
              </button>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mb-2 font-medium">No transactions yet</p>
                <p className="text-sm">Your payment history will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((tx) => (
                  <div 
                    key={tx.id} 
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/contact/payment/${tx.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.status === 'PAID' ? 'bg-green-100' : 
                        tx.status === 'PARTIAL' ? 'bg-blue-100' : 
                        'bg-amber-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          tx.status === 'PAID' ? 'text-green-600' : 
                          tx.status === 'PARTIAL' ? 'text-blue-600' : 
                          'text-amber-600'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.reference || `Payment #${tx.id.slice(0, 8)}`}</p>
                        <p className="text-sm text-slate-500">{new Date(tx.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          tx.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                          tx.status === 'PARTIAL' ? 'bg-blue-100 text-blue-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/contact/forms')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">My Forms</span>
                </button>
                <button 
                  onClick={() => navigate('/contact/transactions')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Transactions</span>
                </button>
                <button 
                  onClick={() => navigate('/contact/profile')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Profile</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-4">Contact your administrator if you have payment issues.</p>
              <button className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
