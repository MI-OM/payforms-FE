import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/authService'
import { setTokens } from '@/lib/auth'
import { ApiError } from '@/lib/apiClient'

export function AcceptInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    title: '',
    designation: ''
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 relative overflow-hidden">
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

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mb-3">
              Welcome to the Team!
            </h2>
            <p className="font-body text-slate-500 mb-8">
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 relative overflow-hidden">
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
            Accept Invitation
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Join Your Team</h2>
            <p className="text-slate-500 text-sm font-body">Set up your account to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-700 font-body">
                <span className="font-semibold">You've been invited</span> to join your organization's Payforms account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="title">Title</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="title" 
                  placeholder="Mr."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="designation">Designation</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="designation" 
                  placeholder="Manager"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="password">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="password" 
                  type="password"
                  placeholder="Min 8 characters"
                  required={true}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="confirmPassword" 
                  type="password"
                  placeholder="Confirm password"
                  required={true}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
                  <span>Accept & Continue</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" to="/login">
              Back to Login
            </Link>
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

export function PasswordResetRequest() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 relative overflow-hidden">
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

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mb-3">
              Check Your Email
            </h2>
            <p className="font-body text-slate-500 mb-6">
              We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>
            </p>
            <p className="text-sm text-slate-400 font-body mb-8">
              The link will expire in 15 minutes.
            </p>
            <button 
              className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
              onClick={() => { setIsSuccess(false); setEmail('') }}
            >
              Didn't receive it? Try again
            </button>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" to="/login">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 relative overflow-hidden">
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
            Password Reset
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Reset Password</h2>
            <p className="text-slate-500 text-sm font-body">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="email">Work Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">alternate_email</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="email" 
                  type="email"
                  placeholder="name@company.com"
                  required={true}
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
              className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" to="/login">
              Back to Login
            </Link>
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

export function PasswordResetConfirm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
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
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Failed to reset password. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 relative overflow-hidden">
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

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mb-3">
              Password Reset!
            </h2>
            <p className="font-body text-slate-500 mb-8">
              Your password has been updated. Redirecting to login...
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 relative overflow-hidden">
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
            Set New Password
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Create New Password</h2>
            <p className="text-slate-500 text-sm font-body">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="password">New Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="password" 
                  type="password"
                  placeholder="Min 8 characters"
                  required={true}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="confirmPassword" 
                  type="password"
                  placeholder="Confirm password"
                  required={true}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
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
              className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Reset Password</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" to="/login">
              Back to Login
            </Link>
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
