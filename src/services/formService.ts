import { apiClient } from '@/lib/apiClient'

export interface FormField {
  id: string
  label: string
  type: 'TEXT' | 'EMAIL' | 'SELECT' | 'NUMBER' | 'TEXTAREA'
  required: boolean
  options?: string[]
  order_index: number
  validation_rules?: Record<string, unknown>
}

export interface Form {
  id: string
  title: string
  slug: string
  category?: string
  description?: string
  note?: string
  payment_type: 'FIXED' | 'VARIABLE'
  amount?: number
  allow_partial: boolean
  is_active: boolean
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
  payment_type: 'FIXED' | 'VARIABLE'
  amount?: number
  allow_partial: boolean
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

  getFormGroups: async (formId: string): Promise<{ id: string; name: string }[]> => {
    return apiClient.get(`/forms/${formId}/groups`)
  },

  addFormGroups: async (formId: string, groupIds: string[]): Promise<void> => {
    return apiClient.post(`/forms/${formId}/groups`, { group_ids: groupIds })
  },
}

export interface PublicForm {
  id: string
  title: string
  slug: string
  description?: string
  note?: string
  payment_type: 'FIXED' | 'VARIABLE'
  amount?: number
  allow_partial: boolean
  fields: FormField[]
  organization_name: string
  require_contact_login?: boolean
}

export interface FormSubmissionData {
  [key: string]: string | number | boolean | undefined
}

export interface FormSubmissionResult {
  submission_id: string
  payment?: {
    reference: string
    authorization_url: string
  }
  contact?: {
    id: string
    require_login: boolean
  }
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

  submitForm: async (
    slug: string, 
    data: FormSubmissionData,
    options?: {
      contact_email?: string
      contact_name?: string
      callback_url?: string
      partial_amount?: number
    }
  ): Promise<FormSubmissionResult> => {
    return publicApi.post<FormSubmissionResult>(`/public/forms/${slug}/submit`, {
      data,
      contact_email: options?.contact_email,
      contact_name: options?.contact_name,
      partial_amount: options?.partial_amount,
    })
  },

  verifyPayment: async (reference: string): Promise<{ status: string; reference: string }> => {
    return publicApi.get(`/public/payments/callback?reference=${reference}`)
  },
}
