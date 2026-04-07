import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface ReportSummary {
  forms: number
  contacts: number
  submissions: number
  payments: number
  payment_total: number
  payment_paid_total: number
  payment_pending_total: number
  payment_failed_total: number
  payment_partial_total: number
  range?: {
    start: string
    end: string
  }
}

export interface AnalyticsData {
  range?: {
    start: string
    end: string
  }
  submissions_by_day: { day: string; count: number }[]
  payments_by_day: { day: string; total: number; count: number }[]
  payment_status_breakdown: { status: string; count: number; total_amount: number }[]
}

export interface PaymentStatusBreakdown {
  status: string
  count: number
  total_amount: number
}

export interface FormPerformance {
  form_id: string
  title: string
  slug: string
  is_active: boolean
  created_at: string
  submissions: number
  payments: number
  paid_payments: number
  pending_payments: number
  failed_payments: number
  partial_payments: number
  amount_total: number
  paid_amount_total: number
  pending_amount_total: number
  failed_amount_total: number
  partial_amount_total: number
  completion_rate: number
  collection_rate: number
}

export interface FormsPerformanceResponse {
  range: { from?: string; to?: string }
  totals: {
    forms: number
    submissions: number
    payments: number
    amount_total: number
    paid_amount_total: number
  }
  data: FormPerformance[]
}

export interface GroupContribution {
  group_id: string
  group_name: string
  parent_group_id?: string
  contact_count: number
  submissions: number
  payments: number
  paid_amount: number
  pending_amount: number
  expected_total?: number
  deficit?: number
  collection_rate?: number
  children?: GroupContribution[]
}

export interface GroupContributionsResponse {
  form_id?: string
  form_title?: string
  totals: {
    contacts: number
    submissions: number
    payments: number
    paid_amount: number
  }
  data: GroupContribution[]
}

export interface ReportFilters {
  start_date?: string
  end_date?: string
  form_id?: string
  [key: string]: string | number | boolean | undefined
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const reportService = {
  getSummary: async (params?: ReportFilters): Promise<ReportSummary> => {
    return apiClient.get('/reports/summary', { params })
  },

  getAnalytics: async (params?: ReportFilters): Promise<AnalyticsData> => {
    return apiClient.get('/reports/analytics', { params })
  },

  getFormsPerformance: async (params?: ReportFilters): Promise<FormsPerformanceResponse> => {
    return apiClient.get('/reports/forms/performance', { params })
  },

  getGroupContributions: async (params?: ReportFilters): Promise<GroupContributionsResponse> => {
    return apiClient.get('/reports/groups/contributions', { params })
  },

  exportReport: async (params: {
    type?: 'summary' | 'analytics'
    format?: 'csv' | 'pdf'
    start_date?: string
    end_date?: string
  }): Promise<Blob> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value))
    })
    const url = `${apiUrl}/reports/export?${searchParams.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to export report')
    }
    
    return response.blob()
  },
}
