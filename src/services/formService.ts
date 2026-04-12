import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface FormField {
  id: string
  label: string
  type: 'TEXT' | 'EMAIL' | 'SELECT' | 'NUMBER' | 'TEXTAREA'
  required: boolean
  options?: string[]
  order_index: number
  validation_rules?: Record<string, unknown>
}

export type PaymentType = 'FIXED' | 'VARIABLE'
export type AccessMode = 'OPEN' | 'LOGIN_REQUIRED' | 'TARGETED_ONLY'
export type IdentityValidationMode = 'NONE' | 'CONTACT_EMAIL' | 'CONTACT_EXTERNAL_ID'

export interface Form {
  id: string
  title: string
  slug: string
  category?: string
  description?: string
  note?: string
  payment_type: PaymentType
  amount?: number
  allow_partial: boolean
  is_active: boolean
  access_mode?: AccessMode
  identity_validation_mode?: IdentityValidationMode
  identity_field_label?: string
  fields?: FormField[]
  created_at: string
  updated_at: string
}

export interface CreateFormRequest {
  title: string
  slug: string
  category?: string
  description?: string
  note?: string
  payment_type: PaymentType
  amount?: number
  allow_partial: boolean
  access_mode?: AccessMode
  identity_validation_mode?: IdentityValidationMode
  identity_field_label?: string
}

export interface CreateFieldRequest {
  label: string
  type: FormField['type']
  required: boolean
  options?: string[]
  order_index?: number
  validation_rules?: Record<string, unknown>
}

export interface FormTarget {
  id: string
  target_type: 'group' | 'contact'
  target_id: string
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

export const formService = {
  getForms: async (params?: PaginationParams): Promise<PaginatedResponse<Form>> => {
    return apiClient.get('/forms', { params })
  },

  getForm: async (id: string): Promise<Form> => {
    return apiClient.get(`/forms/${id}`)
  },

  createForm: async (data: CreateFormRequest): Promise<Form> => {
    return apiClient.post('/forms', data)
  },

  updateForm: async (id: string, data: Partial<CreateFormRequest & { is_active?: boolean }>): Promise<Form> => {
    return apiClient.patch(`/forms/${id}`, data)
  },

  getFormGroups: async (formId: string): Promise<{ id: string; name: string }[]> => {
    return apiClient.get(`/forms/${formId}/groups`)
  },

  addFormGroups: async (formId: string, groupIds: string[]): Promise<void> => {
    return apiClient.post(`/forms/${formId}/groups`, { group_ids: groupIds })
  },

  deleteForm: async (id: string): Promise<void> => {
    return apiClient.delete(`/forms/${id}`)
  },

  getFormFields: async (formId: string): Promise<FormField[]> => {
    return apiClient.get(`/forms/${formId}/fields`)
  },

  createField: async (formId: string, data: CreateFieldRequest): Promise<FormField> => {
    return apiClient.post(`/forms/${formId}/fields`, data)
  },

  updateField: async (fieldId: string, data: Partial<CreateFieldRequest>): Promise<FormField> => {
    return apiClient.patch(`/forms/fields/${fieldId}`, data)
  },

  deleteField: async (fieldId: string): Promise<void> => {
    return apiClient.delete(`/forms/fields/${fieldId}`)
  },

  reorderFields: async (formId: string, fields: { id: string; order_index: number }[]): Promise<void> => {
    return apiClient.patch(`/forms/${formId}/fields/reorder`, { fields })
  },

  getFormTargets: async (formId: string): Promise<FormTarget[]> => {
    return apiClient.get(`/forms/${formId}/targets`)
  },

  addFormTargets: async (formId: string, data: { target_type: 'group' | 'contact'; target_ids: string[] }): Promise<void> => {
    return apiClient.post(`/forms/${formId}/targets`, data)
  },

  removeFormTarget: async (formId: string, targetId: string): Promise<void> => {
    return apiClient.delete(`/forms/${formId}/targets/${targetId}`)
  },

  getFormSubmissions: async (params?: {
    page?: number
    limit?: number
    form_id?: string
    contact_id?: string
    status?: string
    start_date?: string
    end_date?: string
  }): Promise<PaginatedResponse<FormSubmission>> => {
    return apiClient.get('/submissions', { params })
  },

  exportSubmissions: async (params?: {
    format?: 'csv' | 'pdf'
    form_id?: string
    contact_id?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }): Promise<Blob> => {
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
    const url = `${apiUrl}/submissions/export?${searchParams.toString()}`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to export submissions')
    }
    
    return response.blob()
  },
}

export interface PublicForm {
  id: string
  title: string
  slug: string
  description?: string
  note?: string
  payment_type: PaymentType
  amount?: number
  allow_partial: boolean
  fields: FormField[]
  organization_name: string
  require_contact_login?: boolean
  access_mode?: AccessMode
  payment_method?: 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'
  enabled_payment_methods?: ('ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE')[]
}

export interface FormSubmissionData {
  [key: string]: string | number | boolean | undefined
}

export interface FormSubmissionResult {
  submission?: {
    id: string
    form_id: string
    contact_id: string
  }
  submission_id?: string
  payment?: {
    reference: string
    submission_id: string
    organization_id: string
    [key: string]: any
  }
  authorization?: {
    authorization_url: string
    access_code: string
    reference: string
  }
  contact?: {
    id: string
    require_login: boolean
  }
  offline_payment?: boolean
}

const createPublicApiClient = () => {
  return {
    get: async <T>(endpoint: string): Promise<T> => {
      return apiClient.get<T>(endpoint)
    },
    post: async <T>(endpoint: string, data: unknown): Promise<T> => {
      return apiClient.post<T>(endpoint, data)
    },
  }
}

const publicApi = createPublicApiClient()

export const publicFormService = {
  getForm: async (slug: string): Promise<PublicForm> => {
    return publicApi.get<PublicForm>(`/public/forms/${slug}`)
  },

  getWidgetConfig: async (slug: string): Promise<{
    form: PublicForm
    callback_url?: string
    contact_token?: string
    contact_email?: string
    contact_name?: string
    auto_redirect?: boolean
  }> => {
    return publicApi.get(`/public/forms/${slug}/widget-config`)
  },

  getEmbedScript: async (slug: string): Promise<{ script: string }> => {
    return publicApi.get(`/public/forms/${slug}/embed.js`)
  },

  getWidget: async (slug: string, options?: {
    callback_url?: string
    contact_token?: string
    contact_email?: string
    contact_name?: string
    auto_redirect?: boolean
  }): Promise<string> => {
    const params = new URLSearchParams()
    if (options?.callback_url) params.append('callback_url', options.callback_url)
    if (options?.contact_token) params.append('contact_token', options.contact_token)
    if (options?.contact_email) params.append('contact_email', options.contact_email)
    if (options?.contact_name) params.append('contact_name', options.contact_name)
    if (options?.auto_redirect) params.append('auto_redirect', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return publicApi.get(`/public/forms/${slug}/widget${query}`)
  },

  // New v1 Widget Endpoints
  getEmbedScriptV1: async (slug: string): Promise<{ script: string }> => {
    return publicApi.get(`/public/forms/${slug}/embed/v1.js`)
  },

  getWidgetV1: async (slug: string, options?: {
    callback_url?: string
    contact_token?: string
    contact_email?: string
    contact_name?: string
    auto_redirect?: boolean
    parent_origin?: string
    instance_id?: string
  }): Promise<string> => {
    const params = new URLSearchParams()
    if (options?.callback_url) params.append('callback_url', options.callback_url)
    if (options?.contact_token) params.append('contact_token', options.contact_token)
    if (options?.contact_email) params.append('contact_email', options.contact_email)
    if (options?.contact_name) params.append('contact_name', options.contact_name)
    if (options?.auto_redirect) params.append('auto_redirect', 'true')
    if (options?.parent_origin) params.append('parent_origin', options.parent_origin)
    if (options?.instance_id) params.append('instance_id', options.instance_id)
    const query = params.toString() ? `?${params.toString()}` : ''
    return publicApi.get(`/public/forms/${slug}/widget/v1${query}`)
  },

  submitForm: async (
    slug: string, 
    data: FormSubmissionData,
    options?: {
      contact_email?: string
      contact_name?: string
      callback_url?: string
      partial_amount?: number
      payment_method?: 'ONLINE' | 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CHEQUE'
    }
  ): Promise<FormSubmissionResult> => {
    const params = options?.callback_url ? `?callback_url=${encodeURIComponent(options.callback_url)}` : ''
    return publicApi.post<FormSubmissionResult>(`/public/forms/${slug}/submit${params}`, {
      data,
      contact_email: options?.contact_email,
      contact_name: options?.contact_name,
      partial_amount: options?.partial_amount,
      payment_method: options?.payment_method,
    })
  },

  handlePaymentCallback: async (reference: string): Promise<{
    status: string
    reference: string
    amount?: number
    currency?: string
    customer_email?: string
    customer_name?: string
    paid_at?: string
    payment_type?: string
    form_title?: string
    organization_name?: string
  }> => {
    return publicApi.get(`/public/payments/callback?reference=${reference}`)
  },

  verifyPayment: async (reference: string): Promise<{
    status: string
    reference: string
    amount?: number
    currency?: string
    customer_email?: string
    customer_name?: string
    paid_at?: string
    payment_type?: string
    form_title?: string
    organization_name?: string
  }> => {
    return publicApi.get(`/public/payments/verify?reference=${reference}`)
  },

  getFormSubmissions: async (params: {
    form_id?: string
    contact_id?: string
    page?: number
    limit?: number
    status?: string
    from?: string
    to?: string
  }): Promise<{
    data: FormSubmission[]
    meta: { page: number; limit: number; total: number; total_pages: number }
  }> => {
    return apiClient.get('/submissions', { params })
  },

  getSubmission: async (submissionId: string): Promise<FormSubmission> => {
    return apiClient.get(`/submissions/${submissionId}`)
  },
}

export interface FormSubmission {
  id: string
  form_id: string
  form_title?: string
  contact_id?: string
  contact_name?: string
  contact_email?: string
  data: Record<string, unknown>
  payment_status?: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED'
  payment_amount?: number
  reference?: string
  submitted_at: string
  updated_at?: string
}
