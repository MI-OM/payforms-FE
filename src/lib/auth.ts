const ACCESS_TOKEN_KEY = 'payforms_access_token'
const REFRESH_TOKEN_KEY = 'payforms_refresh_token'
const TOKEN_EXPIRY_KEY = 'payforms_token_expiry'
const SESSION_ID_KEY = 'payforms_session_id'
const FAILED_ATTEMPTS_KEY = 'payforms_failed_attempts'
const LOCKOUT_UNTIL_KEY = 'payforms_lockout_until'

const DEFAULT_TOKEN_EXPIRY_MS = 60 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface SessionInfo {
  sessionId: string
  createdAt: number
  expiresAt: number
}

function generateSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function getStorage(): Storage {
  return sessionStorage
}

export function getAccessToken(): string | null {
  const token = getStorage().getItem(ACCESS_TOKEN_KEY)
  if (!token) return null
  
  const expiry = getStorage().getItem(TOKEN_EXPIRY_KEY)
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    clearTokens()
    return null
  }
  
  return token
}

export function getRefreshToken(): string | null {
  return getStorage().getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string, expiresInSeconds?: number): void {
  const storage = getStorage()
  storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  
  const expiryMs = expiresInSeconds 
    ? Date.now() + (expiresInSeconds * 1000) 
    : Date.now() + DEFAULT_TOKEN_EXPIRY_MS
  storage.setItem(TOKEN_EXPIRY_KEY, expiryMs.toString())
  
  const sessionId = generateSessionId()
  storage.setItem(SESSION_ID_KEY, JSON.stringify({
    sessionId,
    createdAt: Date.now(),
    expiresAt: expiryMs
  } satisfies SessionInfo))
  
  storage.removeItem(FAILED_ATTEMPTS_KEY)
  storage.removeItem(LOCKOUT_UNTIL_KEY)
}

export function clearTokens(): void {
  const storage = getStorage()
  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
  storage.removeItem(TOKEN_EXPIRY_KEY)
  storage.removeItem(SESSION_ID_KEY)
  storage.removeItem(FAILED_ATTEMPTS_KEY)
  storage.removeItem(LOCKOUT_UNTIL_KEY)
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

export function getSessionInfo(): SessionInfo | null {
  const data = getStorage().getItem(SESSION_ID_KEY)
  if (!data) return null
  
  try {
    return JSON.parse(data) as SessionInfo
  } catch {
    return null
  }
}

export function getTimeUntilExpiry(): number | null {
  const session = getSessionInfo()
  if (!session) return null
  return Math.max(0, session.expiresAt - Date.now())
}

export function isLockedOut(): boolean {
  const lockoutUntil = getStorage().getItem(LOCKOUT_UNTIL_KEY)
  if (!lockoutUntil) return false
  
  const lockoutTime = parseInt(lockoutUntil, 10)
  if (Date.now() < lockoutTime) {
    return true
  }
  
  getStorage().removeItem(LOCKOUT_UNTIL_KEY)
  getStorage().removeItem(FAILED_ATTEMPTS_KEY)
  return false
}

export function getLockoutRemainingMs(): number {
  const lockoutUntil = getStorage().getItem(LOCKOUT_UNTIL_KEY)
  if (!lockoutUntil) return 0
  
  const lockoutTime = parseInt(lockoutUntil, 10)
  return Math.max(0, lockoutTime - Date.now())
}

export function recordFailedAttempt(): { attempts: number; isLockedOut: boolean } {
  const storage = getStorage()
  const attempts = (parseInt(storage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10)) + 1
  storage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString())
  
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS
    storage.setItem(LOCKOUT_UNTIL_KEY, lockoutUntil.toString())
    storage.removeItem(FAILED_ATTEMPTS_KEY)
    return { attempts, isLockedOut: true }
  }
  
  return { attempts, isLockedOut: false }
}

export function getFailedAttempts(): number {
  return parseInt(getStorage().getItem(FAILED_ATTEMPTS_KEY) || '0', 10)
}

export function getRemainingAttempts(): number {
  return Math.max(0, MAX_FAILED_ATTEMPTS - getFailedAttempts())
}

export const SECURITY_CONFIG = {
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  LOCKOUT_DURATION_MINUTES: LOCKOUT_DURATION_MS / 60000
} as const
