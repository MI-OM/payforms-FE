import { apiClient } from '@/lib/apiClient'
import { setTokens, clearTokens } from '@/lib/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterRequest {
  organization_name: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  title?: string
  designation?: string
  website?: string
}

export interface InviteRequest {
  email: string
  role?: 'admin' | 'manager' | 'staff' | 'viewer'
  title?: string
  designation?: string
  message?: string
}

export interface AcceptInviteRequest {
  token: string
  password: string
  title?: string
  designation?: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff' | 'contact'
  organizationId: string
  title?: string
  designation?: string
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    setTokens(response.access_token, response.refresh_token)
    return response
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/register', data)
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearTokens()
    }
  },

  invite: async (data: InviteRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/invite', data)
  },

  acceptInvite: async (data: AcceptInviteRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/accept-invite', data)
    setTokens(response.access_token, response.refresh_token)
    return response
  },

  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/password-reset/request', data)
  },

  confirmPasswordReset: async (data: PasswordResetConfirmRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/password-reset/confirm', data)
  },

  verifyOrganizationEmail: async (token: string): Promise<{ message: string }> => {
    return apiClient.post('/auth/organization-email/verify', { token })
  },

  requestEmailVerification: async (): Promise<{ message: string }> => {
    return apiClient.post('/auth/organization-email/request-verification')
  },

  getEmailVerificationStatus: async (): Promise<{ verified: boolean }> => {
    return apiClient.get('/auth/organization-email/status')
  },

  getMe: async (): Promise<User> => {
    return apiClient.get('/auth/me')
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', { refresh_token: refreshToken })
    setTokens(response.access_token, response.refresh_token)
    return response
  },
}
