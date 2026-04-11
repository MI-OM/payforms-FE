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
  payment_method?: 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'
  confirmation_note?: string
  external_reference?: string
  contact_name?: string
  contact_email?: string
  form_title?: string
}

export interface Transaction {
  id: string
  submission_id: string
  organization_id: string
  reference: string
  amount: string
  total_amount: string
  amount_paid: string
  balance_due: string
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED'
  paid_at: string | null
  created_at: string
  submission?: {
    id: string
    form_id: string
    contact_id?: string
    organization_id: string
  }
  customer_name?: string
  customer_email?: string
  student_id?: string
  form_title?: string
  organization_name?: string
  payment_method?: string
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
  total_amount?: number
  reference?: string
  payment_method?: 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'
}

export interface UpdatePaymentStatusRequest {
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED'
  paid_at?: string
  amount_paid?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  [key: string]: string | number | boolean | undefined
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

  getTransactionByReference: async (reference: string): Promise<Transaction> => {
    return apiClient.get(`/transactions/reference/${reference}`)
  },

  getPaymentReceipt: async (id: string): Promise<Blob> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiUrl}/payments/${id}/receipt`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch receipt')
    }
    return response.blob()
  },

  getPaymentReceiptByReference: async (reference: string): Promise<Blob> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiUrl}/payments/reference/${reference}/receipt`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch receipt')
    }
    return response.blob()
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
    searchParams.append('format', 'csv')
    const url = `${apiUrl}/transactions?${searchParams.toString()}`
    
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

  getOfflinePendingPayments: async (params?: {
    page?: number
    limit?: number
    form_id?: string
    contact_id?: string
    payment_method?: string
    start_date?: string
    end_date?: string
  }): Promise<PaginatedResponse<Payment>> => {
    return apiClient.get('/payments/offline/pending', { params })
  },

  submitOfflinePaymentForReview: async (paymentId: string, data: {
    notes?: string
  }): Promise<Payment> => {
    return apiClient.post(`/payments/${paymentId}/offline-review`, data)
  },

  updateOfflinePaymentReview: async (paymentId: string, data: {
    status: 'PAID' | 'PARTIAL' | 'FAILED'
    paid_at?: string
    amount_paid?: number
    payment_method?: 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'
    confirmation_note?: string
    external_reference?: string
  }): Promise<Payment> => {
    return apiClient.patch(`/payments/${paymentId}/offline-review`, data)
  },
}
