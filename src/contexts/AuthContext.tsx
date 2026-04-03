import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, type User } from '@/services/authService'
import { clearTokens, getAccessToken, isLockedOut, getLockoutRemainingMs, recordFailedAttempt, getRemainingAttempts } from '@/lib/auth'
import { ApiError } from '@/lib/apiClient'

type UserRole = 'admin' | 'staff' | 'contact' | null

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  switchToContact: (contact: User) => void
  error: string | null
  isLocked: boolean
  lockoutRemainingMs: number
  remainingAttempts: number
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const IDLE_TIMEOUT_MS = 30 * 60 * 1000
const WARNING_BEFORE_MS = 5 * 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutRemainingMs, setLockoutRemainingMs] = useState(0)
  const [remainingAttempts, setRemainingAttempts] = useState(5)
  const [showWarning, setShowWarning] = useState(false)
  const [idleRemaining, setIdleRemaining] = useState(IDLE_TIMEOUT_MS)

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken()
      if (token) {
        try {
          const userData = await authService.getMe()
          setUser(userData)
        } catch {
          clearTokens()
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const checkLockout = () => {
      const locked = isLockedOut()
      setIsLocked(locked)
      
      if (locked) {
        const remaining = getLockoutRemainingMs()
        setLockoutRemainingMs(remaining)
        
        const interval = setInterval(() => {
          const newRemaining = getLockoutRemainingMs()
          setLockoutRemainingMs(newRemaining)
          
          if (newRemaining <= 0) {
            setIsLocked(false)
            setRemainingAttempts(5)
            clearInterval(interval)
          }
        }, 1000)
        
        return () => clearInterval(interval)
      }
    }
    
    checkLockout()
  }, [])

  useEffect(() => {
    if (!user) return

    let warningTimeout: number | null = null
    let idleTimeout: number | null = null
    let countdownInterval: number | null = null

    const startTimers = () => {
      const timeoutAt = Date.now() + IDLE_TIMEOUT_MS
      const warningAt = timeoutAt - WARNING_BEFORE_MS

      countdownInterval = window.setInterval(() => {
        const remaining = timeoutAt - Date.now()
        setIdleRemaining(remaining)

        if (remaining <= 0) {
          clearTokens()
          setUser(null)
          setShowWarning(false)
        }
      }, 1000)

      warningTimeout = window.setTimeout(() => {
        setShowWarning(true)
      }, WARNING_BEFORE_MS)

      idleTimeout = window.setTimeout(() => {
        clearTokens()
        setUser(null)
        setShowWarning(false)
      }, IDLE_TIMEOUT_MS)
    }

    const resetTimers = () => {
      if (warningTimeout) clearTimeout(warningTimeout)
      if (idleTimeout) clearTimeout(idleTimeout)
      if (countdownInterval) clearInterval(countdownInterval)
      setShowWarning(false)
      setIdleRemaining(IDLE_TIMEOUT_MS)
      startTimers()
    }

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimers, { passive: true })
    })

    startTimers()

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimers)
      })
      if (warningTimeout) clearTimeout(warningTimeout)
      if (idleTimeout) clearTimeout(idleTimeout)
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [user])

  const login = useCallback(async (email: string, password: string) => {
    if (isLockedOut()) {
      const err = new Error('Account temporarily locked. Please try again later.')
      setError(err.message)
      throw err
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login({ email, password })
      setUser(response.user)
      setRemainingAttempts(5)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        
        if (err.status === 401) {
          const { isLockedOut: nowLockedOut } = recordFailedAttempt()
          setRemainingAttempts(getRemainingAttempts())
          
          if (nowLockedOut) {
            setIsLocked(true)
            setLockoutRemainingMs(15 * 60 * 1000)
          }
        }
        
        throw err
      }
      setError('An unexpected error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearTokens()
      setUser(null)
      setError(null)
      setIsLocked(false)
      setLockoutRemainingMs(0)
      setRemainingAttempts(5)
    }
  }, [])

  const switchToContact = useCallback((contact: User) => {
    setUser(contact)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const extendSession = useCallback(() => {
    setShowWarning(false)
    setIdleRemaining(IDLE_TIMEOUT_MS)
  }, [])

  const formatLockoutTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      switchToContact,
      error,
      isLocked,
      lockoutRemainingMs,
      remainingAttempts,
      clearError
    }}>
      {children}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Expiring</h3>
              <p className="text-gray-600 mb-4">
                Session expires in{' '}
                <span className="font-mono font-bold text-gray-900">
                  {formatLockoutTime(idleRemaining)}
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={logout}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
                <button
                  onClick={extendSession}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth(allowedRoles: UserRole[]) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return 'loading'
  if (!user) return 'unauthenticated'
  if (!allowedRoles.includes(user.role)) return 'unauthorized'
  return 'authorized'
}

export function useIsAdmin() {
  const { user } = useAuth()
  return user?.role === 'admin'
}

export function useIsStaff() {
  const { user } = useAuth()
  return user?.role === 'staff' || user?.role === 'admin'
}
