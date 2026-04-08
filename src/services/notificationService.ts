import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface ScheduledNotification {
  id: string
  subject: string
  body: string
  recipients: string[]
  scheduled_for: string
  status: 'scheduled' | 'sent' | 'cancelled'
  created_at: string
}

export interface NotificationHistory {
  id: string
  type: 'reminder' | 'scheduled' | 'system'
  subject: string
  sent_at: string
  recipient_count: number
  status: 'sent' | 'failed' | 'partial'
}

export interface InternalNotification {
  id: string
  title: string
  body: string
  user_ids?: string[]
  created_at: string
  read_at?: string
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

const createMultipartApiClient = () => {
  return {
    post: async <T>(endpoint: string, data: FormData): Promise<T> => {
      const token = getAccessToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data,
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `Request failed: ${response.status}`)
      }
      return response.json()
    },
  }
}

const multipartApi = createMultipartApiClient()

export const notificationService = {
  sendReminder: async (data: { contact_ids: string[]; message?: string; attachment?: File }): Promise<{ message: string }> => {
    const formData = new FormData()
    formData.append('contact_ids', JSON.stringify(data.contact_ids))
    if (data.message) {
      formData.append('message', data.message)
    }
    if (data.attachment) {
      formData.append('attachment', data.attachment)
    }
    return multipartApi.post('/notifications/reminder', formData)
  },

  sendGroupReminder: async (data: { group_ids: string[]; message?: string; attachment?: File }): Promise<{ message: string }> => {
    const formData = new FormData()
    formData.append('group_ids', JSON.stringify(data.group_ids))
    if (data.message) {
      formData.append('message', data.message)
    }
    if (data.attachment) {
      formData.append('attachment', data.attachment)
    }
    return multipartApi.post('/notifications/reminder/groups', formData)
  },

  sendScheduledNotification: async (data: {
    subject: string
    body: string
    recipients: string[]
  }): Promise<ScheduledNotification> => {
    return apiClient.post('/notifications/schedule', data)
  },

  sendScheduledNotificationToGroups: async (data: {
    group_ids: string[]
    subject: string
    body: string
  }): Promise<{ message: string }> => {
    return apiClient.post('/notifications/schedule/groups', data)
  },

  getScheduledNotifications: async (params?: PaginationParams): Promise<PaginatedResponse<ScheduledNotification>> => {
    return apiClient.get('/notifications/scheduled', { params })
  },

  getNotificationHistory: async (params?: PaginationParams): Promise<PaginatedResponse<NotificationHistory>> => {
    return apiClient.get('/notifications/history', { params })
  },

  cancelScheduledNotification: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/notifications/scheduled/${id}`)
  },

  createInternalNotification: async (data: {
    title: string
    body: string
    user_ids?: string[]
  }): Promise<InternalNotification> => {
    return apiClient.post('/notifications/internal', data)
  },

  getInternalNotifications: async (params?: PaginationParams & { unread_only?: boolean }): Promise<PaginatedResponse<InternalNotification>> => {
    return apiClient.get('/notifications/internal', { params })
  },

  markInternalNotificationAsRead: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch(`/notifications/internal/${id}/read`)
  },
}
