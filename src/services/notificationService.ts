import { apiClient } from '@/lib/apiClient'

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

export const notificationService = {
  sendReminder: async (data: { contact_ids: string[]; message?: string }): Promise<{ message: string }> => {
    return apiClient.post('/notifications/reminder', data)
  },

  sendGroupReminder: async (data: { group_ids: string[]; message?: string }): Promise<{ message: string }> => {
    return apiClient.post('/notifications/reminder/groups', data)
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
}
