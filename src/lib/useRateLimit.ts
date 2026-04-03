import { useCallback, useRef, useState } from 'react'

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  lockoutMs?: number
}

interface RateLimitState {
  attempts: number
  isLocked: boolean
  lockoutEndsAt: number | null
  remainingAttempts: number
}

export function useRateLimit(config: RateLimitConfig) {
  const { maxAttempts, windowMs, lockoutMs } = config
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    isLocked: false,
    lockoutEndsAt: null,
    remainingAttempts: maxAttempts
  })
  
  const attemptsRef = useRef<number>(0)
  const windowStartRef = useRef<number>(Date.now())
  const lockoutEndRef = useRef<number | null>(null)

  const reset = useCallback(() => {
    attemptsRef.current = 0
    windowStartRef.current = Date.now()
    lockoutEndRef.current = null
    setState({
      attempts: 0,
      isLocked: false,
      lockoutEndsAt: null,
      remainingAttempts: maxAttempts
    })
  }, [maxAttempts])

  const checkLockout = useCallback((): boolean => {
    if (lockoutEndRef.current && Date.now() < lockoutEndRef.current) {
      setState(prev => ({ ...prev, isLocked: true }))
      return true
    }
    
    if (lockoutEndRef.current) {
      lockoutEndRef.current = null
      attemptsRef.current = 0
      windowStartRef.current = Date.now()
      setState({
        attempts: 0,
        isLocked: false,
        lockoutEndsAt: null,
        remainingAttempts: maxAttempts
      })
    }
    return false
  }, [maxAttempts])

  const recordAttempt = useCallback((): RateLimitState => {
    if (checkLockout()) {
      return state
    }

    const now = Date.now()
    if (now - windowStartRef.current > windowMs) {
      attemptsRef.current = 0
      windowStartRef.current = now
    }

    attemptsRef.current++
    const remaining = Math.max(0, maxAttempts - attemptsRef.current)
    
    let isLocked = false
    let lockoutEndsAt: number | null = null

    if (lockoutMs && attemptsRef.current >= maxAttempts) {
      isLocked = true
      lockoutEndsAt = now + lockoutMs
      lockoutEndRef.current = lockoutEndsAt
      attemptsRef.current = 0
    }

    const newState: RateLimitState = {
      attempts: attemptsRef.current,
      isLocked,
      lockoutEndsAt,
      remainingAttempts: remaining
    }
    
    setState(newState)
    return newState
  }, [checkLockout, maxAttempts, windowMs, lockoutMs, state])

  const isRateLimited = useCallback((): boolean => {
    return checkLockout()
  }, [checkLockout])

  return {
    state,
    recordAttempt,
    isRateLimited,
    reset,
    remainingAttempts: state.remainingAttempts,
    isLocked: state.isLocked,
    lockoutEndsAt: state.lockoutEndsAt
  }
}

export function getLockoutTimeRemaining(lockoutEndsAt: number | null): number {
  if (!lockoutEndsAt) return 0
  return Math.max(0, lockoutEndsAt - Date.now())
}

export function formatLockoutTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}
