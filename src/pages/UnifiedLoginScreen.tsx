import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader, Lock, UserCog, GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/apiClient'
import { SECURITY_CONFIG } from '@/lib/auth'
import { contactAuthService } from '@/services/contactAuthService'
import { Logo } from '@/components/Logo'

type LoginType = 'admin' | 'contact'

export function UnifiedLoginScreen() {
  const navigate = useNavigate()
  const { login, isLocked, lockoutRemainingMs, remainingAttempts } = useAuth()
  const [loginType, setLoginType] = useState<LoginType>('admin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })

  useEffect(() => {
    if (isLocked && lockoutRemainingMs > 0) {
      const updateLockoutTime = () => {
        const minutes = Math.floor(lockoutRemainingMs / 60000)
        const seconds = Math.floor((lockoutRemainingMs % 60000) / 1000)
        setLockoutTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
      
      updateLockoutTime()
      const interval = setInterval(updateLockoutTime, 1000)
      return () => clearInterval(interval)
    } else {
      setLockoutTimeLeft('')
    }
  }, [isLocked, lockoutRemainingMs])

  const isEmailValid = formData.email.includes('@') && formData.email.includes('.')
  const isPasswordValid = formData.password.length >= 1

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
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

  const handleContactLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await contactAuthService.login({
        email: formData.email,
        password: formData.password,
      })
      navigate('/contact/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid email or password')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = loginType === 'admin' ? handleAdminLogin : handleContactLogin

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <main className="relative z-10 w-full max-w-sm sm:max-w-md px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button 
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                loginType === 'admin' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => { setLoginType('admin'); setError(''); }}
            >
              <UserCog className="w-4 h-4" />
              Admin / Staff
            </button>
            <button 
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                loginType === 'contact' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => { setLoginType('contact'); setError(''); }}
            >
              <GraduationCap className="w-4 h-4" />
              Contact / Student
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {loginType === 'admin' ? 'Welcome back' : 'Student Portal Login'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {loginType === 'admin' 
                ? 'Enter your credentials to continue' 
                : 'Enter your student credentials'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <input 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400 ${
                    touched.email && !isEmailValid 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  id="email" 
                  name="email" 
                  placeholder={loginType === 'contact' ? 'student@school.edu' : 'you@example.com'} 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  disabled={isLoading}
                />
                {touched.email && isEmailValid && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link 
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors" 
                  to={loginType === 'contact' ? '/contact/reset-password' : '/password-reset'}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  className={`w-full px-4 py-3 pr-12 bg-slate-50 border rounded-xl outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400 ${
                    touched.password && !isPasswordValid 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  id="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginType === 'admin' && isLocked && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <Lock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700">Account temporarily locked</p>
                  <p className="text-xs text-orange-600/80 mt-0.5">
                    Too many failed attempts. Try again in{' '}
                    <span className="font-mono font-medium">{lockoutTimeLeft}</span>
                  </p>
                </div>
              </div>
            )}

            {loginType === 'admin' && !isLocked && remainingAttempts > 0 && remainingAttempts <= 2 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-700">Warning: Low attempts remaining</p>
                  <p className="text-xs text-yellow-600/80 mt-0.5">
                    {remainingAttempts} attempt{remainingAttempts > 1 ? 's' : ''} remaining before lockout
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                  <p className="text-xs text-red-600/80 mt-0.5">Please check your credentials and try again</p>
                </div>
              </div>
            )}

            <button 
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || !formData.email || !formData.password || (loginType === 'admin' && isLocked)}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in as {loginType === 'admin' ? 'Admin/Staff' : 'Contact/Student'}</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {loginType === 'contact' && (
            <p className="text-center text-sm text-slate-500 mt-6">
              Need to set up your account?{' '}
              <Link className="font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors" to="/contact/set-password">
                Set up your password
              </Link>
            </p>
          )}

          {loginType === 'admin' && (
            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link className="font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors" to="/signup">
                Sign up
              </Link>
            </p>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4 text-xs text-slate-400">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
        </div>
      </main>

      <footer className="mt-auto py-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Payforms. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
