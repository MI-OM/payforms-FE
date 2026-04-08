import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useState } from 'react'
import { LogoIcon } from '@/components/Logo'
import { authService } from '@/services/authService'
import { setTokens } from '@/lib/auth'
import { ApiError } from '@/lib/apiClient'

export function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
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

    if (!token) {
      setError('Invalid invitation link')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await authService.acceptInvite({
        token,
        password: formData.password,
      })
      setTokens(response.access_token, response.refresh_token)
      setIsSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setError('This invitation link has expired or already been used.')
        } else {
          setError(err.message || 'Failed to accept invitation')
        }
      } else {
        setError('Failed to accept invitation. The link may have expired.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}</style>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-10 shadow-xl shadow-slate-200/50 border border-white/50 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Invalid Invitation Link
            </h2>
            <p className="text-slate-500 mb-6">
              This invitation link is invalid or missing a token. Please contact your administrator for a new invitation.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}</style>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-10 shadow-xl shadow-slate-200/50 border border-white/50 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Welcome to the Team!
            </h2>
            <p className="text-slate-500 mb-8">
              Your account has been created. Redirecting to dashboard...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="mb-4">
            <LogoIcon size="md" />
          </div>
          <p className="text-sm text-slate-500">Accept Invitation</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-white/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Join Your Team</h2>
            <p className="text-sm text-slate-500">Set up your account to get started.</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-sm text-blue-700">
                <span className="font-semibold">You've been invited</span> to join your organization's Payforms account.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
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
                  autoComplete="new-password"
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

            {formData.password.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Password strength</span>
                  <span className={`text-xs font-medium ${strength.score >= 3 ? 'text-green-600' : strength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {formData.password.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-600 mb-2">Password requirements:</p>
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    {req.test(formData.password) ? (
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`text-xs ${req.test(formData.password) ? 'text-green-600' : 'text-slate-500'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm ${
                    passwordsMatch && formData.confirmPassword.length > 0
                      ? 'border-green-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-500'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              {formData.confirmPassword.length > 0 && (
                <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
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
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              type="submit"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Accepting Invitation...</span>
                </>
              ) : (
                <>
                  <span>Accept & Continue</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors" to="/login">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PasswordResetRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await authService.requestPasswordReset({ email })
    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Check Your Email
            </h2>
            <p className="text-sm text-slate-500 mb-2">
              We've sent a password reset link to
            </p>
            <p className="font-semibold text-slate-700 mb-6">{email}</p>
            <p className="text-xs text-slate-400 mb-8">
              The link will expire in 15 minutes. Check your spam folder if you don't see it.
            </p>
            <div className="space-y-3">
              <button 
                className="w-full py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => { setIsSuccess(false); setEmail('') }}
              >
                Didn't receive it? Try again
              </button>
              <div className="pt-4 border-t border-slate-100">
                <Link className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors" to="/login">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-4 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Payforms. All rights reserved.
          </p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <main className="relative z-10 w-full max-w-sm sm:max-w-md px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="mb-4">
            <LogoIcon size="md" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reset Password
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Forgot your password?</h2>
            <p className="text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm" 
                id="email" 
                type="email"
                placeholder="you@example.com"
                required={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button 
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              type="submit"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors" to="/login">
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 flex justify-center gap-4 text-xs text-slate-400">
        <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
        <span>•</span>
        <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
        <span>•</span>
        <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
      </footer>
    </div>
  )
}

export function PasswordResetConfirm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const passwordRequirements = [
    { id: 'length', label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
    { id: 'uppercase', label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'At least one lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'At least one number', test: (p: string) => /\d/.test(p) },
    { id: 'special', label: 'At least one special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
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
      setError('Password does not meet all requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid reset link')
      return
    }

    setIsLoading(true)
    
    try {
      await authService.confirmPasswordReset({ token, password: formData.password })
      setIsSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError('Failed to reset password. The link may have expired.')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Password Reset Complete!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Your password has been updated successfully.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Redirecting to login...
            </p>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <main className="relative z-10 w-full max-w-sm sm:max-w-md px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="mb-4">
            <LogoIcon size="md" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reset Password
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Create New Password</h2>
            <p className="text-sm text-slate-500">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm" 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  required={true}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {formData.password.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Password strength</span>
                  <span className={`text-xs font-medium ${strength.score >= 3 ? 'text-green-600' : strength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {formData.password.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    {req.test(formData.password) ? (
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`text-xs ${req.test(formData.password) ? 'text-green-600' : 'text-slate-500'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm ${
                    passwordsMatch && formData.confirmPassword.length > 0
                      ? 'border-green-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-500'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  id="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  required={true}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button 
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              type="submit"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors" to="/login">
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 flex justify-center gap-4 text-xs text-slate-400">
        <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
        <span>•</span>
        <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
        <span>•</span>
        <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
      </footer>
    </div>
  )
}
