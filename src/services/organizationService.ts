import { apiClient } from '@/lib/apiClient'

export interface Organization {
  id: string
  name: string
  email?: string
  subdomain?: string
  custom_domain?: string
  logo_url?: string
  email_verified?: boolean
  require_contact_login?: boolean
  notify_submission_confirmation?: boolean
  notify_payment_confirmation?: boolean
  notify_payment_failure?: boolean
  partial_payment_limit?: number
  enabled_payment_methods?: ('ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE')[]
}

export interface OrganizationSettings {
  name: string
  email: string
  email_verified: boolean
  logo_url?: string
  subdomain?: string
  custom_domain?: string
  require_contact_login: boolean
  notify_submission_confirmation: boolean
  notify_payment_confirmation: boolean
  notify_payment_failure: boolean
  partial_payment_limit?: number
  enabled_payment_methods?: ('ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE')[]
}

export interface OrganizationUpdateRequest {
  name?: string
  email?: string
  subdomain?: string
  custom_domain?: string
  require_contact_login?: boolean
  notify_submission_confirmation?: boolean
  notify_payment_confirmation?: boolean
  notify_payment_failure?: boolean
  partial_payment_limit?: number
  enabled_payment_methods?: ('ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE')[]
}

export interface PaystackKeys {
  paystack_public_key?: string
  paystack_secret_key?: string
  paystack_webhook_url?: string
}

export const organizationService = {
  getOrganization: async (): Promise<Organization> => {
    return apiClient.get('/organization')
  },

  updateOrganization: async (data: OrganizationUpdateRequest): Promise<Organization> => {
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
