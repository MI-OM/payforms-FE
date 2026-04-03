import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface Payment {
  id: string
  submission_id: string
  reference?: string
  amount: number
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED'
  paid_at?: string
  created_at: string
}

export interface Transaction {
  id: string
  reference: string
  contact_id: string
  form_id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED'
  paid_at?: string
  created_at: string
}

export interface TransactionHistory {
  id: string
  timestamp: string
  action: string
  details: string
  user: string
}

export interface CreatePaymentRequest {
  submission_id: string
  amount: number
  reference?: string
}

export interface UpdatePaymentStatusRequest {
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED'
  paid_at?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TransactionFilters {
  status?: string
  reference?: string
  form_id?: string
  contact_id?: string
  start_date?: string
  end_date?: string
  [key: string]: string | number | boolean | undefined
}

export interface PaginationParams {
  page?: number
  limit?: number
  [key: string]: string | number | boolean | undefined
}

export const paymentService = {
  getPayments: async (params?: PaginationParams): Promise<PaginatedResponse<Payment>> => {
    return apiClient.get('/payments', { params })
  },

  getPayment: async (id: string): Promise<Payment> => {
    return apiClient.get(`/payments/${id}`)
  },

  verifyPayment: async (reference: string): Promise<Payment> => {
    return apiClient.get(`/payments/verify/${reference}`)
  },

  createPayment: async (data: CreatePaymentRequest): Promise<Payment> => {
    return apiClient.post('/payments', data)
  },

  updatePaymentStatus: async (id: string, data: UpdatePaymentStatusRequest): Promise<Payment> => {
    return apiClient.post(`/payments/${id}/status`, data)
  },

  getTransactions: async (params?: TransactionFilters & PaginationParams): Promise<PaginatedResponse<Transaction>> => {
    return apiClient.get('/transactions', { params })
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    return apiClient.get(`/transactions/${id}`)
  },

  getTransactionHistory: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<TransactionHistory>> => {
    return apiClient.get(`/transactions/${id}/history`, { params })
  },

  exportTransactions: async (params?: TransactionFilters): Promise<Blob> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = `${apiUrl}/transactions${queryString ? `?${queryString}` : ''}&format=csv`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to export transactions')
    }
    
    return response.blob()
  },
}
