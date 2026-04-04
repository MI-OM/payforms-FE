import { apiClient } from '@/lib/apiClient'
import { contactAuth } from '@/lib/contactAuth'

export interface ContactLoginRequest {
  email: string
  password: string
  organization_id?: string
  organization_subdomain?: string
  organization_domain?: string
}

export interface ContactLoginResponse {
  access_token: string
  refresh_token: string
  contact: Contact
}

export interface ContactSetPasswordRequest {
  token: string
  password: string
}

export interface ContactResetRequest {
  email: string
  organization_id?: string
  organization_subdomain?: string
  organization_domain?: string
}

export interface ContactResetConfirmRequest {
  token: string
  password: string
}

export interface Contact {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone?: string
  gender?: string
  student_id?: string
  is_active: boolean
  require_login: boolean
}

const createContactApiClient = () => {
  return {
    post: async <T>(endpoint: string, data: unknown): Promise<T> => {
      const token = contactAuth.getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const url = `${import.meta.env.VITE_API_URL}${endpoint}`
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', { endpoint, data, error: errorData })
        throw new Error(errorData.message || errorData.error || `Request failed: ${response.status}`)
      }
      return response.json()
    },
    get: async <T>(endpoint: string): Promise<T> => {
      const token = contactAuth.getAccessToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Request failed: ${response.status}`)
      }
      return response.json()
    },
  }
}

const contactApi = createContactApiClient()

export const contactAuthService = {
  login: async (data: ContactLoginRequest): Promise<ContactLoginResponse> => {
    const loginData = {
      ...data,
      organization_domain: window.location.hostname !== 'localhost' ? window.location.hostname : undefined,
    }
    const response = await contactApi.post<ContactLoginResponse>('/contact-auth/login', loginData)
    contactAuth.setTokens(response.access_token, response.refresh_token)
    return response
  },

  setPassword: async (data: ContactSetPasswordRequest): Promise<{ message: string }> => {
    return contactApi.post<{ message: string }>('/contact-auth/set-password', data)
  },

  requestPasswordReset: async (data: ContactResetRequest): Promise<{ message: string }> => {
    return contactApi.post<{ message: string }>('/contact-auth/password-reset/request', data)
  },

  confirmPasswordReset: async (data: ContactResetConfirmRequest): Promise<{ message: string }> => {
    return contactApi.post<{ message: string }>('/contact-auth/password-reset/confirm', data)
  },

  logout: async (): Promise<void> => {
    try {
      await contactApi.post('/auth/logout', {})
    } finally {
      contactAuth.clearTokens()
    }
  },

  getMe: async (): Promise<Contact> => {
    return contactApi.get<Contact>('/contact-auth/me')
  },

  getReceipt: async (paymentId: string): Promise<Blob> => {
    const token = contactAuth.getAccessToken()
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-auth/payments/${paymentId}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch receipt')
    }
    return response.blob()
  },

  getReceiptByReference: async (reference: string): Promise<Blob> => {
    const token = contactAuth.getAccessToken()
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-auth/payments/reference/${reference}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch receipt')
    }
    return response.blob()
  },
}
