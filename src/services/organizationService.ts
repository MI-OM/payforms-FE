import { apiClient } from '@/lib/apiClient'

export interface Organization {
  id: string
  name: string
  email?: string
  website?: string
  logo_url?: string
  require_contact_login?: boolean
  notify_submission_confirmation?: boolean
  notify_payment_confirmation?: boolean
  notify_payment_failure?: boolean
}

export interface OrganizationSettings {
  timezone: string
  currency: string
  language: string
  date_format: string
}

export interface PaystackKeys {
  paystack_public_key?: string
  paystack_secret_key?: string
}

export const organizationService = {
  getOrganization: async (): Promise<Organization> => {
    return apiClient.get('/organization')
  },

  updateOrganization: async (data: Partial<Organization>): Promise<Organization> => {
    return apiClient.patch('/organization', data)
  },

  getSettings: async (): Promise<OrganizationSettings> => {
    return apiClient.get('/organization/settings')
  },

  updateSettings: async (data: Partial<OrganizationSettings>): Promise<OrganizationSettings> => {
    return apiClient.patch('/organization/settings', data)
  },

  updateKeys: async (data: PaystackKeys): Promise<{ message: string }> => {
    return apiClient.patch('/organization/keys', data)
  },

  uploadLogo: async (logoUrl: string): Promise<{ message: string }> => {
    return apiClient.post('/organization/logo', { logo_url: logoUrl })
  },
}
