import { apiClient } from '@/lib/apiClient'
import { contactAuth } from '@/lib/contactAuth'

export interface Transaction {
  id: string
  reference: string
  amount: number
  status: string
  created_at: string
  paid_at?: string
  form_id?: string
  form_name?: string
  contact_id?: string
  contact_name?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', { endpoint, data, error: errorData })
        throw new Error(errorData.message || errorData.error || `Request failed: ${response.status}`)
      }
      return response.json()
    },
    get: async <T>(endpoint: string, options?: { params?: Record<string, string | number | boolean | undefined> }): Promise<T> => {
      const token = contactAuth.getAccessToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      let url = `${import.meta.env.VITE_API_URL}${endpoint}`
      if (options?.params) {
        const searchParams = new URLSearchParams()
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          url += `?${queryString}`
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
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
    const hostname = window.location.hostname
    
    let organization_subdomain = data.organization_subdomain
    
    if (!organization_subdomain) {
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        const parts = hostname.split('.')
        if (parts.length >= 2) {
          organization_subdomain = parts[0]
        }
      }
    }
    
    const loginData = {
      ...data,
      organization_subdomain: organization_subdomain || undefined,
    }
    // Backend sets pf_contact_token cookie, so we don't need to store tokens in sessionStorage
    const response = await contactApi.post<ContactLoginResponse>('/contact-auth/login', loginData)
    // Store tokens as fallback for API calls that need bearer token
    // The cookie will handle most requests automatically
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

  changePassword: async (data: { current_password: string; new_password: string }): Promise<{ message: string }> => {
    return contactApi.post<{ message: string }>('/contact-auth/change-password', data)
  },

  logout: async (): Promise<void> => {
    try {
      await contactApi.post('/contact-auth/logout', {})
    } finally {
      contactAuth.clearTokens()
    }
  },

  getMe: async (): Promise<Contact> => {
    return contactApi.get<Contact>('/contact-auth/me')
  },

  getTransactions: async (params?: {
    page?: number
    limit?: number
    format?: 'csv'
  }): Promise<PaginatedResponse<Transaction>> => {
    return contactApi.get('/contact-auth/transactions', { params })
  },

  getReceipt: async (paymentId: string): Promise<Blob> => {
    const token = contactAuth.getAccessToken()
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-auth/payments/${paymentId}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
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
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch receipt')
    }
    return response.blob()
  },

  updateProfile: async (data: {
    first_name?: string
    middle_name?: string
    last_name?: string
    phone?: string
  }): Promise<Contact> => {
    const token = contactAuth.getAccessToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-auth/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Failed to update profile')
    }
    return response.json()
  },

  getForms: async (params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Form>> => {
    const token = contactAuth.getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-auth/forms?limit=${params?.limit || 50}&page=${params?.page || 1}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `Request failed: ${response.status}`)
    }
    const data = await response.json()
    const formsList = data.data || []
    return {
      data: formsList,
      total: data.total || formsList.length,
      page: data.page || 1,
      limit: data.limit || params?.limit || 50,
      totalPages: data.totalPages || Math.ceil((data.total || formsList.length) / (params?.limit || 50)),
    }
  },

  getNotifications: async (params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<ContactNotification>> => {
    const token = contactAuth.getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-auth/notifications?limit=${params?.limit || 20}&page=${params?.page || 1}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `Request failed: ${response.status}`)
    }
    const data = await response.json()
    const notificationsList = data.data || []
    return {
      data: notificationsList,
      total: data.total || notificationsList.length,
      page: data.page || 1,
      limit: data.limit || params?.limit || 20,
      totalPages: data.totalPages || Math.ceil((data.total || notificationsList.length) / (params?.limit || 20)),
    }
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    const token = contactAuth.getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-auth/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `Request failed: ${response.status}`)
    }
  },
}

export interface Form {
  id: string
  title: string
  slug: string
  category?: string
  description?: string
  note?: string
  payment_type: string
  amount?: number
  allow_partial: boolean
  is_active: boolean
  access_mode?: string
  identity_validation_mode?: string
  identity_field_label?: string
  created_at: string
  updated_at: string
}

export interface ContactNotification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  read_at?: string
  link?: string
}
