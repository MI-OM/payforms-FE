import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface AuditLog {
  id: string
  timestamp: string
  action: string
  entity_type: string
  entity_id: string
  user_id?: string
  user_email?: string
  ip_address?: string
  user_agent?: string
  details?: Record<string, unknown>
}

export interface PaymentAuditLog {
  id: string
  timestamp: string
  event: string
  details: string
  user: string
  ip_address?: string
}

export interface AuditLogFilters {
  action?: string
  entity_type?: string
  entity_id?: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  keyword?: string
  from?: string
  to?: string
  [key: string]: string | number | boolean | undefined
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

export const auditService = {
  getAuditLogs: async (params?: AuditLogFilters & PaginationParams): Promise<PaginatedResponse<AuditLog>> => {
    return apiClient.get('/audit/logs', { params })
  },

  getPaymentAuditLogs: async (
    paymentId: string,
    params?: { event?: string; event_id?: string; keyword?: string; from?: string; to?: string } & PaginationParams
  ): Promise<PaginatedResponse<PaymentAuditLog>> => {
    return apiClient.get(`/audit/payment-logs/${paymentId}`, { params })
  },

  exportAuditLogs: async (params?: AuditLogFilters): Promise<Blob> => {
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
    const url = `${apiUrl}/audit/logs/export${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to export audit logs')
    }
    
    return response.blob()
  },
}
