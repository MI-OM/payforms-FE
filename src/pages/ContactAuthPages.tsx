import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { contactAuthService } from '@/services/contactAuthService'
import { ApiError } from '@/lib/apiClient'

export function ContactLoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await contactAuthService.login(formData)
      localStorage.setItem('contact_data', JSON.stringify(response.contact))
      navigate('/contact/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid email or password')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-slate-900 mb-2">
            Payforms
          </h1>
          <p className="font-label text-xs uppercase tracking-widest text-slate-500 opacity-70">
            Student Portal
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Welcome Back</h2>
            <p className="text-slate-500 text-sm font-body">Sign in to access your payments</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  alternate_email
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400"
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="password">
                  Password
                </label>
                <Link className="text-xs font-semibold text-blue-500 hover:underline underline-offset-4" to="/contact/reset-password">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  lock
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400"
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 font-body">{error}</p>
              </div>
            )}

            <button
              className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200/50 text-center">
            <p className="text-sm text-slate-500">
              Need to make a payment?{' '}
              <Link className="font-semibold text-blue-500 hover:underline" to="/">
                Use payment link
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6 opacity-40">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
          © 2024 Payforms Inc. Built with Precision.
        </p>
      </footer>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 via-blue-500 to-green-400 opacity-50"></div>
    </div>
  )
}

export function ContactSetPassword() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await contactAuthService.setPassword({
        email: formData.email,
        password: formData.password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/contact/login'), 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to set password')
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
            <h2 className="font-headline font-bold text-2xl text-slate-900 mb-3">
              Password Set!
            </h2>
            <p className="font-body text-slate-500 mb-8">
              Your password has been created. Redirecting to login...
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-slate-900 mb-2">Payforms</h1>
          <p className="font-label text-xs uppercase tracking-widest text-slate-500 opacity-70">Set Your Password</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Create Password</h2>
            <p className="text-slate-500 text-sm font-body">Set up your account password</p>
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
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900"
                id="password"
                type="password"
                placeholder="Min 8 characters"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900"
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                'Set Password'
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
      if (err instanceof ApiError) {
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
        <div className="text-center mb-10">
          <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-slate-900 mb-2">Payforms</h1>
          <p className="font-label text-xs uppercase tracking-widest text-slate-500 opacity-70">Reset Password</p>
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
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  alternate_email
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900"
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await contactAuthService.confirmPasswordReset({
        token: window.location.pathname.split('/').pop() || '',
        password: formData.password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/contact/login'), 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to reset password')
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
        <div className="text-center mb-10">
          <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-slate-900 mb-2">Payforms</h1>
          <p className="font-label text-xs uppercase tracking-widest text-slate-500 opacity-70">New Password</p>
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
              <input
                className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900"
                id="password"
                type="password"
                placeholder="Min 8 characters"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900"
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
              <svg className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-700 font-body">
                Use at least 8 characters with a mix of letters, numbers & symbols.
              </p>
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
  const [contact] = useState(() => {
    const data = localStorage.getItem('contact_data')
    return data ? JSON.parse(data) : null
  })

  const handleLogout = () => {
    localStorage.removeItem('contact_data')
    localStorage.removeItem('payforms_access_token')
    localStorage.removeItem('payforms_refresh_token')
    navigate('/contact/login')
  }

  const mockTransactions = [
    { id: '1', form: 'Q1 Tuition', amount: 2500, status: 'PAID', date: '2026-03-15' },
    { id: '2', form: 'Lab Fees', amount: 150, status: 'PENDING', date: '2026-04-01' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payforms</h1>
            <p className="text-sm text-gray-500">Student Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{contact?.name || 'Student'}</p>
              <p className="text-sm text-gray-500">{contact?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {contact?.name?.split(' ')[0] || 'Student'}</h2>
          <p className="text-gray-500">Manage your payments and view history</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">$2,500.00</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-600">$150.00</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Payment History</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{tx.form}</p>
                  <p className="text-sm text-gray-500">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${tx.amount.toFixed(2)}</p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    tx.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
