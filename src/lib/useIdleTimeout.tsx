import { useEffect, useRef, useState, useCallback } from 'react'

interface IdleTimeoutConfig {
  timeoutMs: number
  warningMs?: number
  onIdle: () => void
  onWarning?: () => void
  enabled?: boolean
}

interface IdleTimeoutState {
  isIdle: boolean
  isWarning: boolean
  remainingMs: number
}

export function useIdleTimeout(config: IdleTimeoutConfig) {
  const { timeoutMs, warningMs = 60000, onIdle, onWarning, enabled = true } = config
  
  const [state, setState] = useState<IdleTimeoutState>({
    isIdle: false,
    isWarning: false,
    remainingMs: timeoutMs
  })
  
  const timeoutRef = useRef<number | null>(null)
  const warningRef = useRef<number | null>(null)
  const countdownRef = useRef<number | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const remainingRef = useRef<number>(timeoutMs)

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
      warningRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    if (!enabled) return
    
    lastActivityRef.current = Date.now()
    remainingRef.current = timeoutMs
    
    setState({
      isIdle: false,
      isWarning: false,
      remainingMs: timeoutMs
    })

    clearAllTimers()

    if (warningMs > 0 && warningMs < timeoutMs) {
      const warningDelay = timeoutMs - warningMs
      warningRef.current = window.setTimeout(() => {
        if (onWarning) {
          onWarning()
        }
        setState(prev => ({ ...prev, isWarning: true }))
        
        countdownRef.current = window.setInterval(() => {
          remainingRef.current = Math.max(0, remainingRef.current - 1000)
          setState(prev => ({ ...prev, remainingMs: remainingRef.current }))
        }, 1000)
      }, warningDelay)
    }

    timeoutRef.current = window.setTimeout(() => {
      setState(prev => ({ ...prev, isIdle: true }))
      onIdle()
    }, timeoutMs)
  }, [timeoutMs, warningMs, onIdle, onWarning, enabled, clearAllTimers])

  const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

  useEffect(() => {
    if (!enabled) {
      clearAllTimers()
      return
    }

    const handleActivity = () => {
      if (!state.isIdle && !state.isWarning) {
        resetTimer()
      }
    }

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    resetTimer()

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      clearAllTimers()
    }
  }, [enabled, resetTimer, clearAllTimers, state.isIdle, state.isWarning])

  const extendSession = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  const formatRemaining = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    return `${seconds}s`
  }, [])

  return {
    ...state,
    remainingFormatted: formatRemaining(state.remainingMs),
    resetTimer: extendSession,
    extendSession
  }
}

export function SessionTimeoutWarning({ 
  remainingMs, 
  onExtend, 
  onLogout 
}: { 
  remainingMs: number
  onExtend: () => void
  onLogout: () => void 
}) {
  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Expiring Soon</h3>
          <p className="text-gray-600 mb-4">
            Your session will expire in{' '}
            <span className="font-mono font-bold text-gray-900">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={onExtend}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
