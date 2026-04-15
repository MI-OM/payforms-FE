import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface AuditLogActor {
  id: string
  name: string
  role: string
  email: string
  label: string
}

export interface AuditLogEntityDetails {
  type: string
  id: string | null
  label: string
  reference: string | null
  email: string | null
  subject: string | null
}

export interface AuditLogMetadata {
  raw_path?: string
  params?: Record<string, unknown>
  query?: Record<string, string>
  ip_address?: string
  user_agent?: string
  actor?: AuditLogActor
}

export interface AuditLog {
  id: string
  organization_id?: string
  user_id?: string
  contact_id?: string | null
  action?: string
  entity_type?: string
  entity_id?: string
  metadata?: AuditLogMetadata
  ip_address?: string
  user_agent?: string
  created_at?: string
  user?: AuditLogActor
  contact?: unknown
  timestamp?: string
  actor?: AuditLogActor
  entity?: string
  entity_details?: AuditLogEntityDetails
  entity_label?: string
  // Legacy properties for backward compatibility
  user_email?: string
  contact_name?: string
  contact_email?: string
  actor_type?: 'admin' | 'staff' | 'contact' | 'system'
  actor_name?: string
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
  contact_id?: string
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

    console.log('Export URL:', url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    console.log('Export response status:', response.status)
    console.log('Export response ok:', response.ok)
    console.log('Export content-type:', response.headers.get('content-type'))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Export error response:', errorText)
      throw new Error(`Failed to export audit logs: ${response.status} ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('csv')) {
      const text = await response.text()
      console.error('Unexpected content type or response:', text.substring(0, 500))
    }
    
    return response.blob()
  },
}
