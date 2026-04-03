import { apiClient } from '@/lib/apiClient'
import { setTokens, clearTokens } from '@/lib/auth'

export interface ContactLoginRequest {
  email: string
  password: string
}

export interface ContactLoginResponse {
  access_token: string
  refresh_token: string
  contact: Contact
}

export interface ContactSetPasswordRequest {
  email: string
  password: string
}

export interface ContactResetPasswordRequest {
  email: string
}

export interface ContactResetConfirmRequest {
  token: string
  password: string
}

export interface Contact {
  id: string
  email: string
  name: string
  phone?: string
  require_login: boolean
  is_active: boolean
}

export const contactAuthService = {
  login: async (data: ContactLoginRequest): Promise<ContactLoginResponse> => {
    const response = await apiClient.post<ContactLoginResponse>('/contact-auth/login', data)
    setTokens(response.access_token, response.refresh_token)
    return response
  },

  setPassword: async (data: ContactSetPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/contact-auth/set-password', data)
  },

  requestPasswordReset: async (data: ContactResetPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/contact-auth/password-reset/request', data)
  },

  confirmPasswordReset: async (data: ContactResetConfirmRequest): Promise<{ message: string }> => {
    return apiClient.post('/contact-auth/password-reset/confirm', data)
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearTokens()
    }
  },

  getMe: async (): Promise<Contact> => {
    return apiClient.get('/contact-auth/me')
  },
}
