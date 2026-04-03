import { setTokens as setAdminTokens, clearTokens as clearAdminTokens, getAccessToken } from '@/lib/auth'

const CONTACT_TOKEN_KEY = 'payforms_contact_token'
const CONTACT_REFRESH_KEY = 'payforms_contact_refresh'

export const contactAuth = {
  getAccessToken: (): string | null => {
    return sessionStorage.getItem(CONTACT_TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    return sessionStorage.getItem(CONTACT_REFRESH_KEY)
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    sessionStorage.setItem(CONTACT_TOKEN_KEY, accessToken)
    sessionStorage.setItem(CONTACT_REFRESH_KEY, refreshToken)
  },

  clearTokens: (): void => {
    sessionStorage.removeItem(CONTACT_TOKEN_KEY)
    sessionStorage.removeItem(CONTACT_REFRESH_KEY)
  },

  isLoggedIn: (): boolean => {
    return !!sessionStorage.getItem(CONTACT_TOKEN_KEY)
  },
}
