import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface ReportSummary {
  total_revenue: number
  total_transactions: number
  total_forms: number
  total_contacts: number
  pending_payments: number
  failed_payments: number
  today_revenue?: number
  today_transactions?: number
}

export interface AnalyticsData {
  revenue_by_day: { date: string; amount: number }[]
  transactions_by_status: { status: string; count: number }[]
  top_forms: { form_id: string; form_title: string; count: number; amount: number }[]
}

export interface FormPerformance {
  form_id: string
  title: string
  submissions: number
  payments: number
  paid: number
  pending: number
  failed: number
  partial: number
  amount_paid: number
  amount_pending: number
  completion_rate: number
  collection_rate: number
}

export interface ReportFilters {
  start_date?: string
  end_date?: string
  [key: string]: string | number | boolean | undefined
}

export const reportService = {
  getSummary: async (params?: ReportFilters): Promise<ReportSummary> => {
    return apiClient.get('/reports/summary', { params })
  },

  getAnalytics: async (params?: ReportFilters): Promise<AnalyticsData> => {
    return apiClient.get('/reports/analytics', { params })
  },

  getFormsPerformance: async (params?: ReportFilters): Promise<FormPerformance[]> => {
    return apiClient.get('/reports/forms/performance', { params })
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
