import { setTokens as setAdminTokens, clearTokens as clearAdminTokens, getAccessToken } from '@/lib/auth'

const CONTACT_TOKEN_KEY = 'payforms_contact_token'
const CONTACT_REFRESH_KEY = 'payforms_contact_refresh'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      return decodeURIComponent(value)
    }
  }
  return null
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export const contactAuth = {
  getAccessToken: (): string | null => {
    // First check cookie (pf_contact_token set by backend)
    const cookieToken = getCookie('pf_contact_token')
    if (cookieToken) {
      return cookieToken
    }
    // Fallback to sessionStorage
    return sessionStorage.getItem(CONTACT_TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    return sessionStorage.getItem(CONTACT_REFRESH_KEY)
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    // Store in sessionStorage as fallback for API calls that need bearer token
    // The backend already sets the pf_contact_token cookie automatically
    sessionStorage.setItem(CONTACT_TOKEN_KEY, accessToken)
    sessionStorage.setItem(CONTACT_REFRESH_KEY, refreshToken)
  },

  clearTokens: (): void => {
    // Clear sessionStorage
    sessionStorage.removeItem(CONTACT_TOKEN_KEY)
    sessionStorage.removeItem(CONTACT_REFRESH_KEY)
    // Also clear the cookie (logout clears it server-side too)
    deleteCookie('pf_contact_token')
  },

  isLoggedIn: (): boolean => {
    // Check cookie first, then sessionStorage
    return !!getCookie('pf_contact_token') || !!sessionStorage.getItem(CONTACT_TOKEN_KEY)
  },
}
