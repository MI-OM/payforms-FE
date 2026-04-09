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

export interface TwoFactorChallengeResponse {
  requires_two_factor: boolean
  challenge_token?: string
  challenge_expires_in?: number
  user?: Partial<User>
}

export interface TwoFactorVerifyRequest {
  challenge_token: string
  code?: string
  recovery_code?: string
}

export interface TwoFactorStatus {
  enabled: boolean
  setup_pending: boolean
  recovery_codes_remaining: number
}

export interface TwoFactorSetupResponse {
  secret: string
  manual_entry_key: string
  otpauth_url: string
  expires_at: string
}

export interface TwoFactorEnableResponse {
  recovery_codes: string[]
}

export interface RegisterRequest {
  organization_name: string
  email: string
  password: string
}

export interface InviteRequest {
  first_name: string
  last_name: string
  email: string
}

export interface AcceptInviteRequest {
  token: string
  password: string
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
  first_name: string
  middle_name?: string
  last_name: string
  role: 'ADMIN' | 'STAFF' | 'CONTACT'
  organization_id: string
  organization_name?: string
  title?: string
  designation?: string
}

export interface ProfileUpdateRequest {
  first_name?: string
  middle_name?: string
  last_name?: string
  title?: string
  designation?: string
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse | TwoFactorChallengeResponse> => {
    const response = await apiClient.post<LoginResponse | TwoFactorChallengeResponse>('/auth/login', data)
    // If 2FA is required, return the challenge without setting tokens
    if ('requires_two_factor' in response && response.requires_two_factor) {
      return response as TwoFactorChallengeResponse
    }
    // Normal login - set tokens
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

  getProfile: async (): Promise<User> => {
    return apiClient.get('/auth/profile')
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    return apiClient.patch('/auth/profile', data)
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', { refresh_token: refreshToken })
    setTokens(response.access_token, response.refresh_token)
    return response
  },

  // 2FA Methods
  verify2FA: async (data: TwoFactorVerifyRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/2fa/verify-login', data)
    setTokens(response.access_token, response.refresh_token)
    return response
  },

  get2FAStatus: async (): Promise<TwoFactorStatus> => {
    return apiClient.get('/auth/2fa/status')
  },

  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    return apiClient.post('/auth/2fa/setup', {})
  },

  enable2FA: async (code: string): Promise<TwoFactorEnableResponse> => {
    return apiClient.post('/auth/2fa/enable', { code })
  },

  disable2FA: async (code: string, recoveryCode?: string): Promise<{ message: string }> => {
    return apiClient.post('/auth/2fa/disable', { code, recovery_code: recoveryCode })
  },

  regenerateRecoveryCodes: async (code: string, recoveryCode?: string): Promise<{ recovery_codes: string[] }> => {
    return apiClient.post('/auth/2fa/recovery-codes/regenerate', { code, recovery_code: recoveryCode })
  },
}
